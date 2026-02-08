import express, { type Application } from 'express'
import path from 'path'
import router from './router/apiRouter.js'
import globalErrorHandler from './middleware/globalErrorHandler.js'
import responseMessage from './constant/responseMessage.js'
import httpError from './util/httpError.js'

const app: Application = express()

// Middleware
app.use(express.json())
app.use(express.static(path.join(import.meta.dirname, '../', 'public')))

// Routes
app.use('/api/v1', router)

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
