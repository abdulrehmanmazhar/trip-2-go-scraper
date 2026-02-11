import type { NextFunction, Request, Response } from 'express'
import type { THttpError } from '../types/types.js'

export default (err: THttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode).json(err)
}
