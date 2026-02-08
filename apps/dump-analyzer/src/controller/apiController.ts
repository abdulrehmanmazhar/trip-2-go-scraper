import type { NextFunction, Request, Response } from 'express'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import httpError from '../util/httpError.js'

export default {
    self: (req: Request, res: Response, nextFunc: NextFunction) => {
        try {
            httpResponse(req, res, 200, responseMessage.SUCCESS)
        } catch (error) {
            httpError(nextFunc, error as Error, req, 500)
        }
    }
}
