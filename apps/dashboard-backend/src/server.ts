import app from './app.js'
import config from './config/config.js'
import databaseService from './service/databaseService.js'
import { createFiggoServer } from './service/botService.js'
import { attachWorkflowTestStream } from './service/workflowTestStream.js'
import logger from './util/logger.js'
import { ensureWorkflowsBucket, minioClient } from './service/storageService.js'

const server = app.listen(config.PORT)

createFiggoServer(server)
attachWorkflowTestStream(server)

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

        const bucketExists = await minioClient.bucketExists('tript-2-go')

        if (!bucketExists) {
            await minioClient.makeBucket('tript-2-go')
            logger.info(`MINIO BUCKET CREATED`, {
                meta: {
                    BUCKET_NAME: 'tript-2-go'
                }
            })
        } else {
            logger.info(`MINIO BUCKET EXISTS`, {
                meta: {
                    BUCKET_NAME: 'tript-2-go'
                }
            })
        }

        await ensureWorkflowsBucket()
        logger.info(`MINIO WORKFLOWS BUCKET READY`, {
            meta: {
                BUCKET_NAME: 'workflows'
            }
        })

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
