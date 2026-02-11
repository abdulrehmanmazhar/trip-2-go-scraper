import mongoose from 'mongoose'
import config from '../config/config.js'
import logger from '../util/logger.js'

export default {
    connect: async () => {
        try {
            const mongodb = await mongoose.connect(config.DATABASE_URL as string)
            return mongodb.connection.name
        } catch (error) {
            logger.error(`ERROR`, {
                meta: { error }
            })
            return null
        }
    }
}
