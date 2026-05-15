import { chromium, type BrowserContext, type Page, type Request, type Response } from 'playwright'
import type { BotActions, InturrptionAction, ServerAction } from '../types/types.js'
import logger from './logger.js'
import { getMachineInfo, getProcessStats, getQuickHealth } from './process.js'
import {
    isCheckAction,
    isClickAction,
    isFillAction,
    isHoverAction,
    isInturrptionAction,
    isPageCloseAction,
    isPlaywrightAction,
    isPressAction,
    isSelectAction,
    isServerAction,
    isSetInputFilesAction,
    isUnCheckAction,
    isUrlAction
} from '../types/typeGuards.js'
import { matchSchema } from './matchSchema.js'
import type { JSONSchemaType } from 'ajv'

type Action = BotActions

export type RuntimeConfig = {
    userDataDir: string
    launch: {
        // 🔹 Core
        headless?: boolean
        executablePath?: string
        channel?: 'chrome' | 'msedge' | 'chromium'
        args?: string[]
        ignoreDefaultArgs?: boolean | string[]

        // 🔹 Debug / Dev
        devtools?: boolean
        slowMo?: number
        timeout?: number

        // 🔹 Network
        proxy?: {
            server: string
            bypass?: string
            username?: string
            password?: string
        }

        // 🔹 Security
        ignoreHTTPSErrors?: boolean
        bypassCSP?: boolean
        httpCredentials?: {
            username: string
            password: string
        }

        // 🔹 Downloads
        acceptDownloads?: boolean
        downloadsPath?: string

        // 🔹 Locale / Region
        locale?: string
        timezoneId?: string
        geolocation?: {
            latitude: number
            longitude: number
            accuracy?: number
        }
        permissions?: string[]

        // 🔹 Device / View
        viewport?: {
            width: number
            height: number
        } | null
        screen?: {
            width: number
            height: number
        }
        deviceScaleFactor?: number
        isMobile?: boolean
        hasTouch?: boolean

        // 🔹 Browser Identity
        userAgent?: string
        extraHTTPHeaders?: Record<string, string>

        // 🔹 Storage / Session
        storageState?:
            | string
            | {
                  cookies?: unknown[]
                  origins?: unknown[]
              }

        // 🔹 Network Behavior
        offline?: boolean

        // 🔹 Media / Rendering
        colorScheme?: 'light' | 'dark' | 'no-preference'
        reducedMotion?: 'reduce' | 'no-preference'
        forcedColors?: 'active' | 'none'

        // 🔹 JS Control
        javaScriptEnabled?: boolean

        // 🔹 Recording / Debugging
        recordHar?: {
            path: string
            content?: 'omit' | 'embed' | 'attach'
            mode?: 'full' | 'minimal'
        }
        recordVideo?: {
            dir: string
            size?: {
                width: number
                height: number
            }
        }

        // 🔹 Service Workers
        serviceWorkers?: 'allow' | 'block'

        // 🔹 Base URL (useful for routing systems)
        baseURL?: string

        // 🔹 Strict mode
        strictSelectors?: boolean

        // 🔹 Advanced (rare)
        clientCertificates?: Array<{
            origin: string
            certPath?: string
            keyPath?: string
            passphrase?: string
        }>
    }
    execution: {
        blockUserInput: boolean
        humanInLoopOnError: boolean
        maxRetries: number
        actionTimeout: number
        navigationTimeout: number
    }
    networkInterception: {
        url: string
        type: 'http' | 'ws'
        action: 'request' | 'response'
        body: unknown
    }[]
}

type Environment = Record<string, unknown>

// const defaultExecutionMeta = {
//     status: 'idle' as const,
//     retries: 0,
//     message: '',
//     errors: []
// }

const createExecutionMeta = () => ({
    status: 'idle' as const,
    retries: 0,
    message: '',
    errors: []
})

