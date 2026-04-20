import type { NextFunction, Request, Response } from 'express'
type THttpError = {
    success: boolean
    statusCode: number
    request: {
        ip?: string | null
        method: string
        url: string
    }
    message: string
    data: unknown
    trace?: object | null
}

export default (err: THttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode).json(err)
}
