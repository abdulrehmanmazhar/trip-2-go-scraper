import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildWorkflowTestWsUrl, type TerminalLine, type WorkflowTestStatus } from '@/utils/workflowTestApi'

type StreamSnapshot = {
    testId: string
    sessionId: string
    status: WorkflowTestStatus
    botId: string
    workflowId: string
    workflowName: string
    startedAt: number
    endedAt?: number
    lines: TerminalLine[]
}

type WsMessage =
    | { type: 'snapshot'; lines: TerminalLine[]; status: WorkflowTestStatus; testId: string; sessionId: string }
    | { type: 'line'; line: TerminalLine }
    | { type: 'status'; status: WorkflowTestStatus; testId: string; sessionId: string; endedAt?: number }

export function useWorkflowTestStream(testId: string | null) {
    const [lines, setLines] = useState<TerminalLine[]>([])
    const [status, setStatus] = useState<WorkflowTestStatus | 'idle'>('idle')
    const [connected, setConnected] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const wsUrl = useMemo(() => (testId ? buildWorkflowTestWsUrl(testId) : null), [testId])

    const appendLine = useCallback((line: TerminalLine) => {
        setLines((prev) => {
            if (prev.some((l) => l.id === line.id)) return prev
            return [...prev, line]
        })
    }, [])

    const applySnapshot = useCallback((snap: StreamSnapshot) => {
        setLines(snap.lines)
        setStatus(snap.status)
        setSessionId(snap.sessionId)
    }, [])

    useEffect(() => {
        if (!testId || !wsUrl) {
            setConnected(false)
            return
        }

        setLines([])
        setStatus('idle')
        setSessionId(null)

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => setConnected(true)

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(String(event.data)) as WsMessage
                if (msg.type === 'snapshot') {
                    applySnapshot({
                        testId: msg.testId,
                        sessionId: msg.sessionId,
                        status: msg.status,
                        botId: '',
                        workflowId: '',
                        workflowName: '',
                        startedAt: Date.now(),
                        lines: msg.lines
                    })
                    return
                }
                if (msg.type === 'line') {
                    appendLine(msg.line)
                    return
                }
                if (msg.type === 'status') {
                    setStatus(msg.status)
                    if (msg.sessionId) setSessionId(msg.sessionId)
                }
            } catch {
                appendLine({
                    id: `raw-${Date.now()}`,
                    ts: Date.now(),
                    level: 'warn',
                    text: String(event.data)
                })
            }
        }

        ws.onclose = (event) => {
            setConnected(false)
            if (event.code === 4004) {
                appendLine({
                    id: `ws-close-${event.code}`,
                    ts: Date.now(),
                    level: 'error',
                    text: 'Test run not found on server. Start a new test.'
                })
            }
        }

        ws.onerror = () => setConnected(false)

        return () => {
            ws.close()
            if (wsRef.current === ws) {
                wsRef.current = null
            }
            setConnected(false)
        }
    }, [testId, wsUrl, appendLine, applySnapshot])

    const clear = useCallback(() => setLines([]), [])

    return { lines, status, connected, sessionId, clear }
}
