import type { Server } from 'node:http'
import { BotModel } from '../model/bot.model.js'
import { FiggoServer } from 'ws-core'

export async function getBotPublicKey(botId: string): Promise<string> {
    const bot = await BotModel.findOne({ botId })

    if (!bot) {
        throw new Error('Bot not found')
    }

    return bot.publicKey
}

export function registerHandlers(server: FiggoServer) {
    server.handle('task:result', async (ctx) => {
        // ctx.payload contains bot response

        console.log('Task result from bot:', ctx)
    })

    server.handle('save:data', async (ctx) => {
        return {
            success: true,
            message: 'Data saved successfully'
        }
    })

    server.handle('bot:connected', async (ctx) => {
        console.log('Bot connected:', ctx)
    })

    server.handle('bot:disconnected', async (ctx) => {
        console.log('Bot disconnected:', ctx)
    })
}

export function createFiggoServer(server: Server) {
    const figgo = new FiggoServer({
        server,
        path: '/ws',
        getPublicKey: async (botId: string) => {
            return getBotPublicKey(botId)
        }
    })

    registerHandlers(figgo)

    return figgo
}
