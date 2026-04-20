import path from 'node:path'
import os from 'node:os'
export enum EApplicationEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production'
}

export const name: string = 'Trip-2-Go-Recorder'
export const appRoot = path.join(os.homedir(), name)
