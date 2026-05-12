import fs from 'node:fs/promises'
import path from 'node:path'
import { FiggoClient } from 'ws-core'
import { appRoot } from '../constant/application.js'
import { shutDown } from '../handlers/shutdown.js'
import logger from '../utils/logger.js'
import type { BotEvents } from '../types/types.js'
import { runTaskHandler } from '../handlers/runTask.js'
import { getMachineInfo, getProcessStats, getQuickHealth } from '../utils/process.js'
import { runAsyncLoop } from '../utils/runAsyncLoop.js'
import { connectionRefresh } from '../utils/connectionRefresh.js'

export async function handleStart() {
    const configPath = path.join(appRoot, 'bot.json')

    let raw: string
    try {
        raw = await fs.readFile(configPath, 'utf-8')
    } catch {
        throw new Error(`Bot not logged in. Run 'figgo-bot login' first.`)
    }

    const config = JSON.parse(raw) as {
        botId: string
        privateKey: string
        serverUrl: string
    }

    const wsUrl = config.serverUrl.replace('http', 'ws') + '/ws'

    const client = new FiggoClient({
        url: wsUrl,
        botId: config.botId,
        privateKey: config.privateKey
    })

    try {
        await client.connect()
        process.stdout.write('Bot connected to server\n')
        logger.info('BOT_STARTED', { meta: { botId: config.botId } })
    } catch (err) {
        process.stderr.write(`Connection failed: ${err as Error}\n`)
        logger.error('BOT_CONNECTION_FAILED', { meta: { botId: config.botId, error: err as Error } })
        if (err instanceof Error && err.message !== 'Unexpected server response: 404') {
            process.exit(1)
        }
    }

    // HANDLERS SHOULD BE REGISTERED AFTER THE CONNECTION IS ESTABLISHED

    const botShutDown = () => shutDown(client)

    process.on('SIGINT', botShutDown)
    process.on('SIGTERM', botShutDown)

    client.handle('ping', (payload) => {
        return payload
    })

    client.handle('disconnect' as BotEvents['disconnect']['handler'], botShutDown)

    client.handle('runTask' as BotEvents['runTask']['handler'], runTaskHandler)

    client.handle('machineInfo', getMachineInfo)

    client.handle('machineHealth', getQuickHealth)

    client.handle('processHealth', () => getProcessStats(process.pid))

    await runAsyncLoop(() => connectionRefresh(client), {
        intervalMs: 1 * 60 * 1000, // ping every 1 minute
        retryDelayMs: 30 * 1000, // retry every 30 seconds on failure
        maxRetries: 10, // after 10 failed attempts, exit loop and let process crash to trigger restart
        onError: (err, attempt) => {
            logger.warn('CONNECTION_REFRESH_FAILED', { meta: { error: err, attempt } })
            process.stderr.write(`Connection refresh failed (attempt ${attempt}): ${err as Error}\n`)
        }
    })

    process.stderr.write('Max connection refresh attempts exceeded. Exiting.\n')
    logger.error('CONNECTION_REFRESH_MAX_RETRIES_EXCEEDED', { meta: { message: 'Max connection refresh attempts exceeded. Exiting.' } })
    process.exit(1)
}
