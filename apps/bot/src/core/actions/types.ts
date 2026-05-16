import type { BotActions, InturrptionAction, ServerAction } from '../../types/types.js'

export type Action = BotActions

export type RuntimeConfig = {
    userDataDir: string
    launch: {
        headless?: boolean
        executablePath?: string
        channel?: 'chrome' | 'msedge' | 'chromium'
        args?: string[]
        ignoreDefaultArgs?: boolean | string[]
        devtools?: boolean
        slowMo?: number
        timeout?: number
        proxy?: {
            server: string
            bypass?: string
            username?: string
            password?: string
        }
        ignoreHTTPSErrors?: boolean
        bypassCSP?: boolean
        httpCredentials?: {
            username: string
            password: string
        }
        acceptDownloads?: boolean
        downloadsPath?: string
        locale?: string
        timezoneId?: string
        geolocation?: {
            latitude: number
            longitude: number
            accuracy?: number
        }
        permissions?: string[]
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
        userAgent?: string
        extraHTTPHeaders?: Record<string, string>
        storageState?:
            | string
            | {
                  cookies?: unknown[]
                  origins?: unknown[]
              }
        offline?: boolean
        colorScheme?: 'light' | 'dark' | 'no-preference'
        reducedMotion?: 'reduce' | 'no-preference'
        forcedColors?: 'active' | 'none'
        javaScriptEnabled?: boolean
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
        serviceWorkers?: 'allow' | 'block'
        baseURL?: string
        strictSelectors?: boolean
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

export type Environment = Record<string, unknown>

export type WorkflowAction = BotActions | ServerAction | InturrptionAction

export type ExecutionMeta = {
    status: 'idle' | 'executing' | 'completed' | 'failed'
    retries: number
    message: string
    errors: Error[]
}

export const createExecutionMeta = (): ExecutionMeta => ({
    status: 'idle',
    retries: 0,
    message: '',
    errors: []
})
