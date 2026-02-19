import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET,
    ACTIVATION_SECRET: process.env.ACTIVATION_SECRET,
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE
}
