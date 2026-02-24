import type { Request, Response, NextFunction } from 'express'
import type { IUser } from '../model/user.model.js'
import userModel from '../model/user.model.js'
import Jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import emailService from '../service/emailService.js'
import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import config from '../config/config.js'
import { sendToken } from '../util/jwt.js'
// register user

interface RegistrationBody {
    name: string
    email: string
    password: string
    avatar?: string
}

export const registrationUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as RegistrationBody
        const isEmailExist = await userModel.findOne({ email })
        if (isEmailExist) {
            return httpError(next, new Error('Email already exists'), req, 400)
        }

        const user: RegistrationBody = {
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user)

        const activationCode = activationToken.activationCode

        const data = { user: { name: user.name }, activationCode, activationLink: `${config.SERVER_URL}/activate-user/${activationCode}` }

        try {
            await emailService.sendEmail({
                email: user.email,
                subject: 'Activate your account',
                template: 'activation-mail.ejs',
                data
            })
            // res.status(201).json({
            //     success: true,
            //     message: `Please check your email ${user.email} to activate your account`,
            //     activationToken: activationToken.token
            // })

            httpResponse(req, res, 200, responseMessage.SUCCESS, { activationToken: activationToken.token })
        } catch (error) {
            return httpError(next, error as Error, req, 400)
        }
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

interface IActivationToken {
    token: string
    activationCode: string
}

export const createActivationToken = (user: RegistrationBody): IActivationToken => {
    const activationCode = Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, '0')

    const token = Jwt.sign(
        {
            user,
            activationCode
        },
        config.ACTIVATION_SECRET as string,
        {
            expiresIn: '5m'
        }
    )

    return { token, activationCode }
}

// activating user account

interface IActivationRequest {
    activation_token: string
    activation_code: string
}

export const activateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest
        const newUser = Jwt.verify(activation_token, config.ACTIVATION_SECRET as string) as {
            user: IUser
            activationCode: string
        }
        if (newUser.activationCode !== activation_code) {
            return httpError(next, new Error('Invalid Activation Code'), req, 400)
        }
        const { name, email, password } = newUser.user
        const existUser = await userModel.findOne({ email })

        if (existUser) {
            return httpError(next, new Error('Email already exist'), req, 400)
        }
        await userModel.create({
            name,
            email,
            password
        })
        // res.status(201).json({
        //     success: true,
        //     message: 'user activated successfully'
        // })
        httpResponse(req, res, 201, responseMessage.SUCCESS)
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

// login user

interface ILoginRequest {
    email: string
    password: string
}

export const LoginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest

        if (!email || !password) {
            return httpError(next, new Error('Please enter email and password both'), req, 400)
        }

        const user = await userModel.findOne({ email }).select('+password')

        if (!user) {
            return httpError(next, new Error('Invalid email or password'), req, 400)
        }

        const isPasswordMatch = await user.comparePassword(password)

        if (!isPasswordMatch) {
            return httpError(next, new Error('Invalid email or password'), req, 400)
        }

        user.password = undefined as unknown as string

        sendToken(user, 200, req, res)
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie('access_token', '', { maxAge: 1, sameSite: 'none', secure: true })
        res.cookie('refresh_token', '', { maxAge: 1, sameSite: 'none', secure: true })
        // const userId = req.user?._id || ''
        // res.status(201).json({
        //     success: true,
        //     message: 'Logged out successfully'
        // })
        httpResponse(req, res, 201, responseMessage.SUCCESS)
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

// update access token
export const updateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refresh_token } = req.cookies as { refresh_token: string }
        const decoded = Jwt.verify(refresh_token, config.REFRESH_TOKEN as string) as JwtPayload
        if (!decoded) {
            // return next(new ErrorHandler("Couldn't refresh token", 400))
            return httpError(next, new Error(`Couldn't refresh token`), req, 400)
        }
        const session = await userModel.findById(decoded.id)
        if (!session) {
            return httpError(next, new Error(`Couldn't refresh token`), req, 400)
        }
        // const user = JSON.parse(session)
        const user = session
        // const accessToken = Jwt.sign({ id: user._id }, config.ACCESS_TOKEN as string, {
        //     expiresIn: '5m'
        // })
        // const refreshToken = Jwt.sign({ id: user._id }, config.REFRESH_TOKEN as string, {
        //     expiresIn: '3d'
        // })
        // req.user = user
        // res.cookie('access_token', accessToken, accessTokenOptions)
        // res.cookie('refresh_token', refreshToken, refreshTokenOptions)
        // res.status(200).json({
        //     status: 'success',
        //     accessToken
        // })
        sendToken(user, 200, req, res)
    } catch (error) {
        // return next(new ErrorHandler(error.message, 400))
        return httpError(next, error as Error, req, 400)
    }
}

