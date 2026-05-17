import { randomUUID } from 'node:crypto'
import type WebSocket from 'ws'

export type WorkflowTestStatus = 'running' | 'completed' | 'failed'

export type TerminalLine = {
    id: string
    ts: number
    level: 'info' | 'success' | 'warn' | 'error'
    text: string
    raw?: unknown
}

export type WorkflowTestRun = {
    testId: string
    sessionId: string
    botId: string
    workflowId: string
    workflowName: string
    status: WorkflowTestStatus
    startedAt: number
    endedAt?: number
    lines: TerminalLine[]
    subscribers: Set<WebSocket>
}

const runs = new Map<string, WorkflowTestRun>()
const sessionToTestId = new Map<string, string>()

const pushLine = (run: WorkflowTestRun, level: TerminalLine['level'], text: string, raw?: unknown) => {
    const line: TerminalLine = {
        id: randomUUID(),
        ts: Date.now(),
        level,
        text,
        ...(raw !== undefined ? { raw } : {})
    }
    run.lines.push(line)
    if (run.lines.length > 2000) {
        run.lines.splice(0, run.lines.length - 2000)
    }
    const payload = JSON.stringify({ type: 'line', line })
    for (const client of run.subscribers) {
        if (client.readyState === 1) {
            client.send(payload)
        }
    }
}

const broadcastStatus = (run: WorkflowTestRun) => {
    const payload = JSON.stringify({
        type: 'status',
        status: run.status,
        testId: run.testId,
        sessionId: run.sessionId,
        endedAt: run.endedAt
    })
    for (const client of run.subscribers) {
        if (client.readyState === 1) {
            client.send(payload)
        }
    }
}

export const workflowTestHub = {
    create(params: { testId: string; botId: string; workflowId: string; workflowName: string; sessionId: string }): WorkflowTestRun {
        const { testId, sessionId } = params
        const run: WorkflowTestRun = {
            testId,
            sessionId,
            botId: params.botId,
            workflowId: params.workflowId,
            workflowName: params.workflowName,
            status: 'running',
            startedAt: Date.now(),
            lines: [],
            subscribers: new Set()
        }
        runs.set(testId, run)
        sessionToTestId.set(sessionId, testId)
        pushLine(run, 'info', `Test ${testId.slice(0, 8)} started on bot ${params.botId}`)
        pushLine(run, 'info', `Workflow: ${params.workflowName}`)
        pushLine(run, 'info', `Session: ${sessionId}`)
        return run
    },

    get(testId: string): WorkflowTestRun | undefined {
        return runs.get(testId)
    },

    getBySessionId(sessionId: string): WorkflowTestRun | undefined {
        const testId = sessionToTestId.get(sessionId)
        return testId ? runs.get(testId) : undefined
    },

    listActive(): WorkflowTestRun[] {
        return [...runs.values()].filter((r) => r.status === 'running')
    },

    subscribe(testId: string, ws: WebSocket): WorkflowTestRun | undefined {
        const run = runs.get(testId)
        if (!run) return undefined

        run.subscribers.add(ws)

        ws.send(
            JSON.stringify({
                type: 'snapshot',
                testId: run.testId,
                sessionId: run.sessionId,
                status: run.status,
                botId: run.botId,
                workflowId: run.workflowId,
                workflowName: run.workflowName,
                startedAt: run.startedAt,
                endedAt: run.endedAt,
                lines: run.lines
            })
        )

        return run
    },

    unsubscribe(testId: string, ws: WebSocket): void {
        const run = runs.get(testId)
        run?.subscribers.delete(ws)
    },

    ingestFeedback(payload: unknown): void {
        if (typeof payload !== 'object' || payload === null) return

        const data = payload as Record<string, unknown>
        const sessionId = typeof data.sessionId === 'string' ? data.sessionId : undefined
        if (!sessionId) return

        const run = workflowTestHub.getBySessionId(sessionId)
        if (!run) return

        const phase = typeof data.phase === 'string' ? data.phase : 'update'
        const step = data.step as Record<string, unknown> | undefined
        const action = data.action as Record<string, unknown> | undefined
        const error = typeof data.error === 'string' ? data.error : undefined

        if (phase === 'workflow:start') {
            const wf = data.workflow as Record<string, unknown> | undefined
            const wfName = typeof wf?.name === 'string' ? wf.name : run.workflowName
            pushLine(run, 'info', `▶ Workflow started (${wfName})`)
            return
        }

        if (phase === 'workflow:complete') {
            run.status = 'completed'
            run.endedAt = Date.now()
            pushLine(run, 'success', '✓ Workflow completed')
            broadcastStatus(run)
            return
        }

        if (phase === 'workflow:failed') {
            run.status = 'failed'
            run.endedAt = Date.now()
            pushLine(run, 'error', `✗ Workflow failed${error ? `: ${error}` : ''}`)
            broadcastStatus(run)
            return
        }

        if (phase === 'browser:launched') {
            pushLine(run, 'info', '⟡ Browser launched')
            return
        }

        if (phase === 'browser:closed') {
            pushLine(run, 'info', '⟡ Browser closed')
            return
        }

        if (step && typeof step.name === 'string') {
            const status = typeof step.status === 'string' ? step.status : 'executing'
            const duration = typeof step.durationMs === 'number' ? ` (${step.durationMs}ms)` : ''
            const actionName = action?.name ? ` [${String(action.name)}]` : ''
            const prefix = status === 'executing' ? '…' : status === 'completed' ? '✓' : status === 'failed' ? '✗' : '•'

            const level: TerminalLine['level'] = status === 'failed' ? 'error' : status === 'completed' ? 'success' : 'info'

            pushLine(run, level, `${prefix} ${step.name}${actionName}${duration}${step.error ? ` — ${String(step.error)}` : ''}`, {
                phase,
                step,
                action
            })
        } else {
            pushLine(run, 'info', `[${phase}]`, data)
        }
    },

    markFailed(testId: string, message: string): void {
        const run = runs.get(testId)
        if (!run || run.status !== 'running') return
        run.status = 'failed'
        run.endedAt = Date.now()
        pushLine(run, 'error', `✗ ${message}`)
        broadcastStatus(run)
    },

    markAccepted(testId: string, result: unknown): void {
        const run = runs.get(testId)
        if (!run) return
        pushLine(run, 'info', `Task accepted by bot`, result)
    }
}
