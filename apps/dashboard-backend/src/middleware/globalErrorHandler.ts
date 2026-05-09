import type { NextFunction, Request, Response } from 'express'
import type { THttpError } from '../types/types.js'

export default (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status((err as THttpError).statusCode && typeof (err as THttpError).statusCode === 'number' ? (err as THttpError).statusCode : 500).json(err)
}
