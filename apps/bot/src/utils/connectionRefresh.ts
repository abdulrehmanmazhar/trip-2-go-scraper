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
            logger.info('BOT_RECONNECTED', { meta: { message: 'Bot reconnected to server' } })
        } catch (err) {
            logger.error('BOT_RECONNECTION_FAILED', { meta: { error: err } })
            if ((err as { code: string }).code && (err as { code: string }).code !== 'ECONNREFUSED') throw err
        }
    }
}
