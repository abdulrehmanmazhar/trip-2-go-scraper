import mongoose, { Document, Model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface IUser extends Document {
    name: string
    email: string
    password: string
    avatar: {
        public_id: string
        url: string
    }
    role: 'Admin' | 'User'
    isVerified: boolean
    routes: string[]
    comparePassword(password: string): Promise<boolean>
    signAccessToken(): string
    signRefreshToken(): string
}

interface IUserMethods {
    comparePassword(password: string): Promise<boolean>
    signAccessToken(): string
    signRefreshToken(): string
}

type UserModel = Model<IUser, IUserMethods>

const userSchema: Schema<IUser, UserModel> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name']
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            validate: {
                validator: function (value: string): boolean {
                    return emailRegexPattern.test(value)
                },
                message: 'Please enter a valid email'
            },
            unique: true
        },
        password: {
            type: String,
            minlength: [6, 'Password must be 6 characters min.'],
            select: false
        },
        avatar: {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            }
        },
        role: {
            type: String,
            enum: {
                values: ['User', 'Admin'],
                message: 'User role must be either Admin or User'
            },
            default: 'User'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        routes: {
            type: [String],
            default: []
        }
    },
    { timestamps: true }
)

// Sign Access Token
userSchema.methods.signAccessToken = function (this: IUser): string {
    const accessTokenSecret = config.ACCESS_TOKEN
    if (!accessTokenSecret) {
        throw new Error('ACCESS_TOKEN is not configured')
    }
    return jwt.sign({ id: this._id }, accessTokenSecret, {
        expiresIn: '5m'
    })
}

// Sign Refresh Token
userSchema.methods.signRefreshToken = function (this: IUser): string {
    const refreshTokenSecret = config.REFRESH_TOKEN
    if (!refreshTokenSecret) {
        throw new Error('REFRESH_TOKEN is not configured')
    }
    return jwt.sign({ id: this._id }, refreshTokenSecret, {
        expiresIn: '3d'
    })
}

// Hash password before saving
userSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.comparePassword = async function (this: IUser, enteredPassword: string): Promise<boolean> {
    if (!this.password) {
        return false
    }
    return (await bcrypt.compare(enteredPassword, this.password)) as unknown as boolean
}

const userModel: Model<IUser> = mongoose.model<IUser, UserModel>('User', userSchema)

export default userModel
