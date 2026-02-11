import type { NextFunction, Request } from 'express'
import errorObject from './errorObject.js'

export default (nextFunc: NextFunction, error: Error, req: Request, statusCode: number = 500) => {
    const errObj = errorObject(error, req, statusCode)
    return nextFunc(errObj)
}
