import fs from 'node:fs/promises'
import path from 'node:path'
import WebSocket from 'ws'
import { appRoot } from '../constant/application.js'

export async function handleStart() {
    const configPath = path.join(appRoot, 'bot.json')

    // console.log('🚀 Starting bot...')

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

    const ws = new WebSocket(wsUrl)

    ws.on('open', () => {
        // console.log('✅ Connected to server')

        ws.send(
            JSON.stringify({
                type: 'hello',
                botId: config.botId
            })
        )
    })

    ws.on('message', (data) => {
        // const msg = data.toString()
    })

    ws.on('close', () => {
        // console.log('❌ Disconnected from server')
    })

    ws.on('error', (err) => {
        // console.error('WebSocket error:', err)
    })
}
