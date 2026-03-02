import type { Request, Response, NextFunction } from 'express'
import Jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import type { IUser } from '../model/user.model.js'
import userModel from '../model/user.model.js'
import config from '../config/config.js'
import httpError from '../util/httpError.js'

interface IReq extends Request {
    user: IUser
}

export const isAuthenticated = async (req: Request, _res: Response, next: NextFunction) => {
    const { access_token } = req.cookies as { access_token: string }

    if (!access_token) {
        return httpError(next, new Error('User is not authenticated'), req, 401)
    }

    try {
        // Verify the token
        const decoded = Jwt.verify(access_token, config.ACCESS_TOKEN as string) as JwtPayload

        if (!decoded) {
            return httpError(next, new Error('Access token is not valid'), req, 400)
        }

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return httpError(next, new Error('User not found'), req, 400)
        }

        ;(req as IReq).user = user
        next()
    } catch (error) {
        // Explicitly handle token expiration
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return httpError(next, new Error('JWT token has expired'), req, 401)
        }
        return httpError(next, error as Error, req, 500)
    }
}

export const authorizeRoles = (...roles: IUser['role'][]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = (req as IReq).user
        if (!roles.includes(user.role)) {
            return httpError(next, new Error(`Role: ${user.role} is not allowed to access this resource`), req, 403)
        }
        next()
    }
}
