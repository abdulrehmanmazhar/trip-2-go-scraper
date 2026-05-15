import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, type BrowserContext } from 'playwright'
import type { BotActions, InturrptionAction, ServerAction } from '../types/types.js'
import type { LaunchBrowserNodeData, WorkflowFile, WorkflowGraphNode } from '../types/workflow.js'
import { appRoot } from '../constant/application.js'
import { buildWorkflowGraphIndex, getPlaywrightAction } from './buildWorkflowGraph.js'
import { executeWorkflowGraph } from './executeWorkflowGraph.js'
import logger from './logger.js'
import { NetworkInterceptorWorker, PlaywrightWorker, type RuntimeConfig } from './playwrightWorker.js'

export type StepFeedback = {
    index: number
    nodeId: string
    nodeType: string
    name: string
    status: 'executing' | 'completed' | 'failed'
    message?: string
    error?: string
    durationMs?: number
}

type WorkflowAction = BotActions | ServerAction | InturrptionAction

const emitFeedback = (feedback: StepFeedback) => {
    const line = JSON.stringify(feedback)
    process.stdout.write(`${line}\n`)
    logger.info('WORKFLOW_STEP', { meta: feedback })
}

const resolveUserDataDir = (configured: string, workflowName: string) => {
    if (configured && !configured.includes('/path/to/') && configured !== '/path/to/user-data') {
        return configured
    }
    return path.join(appRoot, 'workflows', workflowName, 'chrome-profile')
}

const toRuntimeConfig = (launchData: LaunchBrowserNodeData, workflowName: string): RuntimeConfig => {
    const { config } = launchData
    return {
        userDataDir: resolveUserDataDir(config.userDataDir, workflowName),
        launch: config.launch as RuntimeConfig['launch'],
        execution: config.execution,
        networkInterception: config.networkInterception ?? []
    }
}

const isPlaywrightNode = (node: WorkflowGraphNode): node is WorkflowGraphNode & { data: BotActions } =>
    node.type === 'playwrightAction' && typeof node.data.name === 'string'

export class WorkflowRunner {
    private browser: BrowserContext | null = null
    private playwright: PlaywrightWorker | null = null
    private network: NetworkInterceptorWorker | null = null
    private config: RuntimeConfig | null = null
    public environment: Record<string, unknown> = {}

    async runFromFile(workflowPath: string) {
        const raw = await fs.readFile(workflowPath, 'utf-8')
        const workflow = JSON.parse(raw) as WorkflowFile
        return this.run(workflow)
    }

    async run(workflow: WorkflowFile) {
        const workflowName = workflow.name.replace(/\s+/g, '-').toLowerCase()
        const index = buildWorkflowGraphIndex(workflow.graph)

        process.stdout.write(`Running workflow "${workflow.name}" (${index.reachable.size} nodes, parallel branches enabled)\n`)

        try {
            await executeWorkflowGraph(workflow.graph, {
                onStepStart: (nodeId, stepIndex) => {
                    const node = index.nodesById.get(nodeId)!
                    emitFeedback({
                        index: stepIndex,
                        nodeId,
                        nodeType: node.type,
                        name: String(node.data.name ?? node.type),
                        status: 'executing'
                    })
                },
                onStepComplete: (nodeId, stepIndex, durationMs) => {
                    const node = index.nodesById.get(nodeId)!
                    emitFeedback({
                        index: stepIndex,
                        nodeId,
                        nodeType: node.type,
                        name: String(node.data.name ?? node.type),
                        status: 'completed',
                        durationMs
                    })
                },
                onStepFailed: (nodeId, stepIndex, error, durationMs) => {
                    const node = index.nodesById.get(nodeId)!
                    emitFeedback({
                        index: stepIndex,
                        nodeId,
                        nodeType: node.type,
                        name: String(node.data.name ?? node.type),
                        status: 'failed',
                        error,
                        durationMs
                    })
                },
                runNode: async (nodeId) => {
                    const node = index.nodesById.get(nodeId)!
                    await this.runGraphNode(node, workflowName, index)
                }
            })
        } catch (err) {
            await this.closeBrowser().catch(() => undefined)
            throw err
        }

        process.stdout.write(`Workflow "${workflow.name}" completed successfully\n`)
    }

    private async runGraphNode(node: WorkflowGraphNode, workflowName: string, index: ReturnType<typeof buildWorkflowGraphIndex>) {
        if (node.type === 'browserAction') {
            if (node.data.name === 'launchBrowser') {
                await this.launchBrowser(node.data as LaunchBrowserNodeData, workflowName)
                return
            }
            if (node.data.name === 'closeBrowser') {
                await this.closeBrowser()
                return
            }
            throw new Error(`Unknown browser action: ${String(node.data.name)}`)
        }

        if (isPlaywrightNode(node)) {
            if (!this.playwright) throw new Error('Playwright worker not initialized — missing launchBrowser step')
            const action = getPlaywrightAction(node.id, index)
            await this.runPlaywrightWithRetry(action)
            return
        }

        throw new Error(`Unsupported node type: ${node.type}`)
    }

    private async launchBrowser(data: LaunchBrowserNodeData, workflowName: string) {
        this.config = toRuntimeConfig(data, workflowName)
        await fs.mkdir(this.config.userDataDir, { recursive: true })

        this.browser = await chromium.launchPersistentContext(this.config.userDataDir, {
            ...this.config.launch,
            recordHar: this.config.launch.recordHar ?? {
                path: path.join(appRoot, 'workflows', workflowName, 'network.har'),
                content: 'embed',
                mode: 'minimal'
            }
        })

        this.playwright = new PlaywrightWorker(this.browser, this.config)

        if (this.config.networkInterception.length > 0) {
            this.network = new NetworkInterceptorWorker({
                playwright: this.playwright,
                config: this.config,
                requests: [],
                responses: [],
                environment: this.environment
            })
            this.network.startNetworkRecording()
        }
    }

    private async closeBrowser() {
        const context = this.browser ?? this.playwright?.browser
        if (!context) return

        // Persistent contexts keep Chrome open until the context is closed; closing the
        // last tab via closePage is not enough.

        // for (const page of context.pages()) {
        //     if (!page.isClosed()) {
        //         await page.close({ runBeforeUnload: false })
        //     }
        // }

        await context.close({ reason: 'normal' })

        this.browser = null
        this.playwright = null
        this.network = null
        this.config = null
    }

    private async runPlaywrightWithRetry(action: WorkflowAction) {
        const maxRetries = this.config?.execution.maxRetries ?? 0
        let lastError: unknown

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await this.playwright!.runPlaywrightAction(action as BotActions)
                return
            } catch (err) {
                lastError = err
                if (attempt < maxRetries) {
                    logger.warn('WORKFLOW_ACTION_RETRY', {
                        meta: { action: action.name, attempt: attempt + 1, maxRetries }
                    })
                }
            }
        }

        throw lastError
    }
}
