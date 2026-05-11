import fs from 'node:fs/promises'
import path from 'node:path'
import { FiggoClient } from 'ws-core'
import { appRoot } from '../constant/application.js'

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

    // 🧠 Task execution handler (server → bot)
    client.handle('task:run', (payload) => {
        process.stdout.write(`⚙️ Running task: ${JSON.stringify(payload)}\n`)

        // simulate execution result
        return {
            success: true,
            output: 'Task executed successfully',
            received: payload
        }
    })

    try {
        await client.connect()

        setInterval(() => {
            client.sendEvent('bot:connected', { botId: config.botId })
            client.request('save:data', { data: 'Hello, world!' }).then((res) => {
                console.log('Save data response:', res)
            })
        }, 1000)

        process.stdout.write('✅ Bot connected to server\n')
    } catch (err) {
        process.stderr.write(`❌ Connection failed: ${(err as Error).message}\n`)
        process.exit(1)
    }

    const shutdown = async () => {
        process.stdout.write('\n🛑 Shutting down bot...\n')

        try {
            await client.request('bot:disconnected', {
                botId: config.botId,
                timestamp: Date.now()
            })
        } catch {}

        client.disconnect()
        process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
}
