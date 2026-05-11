import { randomBytes, randomUUID } from 'node:crypto'
import WebSocket, { type RawData } from 'ws'
import { signMessage } from '../protocol/signer.js'
import { verifyMessage } from '../protocol/verifier.js'
import { isTimestampValid, NonceStore } from '../protocol/nonce.js'
import { RequestManager } from '../runtime/request-manager.js'
import { MessageRouter } from '../runtime/router.js'
import { type MessageDirection, type WSMessage, type UnsignedWSMessage, isWSMessage, SYSTEM_HANDSHAKE, SYSTEM_HEARTBEAT } from '../types/message.js'

/** Client heartbeat send interval (ms). */
export const HEARTBEAT_INTERVAL_MS = 15_000

export type FiggoClientOptions = {
    url: string
    botId: string
    /** PKCS#8 PEM, Ed25519 */
    privateKey: string
    /**
     * SPKI PEM for verifying server-signed frames. When omitted, frames with a non-empty signature are not verified.
     */
    serverPublicKey?: string
}

export class FiggoClient {
    private readonly url: string
    private readonly botId: string
    private readonly privateKey: string
    private readonly serverPublicKey: string | undefined
    private ws: WebSocket | null = null
    private readonly router = new MessageRouter()
    private readonly requests = new RequestManager()
    private readonly inboundNonces = new NonceStore()
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null

    constructor(options: FiggoClientOptions) {
        this.url = options.url
        this.botId = options.botId
        this.privateKey = options.privateKey
        this.serverPublicKey = options.serverPublicKey
    }

    async connect(): Promise<void> {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return
        }

        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket(this.url)
            this.ws = ws

            const onOpen = (): void => {
                try {
                    this.sendHandshake()
                    this.startHeartbeat()
                    resolve()
                } catch (err) {
                    reject(err instanceof Error ? err : new Error(String(err)))
                }
            }

            ws.once('open', onOpen)
            ws.once('error', (err: Error) => {
                reject(err)
            })
            ws.on('message', (data: RawData) => {
                this.onRawMessage(data)
            })
            ws.on('close', () => {
                this.onSocketClosed()
            })
        })
    }

    handle(type: string, handler: (payload: unknown) => unknown | Promise<unknown>): void {
        this.router.handle(type, handler)
    }

    async request(type: string, payload?: unknown): Promise<unknown> {
        const id = randomUUID()
        const pending = this.requests.create(id)
        try {
            const msg = payload === undefined ? this.createSignedMessage(type, 'req', id) : this.createSignedMessage(type, 'req', id, payload)
            this.wsSend(msg)
        } catch (err) {
            this.requests.reject(id, err instanceof Error ? err : new Error(String(err)))
            throw err
        }
        return pending
    }

    sendEvent(type: string, payload?: unknown): void {
        const msg =
            payload === undefined
                ? this.createSignedMessage(type, 'event', randomUUID())
                : this.createSignedMessage(type, 'event', randomUUID(), payload)
        this.wsSend(msg)
    }

    disconnect(): void {
        this.stopHeartbeat()
        this.requests.clear()
        if (this.ws) {
            this.ws.removeAllListeners()
            this.ws.close()
            this.ws = null
        }
    }

    private sendHandshake(): void {
        const msg = this.createSignedMessage(SYSTEM_HANDSHAKE, 'event', randomUUID(), { botId: this.botId })
        this.wsSend(msg)
    }

    private startHeartbeat(): void {
        this.stopHeartbeat()
        this.heartbeatTimer = setInterval(() => {
            try {
                this.sendEvent(SYSTEM_HEARTBEAT, {})
            } catch {
                /* ignore send failures until reconnect */
            }
        }, HEARTBEAT_INTERVAL_MS)
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer !== null) {
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = null
        }
    }

    private onSocketClosed(): void {
        this.stopHeartbeat()
        this.requests.clear()
        this.ws = null
    }

    private createSignedMessage<T>(type: string, direction: MessageDirection, id: string, payload?: T): WSMessage<T> {
        const timestamp = Date.now()
        const nonce = randomBytes(16).toString('hex')
        const unsigned: UnsignedWSMessage<T> = {
            id,
            type,
            direction,
            timestamp,
            nonce
        }
        if (payload !== undefined) {
            unsigned.payload = payload
        }
        const signature = signMessage(this.privateKey, unsigned)
        return { ...unsigned, signature }
    }

    private wsSend(msg: WSMessage): void {
        const socket = this.ws
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected')
        }
        socket.send(JSON.stringify(msg))
    }

    private onRawMessage(raw: RawData): void {
        let text: string
        if (typeof raw === 'string') {
            text = raw
        } else if (Buffer.isBuffer(raw)) {
            text = raw.toString('utf8')
        } else if (raw instanceof ArrayBuffer) {
            text = Buffer.from(raw).toString('utf8')
        } else {
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

        if (!this.inboundNonces.tryUse(msg.nonce, now)) {
            return
        }

        if (!this.verifyInboundSignature(msg)) {
            return
        }

        if (msg.direction === 'res') {
            if (msg.error !== undefined && msg.error !== '') {
                this.requests.reject(msg.id, new Error(msg.error))
            } else {
                this.requests.resolve(msg.id, msg.payload)
            }
            return
        }

        if (msg.direction === 'event') {
            void this.router.dispatch(msg.type, msg.payload).catch(() => {
                /* unknown handler: ignored */
            })
            return
        }

        if (msg.direction === 'req') {
            void this.dispatchIncomingRequest(msg).catch(() => {
                /* router errors surfaced via response error */
            })
        }
    }

    private verifyInboundSignature(msg: WSMessage): boolean {
        if (msg.signature === '') {
            return true
        }
        if (this.serverPublicKey === undefined) {
            return false
        }
        return verifyMessage(this.serverPublicKey, msg)
    }

    private async dispatchIncomingRequest(msg: WSMessage): Promise<void> {
        try {
            const routed = await this.router.dispatch(msg.type, msg.payload)
            const res = routed.handled
                ? this.buildSignedResponse(msg.id, msg.type, routed.result, undefined)
                : this.buildSignedResponse(msg.id, msg.type, undefined, 'NO_HANDLER')
            this.wsSend(res)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'INTERNAL_ERROR'
            this.wsSend(this.buildSignedResponse(msg.id, msg.type, undefined, message))
        }
    }

    private buildSignedResponse(requestId: string, requestType: string, payload: unknown | undefined, error: string | undefined): WSMessage {
        const timestamp = Date.now()
        const nonce = randomBytes(16).toString('hex')
        const base: UnsignedWSMessage = {
            id: requestId,
            type: requestType,
            direction: 'res',
            timestamp,
            nonce
        }
        if (payload !== undefined) {
            base.payload = payload
        }
        if (error !== undefined) {
            base.error = error
        }
        const signature = signMessage(this.privateKey, base)
        return { ...base, signature }
    }
}
