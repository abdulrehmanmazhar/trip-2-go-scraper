export type ClickAction = {
    name: 'click'
    button: 'left' | 'middle' | 'right'
    modifiers: number
    clickCount: number
}

export type HoverAction = {
    name: 'hover'
}

export type CheckAction = {
    name: 'check'
}

export type UncheckAction = {
    name: 'uncheck'
}

export type FillAction = {
    name: 'fill'
    text: string
}

export type Navigate = {
    name: 'navigate'
    url: string
}

export type OpenPage = {
    name: 'openPage'
    url: string
}

export type ClosesPage = {
    name: 'closePage'
}

export type PressAction = {
    name: 'press'
    key: string
    modifiers: number
}

export type SelectAction = {
    name: 'select'
    options: string[]
}

export type SetInputFilesAction = {
    name: 'setInputFiles'
    files: string[]
}

export type NavigateAction = {
    name: 'navigate'
    url: string
}

export type OpenPageAction = {
    name: 'openPage'
    url: string
}

export type ClosesPageAction = {
    name: 'closePage'
}

export type TPlaywrightAction =
    | ClickAction
    | HoverAction
    | CheckAction
    | ClosesPageAction
    | OpenPageAction
    | UncheckAction
    | FillAction
    | NavigateAction
    | PressAction
    | SelectAction
    | SetInputFilesAction

export type TNetworkInterceptorAction = {
    name: 'networkInterceptionAction'
    url: string
    type: 'http' | 'ws'
    action: 'request' | 'response'
    body: unknown // this would be ajv compatible schema
}

export type PlaywrightConfigs = {
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
}

export type LaunchBrowserAction = {
    name: 'launchBrowser'
    config: PlaywrightConfigs
}

export type CloseBrowserAction = {
    name: 'closeBrowser'
}

export type TBrowserAction = LaunchBrowserAction | CloseBrowserAction

export type CustomServerAction = {
    name: 'serverAction'
    type: 'custom'
    runtimeEnvRef: 'environment' | 'context'
    action: {
        url: string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE'
        body: unknown
    }
}

export type BuiltInServerAction = {
    name: 'serverAction'
    type: 'built-in'
    runtimeEnvRef: 'environment' | 'context'
    action: {
        timeout: number
        function: 'get-otp'
    }
}

export type TServerAction = BuiltInServerAction | CustomServerAction

export type TInterruptionAction = {
    name: 'interruptionAction'
    timeout: number
    preconditionSelector: string | null
    resolve: {
        selector: string
        attr: 'visible' | 'hidden'
    }
}

// export type ControlFlowAction = IfElseAction |

// // {
// //     name: 'controlFlowAction'
// //     type: 'if' | 'loop'
// //     condition: 'check'
// // }

// export type IfElseAction = {
//     name: 'ifElseAction'
//     condition: 'checkEqual' | 'checkGreaterThan' | 'checkLessThan'
// }
