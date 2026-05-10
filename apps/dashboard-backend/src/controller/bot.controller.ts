import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { BotModel } from '../model/bot.model.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'

export default {
    async registerBot(req: Request, res: Response, next: NextFunction) {
        const { publicKey, hostname, platform } = req.body

        if (!publicKey) {
            return httpError(next, new Error('Public key is required'), req, 400)
        }

        const botId = crypto.randomUUID()
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')

        await BotModel.create({
            botId,
            publicKey,
            hostname,
            platform,
            otpHash,
            otpExpiresAt: new Date(Date.now() + 2 * 60 * 1000)
        })

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            botId,
            otp,
            resolveUrl: `/resolve-bot`
        })
    },
    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        const { botId, otp } = req.body

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.otpExpiresAt < new Date()) {
            return httpError(next, new Error('OTP expired'), req, 400)
        }

        const hash = crypto.createHash('sha256').update(otp).digest('hex')

        if (hash !== bot.otpHash) {
            return httpError(next, new Error('Invalid OTP'), req, 400)
        }

        bot.isOtpVerified = true
        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'OTP verified. Awaiting admin approval.' })
    },
    async approveBot(req: Request, res: Response, next: NextFunction) {
        const { botId, name } = req.body

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        bot.status = 'approved'
        bot.name = name

        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot approved' })
    },
    async rejectBot(req: Request, res: Response, next: NextFunction) {
        const { botId, name } = req.body

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        bot.status = 'rejected'
        bot.name = name

        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot rejected' })
    },
    async resolveBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.params as { botId: string }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status === 'approved' && bot.isOtpVerified) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { status: 'approved' })
        } else if (bot.status === 'rejected') {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { status: 'rejected' })
        }

        return httpResponse(req, res, 202, responseMessage.PENDING, { status: 'pending' })
    }
}
