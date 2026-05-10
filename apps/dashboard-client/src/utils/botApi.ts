import constants, { APIS } from '@/constants'

export type BotRecord = {
    id: string
    botId: string
    name?: string
    hostname?: string
    platform?: string
    ip?: string
    status: 'pending' | 'approved' | 'rejected'
    isOtpVerified: boolean
    isRevoked: boolean
    revokedAt?: string
    lastSeenAt?: string
    createdAt: string
    updatedAt: string
}

export function normalizeBot(raw: BotRecord): BotRecord {
    return {
        ...raw,
        isRevoked: Boolean(raw.isRevoked)
    }
}

async function parseJsonError(res: Response): Promise<string> {
    try {
        const json = (await res.json()) as { message?: string }
        return json.message || 'Request failed'
    } catch {
        return 'Request failed'
    }
}

export async function fetchBots(): Promise<BotRecord[]> {
    const res = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.BOT_LIST}`, {
        credentials: 'include'
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
    const json = (await res.json()) as { data?: BotRecord[] }
    return (json.data ?? []).map(normalizeBot)
}

export async function postBotAction(path: string, body: Record<string, string>): Promise<void> {
    const res = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
}

export async function patchBotName(botId: string, name: string): Promise<void> {
    const res = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.BOT_LIST}/${encodeURIComponent(botId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
}

export async function deleteBotRecord(botId: string): Promise<void> {
    const res = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.BOT_LIST}/${encodeURIComponent(botId)}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    if (!res.ok) {
        throw new Error(await parseJsonError(res))
    }
}
