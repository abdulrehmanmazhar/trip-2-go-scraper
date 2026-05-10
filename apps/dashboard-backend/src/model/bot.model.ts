import { Schema, model, Document } from 'mongoose'

export interface IBot extends Document {
    botId: string
    name?: string

    publicKey: string

    hostname: string
    platform: string
    ip?: string

    status: 'pending' | 'approved' | 'rejected'

    /** When true, an approved bot is blocked from platform access until re-approved or record removed. */
    isRevoked: boolean
    revokedAt?: Date

    otpHash: string
    otpExpiresAt: Date
    isOtpVerified: boolean

    lastSeenAt?: Date

    createdAt: Date
    updatedAt: Date
}

const BotSchema = new Schema<IBot>(
    {
        botId: { type: String, required: true, unique: true },

        name: { type: String },

        publicKey: { type: String, required: true },

        hostname: String,
        platform: String,
        ip: String,

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },

        isRevoked: { type: Boolean, default: false },
        revokedAt: Date,

        otpHash: { type: String, required: true },
        otpExpiresAt: { type: Date, required: true },
        isOtpVerified: { type: Boolean, default: false },

        lastSeenAt: Date
    },
    { timestamps: true }
)

export const BotModel = model<IBot>('Bot', BotSchema)
