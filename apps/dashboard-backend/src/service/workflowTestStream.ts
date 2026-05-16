import type { Server } from 'node:http'
import { WebSocketServer, type WebSocket } from 'ws'
import { workflowTestHub } from './workflowTestHub.js'
import logger from '../util/logger.js'

export const WORKFLOW_TEST_WS_PATH = '/ws/workflow-test'

export function attachWorkflowTestStream(server: Server): WebSocketServer {
    const wss = new WebSocketServer({ server, path: WORKFLOW_TEST_WS_PATH })

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const testId = url.searchParams.get('testId')

        if (!testId) {
            ws.close(4000, 'testId required')
            return
        }

        const run = workflowTestHub.subscribe(testId, ws)
        if (!run) {
            ws.close(4004, 'test not found')
            return
        }

        logger.info('WORKFLOW_TEST_WS_CONNECTED', { meta: { testId, subscribers: run.subscribers.size } })

        ws.on('close', () => {
            workflowTestHub.unsubscribe(testId, ws)
            logger.info('WORKFLOW_TEST_WS_DISCONNECTED', { meta: { testId } })
        })

        ws.on('error', () => {
            workflowTestHub.unsubscribe(testId, ws)
        })
    })

    return wss
}

export function closeWorkflowTestStream(wss: WebSocketServer): void {
    wss.clients.forEach((client: WebSocket) => client.close())
    wss.close()
}
