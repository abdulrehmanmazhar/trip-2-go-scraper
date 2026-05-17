import type { FiggoServer } from 'ws-core'
import { createBotSocket } from '../ws/bot-socket.js'
import { registerHandlers } from '../util/bot.js'

export let botService: FiggoServer

/** Creates the Figgo bot server and registers RPC handlers. Called from {@link attachWebSockets}. */
export function initBotService(): FiggoServer {
    const figgo = createBotSocket()
    botService = figgo
    registerHandlers(figgo)
    return figgo
}
