import express, { type Application } from 'express'
import path from 'path'
import { httpError, responseMessage } from '../utils/serverUtils.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './router/apiRouter.js'
import botRouter from './router/botRouter.js'
import globalErrorHandler from './middleware/globalErrorHandler.js'

const app: Application = express()

// Middleware
app.use(express.json())
app.use(express.static(path.join(import.meta.dirname, '../', 'public')))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cookieParser())

// Routes
app.use('/api/v1', router, botRouter)

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