class CreateContext {
    environment: Environment = {}
    // browser!: BrowserContext
    // pages = new Map<string, Page>() //{pageid, Page}
    playwright!: PlaywrightWorker
    database!: DatabaseWorker
    server!: ServerWorker
    intrupption!: IntrruptionWorker
    controlFlow!: ControlFlowWorker
    config!: RuntimeConfig
    actions: (Action | ServerAction | InturrptionAction)[] = []
    execution: Record<
        string,
        {
            status: 'idle' | 'executing' | 'completed' | 'failed'
            retries: number
            message: string
            errors: Error[]
        }
    > = {}
    requests: unknown[] = []
    responses: unknown[] = []

    constructor(initialContext: Environment = {}, config: RuntimeConfig, actions: Action[]) {
        this.environment = initialContext
        this.config = config
        this.actions = actions
    }

    set(key: string, value: unknown) {
        this.environment[key] = value
    }

    get(key: string) {
        return this.environment[key]
    }
}

// Playwright actions line by line execution logic
export class PlaywrightWorker {
    config!: RuntimeConfig
    browser!: BrowserContext
    pages = new Map<string, Page>() //{pageid, Page}

    // private context!: CreateContext

    constructor(browser: BrowserContext, config: RuntimeConfig) {
        this.browser = browser
        this.config = config
    }

    getPage(pageGuid: string) {
        const page = this.pages.get(pageGuid)
        if (!page) throw new Error('page not found')
        return page
    }

    async waitForPrecondition(action: Action) {
        if (!action.preconditionSelector) return

        const page = this.getPage(action.pageGuid)

        const loc = page.locator(action.preconditionSelector)

        await loc.waitFor({ state: 'visible', timeout: this.config.execution.actionTimeout })
    }

    async openPage(action: Action) {
        if (!isUrlAction(action)) throw new Error('The action is not open page action')

        const page = await this.browser.newPage()

        page.setDefaultTimeout(this.config.execution.actionTimeout)
        page.setDefaultNavigationTimeout(this.config.execution.navigationTimeout)

        await page.goto(action.url)
        this.pages.set(action.pageGuid, page)
    }

    async navigate(action: Action) {
        if (!isUrlAction(action)) throw new Error('The action is not navigation action')

        const page = this.getPage(action.pageGuid)

        await page.goto(action.url)
    }

