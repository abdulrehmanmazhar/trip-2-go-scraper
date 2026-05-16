import type { BrowserContext } from 'playwright'
import type { BotActions } from '../../types/types.js'
import type { LaunchBrowserNodeData } from '../../types/workflow.js'
import logger from '../../utils/logger.js'
import { BrowserManager, NetworkInterceptorWorker, PlaywrightWorker, resolveUserDataDir } from '../actions/index.js'
import type { RuntimeConfig, WorkflowAction } from '../actions/types.js'
import type { SessionStatus } from './types.js'

const toRuntimeConfig = (launchData: LaunchBrowserNodeData, workflowName: string): RuntimeConfig => {
    const { config } = launchData
    return {
        userDataDir: resolveUserDataDir(config.userDataDir, workflowName),
        launch: config.launch as RuntimeConfig['launch'],
        execution: config.execution,
        networkInterception: config.networkInterception ?? []
    }
}

/**
 * One workflow session owns at most one browser context for its entire lifetime.
 */
export class WorkflowSession {
    readonly id: string
    environment: Record<string, unknown> = {}
    status: SessionStatus = 'idle'
    workflowName: string | null = null

    private browser: BrowserContext | null = null
    private playwright: PlaywrightWorker | null = null
    private interceptor: NetworkInterceptorWorker | null = null
    private config: RuntimeConfig | null = null
    private readonly browserManager = new BrowserManager()

    constructor(id: string) {
        this.id = id
    }

    get hasBrowser(): boolean {
        return this.browser !== null
    }

    get runtimeConfig(): RuntimeConfig | null {
        return this.config
    }

    assertNoBrowser(action: string): void {
        if (this.browser) {
            throw new Error(`${action}: session "${this.id}" already has an active browser (one browser per workflow session)`)
        }
    }

    assertBrowser(action: string): void {
        if (!this.browser || !this.playwright) {
            throw new Error(`${action}: session "${this.id}" has no active browser — run launchBrowser first`)
        }
    }

    async launchBrowser(launchData: LaunchBrowserNodeData, workflowName: string): Promise<void> {
        this.assertNoBrowser('launchBrowser')
        this.workflowName = workflowName
        this.config = toRuntimeConfig(launchData, workflowName)
        this.browser = await this.browserManager.launchForWorkflow(this.config, workflowName)
        this.playwright = new PlaywrightWorker(this.browser, this.config)

        if (this.config.networkInterception.length > 0) {
            this.interceptor = new NetworkInterceptorWorker({
                playwright: this.playwright,
                config: this.config,
                requests: [],
                responses: [],
                environment: this.environment
            })
            this.interceptor.startNetworkRecording()
        }

        logger.info('SESSION_BROWSER_LAUNCHED', { meta: { sessionId: this.id, workflowName } })
    }

    async closeBrowser(): Promise<void> {
        if (!this.browser) return

        await this.browserManager.close(this.browser)

        this.browser = null
        this.playwright = null
        this.interceptor = null
        this.config = null

        logger.info('SESSION_BROWSER_CLOSED', { meta: { sessionId: this.id } })
    }

    async runPlaywrightAction(action: WorkflowAction): Promise<void> {
        this.assertBrowser('runPlaywrightAction')

        const maxRetries = this.config!.execution.maxRetries ?? 0
        let lastError: unknown

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await this.playwright!.runPlaywrightAction(action as BotActions)
                return
            } catch (err) {
                lastError = err
                if (attempt < maxRetries) {
                    logger.warn('WORKFLOW_ACTION_RETRY', {
                        meta: { sessionId: this.id, action: action.name, attempt: attempt + 1, maxRetries }
                    })
                }
            }
        }

        throw lastError
    }

    async dispose(): Promise<void> {
        if (this.hasBrowser) {
            await this.closeBrowser()
        }
        this.status = 'idle'
        this.workflowName = null
    }
}
