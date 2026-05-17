import { WebSocketServer, type WebSocket } from 'ws'
import { workflowTestHub } from '../service/workflowTestHub.js'
import logger from '../util/logger.js'
import { WORKFLOW_TEST_WS_PATH } from './paths.js'

export function createWorkflowTestSocket(): WebSocketServer {
    const wss = new WebSocketServer({ noServer: true, path: WORKFLOW_TEST_WS_PATH })

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

export function closeWorkflowTestSocket(wss: WebSocketServer): void {
    wss.clients.forEach((client: WebSocket) => client.close())
    wss.close()
}
