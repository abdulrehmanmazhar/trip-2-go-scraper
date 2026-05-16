import type { BrowserContext, Request, Response } from 'playwright'
import type { JSONSchemaType } from 'ajv'
import { matchSchema } from './matchSchema.js'
import type { PlaywrightWorker } from './playwright.js'
import type { RuntimeConfig } from './types.js'

export class NetworkInterceptorWorker {
    browser: BrowserContext
    rules: RuntimeConfig['networkInterception']
    requests: unknown[]
    responses: unknown[]

    constructor(context: {
        playwright: PlaywrightWorker
        config: RuntimeConfig
        requests: unknown[]
        responses: unknown[]
        environment: Record<string, unknown>
    }) {
        this.browser = context.playwright.browser
        this.rules = context.config.networkInterception
        this.requests = context.requests
        this.responses = context.responses
    }

    satisfiesCriteria(params: RuntimeConfig['networkInterception'][0]) {
        if (!this.rules.length) return false

        for (const rule of this.rules) {
            if (!params.url.includes(rule.url)) continue
            if (params.action !== rule.action) continue
            if (params.type !== rule.type) continue
            if (!matchSchema(params.body, rule.body as JSONSchemaType<unknown>)) continue
            return true
        }

        return false
    }

    interceptSocketRequest(payload: string | Buffer<ArrayBufferLike>, url: string) {
        const data = {
            type: 'ws',
            url,
            payload,
            timestamp: Date.now()
        }

        if (!this.satisfiesCriteria({ url: data.url, type: 'ws', action: 'request', body: data.payload })) return

        this.requests.push(data)
    }

    interceptSocketResponse(payload: string | Buffer<ArrayBufferLike>, url: string) {
        const data = {
            type: 'ws',
            url,
            payload,
            timestamp: Date.now()
        }

        if (!this.satisfiesCriteria({ url: data.url, type: 'ws', action: 'response', body: data.payload })) return

        this.responses.push(data)
    }

    interceptHttpRequest(request: Request) {
        const data = {
            type: 'http',
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            resourceType: request.resourceType(),
            timestamp: Date.now()
        }

        if (!this.satisfiesCriteria({ url: data.url, type: 'http', action: 'request', body: data.postData })) return

        this.requests.push(data)
    }

    async interceptHttpResponse(response: Response) {
        const req = response.request()

        let parsedBody: unknown = null

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
            type: 'http',
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

        if (!this.satisfiesCriteria({ url: data.url, type: 'http', action: 'response', body: data.body })) return

        this.responses.push(data)
    }

    startNetworkRecording() {
        this.browser.on('page', (page) => {
            const url = page.url()
            page.on('websocket', (ws) => {
                ws.on('framereceived', (frame) => {
                    this.interceptSocketResponse(frame.payload, url)
                })

                ws.on('framesent', (frame) => {
                    this.interceptSocketRequest(frame.payload, url)
                })
            })
        })

        this.browser.on('response', (arg) => this.interceptHttpResponse(arg))
        this.browser.on('request', (arg) => this.interceptHttpRequest(arg))
    }
}
