import type { IncomingMessage } from 'node:http'
import type { Server as HttpServer } from 'node:http'
import type { Duplex } from 'node:stream'
import { matchesUpgradePath } from 'ws-core'
import type { WebSocketServer } from 'ws'

export type UpgradeRoute = {
    name: string
    match: (req: IncomingMessage) => boolean
    handle: (req: IncomingMessage, socket: Duplex, head: Buffer) => void
}

/**
 * Dispatches HTTP `upgrade` requests to exactly one WebSocket server.
 * Required when multiple `ws` paths share one HTTP server — each attached
 * `WebSocketServer` otherwise rejects foreign paths with `abortHandshake(400)`.
 */
export class HttpUpgradeRouter {
    private readonly routes: UpgradeRoute[] = []
    private installed = false

    constructor(private readonly server: HttpServer) {}

    register(route: UpgradeRoute): this {
        if (this.installed) {
            throw new Error('HttpUpgradeRouter: cannot register routes after install()')
        }
        this.routes.push(route)
        return this
    }

    install(): void {
        if (this.installed) {
            return
        }
        this.installed = true

        this.server.on('upgrade', (req, socket, head) => {
            for (const route of this.routes) {
                if (route.match(req)) {
                    route.handle(req, socket, head)
                    return
                }
            }
            socket.destroy()
        })
    }
}

export function pathRoute(wss: WebSocketServer, path: string, name = path): UpgradeRoute {
    return {
        name,
        match: (req) => matchesUpgradePath(req, path),
        handle: (req, socket, head) => {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req)
            })
        }
    }
}

export function figgoRoute(figgo: {
    matchesUpgrade: (req: IncomingMessage) => boolean
    handleUpgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void
}): UpgradeRoute {
    return {
        name: 'figgo-bot',
        match: (req) => figgo.matchesUpgrade(req),
        handle: (req, socket, head) => figgo.handleUpgrade(req, socket, head)
    }
}
