import { createLogger, format, transports } from 'winston'
import type { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports/index.js'
import util from 'util'
import config from '../config/config.js'
import { EApplicationEnvironment } from '../constant/application.js'
import path from 'path'
import { blue, green, magenta, red, yellow } from 'colorette'
import 'winston-mongodb'
import type { MongoDBTransportInstance } from 'winston-mongodb'

// colorize terminal
const colorizeLevel = (level: string) => {
    switch (level) {
        case 'ERROR':
            return red(level)
        case 'WARN':
            return yellow(level)
        case 'INFO':
            return blue(level)
        default:
            return level
    }
}

// console functions
const consoleLogFormat = format.printf((info) => {
    const { timestamp, level, message, meta = {} } = info

    const customLevel = colorizeLevel(level.toUpperCase())
    const customTimestamp = green(timestamp as string)
    const customMessage = message as string
    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null
    })

    const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customMeta}\n `

    return customLog
})
const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ]
    }
    return []
}

// file functions
const fileLogFormat = format.printf((info) => {
    const { timestamp, level, message, meta = {} } = info

    const logMeta: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            }
        } else {
            logMeta[key] = value
        }
    }

    const logData = {
        level: level.toUpperCase(),
        timestamp,
        message,
        meta: logMeta
    }

    return JSON.stringify(logData, null, 4)
})
const fileTransport = (): Array<FileTransportInstance> => {
    return [
        new transports.File({
            filename: path.join(import.meta.dirname, '../', '../', 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat)
        })
    ]
}

const mongoDBTransport = (): Array<MongoDBTransportInstance> => {
    return [
        new transports.MongoDB({
            level: 'info',
            db: config.DATABASE_URL as string,
            metaKey: 'meta',
            expireAfterSeconds: 2592000, // 30 days
            collection: 'app-logs'
            // format: format.combine(format.timestamp(), fileLogFormat)
        })
    ]
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...consoleTransport(), ...fileTransport(), ...mongoDBTransport()]
})
