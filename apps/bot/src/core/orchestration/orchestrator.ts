import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import type { BotActions } from '../../types/types.js'
import type { LaunchBrowserNodeData, WorkflowFile, WorkflowGraphNode } from '../../types/workflow.js'
import logger from '../../utils/logger.js'
import { getMachineInfo, getProcessStats, getQuickHealth } from '../../utils/process.js'
import { executeWorkflowGraph } from '../executor/executeWorkflowGraph.js'
import { buildWorkflowGraphIndex, getPlaywrightAction, type WorkflowGraphIndex } from '../parser/buildWorkflowGraph.js'
import {
    buildWorkflowFeedback,
    composeFeedbackHandlers,
    createLoggerFeedback,
    type RunWorkflowOptions,
    type WorkflowFeedbackHandler
} from './feedback.js'
import { WorkflowSession } from './session.js'
import type { StepFeedback } from './types.js'

const isPlaywrightNode = (node: WorkflowGraphNode): node is WorkflowGraphNode & { data: BotActions } =>
    node.type === 'playwrightAction' && typeof node.data.name === 'string'

/**
 * Single entry point for workflow execution and session lifecycle.
 * Each session may hold at most one browser for the duration of a workflow run.
 */
export class BotOrchestrator {
    private readonly sessions = new Map<string, WorkflowSession>()

    /** Run a workflow file; creates a transient session and tears it down when finished. */
    async runWorkflowFromFile(workflowPath: string, sessionId?: string, options: RunWorkflowOptions = {}): Promise<string> {
        const raw = await fs.readFile(workflowPath, 'utf-8')
        const workflow = JSON.parse(raw) as WorkflowFile
        const id = sessionId ?? crypto.randomUUID()
        await this.runWorkflow(id, workflow, options)
        return id
    }

    /** Execute a workflow JSON graph under the given session. */
    async runWorkflow(sessionId: string, workflow: WorkflowFile, options: RunWorkflowOptions = {}): Promise<void> {
        const session = this.acquireSession(sessionId)
        const feedback = this.resolveFeedback(options)

        if (session.status === 'running') {
            throw new Error(`Session "${sessionId}" is already running a workflow`)
        }

        if (session.hasBrowser) {
            throw new Error(`Session "${sessionId}" still has an active browser — close it before starting a new workflow`)
        }

        if (options.environment) {
            Object.assign(session.environment, options.environment)
        }

        const workflowName = workflow.name.replace(/\s+/g, '-').toLowerCase()
        const index = buildWorkflowGraphIndex(workflow.graph)

        session.status = 'running'
        session.workflowName = workflowName

        await feedback(
            buildWorkflowFeedback('workflow:start', session, workflow, {
                ...options,
                metadata: { ...options.metadata, nodeCount: index.reachable.size }
            })
        )

        try {
            await executeWorkflowGraph(workflow.graph, {
                onStepStart: (nodeId, stepIndex) =>
                    this.emitStepFeedback(session, workflow, index, nodeId, stepIndex, 'executing', options, feedback),
                onStepComplete: (nodeId, stepIndex, durationMs) =>
                    this.emitStepFeedback(session, workflow, index, nodeId, stepIndex, 'completed', options, feedback, durationMs),
                onStepFailed: (nodeId, stepIndex, error, durationMs) =>
                    this.emitStepFeedback(session, workflow, index, nodeId, stepIndex, 'failed', options, feedback, durationMs, error),
                runNode: async (nodeId) => {
                    const node = index.nodesById.get(nodeId)!
                    await this.runGraphNode(session, workflow, node, workflowName, index, options, feedback)
                }
            })

            session.status = 'completed'
            await feedback(buildWorkflowFeedback('workflow:complete', session, workflow, options))
        } catch (err) {
            session.status = 'failed'
            const error = err instanceof Error ? err.message : String(err)
            await feedback(buildWorkflowFeedback('workflow:failed', session, workflow, options, { error }))
            throw err
        } finally {
            await session.dispose()
        }
    }

