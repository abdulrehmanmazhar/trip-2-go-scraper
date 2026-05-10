import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '@/components/features/header'
import { ConfirmationModal } from '@/components/features/confirmation-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, RefreshCw, Terminal, Check, X, ShieldOff, Trash2, Pencil, RotateCcw } from 'lucide-react'
import { APIS } from '@/constants'
import { cn } from '@/lib/utils'
import { deleteBotRecord, fetchBots, patchBotName, postBotAction, type BotRecord } from '@/utils/botApi'
import { toast } from 'sonner'

export type { BotRecord }

type BotDialogOpen =
    | { open: true; kind: 'approve'; bot: BotRecord }
    | { open: true; kind: 'reject'; bot: BotRecord }
    | { open: true; kind: 'revoke'; bot: BotRecord }
    | { open: true; kind: 'restore'; bot: BotRecord }
    | { open: true; kind: 'delete'; bot: BotRecord }
    | { open: true; kind: 'rename'; bot: BotRecord; nameDraft: string }

type BotDialogState = { open: false } | BotDialogOpen

function formatDay(iso: string | undefined) {
    if (!iso) return '—'
    try {
        return new Date(iso).toISOString().slice(0, 10)
    } catch {
        return '—'
    }
}

function botLabel(bot: BotRecord) {
    return bot.name?.trim() || bot.hostname?.trim() || bot.botId.slice(0, 8)
}

function statusBadgeVariant(bot: BotRecord): 'secondary' | 'destructive' | 'outline' {
    if (bot.status === 'approved' && bot.isRevoked) return 'destructive'
    if (bot.status === 'approved') return 'secondary'
    if (bot.status === 'rejected') return 'destructive'
    return 'outline'
}

function statusBadgeLabel(bot: BotRecord): string {
    if (bot.status === 'approved' && bot.isRevoked) return 'Revoked'
    return bot.status
}

