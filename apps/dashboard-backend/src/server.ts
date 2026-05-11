import app from './app.js'
import config from './config/config.js'
import databaseService from './service/databaseService.js'
import { createFiggoServer } from './util/bot.js'
import logger from './util/logger.js'

const server = app.listen(config.PORT)

const main = async () => {
    try {
        // Database connection
        const connect = await databaseService.connect()

        logger.info(`DATABASE CONNECTED`, {
            meta: {
                DATABASE_NAME: connect,
                TYPE: 'mongodb'
            }
        })

        const figgo = createFiggoServer(server)

        setInterval(() => {
            figgo.send('974c5875-a425-48d7-8815-800f0a405658', 'task:run', { nope: 0 })
        }, 1000)

        logger.info(`APPLICATION STARTED`, {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        })
    } catch (error) {
        logger.error(`APPLICATION ERROR`, {
            meta: error
        })

        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION ERROR`, {
                    meta: error
                })
            }

            process.exit(1)
        })
    }
}

await main()
