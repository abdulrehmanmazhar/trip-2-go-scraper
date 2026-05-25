import crypto from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'
import { apiVersion, appRoot, centralServerUrl, verificationLink } from '../constant/application.js'
import { checkFile } from '../utils/path.js'
import logger from '../utils/logger.js'

export async function handleLogin() {
    const configPath = path.join(appRoot, 'bot.json')

    const exist = await checkFile(configPath)

    if (exist) {
        throw new Error('Bot already logged in. Delete bot.json to re-login.')
    }

    // 🔐 Generate keypair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')

    const pub = publicKey.export({ type: 'spki', format: 'pem' }).toString()
    const priv = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

    // 📡 Register bot
    const res = await fetch(`${centralServerUrl}${apiVersion}/register-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey: pub,
            hostname: os.hostname(),
            platform: os.platform()
        })
    })

    if (!res.ok) {
        throw new Error('Failed to register bot')
    }

    const data = (await res.json()) as {
        data: {
            botId: string
            otp: string
            resolveUrl: string
        }
    }

    process.stdout.write(`\n🔑 OTP: ${data.data.otp}\n`)
    process.stdout.write(`🌐 Open in browser: ${verificationLink}/${data.data.botId}\n`)

    // 💾 Save config early (important)
    await writeFile(
        configPath,
        JSON.stringify(
            {
                botId: data.data.botId,
                privateKey: priv,
                serverUrl: centralServerUrl
            },
            null,
            2
        )
    )

    // ⏱️ Polling config
    const POLL_INTERVAL = 3000
    const MAX_WAIT_TIME = 2 * 60 * 1000 // 2 minutes

    let elapsed = 0
    let stopped = false

    // 🛑 Cleanup handler
    const cleanup = () => {
        stopped = true
        logger.warn('LOGIN_CANCELLED', { meta: { message: 'Login cancelled' } })
        process.exit(1)
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    logger.info('LOGIN_WAITING', { meta: { message: 'Waiting for login confirmation' } })

    while (!stopped && elapsed < MAX_WAIT_TIME) {
        const checkRes = await fetch(`${centralServerUrl}${apiVersion}${data.data.resolveUrl}/${data.data.botId}`)

        const res = (await checkRes.json()) as { data: { status: 'pending' | 'approved' | 'rejected' } }

        if (checkRes.status === 200 && res.data.status === 'approved') {
            logger.info('LOGIN_SUCCESS', { meta: { message: 'Login successful. Run: figgo-bot start' } })
            process.exit(0)
        } else if (checkRes.status === 200 && res.data.status === 'rejected') {
            logger.error('LOGIN_REJECTED', { meta: { message: 'Login rejected by admin' } })
            process.exit(1)
        }

        await new Promise((r) => setTimeout(r, POLL_INTERVAL))
        elapsed += POLL_INTERVAL
    }

    logger.error('LOGIN_TIMEOUT', { meta: { message: 'Login timeout. Please try again.' } })
    process.exit(1)
}
