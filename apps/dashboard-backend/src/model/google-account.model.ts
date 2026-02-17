import mongoose, { Document, Schema } from 'mongoose'
import { decrypt, encrypt } from '../util/encryption.js'

export interface IGoogleAccount extends Document {
    email: string
    password: string
    getDecryptedPassword(): string
    status: 'active' | 'suspended' | 'banned'
}

const GoogleAccountSchema = new Schema<IGoogleAccount>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        password: {
            type: String,
            required: true,
            select: false // VERY IMPORTANT
        },

        status: {
            type: String,
            enum: ['active', 'suspended', 'banned'],
            default: 'active',
            index: true
        }
    },
    {
        timestamps: true
    }
)

GoogleAccountSchema.pre('save', function () {
    if (!this.isModified('password')) return

    this.password = encrypt(this.password)
})

GoogleAccountSchema.methods.getDecryptedPassword = function () {
    if (!this.password) {
        throw new Error('Password not selected. Use .select("+password")')
    }

    return decrypt(this.password as string)
}

const GoogleAccountModel = mongoose.model<IGoogleAccount>('GoogleAccount', GoogleAccountSchema)

export default GoogleAccountModel
