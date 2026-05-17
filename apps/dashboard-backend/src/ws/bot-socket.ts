import { FiggoServer } from 'ws-core'
import { getBotPublicKey } from '../util/bot.js'
import { BOT_WS_PATH } from './paths.js'

export function createBotSocket(): FiggoServer {
    return new FiggoServer({
        noServer: true,
        path: BOT_WS_PATH,
        getPublicKey: getBotPublicKey
    })
}
