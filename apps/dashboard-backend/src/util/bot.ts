import { updateCountryList } from '../handler/updateCountryList.js'
import { BotModel } from '../model/bot.model.js'
import { workflowTestHub } from '../service/workflowTestHub.js'
import { FiggoServer } from 'ws-core'

export async function getBotPublicKey(botId: string): Promise<string> {
    const bot = await BotModel.findOne({ botId })

    if (!bot || bot.isRevoked || !bot.isOtpVerified || bot.status !== 'approved') {
        throw new Error('Bot not found')
    }

    return bot.publicKey
}

export function registerHandlers(server: FiggoServer) {
    server.handle('ping', (payload) => {
        return payload
    })

    server.handle('updateCountryList', updateCountryList)

    server.handle('workflowFeedback', (payload) => {
        workflowTestHub.ingestFeedback(payload)
        return { ok: true }
    })
}
