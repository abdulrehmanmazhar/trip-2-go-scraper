import path from 'node:path'
import os from 'node:os'
import { loadEnvFile } from 'node:process'

loadEnvFile()

export enum EApplicationEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production'
}

export const apiVersion = '/api/v1'
export const centralServerUrl = process.env.CENTRAL_SERVER_URL || 'http://localhost:4000'
export const frontend = process.env.FRONTEND_URL || 'http://localhost:5173'
export const verificationLink = `${frontend}/verify-bot`

export const name: string = 'Trip-2-Go-Bot'
export const appRoot = path.join(os.homedir(), name)
