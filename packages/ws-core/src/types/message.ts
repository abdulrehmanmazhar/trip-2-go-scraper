export type MessageDirection = 'req' | 'res' | 'event'

/**
 * Wire format for all frames. Every field except optional payload/error is required on the wire.
 * Server-originated frames may use an empty signature when only the bot authenticates (see deployment TLS).
 */
export type WSMessage<T = unknown> = {
    id: string
    type: string
    direction: MessageDirection
    timestamp: number
    nonce: string
    payload?: T
    signature: string
    error?: string
}

export type UnsignedWSMessage<T = unknown> = Omit<WSMessage<T>, 'signature'>

export const SYSTEM_HANDSHAKE = 'system:handshake'
export const SYSTEM_HEARTBEAT = 'system:heartbeat'

export function isWSMessage(value: unknown): value is WSMessage {
    if (value === null || typeof value !== 'object') return false
    const o = value as Record<string, unknown>
    return (
        typeof o['id'] === 'string' &&
        typeof o['type'] === 'string' &&
        (o['direction'] === 'req' || o['direction'] === 'res' || o['direction'] === 'event') &&
        typeof o['timestamp'] === 'number' &&
        typeof o['nonce'] === 'string' &&
        typeof o['signature'] === 'string'
    )
}
