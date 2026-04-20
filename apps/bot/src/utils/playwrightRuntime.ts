import { chromium, firefox, webkit } from 'playwright'
import type { Browser, Page, Locator } from 'playwright'
import fs from 'fs'
import type { FrameDescription, Action as ActionEntity } from '../types/types.js'

type Action = FrameDescription & ActionEntity

type RuntimeConfig = {
    browser: {
        name: 'chromium' | 'firefox' | 'webkit'
        launchOptions?: Parameters<typeof chromium.launch>[0]
        contextOptions?: Parameters<Browser['newContext']>[0]
    }
    execution: {
        defaultTimeout: number
        navigationTimeout: number
        actionTimeout: number
        maxRetries: number
        retryDelay: number
        slowMo?: number

        blockUserInput?: boolean
        humanInLoopOnError?: boolean
    }
}

// ---------- TYPE GUARDS ----------

function isRuntimeConfig(obj: unknown): obj is RuntimeConfig {
    return typeof obj === 'object' && obj !== null && 'browser' in obj && 'execution' in obj
}

// ---------- SELECTOR PARSER ----------

function parseSelector(selector: string): (page: Page) => Locator {
    if (selector.startsWith('internal:role=')) {
        const match = selector.match(/role=([^\[]+)\[name="(.+?)"/)
        if (match) {
            const [, role, name] = match
            return (page: Page) => page.getByRole(role as Parameters<Page['getByRole']>[0], { name })
        }
    }

    return (page: Page) => page.locator(selector)
}

// ---------- RUNTIME ----------

export class PlaywrightRuntime {
    private browser!: Browser
    private pages = new Map<string, Page>()
    private config!: RuntimeConfig
    private pauseController = new PauseController()
    private isInitialized = false

    // ---------- INIT ----------

    async init(config: RuntimeConfig) {
        if (this.isInitialized) return // ✅ prevent multiple launches

        this.isInitialized = true
        this.config = config

        const browserType = config.browser.name === 'firefox' ? firefox : config.browser.name === 'webkit' ? webkit : chromium

        this.browser = await browserType.launch({
            ...config.browser.launchOptions,
            slowMo: config.execution.slowMo
        })
    }

    // ---------- PAGE ----------

    async openPage(action: Action & { url: string }) {
        const context = await this.browser.newContext({
            ...this.config.browser.contextOptions
        })

        const page = await context.newPage()

        page.setDefaultTimeout(this.config.execution.actionTimeout)
        page.setDefaultNavigationTimeout(this.config.execution.navigationTimeout)

        this.pages.set(action.pageGuid, page) // ✅ register FIRST

        if (action.url) {
            await page.goto(action.url)
        }
    }

    getPage(pageGuid: string): Page {
        const page = this.pages.get(pageGuid)
        if (!page) throw new Error(`Page not found: ${pageGuid}`)
        return page
    }

    locator(page: Page, selector: string): Locator {
        return parseSelector(selector)(page)
    }

    // ---------- RETRY ----------

    // async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    //     const { maxRetries, retryDelay } = this.config.execution

    //     let lastError: unknown

    //     for (let i = 0; i <= maxRetries; i++) {
    //         try {
    //             return await fn()
    //         } catch (err) {
    //             lastError = err
    //             if (i === maxRetries) break
    //             await new Promise((res) => setTimeout(res, retryDelay))
    //         }
    //     }

    //     throw lastError
    // }

    async withRetry<T>(fn: () => Promise<T>, action: Action): Promise<T | void> {
        const { maxRetries, retryDelay, humanInLoopOnError } = this.config.execution

        let lastError: unknown

        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await fn()
            } catch (err) {
                lastError = err

                if (i < maxRetries) {
                    await new Promise((res) => setTimeout(res, retryDelay))
                    continue
                }

                // 🔥 HUMAN IN LOOP
                if (humanInLoopOnError) {
                    console.error('Action failed:', action, err)

                    const page = action.pageGuid ? this.pages.get(action.pageGuid) : undefined

                    if (page) {
                        await this.unblockUserInteraction(page)
                    }

                    const decision = await this.pauseController.wait()

                    if (decision === 'retry') {
                        if (page && this.config.execution.blockUserInput) {
                            await this.blockUserInteraction(page)
                        }
                        return this.withRetry(fn, action)
                    }

                    if (decision === 'skip') {
                        return
                    }

                    if (decision === 'resume') {
                        if (page && this.config.execution.blockUserInput) {
                            await this.blockUserInteraction(page)
                        }
                        return
                    }
                }

                throw lastError
            }
        }

        throw lastError
    }

    // ---------- PRECONDITION ----------

    async waitForPrecondition(page: Page, selector?: string) {
        if (!selector) return

        const loc = this.locator(page, selector)
        await loc.waitFor({
            state: 'visible',
            timeout: this.config.execution.actionTimeout
        })
    }

    // ---------- SAFE ACTION ----------

    async safeLocatorAction(locator: Locator, action: () => Promise<unknown>) {
        await locator.waitFor({
            state: 'visible',
            timeout: this.config.execution.actionTimeout
        })

        return action()
    }

    // ---------- ACTION EXECUTION ----------

    async runAction(action: Action) {
        return this.withRetry(async () => {
            console.log('RUNNING ACTION', action)

            switch (action.name) {
                case 'openPage': {
                    await this.openPage(action)
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }
                    break
                }

                case 'navigate': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }

                    await page.goto(action.url)
                    break
                }

                case 'click': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }

                    await this.waitForPrecondition(page, action.preconditionSelector)

                    const loc = this.locator(page, action.selector)

                    await this.safeLocatorAction(loc, () =>
                        loc.click({
                            button: action.button,
                            clickCount: action.clickCount ?? 1
                        })
                    )
                    break
                }

                case 'fill': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }

                    await this.waitForPrecondition(page, action.preconditionSelector)

                    const loc = this.locator(page, action.selector)

                    await this.safeLocatorAction(loc, () => loc.fill(action.text))
                    break
                }

                case 'press': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }

                    await this.waitForPrecondition(page, action.preconditionSelector)

                    const loc = this.locator(page, action.selector)

                    await this.safeLocatorAction(loc, () => loc.press(action.key))
                    break
                }

                case 'hover': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }

                    await this.waitForPrecondition(page, action.preconditionSelector)

                    const loc = this.locator(page, action.selector)

                    await this.safeLocatorAction(loc, () => loc.hover())
                    break
                }

                case 'closePage': {
                    const page = this.getPage(action.pageGuid)

                    if (this.config.execution.blockUserInput) {
                        await this.blockUserInteraction(page)
                    }
                    await page.close()
                    break
                }

                default:
                    console.warn(`Unknown action: ${action.name}`)
            }
        }, action)
    }

    // ---------- BLOCKADE ----------

    async blockUserInteraction(page: Page) {
        await page.evaluate(() => {
            if ((window as any).__pw_blocked) return
            ;(window as any).__pw_blocked = true

            const stop = (e: Event) => {
                e.stopPropagation()
                e.preventDefault()
            }

            const events = ['click', 'mousedown', 'mouseup', 'keydown', 'keyup']

            events.forEach((ev) => document.addEventListener(ev, stop, true))
            ;(window as any).__pw_block_cleanup = () => {
                events.forEach((ev) => document.removeEventListener(ev, stop, true))
            }
        })
    }

    async unblockUserInteraction(page: Page) {
        await page.evaluate(() => {
            if ((window as any).__pw_block_cleanup) {
                ;(window as any).__pw_block_cleanup()
                delete (window as any).__pw_blocked
            }
        })
    }

    // ---------- RUN ----------

    async run(jsonlPath: string) {
        process.stdin.setEncoding('utf-8')
        process.stdin.resume()

        process.stdin.on('data', (data) => {
            const input = data.trim()

            console.log('CLI INPUT:', input)

            if (input === 'r') this.pauseController.resolve('retry')
            if (input === 's') this.pauseController.resolve('skip')
            if (input === 'c') this.pauseController.resolve('resume')
        })

        const lines = fs.readFileSync(jsonlPath, 'utf-8').split('\n')

        for (const line of lines) {
            if (!line.trim()) continue

            const parsed: unknown = JSON.parse(line)

            if (isRuntimeConfig(parsed)) {
                await this.init(parsed)
                continue
            }

            await this.runAction(parsed as Action)
        }

        await this.browser.close()
    }
}

type PauseDecision = 'retry' | 'skip' | 'resume'

class PauseController {
    private resolver: ((value: PauseDecision) => void) | null = null

    wait(): Promise<PauseDecision> {
        return new Promise((res) => {
            this.resolver = res
        })
    }

    resolve(decision: PauseDecision) {
        if (this.resolver) {
            this.resolver(decision)
            this.resolver = null
        }
    }
}