    createSession(sessionId: string): WorkflowSession {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Session "${sessionId}" already exists`)
        }
        const session = new WorkflowSession(sessionId)
        this.sessions.set(sessionId, session)
        return session
    }

    getSession(sessionId: string): WorkflowSession | null {
        return this.sessions.get(sessionId) ?? null
    }

    async closeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId)
        if (!session) throw new Error(`Session "${sessionId}" not found`)

        if (session.status === 'running') {
            throw new Error(`Cannot close session "${sessionId}" while a workflow is running`)
        }

        await session.dispose()
        this.sessions.delete(sessionId)
        logger.info('SESSION_CLOSED', { meta: { sessionId } })
    }

    listSessions(): string[] {
        return [...this.sessions.keys()]
    }

    exitBot(): void {
        try {
            logger.info('EXIT_BOT', { meta: 'Exit Bot event' })
            process.exit(0)
        } catch (error) {
            logger.error('ERROR_BOT', { meta: error })
        }
    }

    getBotStats() {
        return getProcessStats(process.pid)
    }

    getMachineHealth() {
        return getQuickHealth()
    }

    getMachineInfo() {
        return getMachineInfo()
    }

    private resolveFeedback(options: RunWorkflowOptions): WorkflowFeedbackHandler {
        const handlers = Array.isArray(options.feedback) ? options.feedback : options.feedback ? [options.feedback] : []
        return composeFeedbackHandlers(createLoggerFeedback(), ...handlers)
    }

    private acquireSession(sessionId: string): WorkflowSession {
        let session = this.sessions.get(sessionId)
        if (!session) {
            session = new WorkflowSession(sessionId)
            this.sessions.set(sessionId, session)
        }
        return session
    }

    private buildStep(
        index: WorkflowGraphIndex,
        nodeId: string,
        stepIndex: number,
        status: StepFeedback['status'],
        durationMs?: number,
        error?: string
    ): StepFeedback {
        const node = index.nodesById.get(nodeId)!
        const step: StepFeedback = {
            index: stepIndex,
            nodeId,
            nodeType: node.type,
            name: String(node.data.name ?? node.type),
            status
        }
        if (durationMs !== undefined) step.durationMs = durationMs
        if (error !== undefined) step.error = error
        return step
    }

    private async emitStepFeedback(
        session: WorkflowSession,
        workflow: WorkflowFile,
        index: WorkflowGraphIndex,
        nodeId: string,
        stepIndex: number,
        status: StepFeedback['status'],
        options: RunWorkflowOptions,
        feedback: WorkflowFeedbackHandler,
        durationMs?: number,
        error?: string
    ) {
        const step = this.buildStep(index, nodeId, stepIndex, status, durationMs, error)
        const node = index.nodesById.get(nodeId)!
        const phase = status === 'executing' ? 'step:executing' : status === 'completed' ? 'step:completed' : 'step:failed'

        const action = node.type === 'playwrightAction' ? (getPlaywrightAction(nodeId, index) as Record<string, unknown>) : { ...node.data }

        const extras: { step: StepFeedback; action: Record<string, unknown>; error?: string } = { step, action }
        if (error !== undefined) extras.error = error
        await feedback(buildWorkflowFeedback(phase, session, workflow, options, extras))
    }

    private async runGraphNode(
        session: WorkflowSession,
        workflow: WorkflowFile,
        node: WorkflowGraphNode,
        workflowName: string,
        index: WorkflowGraphIndex,
        options: RunWorkflowOptions,
        feedback: WorkflowFeedbackHandler
    ): Promise<void> {
        if (node.type === 'browserAction') {
            if (node.data.name === 'launchBrowser') {
                await session.launchBrowser(node.data as LaunchBrowserNodeData, workflowName)
                await feedback(
                    buildWorkflowFeedback('browser:launched', session, workflow, options, {
                        action: node.data as Record<string, unknown>
                    })
                )
                return
            }
            if (node.data.name === 'closeBrowser') {
                await session.closeBrowser()
                await feedback(
                    buildWorkflowFeedback('browser:closed', session, workflow, options, {
                        action: node.data as Record<string, unknown>
                    })
                )
                return
            }
            throw new Error(`Unknown browser action: ${String(node.data.name)}`)
        }

        if (isPlaywrightNode(node)) {
            session.assertBrowser(`playwright action "${node.data.name}"`)
            const action = getPlaywrightAction(node.id, index)
            await session.runPlaywrightAction(action)
            return
        }

        throw new Error(`Unsupported node type: ${node.type}`)
    }
}
