import type { FiggoClient } from 'ws-core'
import logger from '../utils/logger.js'

export const shutDown = (client: FiggoClient) => {
    process.stdout.write('\n🛑 Shutting down bot...\n')
    client.disconnect()
    logger.info('BOT_SHUTDOWN', { meta: { message: 'Bot shutdown successful' } })
    process.exit(0)
}
