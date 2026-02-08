import type { Request, Response } from 'express'
import type { THttpResponse } from '../types/types.js'
import config from '../config/config.js'
import { EApplicationEnvironment } from '../constant/application.js'
import logger from './logger.js'

export default (req: Request, res: Response, responseStatusCode: number, responseMessage: string, data: unknown = null): void => {
    const response: THttpResponse = {
        success: true,
        statusCode: responseStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: responseMessage,
        data
    }

    // LOG
    logger.info(`CONTROLLER RESPONSE`, {
        meta: response
    })

    // Production environment - remove IP address from response
    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete response.request.ip
    }

    res.status(responseStatusCode).json(response)
}
