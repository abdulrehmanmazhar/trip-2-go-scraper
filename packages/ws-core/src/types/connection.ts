/**
 * Per-connection metadata maintained by the server after a successful handshake.
 */
export type ConnectionContext = {
    botId: string
    ip: string
    connectedAt: number
    lastSeen: number
}
