import type { FiggoClient } from 'ws-core'
import logger from './logger.js'

export const connectionRefresh = async (client: FiggoClient) => {
    try {
        client.sendEvent('ping')
    } catch {
        try {
            await client.connect()
            await new Promise((resolve) => setTimeout(resolve, 2000))
            client.sendEvent('ping')
            process.stdout.write('Bot re-connected to server\n')
            logger.info('BOT_RECONNECTED', { meta: { message: 'Bot reconnected to server' } })
        } catch (err) {
            process.stderr.write(`Reconnection failed: ${err as Error}\n`)
            logger.error('BOT_RECONNECTION_FAILED', { meta: { error: err } })
            if ((err as { code: string }).code && (err as { code: string }).code !== 'ECONNREFUSED') throw err
        }
    }
}