    async click(action: Action) {
        if (!isClickAction(action)) throw new Error('This action is not click action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.click({ clickCount: action.clickCount, button: action.button })
    }

    async fill(action: Action) {
        if (!isFillAction(action)) throw new Error('This action is not fill action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.fill(action.text)
    }

    async press(action: Action) {
        if (!isPressAction(action)) throw new Error('This action is not press action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.press(action.key)
    }

    async check(action: Action) {
        if (!isCheckAction(action)) throw new Error('This action is not check action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.check()
    }

    async uncheck(action: Action) {
        if (!isUnCheckAction(action)) throw new Error('This action is not uncheck action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.uncheck()
    }

    async select(action: Action) {
        if (!isSelectAction(action)) throw new Error('This action is not select action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.selectOption(action.options)
    }

    async hover(action: Action) {
        if (!isHoverAction(action)) throw new Error('This action is not hover action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.hover()
    }

    async setInputFiles(action: Action) {
        if (!isSetInputFilesAction(action)) throw new Error('This action is not set input files action')

        const page = this.getPage(action.pageGuid)

        await this.waitForPrecondition(action)

        const loc = page.locator(action.selector)

        await loc.setInputFiles(action.files)
    }

    async closePage(action: Action) {
        if (!isPageCloseAction(action)) throw new Error('This action is not page close action')

        const page = this.getPage(action.pageGuid)

        await page.close()

        this.pages.delete(action.pageGuid)
    }

    async runPlaywrightAction(action: Action) {
        switch (action.name) {
            case 'check':
                return this.check(action)
            case 'click':
                return this.click(action)
            case 'hover':
                return this.hover(action)
            case 'closePage':
                return this.closePage(action)
            case 'fill':
                return this.fill(action)
            case 'navigate':
                return this.navigate(action)
            case 'openPage':
                return this.openPage(action)
            case 'press':
                return this.press(action)
            case 'select':
                return this.select(action)
            case 'uncheck':
                return this.uncheck(action)
            case 'setInputFiles':
                return this.setInputFiles(action)
            // case 'assertText':
            //     return this.click(action)
            // case 'assertValue':
            //     return this.click(action)
            // case 'assertChecked':
            //     return this.click(action)
            // case 'assertVisible':
            //     return this.click(action)
            // case 'assertSnapshot':
            //     return this.click(action)

            default:
                throw new Error(`Cannot find relevant function for ${action.name} in playwright runtime`)
        }
    }
}

export class NetworkInterceptorWorker {
    browser!: BrowserContext
    rules!: RuntimeConfig['networkInterception']
    requests!: unknown[]
    responses!: unknown[]

    constructor(context: {
        playwright: PlaywrightWorker
        config: RuntimeConfig
        requests: unknown[]
        responses: unknown[]
        environment: Record<string, unknown>
    }) {
        this.browser = context.playwright.browser
        this.rules = context.config.networkInterception
        this.requests = context.requests
        this.responses = context.responses
    }

    satisfiesCriteria(params: RuntimeConfig['networkInterception'][0]) {
        if (!this.rules.length) return false

        for (const rule of this.rules) {
            if (!params.url.includes(rule.url)) continue
            if (params.action !== rule.action) continue
            if (params.type !== rule.type) continue
            if (!matchSchema(params.body, rule.body as JSONSchemaType<unknown>)) continue
            return true
        }

        return false
    }

    interceptSocketRequest(payload: string | Buffer<ArrayBufferLike>, url: string) {
        const data = {
            type: 'ws',
            url,
            payload,
            timestamp: Date.now()
        }

        const proceed = this.satisfiesCriteria({ url: data.url, type: 'ws', action: 'request', body: data.payload })

        if (!proceed) return

        this.requests.push(data)
    }

    interceptSocketResponse(payload: string | Buffer<ArrayBufferLike>, url: string) {
        const data = {
            type: 'ws',
            url,
            payload,
            timestamp: Date.now()
        }

        const proceed = this.satisfiesCriteria({ url: data.url, type: 'ws', action: 'response', body: data.payload })

        if (!proceed) return

        this.responses.push(data)
    }

    interceptHttpRequest(request: Request) {
        const data = {
            type: 'http',
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            resourceType: request.resourceType(),
            timestamp: Date.now()
        }

        const proceed = this.satisfiesCriteria({ url: data.url, type: 'http', action: 'request', body: data.postData })

        if (!proceed) return

        this.requests.push(data)
    }

    async interceptHttpResponse(response: Response) {
        const req = response.request()

        let parsedBody: unknown = null

        try {
            const body = await response.body()
            const contentType = response.headers()['content-type'] || ''

            if (contentType.includes('application/json')) {
                parsedBody = JSON.parse(body.toString('utf-8'))
            } else if (contentType.startsWith('text/')) {
                parsedBody = body.toString('utf-8')
            } else {
                parsedBody = body.toString('base64')
            }
        } catch {
            parsedBody = null
        }

        const data = {
            type: 'http',
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            request: {
                method: req.method(),
                headers: req.headers()
            },
            body: parsedBody,
            timestamp: Date.now()
        }

        const proceed = this.satisfiesCriteria({ url: data.url, type: 'http', action: 'response', body: data.body })

        if (!proceed) return

        this.responses.push(data)
    }

    startNetworkRecording() {
        this.browser.on('page', (page) => {
            const url = page.url()
            page.on('websocket', (ws) => {
                ws.on('framereceived', (frame) => {
                    this.interceptSocketResponse(frame.payload, url)
                })

                ws.on('framesent', (frame) => {
                    this.interceptSocketRequest(frame.payload, url)
                })
            })
        })

        this.browser.on('response', (arg) => this.interceptHttpResponse(arg))

        this.browser.on('request', (arg) => this.interceptHttpRequest(arg))
    }
}

export class DatabaseWorker {}

export class ServerWorker {
    runServerAction(action: unknown) {
        return action
    }
}

export class IntrruptionWorker {
    runIntrruptionAction(action: unknown) {
        return action
    }
}

export class ControlFlowWorker {}

export class ExecutionEngine {
    private context!: CreateContext

    constructor(context: CreateContext) {
        this.context = context
    }

    start() {
        if (Object.entries(this.context.execution).length) throw new Error('Cannot start the running session')

        this.context.execution = Object.fromEntries(this.context.actions.map((_, index) => [`${index}`, createExecutionMeta()]))
    }

    async executeSession() {
        if (Object.entries(this.context.execution).some(([_, value]) => value.status !== 'idle'))
            throw new Error('Cannot re-execute the running session')
        const browser = await chromium.launchPersistentContext(this.context.config.userDataDir, this.context.config.launch)
        this.context.playwright = new PlaywrightWorker(browser, this.context.config)

        for (let i = 0; i < this.context.actions.length; i++) {
            await this.runAction(i)
        }
    }

    async runAction(index: number) {
        const action = this.context.actions[index]
        const execution = this.context.execution[`${index}`]
        if (!action || !execution) throw new Error('Cannot execute undefined action')

        if (execution.retries >= this.context.config.execution.maxRetries) throw new Error('Exeeding max retries ')

        execution.status = 'executing'

        if (isServerAction(action)) {
            this.context.server.runServerAction(action)
        } else if (isInturrptionAction(action)) {
            this.context.intrupption.runIntrruptionAction(action)
        } else if (isPlaywrightAction(action)) {
            await this.context.playwright.runPlaywrightAction(action)
        }
    }
}

// Bot orchestrator
export class BotOrchestrator {
    private contexts = new Map<string, CreateContext>() //{browserKey, Context}

    createContext(initialContext: Environment = {}, config: RuntimeConfig, actions: Action[], sessionId: string) {
        if (this.contexts.has(sessionId)) throw new Error('Cannot spawn a duplicate session')
        const context = new CreateContext(initialContext, config, actions)
        this.contexts.set(sessionId, context)
        return context
    }

    getSessionContext(sessionId: string) {
        const context = this.contexts.get(sessionId)

        if (!context) return null

        return context
    }

    async closeSession(sessionId: string) {
        const context = this.getSessionContext(sessionId)
        if (!context) throw new Error('Could not find the session')

        if (
            Object.entries(context.execution).length !== context.actions.length ||
            Object.entries(context.execution).some(([_, value]) => value.status === 'executing' || value.status === 'idle')
        )
            throw new Error('Cannot close a session while some actions pending')

        await context.playwright.browser.close({ reason: 'Session closing event' })

        this.contexts.delete(sessionId)
    }

    async executeSession(sessionId: string) {
        const context = this.getSessionContext(sessionId)
        if (!context) throw new Error('Could not find the session')
        if (Object.entries(context.execution).some(([_, value]) => value.status !== 'idle')) throw new Error('Cannot re-execute the running session')
        const browser = await chromium.launchPersistentContext(context.config.userDataDir, context.config.launch)
        context.playwright = new PlaywrightWorker(browser, context.config)

        browser.on('close', async () => {
            try {
                await this.closeSession(sessionId)
            } catch (error) {
                if (error instanceof Error && error.message === 'Could not find the session') {
                    logger.info('BROWER_CLOSE', { meta: 'Browser closed successfully' })
                } else {
                    logger.error('BROWSER_CRASH', { meta: error })
                    throw error
                }
            }
        })
    }

    exitBot() {
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

    getSessionExecution(sessionId: string) {
        const context = this.getSessionContext(sessionId)
        if (!context) throw new Error('Could not find the session')

        return {
            executionState: context.execution,
            actions: context.actions
        }
    }
}
