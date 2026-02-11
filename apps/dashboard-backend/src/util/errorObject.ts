import type { Request } from 'express'
import type { THttpError } from '../types/types.js'
import responseMessage from '../constant/responseMessage.js'
import config from '../config/config.js'
import { EApplicationEnvironment } from '../constant/application.js'
import logger from './logger.js'

export default (err: unknown, req: Request, errorStatusCode: number = 500): THttpError => {
    const errObj: THttpError = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    // LOG
    logger.info(`CONTROLLER ERROR`, {
        meta: errObj
    })

    // Production environment - remove IP address from response and error trace
    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete errObj.request.ip
        delete errObj.trace
    }

    return errObj
}
