import constants, { APIS } from '@/constants'

const apiRoot = `${constants.BACKEND_LINK}${constants.API_VERSION}`

/** Must match dashboard-backend `WORKFLOW_TEST_WS_PATH`. */
export const WORKFLOW_TEST_WS_PATH = '/ws/workflow-test'

export function buildWorkflowTestWsUrl(testId: string): string {
    const wsBase = constants.BACKEND_LINK.replace(/^http/, 'ws')
    return `${wsBase}${WORKFLOW_TEST_WS_PATH}?testId=${encodeURIComponent(testId)}`
}

export type WorkflowTestStatus = 'running' | 'completed' | 'failed'

export type TerminalLine = {
    id: string
    ts: number
    level: 'info' | 'success' | 'warn' | 'error'
    text: string
    raw?: unknown
}

export type StartWorkflowTestResult = {
    testId: string
    sessionId: string
    botId: string
    workflowId: string
    workflowName: string
    status: WorkflowTestStatus
}

export type WorkflowTestInfo = StartWorkflowTestResult & {
    startedAt: number
    endedAt?: number
    lineCount: number
}

async function parseJsonError(res: Response): Promise<string> {
    try {
        const json = (await res.json()) as { message?: string }
        return json.message || 'Request failed'
    } catch {
        return 'Request failed'
    }
}

export async function startWorkflowTest(botId: string, workflowId: string): Promise<StartWorkflowTestResult> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOW_TESTS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, workflowId })
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: StartWorkflowTestResult }
    if (!json.data) {
        throw new Error('Invalid response')
    }
    return json.data
}

export async function fetchWorkflowTest(testId: string): Promise<WorkflowTestInfo> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOW_TESTS}/${encodeURIComponent(testId)}`, {
        credentials: 'include'
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: WorkflowTestInfo }
    if (!json.data) {
        throw new Error('Invalid response')
    }
    return json.data
}

export async function fetchActiveWorkflowTests(): Promise<
    Pick<WorkflowTestInfo, 'testId' | 'sessionId' | 'botId' | 'workflowId' | 'workflowName' | 'status' | 'startedAt'>[]
> {
    const res = await fetch(`${apiRoot}${APIS.WORKFLOW_TESTS}/active`, { credentials: 'include' })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as {
        data?: Pick<WorkflowTestInfo, 'testId' | 'sessionId' | 'botId' | 'workflowId' | 'workflowName' | 'status' | 'startedAt'>[]
    }
    return json.data ?? []
}

export const WORKFLOW_TEST_STORAGE_KEY = 'figgo.workflowTest.activeTestId'