// get user info
export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.body as IUser)._id
        const user = await userModel.findOne({ userId })
        httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

interface ISocialBody {
    email: string
    name: string
    avatar: IUser['avatar']
}

// social auth
export const socialAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as ISocialBody
        const user = await userModel.findOne({ email })
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar })
            sendToken(newUser, 200, req, res)
        } else {
            sendToken(user, 200, req, res)
        }
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

interface IUpdateUserInfo {
    name: string
    email: string
}

interface IReq extends Request {
    user: IUser
}

export const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body as IUpdateUserInfo
        const userId = (req as IReq).user?._id
        const user = await userModel.findById(userId)
        if (email && user) {
            const isEmailExist = await userModel.findOne({ email })

            if (isEmailExist) {
                return httpError(next, new Error('Email already exist'), req, 400)
            }
            user.email = email
        }
        if (name && user) {
            user.name = name
        }

        await user?.save()
        // res.status(200).json({
        //     success: true,
        //     user
        // })

        httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

// update user password

interface IUpdatePassword {
    oldPassword: string
    newPassword: string
}

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as IUpdatePassword
        //console.log(oldPassword, newPassword);
        if (!oldPassword || !newPassword) {
            // return next(new ErrorHandler('Please enter old or new password', 400))
            return httpError(next, new Error('Please enter old or new password'), req, 400)
        }
        const user = await userModel.findById((req as IReq).user?._id).select('+password')

        if (user?.password === undefined) {
            // return next(new ErrorHandler('Invalid user', 400))
            return httpError(next, new Error('Invalid User'), req, 400)
        }
        const isPasswordMatch = await user?.comparePassword(oldPassword)

        if (!isPasswordMatch) {
            // return next(new ErrorHandler('Invalid password', 400))
            return httpError(next, new Error('Invalid Password'), req, 400)
        }
        user.password = newPassword

        await user.save()
        // res.status(201).json({
        //     success: true,
        //     user
        // })
        httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
    } catch (error) {
        // return next(new ErrorHandler(error.message, 400))
        return httpError(next, error as Error, req, 400)
    }
}

interface IUpdateProfilePicture {
    avatar: string
}

export const updateProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    const { avatar } = req.body as IUpdateProfilePicture

    try {
        const user = await userModel.findById((req as IReq).user?._id)

        if (!user) {
            return httpError(next, new Error('User not found'), req, 404)
        }

        if (!avatar) {
            return httpError(next, new Error('Avatar is required'), req, 400)
        }

        // If user already has avatar → delete old one
        if (user.avatar?.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id)
        }

        const myCloud: UploadApiResponse = await cloudinary.uploader.upload(avatar, {
            folder: 'avatars',
            width: 150
        })

        user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }

        await user.save()

        httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
    } catch (error) {
        return httpError(next, error as Error, req, 400)
    }
}

// get all users for admin

export const fetchAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // getAllUsers(res)
        const users = await userModel.find()
        httpResponse(req, res, 200, responseMessage.SUCCESS, { users })
    } catch (error) {
        // return next(new ErrorHandler(error.message, 500))
        return httpError(next, error as Error, req, 400)
    }
}

// update user role for admin

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.body as { id: string; role: IUser['role'] }
        const user = await userModel.findById(id)
        if (!user) {
            return httpError(next, new Error(`Couldn't find user`), req, 400)
        }
        user.role = role

        await user.save()

        httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
    } catch (error) {
        // return next(new ErrorHandler(error.message, 400))
        return httpError(next, error as Error, req, 400)
    }
}
