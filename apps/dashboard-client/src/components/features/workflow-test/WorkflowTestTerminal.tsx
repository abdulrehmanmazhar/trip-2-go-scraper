import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TerminalLine, WorkflowTestStatus } from '@/utils/workflowTestApi'

const levelClass: Record<TerminalLine['level'], string> = {
    info: 'text-zinc-300',
    success: 'text-emerald-400',
    warn: 'text-amber-400',
    error: 'text-red-400'
}

const statusVariant = (status: WorkflowTestStatus | 'idle'): 'secondary' | 'outline' | 'destructive' => {
    if (status === 'running') return 'secondary'
    if (status === 'completed') return 'outline'
    if (status === 'failed') return 'destructive'
    return 'outline'
}

type Props = {
    lines: TerminalLine[]
    status: WorkflowTestStatus | 'idle'
    connected: boolean
    sessionId: string | null
    className?: string
}

export function WorkflowTestTerminal({ lines, status, connected, sessionId, className }: Props) {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [lines])

    return (
        <div className={cn('flex flex-col overflow-hidden rounded-lg border bg-zinc-950', className)}>
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-4 py-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">workflow-test</span>
                    {sessionId ? (
                        <span
                            className="truncate font-mono text-xs text-zinc-600"
                            title={sessionId}>
                            {sessionId}
                        </span>
                    ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Badge
                        variant={connected ? 'secondary' : 'outline'}
                        className="text-xs">
                        {connected ? 'stream connected' : 'stream disconnected'}
                    </Badge>
                    <Badge
                        variant={statusVariant(status)}
                        className="text-xs capitalize">
                        {status}
                    </Badge>
                </div>
            </div>

            <pre
                className="min-h-[320px] max-h-[min(60vh,520px)] flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
                aria-live="polite">
                {lines.length === 0 ? (
                    <span className="text-zinc-600">Waiting for test output…</span>
                ) : (
                    lines.map((line) => (
                        <div
                            key={line.id}
                            className="flex gap-2">
                            <span className="shrink-0 text-zinc-600">
                                {new Date(line.ts).toLocaleTimeString(undefined, {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </span>
                            <span className={levelClass[line.level]}>{line.text}</span>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </pre>
        </div>
    )
}
