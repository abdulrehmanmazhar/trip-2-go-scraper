export default {
    ENV: process.env.ENV || 'development'
} as { ENV: 'production' | 'development' }
