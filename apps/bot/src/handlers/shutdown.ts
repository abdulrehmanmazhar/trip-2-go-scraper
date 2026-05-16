import type { FiggoClient } from 'ws-core'
import logger from '../utils/logger.js'

export const shutDown = (client: FiggoClient) => {
    logger.info('BOT_SHUTDOWN', { meta: { message: 'Shutting down bot' } })
    client.disconnect()
    process.exit(0)
}
