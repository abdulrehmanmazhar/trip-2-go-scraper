import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { BotModel } from '../model/bot.model.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import { botService } from '../service/botService.js'

export default {
    async listBots(req: Request, res: Response, _next: NextFunction) {
        const docs = await BotModel.find().sort({ createdAt: -1 }).select('-otpHash -publicKey').lean()

        const data = docs.map((b) => {
            const row: {
                id: string
                botId: string
                status: 'pending' | 'approved' | 'rejected'
                isOtpVerified: boolean
                isRevoked: boolean
                createdAt: Date
                updatedAt: Date
                name?: string
                hostname?: string
                platform?: string
                ip?: string
                lastSeenAt?: Date
                revokedAt?: Date
            } = {
                id: String(b._id),
                botId: b.botId,
                status: b.status,
                isOtpVerified: b.isOtpVerified,
                isRevoked: Boolean(b.isRevoked),
                createdAt: b.createdAt!,
                updatedAt: b.updatedAt!
            }
            if (b.name) row.name = b.name
            if (b.hostname) row.hostname = b.hostname
            if (b.platform) row.platform = b.platform
            if (b.ip) row.ip = b.ip
            if (b.lastSeenAt) row.lastSeenAt = b.lastSeenAt
            if (b.revokedAt) row.revokedAt = b.revokedAt
            return row
        })

        return httpResponse(req, res, 200, responseMessage.SUCCESS, data)
    },
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
        const { botId, name } = req.body as { botId?: string; name?: string }

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status !== 'pending') {
            return httpError(next, new Error('Only pending bots can be approved'), req, 400)
        }

        if (!bot.isOtpVerified) {
            return httpError(next, new Error('Bot must complete OTP verification before approval'), req, 400)
        }

        bot.status = 'approved'
        bot.isRevoked = false
        bot.set('revokedAt', undefined)
        if (typeof name === 'string' && name.trim()) {
            bot.name = name.trim()
        }

        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot approved' })
    },
    async rejectBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.body as { botId?: string }

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status !== 'pending') {
            return httpError(next, new Error('Only pending bots can be rejected'), req, 400)
        }

        bot.status = 'rejected'

        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot rejected' })
    },
    async revokeBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.body as { botId?: string }

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status !== 'approved') {
            return httpError(next, new Error('Only approved bots can be revoked'), req, 400)
        }

        if (bot.isRevoked) {
            return httpError(next, new Error('Bot is already revoked'), req, 400)
        }

        bot.isRevoked = true
        bot.revokedAt = new Date()
        await bot.save()

        botService.disconnect(botId)

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot access revoked' })
    },
    async unrevokeBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.body as { botId?: string }

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status !== 'approved') {
            return httpError(next, new Error('Only approved bots can be restored'), req, 400)
        }

        if (!bot.isRevoked) {
            return httpError(next, new Error('Bot is not revoked'), req, 400)
        }

        bot.isRevoked = false
        bot.set('revokedAt', undefined)
        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot access restored' })
    },
    async updateBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.params as { botId: string }
        const { name } = req.body as { name?: unknown }

        if (typeof name !== 'string') {
            return httpError(next, new Error('name must be a string'), req, 400)
        }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        const trimmed = name.trim()
        if (trimmed === '') {
            bot.set('name', undefined)
        } else {
            bot.name = trimmed
        }

        await bot.save()

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot updated' })
    },
    async deleteBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.params as { botId: string }

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }

        const deleted = await BotModel.findOneAndDelete({ botId })

        if (!deleted) {
            return httpError(next, new Error('Bot not found'), req, 404)
        }

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Bot deleted' })
    },
    async resolveBot(req: Request, res: Response, next: NextFunction) {
        const { botId } = req.params as { botId: string }

        const bot = await BotModel.findOne({ botId })

        if (!bot) return httpError(next, new Error('Bot not found'), req, 404)

        if (bot.status === 'approved' && bot.isOtpVerified && bot.isRevoked) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { status: 'revoked' })
        }

        if (bot.status === 'approved' && bot.isOtpVerified) {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { status: 'approved' })
        } else if (bot.status === 'rejected') {
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { status: 'rejected' })
        }

        return httpResponse(req, res, 202, responseMessage.PENDING, { status: 'pending' })
    }
}
