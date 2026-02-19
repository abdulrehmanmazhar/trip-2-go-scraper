import type { Request, Response } from 'express'
import type { IUser } from '../model/user.model.js'
import config from '../config/config.js'
import httpResponse from './httpResponse.js'
import responseMessage from '../constant/responseMessage.js'

interface ITokenOptions {
    expires: Date
    maxAge: number
    httpOnly: boolean
    sameSite: 'lax' | 'strict' | 'none' | undefined
    secure?: boolean
}

const accessTokenExpire = parseInt(config.ACCESS_TOKEN_EXPIRE || '300', 10)
const refreshTokenExpire = parseInt(config.REFRESH_TOKEN_EXPIRE || '1200', 10)

// options for cookies
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire + 1000 * 60 * 60),
    maxAge: accessTokenExpire + 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true
}

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire + 1000 * 60 * 60 * 24),
    maxAge: accessTokenExpire + 60 * 60 * 24 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true
}

export const sendToken = (user: IUser, statusCode: number, req: Request, res: Response) => {
    const accessToken = user.signAccessToken()
    const refreshToken = user.signRefreshToken()

    if (config.ENV === 'production') {
        accessTokenOptions.secure = true
    }

    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', refreshToken, refreshTokenOptions)

    // res.status(statusCode).json({
    //     success: true,
    //     user,
    //     accessToken
    // })
    httpResponse(req, res, statusCode, responseMessage.SUCCESS, { user, accessToken })
}
