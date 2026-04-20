// @ts-nocheck

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import os from 'node:os'
import { findChromeExecutable, getChromeUserDataDir } from 'shared-utils'

const OUTPUT_DIR = path.resolve(os.homedir(), 'Desktop', 'Trip2go_Dump', 'network_dump')
const HAR_PATH = path.resolve(os.homedir(), 'Desktop', 'Trip2go_Dump', 'network.har')

fs.mkdirSync(OUTPUT_DIR, { recursive: true })

function hash(input) {
    return crypto.createHash('sha1').update(input).digest('hex')
}

const chromePath = findChromeExecutable()

const realProfile = getChromeUserDataDir()
const automationProfile = path.join(os.tmpdir(), 'pw-profile')

if (!fs.existsSync(automationProfile)) {
    fs.cpSync(realProfile, automationProfile, { recursive: true })
}

const recorder = async () => {
    console.log('🚀 Launching Chrome with profile:', automationProfile)

    const context = await chromium.launchPersistentContext(automationProfile, {
        executablePath: chromePath,
        headless: false,
        timeout: 30_000,
        args: ['--disable-session-crashed-bubble', '--disable-restore-session-state', '--no-first-run', '--no-default-browser-check']
    })

    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })

    console.log('✅ Context launched')

    /* -------------------- GLOBAL REQUESTS -------------------- */

    context.on('request', (request) => {
        const data = {
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            resourceType: request.resourceType(),
            timestamp: Date.now()
        }

        const id = hash(data.url + data.timestamp)
        fs.writeFileSync(path.join(OUTPUT_DIR, `${id}_request.json`), JSON.stringify(data, null, 2))
    })

    /* -------------------- GLOBAL RESPONSES -------------------- */

    context.on('response', async (response) => {
        const req = response.request()

        let parsedBody = null

        try {
            const body = await response.body()
            const contentType = response.headers()['content-type'] || ''

            if (contentType.includes('application/json')) {
                parsedBody = JSON.parse(body.toString('utf-8'))
            } else if (contentType.startsWith('text/')) {
                parsedBody = body.toString('utf-8')
            } else {
                parsedBody = body.toString('base64')
            }
        } catch {
            parsedBody = null
        }

        const data = {
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers(),
            request: {
                method: req.method(),
                headers: req.headers()
            },
            body: parsedBody,
            timestamp: Date.now()
        }

        const id = hash(data.url + data.timestamp)
        fs.writeFileSync(path.join(OUTPUT_DIR, `${id}_response.json`), JSON.stringify(data, null, 2))
    })

    /* -------------------- NEW TABS / POPUPS -------------------- */

    context.on('page', (page) => {
        console.log('🆕 New tab detected:', page.url())

        page.on('websocket', (ws) => {
            ws.on('framereceived', (frame) => {
                console.log('WS IN:', frame.payload)
            })

            ws.on('framesent', (frame) => {
                console.log('WS OUT:', frame.payload)
            })
        })
    })

    /* -------------------- START -------------------- */

    const page = await context.newPage()

    console.log('📡 Recording ALL network traffic')
    console.log('📂 Dumps:', OUTPUT_DIR)
    console.log('🧠 HAR:', HAR_PATH)
    console.log('⏳ Press Ctrl+C to stop')
}

await recorder()
