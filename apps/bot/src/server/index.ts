import app from './app.js'
import logger from '../utils/logger.js'

const server = app.listen(3000)

export const main = () => {
    try {
        logger.info(`APPLICATION STARTED`, {
            meta: {
                PORT: 3000,
                SERVER_URL: 'http://localhost:3000'
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
