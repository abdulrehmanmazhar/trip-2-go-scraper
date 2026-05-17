import path from 'node:path'
import os from 'node:os'

export enum EApplicationEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production'
}

export const apiVersion = '/api/v1'
export const centralServerUrl = 'https://api.figgolabs.com'
export const frontend = 'https://figgolabs.com'
export const verificationLink = `${frontend}/verify-bot`

export const name: string = 'Trip-2-Go-Bot'
export const appRoot = path.join(os.homedir(), name)