function BotCard({
    bot,
    busy,
    onRequestApprove,
    onRequestReject,
    onRequestRevoke,
    onRequestRestore,
    onRequestDelete,
    onRequestRename
}: {
    bot: BotRecord
    busy: boolean
    onRequestApprove: (bot: BotRecord) => void
    onRequestReject: (bot: BotRecord) => void
    onRequestRevoke: (bot: BotRecord) => void
    onRequestRestore: (bot: BotRecord) => void
    onRequestDelete: (bot: BotRecord) => void
    onRequestRename: (bot: BotRecord) => void
}) {
    const title = botLabel(bot)
    const canDecide = bot.status === 'pending' && bot.isOtpVerified
    const canRevoke = bot.status === 'approved' && !bot.isRevoked
    const canRestore = bot.status === 'approved' && bot.isRevoked

    return (
        <Card className="group h-full rounded-xl overflow-hidden border border-border/60 bg-background shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
            <div className="relative h-28 flex items-center justify-between px-4 border-b overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                <div className="w-full flex items-center justify-between relative z-10 gap-2 pr-1">
                    <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                        <Terminal className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="truncate">CLI bot</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-foreground"
                            title="Edit display name"
                            disabled={busy}
                            onClick={() => onRequestRename(bot)}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground hover:text-destructive"
                            title="Delete bot"
                            disabled={busy}
                            onClick={() => onRequestDelete(bot)}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Badge
                            variant={statusBadgeVariant(bot)}
                            className="text-xs shrink-0 capitalize">
                            {statusBadgeLabel(bot)}
                        </Badge>
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Terminal className="w-16 h-16 text-foreground/5" />
                </div>
            </div>

            <CardHeader className="px-4 py-3 space-y-2">
                <h3 className="font-semibold text-sm leading-none truncate">{title}</h3>
                <p className="text-xs text-muted-foreground">{[bot.platform, bot.hostname].filter(Boolean).join(' · ') || 'Remote host'}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Joined {formatDay(bot.createdAt)}</span>
                    {bot.ip ? <span className="text-border">|</span> : null}
                    {bot.ip ? <span className="font-mono">{bot.ip}</span> : null}
                </div>
                {bot.status === 'pending' ? (
                    <p className={cn('text-xs', bot.isOtpVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                        {bot.isOtpVerified ? 'OTP verified — ready for your decision' : 'Waiting for CLI OTP verification'}
                    </p>
                ) : null}
                {bot.status === 'approved' && bot.isRevoked ? (
                    <p className="text-xs text-muted-foreground">Revoked {formatDay(bot.revokedAt)} — CLI access is blocked.</p>
                ) : null}
            </CardHeader>

            <CardContent className="px-4 pt-0 pb-4 flex flex-col flex-1">
                <div className="mt-auto box-border flex h-[4.75rem] shrink-0 flex-nowrap items-center justify-end gap-2 overflow-x-auto border-t border-border/60 [scrollbar-width:thin]">
                    {canRestore ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1 border-emerald-500/40 text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-400"
                            disabled={busy}
                            onClick={() => onRequestRestore(bot)}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore access
                        </Button>
                    ) : null}
                    {canRevoke ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                            disabled={busy}
                            onClick={() => onRequestRevoke(bot)}>
                            <ShieldOff className="h-3.5 w-3.5" />
                            Revoke access
                        </Button>
                    ) : null}
                    {canDecide ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0 gap-1"
                                disabled={busy}
                                onClick={() => onRequestReject(bot)}>
                                <X className="h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                className="shrink-0 gap-1"
                                disabled={busy}
                                onClick={() => onRequestApprove(bot)}>
                                <Check className="h-3.5 w-3.5" />
                                Approve
                            </Button>
                        </>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    )
}

function dialogCopy(state: BotDialogOpen): { title: string; description: string; confirmLabel: string; type: 'normal' | 'destructive' } {
    const label = botLabel(state.bot)
    switch (state.kind) {
        case 'approve':
            return {
                title: 'Approve this bot?',
                description: `“${label}” will be allowed to connect to the platform as an approved CLI agent.`,
                confirmLabel: 'Approve',
                type: 'normal'
            }
        case 'reject':
            return {
                title: 'Reject this registration?',
                description: `“${label}” will be marked rejected and cannot be approved without registering again.`,
                confirmLabel: 'Reject',
                type: 'destructive'
            }
        case 'revoke':
            return {
                title: 'Revoke bot access?',
                description: `“${label}” will be blocked from using the platform until access is restored.`,
                confirmLabel: 'Revoke access',
                type: 'destructive'
            }
        case 'restore':
            return {
                title: 'Restore bot access?',
                description: `“${label}” will be allowed to connect again as an approved agent.`,
                confirmLabel: 'Restore access',
                type: 'normal'
            }
        case 'delete':
            return {
                title: 'Delete this bot?',
                description: `Permanently remove “${label}” and its registration. This cannot be undone.`,
                confirmLabel: 'Delete',
                type: 'destructive'
            }
        case 'rename':
            return {
                title: 'Save display name?',
                description: 'This label is only used in the admin dashboard. Leave empty to clear the name.',
                confirmLabel: 'Save name',
                type: 'normal'
            }
    }
}

function Bots() {
    const [search, setSearch] = useState('')
    const [bots, setBots] = useState<BotRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [dialog, setDialog] = useState<BotDialogState>({ open: false })

    const loadBots = useCallback(async () => {
        setLoading(true)
        setLoadError(null)
        try {
            const data = await fetchBots()
            setBots(data)
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to load bots'
            setLoadError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadBots()
    }, [loadBots])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return bots
        return bots.filter((b) => {
            const blob = [b.name, b.hostname, b.platform, b.botId, b.ip, b.status, b.isRevoked ? 'revoked' : '']
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
            return blob.includes(q)
        })
    }, [bots, search])

    const closeDialog = () => setDialog({ open: false })

    const runDialogAction = async () => {
        if (!dialog.open) return
        const { bot } = dialog
        setActingId(bot.botId)
        try {
            switch (dialog.kind) {
                case 'approve':
                    await postBotAction(APIS.BOT_APPROVE, { botId: bot.botId })
                    toast.success('Bot approved')
                    break
                case 'reject':
                    await postBotAction(APIS.BOT_REJECT, { botId: bot.botId })
                    toast.success('Bot rejected')
                    break
                case 'revoke':
                    await postBotAction(APIS.BOT_REVOKE, { botId: bot.botId })
                    toast.success('Bot access revoked')
                    break
                case 'restore':
                    await postBotAction(APIS.BOT_UNREVOKE, { botId: bot.botId })
                    toast.success('Bot access restored')
                    break
                case 'delete':
                    await deleteBotRecord(bot.botId)
                    toast.success('Bot removed')
                    break
                case 'rename':
                    await patchBotName(bot.botId, dialog.nameDraft)
                    toast.success('Display name saved')
                    break
            }
            closeDialog()
            await loadBots()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Something went wrong')
        } finally {
            setActingId(null)
        }
    }

    const dialogBusy = dialog.open && actingId === dialog.bot.botId
    const modalCopy = dialog.open ? dialogCopy(dialog) : null

    return (
        <div className="bg-background min-h-full">
            <Header
                title="Bots"
                subtitle="Review remote CLI agents that connect after login"
                actions={
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={loading}
                        onClick={() => void loadBots()}>
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                        Refresh
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search by name, host, platform, id…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading && bots.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">Loading bots…</div>
                ) : loadError && bots.length === 0 ? (
                    <div className="py-20 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">{loadError}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void loadBots()}>
                            Try again
                        </Button>
                    </div>
                ) : filtered.length === 0 && bots.length > 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">No bots match your search.</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">
                        No bot registrations yet. CLI tools appear here after they register and verify OTP.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((b) => (
                            <BotCard
                                key={b.id}
                                bot={b}
                                busy={actingId === b.botId}
                                onRequestApprove={(bot) => setDialog({ open: true, kind: 'approve', bot })}
                                onRequestReject={(bot) => setDialog({ open: true, kind: 'reject', bot })}
                                onRequestRevoke={(bot) => setDialog({ open: true, kind: 'revoke', bot })}
                                onRequestRestore={(bot) => setDialog({ open: true, kind: 'restore', bot })}
                                onRequestDelete={(bot) => setDialog({ open: true, kind: 'delete', bot })}
                                onRequestRename={(bot) => setDialog({ open: true, kind: 'rename', bot, nameDraft: bot.name ?? '' })}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                open={dialog.open}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
                title={modalCopy?.title ?? ''}
                description={modalCopy?.description ?? ''}
                type={modalCopy?.type ?? 'normal'}
                confirmLabel={modalCopy?.confirmLabel ?? 'Confirm'}
                onConfirmation={runDialogAction}
                onCancel={closeDialog}
                pending={dialogBusy}
                className={dialog.open && dialog.kind === 'rename' ? 'sm:max-w-lg' : undefined}>
                {dialog.open && dialog.kind === 'rename' ? (
                    <div className="space-y-2">
                        <label
                            htmlFor="bot-display-name"
                            className="text-sm font-medium">
                            Display name
                        </label>
                        <Input
                            id="bot-display-name"
                            placeholder="e.g. Production scraper"
                            value={dialog.nameDraft}
                            disabled={dialogBusy}
                            onChange={(e) => setDialog((d) => (d.open && d.kind === 'rename' ? { ...d, nameDraft: e.target.value } : d))}
                        />
                    </div>
                ) : null}
            </ConfirmationModal>
        </div>
    )
}

export default Bots
