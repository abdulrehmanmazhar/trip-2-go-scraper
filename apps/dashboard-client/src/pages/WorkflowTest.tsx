import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '@/components/features/header'
import { WorkflowTestTerminal } from '@/components/features/workflow-test/WorkflowTestTerminal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useWorkflowTestStream } from '@/hooks/useWorkflowTestStream'
import { fetchBots, type BotRecord } from '@/utils/botApi'
import { fetchWorkflowsPage, type WorkflowRecord } from '@/utils/workflowApi'
import { fetchWorkflowTest, startWorkflowTest, WORKFLOW_TEST_STORAGE_KEY, type StartWorkflowTestResult } from '@/utils/workflowTestApi'
import { FlaskConical, Play, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

function botOptionLabel(bot: BotRecord) {
    return bot.name?.trim() || bot.hostname?.trim() || bot.botId.slice(0, 12)
}

export default function WorkflowTest() {
    const [workflows, setWorkflows] = useState<WorkflowRecord[]>([])
    const [bots, setBots] = useState<BotRecord[]>([])
    const [loadingOptions, setLoadingOptions] = useState(true)
    const [workflowId, setWorkflowId] = useState('')
    const [botId, setBotId] = useState('')
    const [starting, setStarting] = useState(false)
    const [activeTest, setActiveTest] = useState<StartWorkflowTestResult | null>(null)

    const { lines, status, connected, sessionId } = useWorkflowTestStream(activeTest?.testId ?? null)

    const eligibleBots = useMemo(() => bots.filter((b) => b.status === 'approved' && !b.isRevoked && b.isOtpVerified), [bots])

    const loadOptions = useCallback(async () => {
        setLoadingOptions(true)
        try {
            const [wf, botList] = await Promise.all([fetchWorkflowsPage({ page: 1, limit: 100, search: '' }), fetchBots()])
            setWorkflows(wf.items)
            setBots(botList)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to load options')
        } finally {
            setLoadingOptions(false)
        }
    }, [])

    const resumeActiveTest = useCallback(async () => {
        const stored = sessionStorage.getItem(WORKFLOW_TEST_STORAGE_KEY)
        if (!stored) return

        try {
            const info = await fetchWorkflowTest(stored)
            setActiveTest({
                testId: info.testId,
                sessionId: info.sessionId,
                botId: info.botId,
                workflowId: info.workflowId,
                workflowName: info.workflowName,
                status: info.status
            })
            setWorkflowId(info.workflowId)
            setBotId(info.botId)
        } catch {
            sessionStorage.removeItem(WORKFLOW_TEST_STORAGE_KEY)
        }
    }, [])

    useEffect(() => {
        void loadOptions()
        void resumeActiveTest()
    }, [loadOptions, resumeActiveTest])

    const handleStart = async () => {
        if (!workflowId || !botId) {
            toast.error('Select a workflow and a bot')
            return
        }

        setStarting(true)
        try {
            const result = await startWorkflowTest(botId, workflowId)
            setActiveTest(result)
            sessionStorage.setItem(WORKFLOW_TEST_STORAGE_KEY, result.testId)
            toast.success('Workflow test started')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to start test')
        } finally {
            setStarting(false)
        }
    }

    const handleClearSession = () => {
        setActiveTest(null)
        sessionStorage.removeItem(WORKFLOW_TEST_STORAGE_KEY)
    }

    return (
        <div className="flex min-h-full flex-col">
            <Header
                title="Test workflow"
                subtitle="Run a workflow on a connected bot and watch live execution output"
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void loadOptions()}
                        disabled={loadingOptions}>
                        <RefreshCw className={loadingOptions ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                }
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FlaskConical className="h-4 w-4" />
                            Test configuration
                        </CardTitle>
                        <CardDescription>
                            Choose an approved bot and workflow. The bot must be running and connected via{' '}
                            <code className="text-xs">figgo-bot start</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Workflow</Label>
                            <Select
                                value={workflowId}
                                onValueChange={setWorkflowId}
                                disabled={loadingOptions || starting}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingOptions ? 'Loading…' : 'Select workflow'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {workflows.map((w) => (
                                        <SelectItem
                                            key={w.id}
                                            value={w.id}>
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Bot</Label>
                            <Select
                                value={botId}
                                onValueChange={setBotId}
                                disabled={loadingOptions || starting}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingOptions ? 'Loading…' : 'Select bot'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {eligibleBots.length === 0 ? (
                                        <SelectItem
                                            value="__none"
                                            disabled>
                                            No approved bots available
                                        </SelectItem>
                                    ) : (
                                        eligibleBots.map((b) => (
                                            <SelectItem
                                                key={b.botId}
                                                value={b.botId}>
                                                {botOptionLabel(b)}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                            <Button
                                onClick={() => void handleStart()}
                                disabled={starting || !workflowId || !botId}>
                                {starting ? <Spinner className="mr-2" /> : <Play className="mr-2 h-4 w-4" />}
                                Start test
                            </Button>
                            {activeTest ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearSession}>
                                    Clear local session
                                </Button>
                            ) : null}
                            {activeTest ? (
                                <span className="text-xs text-muted-foreground">
                                    Test <span className="font-mono">{activeTest.testId.slice(0, 8)}</span> · {activeTest.workflowName}
                                </span>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>

                <WorkflowTestTerminal
                    lines={lines}
                    status={status}
                    connected={connected}
                    sessionId={sessionId ?? activeTest?.sessionId ?? null}
                />
            </div>
        </div>
    )
}
