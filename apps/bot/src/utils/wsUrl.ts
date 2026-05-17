const DEFAULT_BOT_WS_PATH = '/ws'

/**
 * Builds the bot WebSocket URL from an HTTP(S) API base URL.
 * Prefer `BOT_WS_URL` when the bot runs on the same host as the backend (avoids Cloudflare hairpin/timeouts).
 */
export function buildBotWsUrl(serverUrl: string, path = DEFAULT_BOT_WS_PATH): string {
    const base = serverUrl.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    if (base.startsWith('https://')) {
        return `wss://${base.slice('https://'.length)}${normalizedPath}`
    }
    if (base.startsWith('http://')) {
        return `ws://${base.slice('http://'.length)}${normalizedPath}`
    }
    if (base.startsWith('wss://') || base.startsWith('ws://')) {
        return `${base}${normalizedPath}`
    }

    throw new Error(`Invalid server URL "${serverUrl}" (expected http(s):// or ws(s)://)`)
}
