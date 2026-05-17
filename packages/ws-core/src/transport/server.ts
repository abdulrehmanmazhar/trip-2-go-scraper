import { randomBytes, randomUUID } from 'node:crypto'
import type { IncomingMessage } from 'node:http'
import type { Server as HttpServer } from 'node:http'
import type { Duplex } from 'node:stream'
import WebSocket, { WebSocketServer, type RawData } from 'ws'
import { matchesUpgradePath } from '../http/upgrade-path.js'
import { verifyMessage } from '../protocol/verifier.js'
import { isTimestampValid, NonceStore } from '../protocol/nonce.js'
import { RequestManager } from '../runtime/request-manager.js'
import { MessageRouter } from '../runtime/router.js'
import type { ConnectionContext } from '../types/connection.js'
import { type MessageDirection, type WSMessage, type UnsignedWSMessage, isWSMessage, SYSTEM_HANDSHAKE, SYSTEM_HEARTBEAT } from '../types/message.js'
import { BotConnectionManager } from './connection-manager.js'

/** Server disconnects if lastSeen is older than this window (ms). */
export const HEARTBEAT_DEAD_MS = 45_000

export type FiggoServerOptions = {
    path?: string
    getPublicKey: (botId: string) => Promise<string>
    /** Attach directly to this HTTP server (single WebSocket path). */
    server?: HttpServer
    /**
     * Do not register an `upgrade` listener. Use with a shared HTTP upgrade router and
     * call {@link matchesUpgrade} / {@link handleUpgrade} per connection.
     */
    noServer?: boolean
}

type HandshakePayload = {
    botId: string
}

type Session = {
    phase: 'handshake' | 'ready'
    botId?: string
    publicKey?: string
    nonce: NonceStore
    ip: string
    requests: RequestManager
}

export class FiggoServer {
    private readonly wss: WebSocketServer
    private readonly getPublicKey: (botId: string) => Promise<string>
    private readonly router = new MessageRouter()
    private readonly connections = new BotConnectionManager()
    private readonly contexts = new Map<string, ConnectionContext>()
    private readonly sessions = new Map<WebSocket, Session>()
    private readonly watchdog: ReturnType<typeof setInterval>

