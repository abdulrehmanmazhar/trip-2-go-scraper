import type { Server } from 'node:http'
import { FiggoServer } from 'ws-core'
import { getBotPublicKey, registerHandlers } from '../util/bot.js'

export let botService: ReturnType<typeof createFiggoServer>

export function createFiggoServer(server: Server) {
    const figgo = new FiggoServer({
        server,
        path: '/ws',
        getPublicKey: async (botId: string) => {
            return getBotPublicKey(botId)
        }
    })

    botService = figgo

    registerHandlers(figgo)

    return figgo
}
