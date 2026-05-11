import type { WebSocket } from 'ws'

/**
 * At most one active socket per bot. Replacing a connection closes the previous socket.
 */
export class BotConnectionManager {
    private readonly byBotId = new Map<string, WebSocket>()

    /**
     * Registers {@link ws} for {@link botId}. Any previously registered socket for the same id is closed.
     */
    replace(botId: string, ws: WebSocket): void {
        const existing = this.byBotId.get(botId)
        if (existing && existing !== ws) {
            existing.removeAllListeners()
            existing.close(4000, 'replaced')
        }
        this.byBotId.set(botId, ws)
    }

    get(botId: string): WebSocket | undefined {
        return this.byBotId.get(botId)
    }

    deleteIfCurrent(botId: string, ws: WebSocket): void {
        if (this.byBotId.get(botId) === ws) {
            this.byBotId.delete(botId)
        }
    }

    clearBot(botId: string): void {
        this.byBotId.delete(botId)
    }
}
