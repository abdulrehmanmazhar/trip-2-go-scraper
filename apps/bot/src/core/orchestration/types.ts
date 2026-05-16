export type SessionStatus = 'idle' | 'running' | 'completed' | 'failed'

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
