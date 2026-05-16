import type { BrowserContext, Page } from 'playwright'
import {
    isCheckAction,
    isClickAction,
    isFillAction,
    isHoverAction,
    isPageCloseAction,
    isPressAction,
    isSelectAction,
    isSetInputFilesAction,
    isUnCheckAction,
    isUrlAction
} from '../../types/typeGuards.js'
import type { Action, RuntimeConfig } from './types.js'

export class PlaywrightWorker {
    browser: BrowserContext
    config: RuntimeConfig
    pages = new Map<string, Page>()

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
        await page.locator(action.selector).click({ clickCount: action.clickCount, button: action.button })
    }

    async fill(action: Action) {
        if (!isFillAction(action)) throw new Error('This action is not fill action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).fill(action.text)
    }

    async press(action: Action) {
        if (!isPressAction(action)) throw new Error('This action is not press action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).press(action.key)
    }

    async check(action: Action) {
        if (!isCheckAction(action)) throw new Error('This action is not check action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).check()
    }

    async uncheck(action: Action) {
        if (!isUnCheckAction(action)) throw new Error('This action is not uncheck action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).uncheck()
    }

    async select(action: Action) {
        if (!isSelectAction(action)) throw new Error('This action is not select action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).selectOption(action.options)
    }

    async hover(action: Action) {
        if (!isHoverAction(action)) throw new Error('This action is not hover action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).hover()
    }

    async setInputFiles(action: Action) {
        if (!isSetInputFilesAction(action)) throw new Error('This action is not set input files action')
        const page = this.getPage(action.pageGuid)
        await this.waitForPrecondition(action)
        await page.locator(action.selector).setInputFiles(action.files)
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
            default:
                throw new Error(`Cannot find relevant function for ${action.name} in playwright runtime`)
        }
    }
}
