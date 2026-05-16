import type { FiggoClient } from 'ws-core'
import { BotOrchestrator } from '../core/orchestration/orchestrator.js'
import { composeFeedbackHandlers } from '../core/orchestration/feedback.js'
import type { WorkflowFile } from '../types/workflow.js'
import type { BotEvents } from '../types/types.js'
import logger from '../utils/logger.js'
import { createWsWorkflowFeedback } from './workflowFeedback.js'

export type RunTaskPayload = BotEvents['runTask']['payload']

export type RunTaskResult = {
    accepted: boolean
    sessionId: string
    taskId?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

const isWorkflowFile = (value: unknown): value is WorkflowFile => {
    if (!isRecord(value)) return false
    if (typeof value.id !== 'string' || typeof value.name !== 'string') return false
    if (!isRecord(value.graph)) return false
    if (!Array.isArray(value.graph.nodes) || !Array.isArray(value.graph.edges)) return false
    return true
}

export const parseRunTaskPayload = (payload: unknown): RunTaskPayload => {
    if (!isRecord(payload)) {
        throw new Error('Invalid runTask payload: expected an object')
    }

    if (typeof payload.sessionId !== 'string' || !payload.sessionId.trim()) {
        throw new Error('Invalid runTask payload: sessionId is required')
    }

    if (!isWorkflowFile(payload.workflow)) {
        throw new Error('Invalid runTask payload: workflow must include id, name, and graph.nodes/graph.edges')
    }

    const result: RunTaskPayload = {
        sessionId: payload.sessionId,
        workflow: payload.workflow
    }

    if (payload.taskId !== undefined) {
        if (typeof payload.taskId !== 'string') throw new Error('Invalid runTask payload: taskId must be a string')
        result.taskId = payload.taskId
    }

    if (payload.environment !== undefined) {
        if (!isRecord(payload.environment)) throw new Error('Invalid runTask payload: environment must be an object')
        result.environment = payload.environment
    }

    if (payload.metadata !== undefined) {
        if (!isRecord(payload.metadata)) throw new Error('Invalid runTask payload: metadata must be an object')
        result.metadata = payload.metadata
    }

    if (payload.waitForCompletion !== undefined) {
        if (typeof payload.waitForCompletion !== 'boolean') {
            throw new Error('Invalid runTask payload: waitForCompletion must be a boolean')
        }
        result.waitForCompletion = payload.waitForCompletion
    }

    return result
}

export type RunTaskHandlerDeps = {
    client: FiggoClient
    orchestrator: BotOrchestrator
}

export const createRunTaskHandler = ({ client, orchestrator }: RunTaskHandlerDeps) => {
    return async (payload: unknown): Promise<RunTaskResult> => {
        const task = parseRunTaskPayload(payload)
        const { sessionId, workflow, taskId, environment, metadata, waitForCompletion } = task

        const existing = orchestrator.getSession(sessionId)
        if (existing?.status === 'running') {
            throw new Error(`Session "${sessionId}" is already running a workflow`)
        }

        const wsOptions: { taskId?: string; metadata?: Record<string, unknown> } = {}
        if (taskId !== undefined) wsOptions.taskId = taskId
        if (metadata !== undefined) wsOptions.metadata = metadata

        const runOptions: {
            feedback: ReturnType<typeof composeFeedbackHandlers>
            environment?: Record<string, unknown>
            taskId?: string
            metadata?: Record<string, unknown>
        } = {
            feedback: composeFeedbackHandlers(createWsWorkflowFeedback(client, wsOptions))
        }
        if (environment !== undefined) runOptions.environment = environment
        if (taskId !== undefined) runOptions.taskId = taskId
        if (metadata !== undefined) runOptions.metadata = metadata

        const run = orchestrator.runWorkflow(sessionId, workflow, runOptions)

        if (waitForCompletion) {
            await run
            return taskId !== undefined ? { accepted: true, sessionId, taskId } : { accepted: true, sessionId }
        }

        run.catch((err) => {
            logger.error('RUN_TASK_FAILED', {
                meta: {
                    sessionId,
                    taskId,
                    error: err instanceof Error ? err.message : String(err)
                }
            })
        })

        return taskId !== undefined ? { accepted: true, sessionId, taskId } : { accepted: true, sessionId }
    }
}