    constructor(options: FiggoServerOptions) {
        this.getPublicKey = options.getPublicKey

        if (options.noServer && options.server) {
            throw new Error('FiggoServer: use either `server` or `noServer: true`, not both')
        }
        if (!options.noServer && !options.server) {
            throw new Error('FiggoServer: `server` is required unless `noServer: true`')
        }

        const path = options.path ?? '/'
        this.wss = options.noServer ? new WebSocketServer({ noServer: true, path }) : new WebSocketServer({ server: options.server, path })

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            this.onConnection(ws, req)
        })

        this.watchdog = setInterval(() => {
            const now = Date.now()
            for (const [botId, ctx] of this.contexts.entries()) {
                if (now - ctx.lastSeen > HEARTBEAT_DEAD_MS) {
                    const socket = this.connections.get(botId)
                    socket?.terminate()
                }
            }
        }, 5_000)
    }

    handle(type: string, handler: (payload: unknown) => unknown | Promise<unknown>): void {
        this.router.handle(type, handler)
    }

    matchesUpgrade(req: IncomingMessage): boolean {
        const path = this.wss.options.path
        return path ? matchesUpgradePath(req, path) : true
    }

    handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): void {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
            this.wss.emit('connection', ws, req)
        })
    }

    send(botId: string, type: string, payload?: unknown): void {
        const ws = this.connections.get(botId)
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return
        }
        const msg = this.createUnsignedMessage(type, 'event', randomUUID(), payload)
        ws.send(JSON.stringify(msg))
    }

    async request(botId: string, type: string, payload?: unknown): Promise<unknown> {
        const ws = this.connections.get(botId)
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            throw new Error(`Bot ${botId} is not connected`)
        }
        const session = this.sessions.get(ws)
        if (!session || session.phase !== 'ready') {
            throw new Error(`Bot ${botId} session is not ready`)
        }

        const id = randomUUID()
        const pending = session.requests.create(id)
        try {
            const msg = this.createUnsignedMessage(type, 'req', id, payload)
            ws.send(JSON.stringify(msg))
        } catch (err) {
            session.requests.reject(id, err instanceof Error ? err : new Error(String(err)))
            throw err
        }
        return pending
    }

    /**
     * Forcefully disconnects the bot identified by {@link botId}. Pending server→bot requests are rejected
     * and all session state is dropped. Returns true if a connection existed and was closed.
     */
    disconnect(botId: string, reason = 'disconnected'): boolean {
        const ws = this.connections.get(botId)
        if (!ws) {
            return false
        }
        this.connections.clearBot(botId)
        this.contexts.delete(botId)
        const session = this.sessions.get(ws)
        if (session) {
            session.requests.clear()
            this.sessions.delete(ws)
        }
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close(4001, reason)
        } else {
            ws.terminate()
        }
        return true
    }

    close(): void {
        clearInterval(this.watchdog)
        this.wss.close()
    }

    private onConnection(ws: WebSocket, req: IncomingMessage): void {
        const ip = req.socket.remoteAddress ?? 'unknown'
        this.sessions.set(ws, {
            phase: 'handshake',
            nonce: new NonceStore(),
            ip,
            requests: new RequestManager()
        })
        ws.on('message', (raw: RawData) => {
            void this.onClientRaw(ws, raw)
        })
        ws.on('close', () => {
            this.onClientClosed(ws)
        })
    }

    private onClientClosed(ws: WebSocket): void {
        const session = this.sessions.get(ws)
        this.sessions.delete(ws)
        if (session) {
            session.requests.clear()
        }
        if (session?.phase === 'ready' && session.botId !== undefined) {
            this.connections.deleteIfCurrent(session.botId, ws)
            if (this.connections.get(session.botId) === undefined) {
                this.contexts.delete(session.botId)
            }
        }
    }

    private async onClientRaw(ws: WebSocket, raw: RawData): Promise<void> {
        const text = this.rawToText(raw)
        if (text === undefined) {
            return
        }

        let parsed: unknown
        try {
            parsed = JSON.parse(text) as unknown
        } catch {
            return
        }

        if (!isWSMessage(parsed)) {
            return
        }

        const msg = parsed
        const now = Date.now()

        if (!isTimestampValid(msg.timestamp, now)) {
            return
        }

        const session = this.sessions.get(ws)
        if (!session) {
            return
        }

        if (!session.nonce.tryUse(msg.nonce, now)) {
            return
        }

        if (session.phase === 'handshake') {
            await this.finishHandshake(ws, session, msg, now)
            return
        }

        if (session.phase === 'ready' && session.publicKey !== undefined && session.botId !== undefined) {
            if (!verifyMessage(session.publicKey, msg)) {
                ws.close(4003, 'invalid signature')
                return
            }

            const ctx = this.contexts.get(session.botId)
            if (ctx) {
                ctx.lastSeen = now
            }

            if (msg.direction === 'req') {
                try {
                    const routed = await this.router.dispatch(msg.type, msg.payload)
                    const response = routed.handled
                        ? this.buildResponse(msg.id, msg.type, routed.result, undefined)
                        : this.buildResponse(msg.id, msg.type, undefined, 'NO_HANDLER')
                    ws.send(JSON.stringify(response))
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'INTERNAL_ERROR'
                    ws.send(JSON.stringify(this.buildResponse(msg.id, msg.type, undefined, message)))
                }
                return
            }

            if (msg.direction === 'event') {
                if (msg.type === SYSTEM_HEARTBEAT) {
                    return
                }
                void this.router.dispatch(msg.type, msg.payload).catch(() => {
                    /* unknown handler: ignored */
                })
                return
            }

            if (msg.direction === 'res') {
                if (msg.error !== undefined && msg.error !== '') {
                    session.requests.reject(msg.id, new Error(msg.error))
                } else {
                    session.requests.resolve(msg.id, msg.payload)
                }
                return
            }
        }
    }

    private async finishHandshake(ws: WebSocket, session: Session, msg: WSMessage, now: number): Promise<void> {
        if (msg.type !== SYSTEM_HANDSHAKE || msg.direction !== 'event') {
            ws.close(4002, 'handshake required')
            return
        }

        const payload = msg.payload as HandshakePayload | undefined
        if (!payload || typeof payload.botId !== 'string' || payload.botId === '') {
            ws.close(4002, 'invalid handshake')
            return
        }

        let publicKeyPem: string
        try {
            publicKeyPem = await this.getPublicKey(payload.botId)
        } catch {
            ws.close(4004, 'unknown bot')
            return
        }

        if (!verifyMessage(publicKeyPem, msg)) {
            ws.close(4003, 'invalid signature')
            return
        }

        this.connections.replace(payload.botId, ws)

        session.phase = 'ready'
        session.botId = payload.botId
        session.publicKey = publicKeyPem

        this.contexts.set(payload.botId, {
            botId: payload.botId,
            ip: session.ip,
            connectedAt: now,
            lastSeen: now
        })
    }

    private rawToText(raw: RawData): string | undefined {
        if (typeof raw === 'string') {
            return raw
        }
        if (Buffer.isBuffer(raw)) {
            return raw.toString('utf8')
        }
        if (raw instanceof ArrayBuffer) {
            return Buffer.from(raw).toString('utf8')
        }
        return undefined
    }

    private buildResponse(requestId: string, requestType: string, payload: unknown | undefined, error: string | undefined): WSMessage {
        const timestamp = Date.now()
        const nonce = randomBytes(16).toString('hex')
        const unsigned: UnsignedWSMessage = {
            id: requestId,
            type: requestType,
            direction: 'res',
            timestamp,
            nonce
        }
        if (payload !== undefined) {
            unsigned.payload = payload
        }
        if (error !== undefined) {
            unsigned.error = error
        }
        return { ...unsigned, signature: '' }
    }

    private createUnsignedMessage(type: string, direction: MessageDirection, id: string, payload?: unknown): WSMessage {
        const timestamp = Date.now()
        const nonce = randomBytes(16).toString('hex')
        const unsigned: UnsignedWSMessage = {
            id,
            type,
            direction,
            timestamp,
            nonce
        }
        if (payload !== undefined) {
            unsigned.payload = payload
        }
        return { ...unsigned, signature: '' }
    }
}
