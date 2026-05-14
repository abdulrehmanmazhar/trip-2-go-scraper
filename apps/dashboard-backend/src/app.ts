import express, { type Application } from 'express'
import path from 'path'
import router from './router/apiRouter.js'
import userRouter from './router/user.router.js'
import botRouter from './router/bot.router.js'
import workflowRouter from './router/workflow.router.js'
import globalErrorHandler from './middleware/globalErrorHandler.js'
import responseMessage from './constant/responseMessage.js'
import httpError from './util/httpError.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { allowedOrigins } from './constant/application.js'
const app: Application = express()

// Middleware
app.use(express.json())
app.use(express.static(path.join(import.meta.dirname, '../', 'public')))
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        },
        credentials: true
    })
)
app.use(cookieParser())

// Routes
app.use('/api/v1', router, userRouter, botRouter, workflowRouter)

// 404 handler
app.use((req, _res, next) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'))
    } catch (error) {
        httpError(next, error as Error, req, 404)
    }
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
