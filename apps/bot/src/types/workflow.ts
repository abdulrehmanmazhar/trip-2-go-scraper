import type { BotActions } from './types.js'

export type WorkflowGraphNode = {
    id: string
    type: 'playwrightAction' | 'browserAction' | string
    data: Record<string, unknown>
}

export type WorkflowGraphEdge = {
    id?: string
    source: string
    target: string
    type?: string
}

export type WorkflowGraph = {
    nodes: WorkflowGraphNode[]
    edges: WorkflowGraphEdge[]
}

export type WorkflowFile = {
    id: string
    name: string
    description?: string
    graph: WorkflowGraph
    version?: string
}

export type LaunchBrowserNodeData = {
    name: 'launchBrowser'
    config: {
        userDataDir: string
        launch: Record<string, unknown>
        execution: {
            blockUserInput: boolean
            humanInLoopOnError: boolean
            maxRetries: number
            actionTimeout: number
            navigationTimeout: number
        }
        networkInterception?: {
            url: string
            type: 'http' | 'ws'
            action: 'request' | 'response'
            body: unknown
        }[]
    }
}

export type CloseBrowserNodeData = {
    name: 'closeBrowser'
}

export type PlaywrightGraphAction = BotActions
