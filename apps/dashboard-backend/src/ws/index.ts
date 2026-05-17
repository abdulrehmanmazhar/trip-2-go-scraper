import type { Server as HttpServer } from 'node:http'
import type { FiggoServer } from 'ws-core'
import type { WebSocketServer } from 'ws'
import { initBotService } from '../service/botService.js'
import logger from '../util/logger.js'
import { createWorkflowTestSocket } from './workflow-test-socket.js'
import { BOT_WS_PATH, WORKFLOW_TEST_WS_PATH } from './paths.js'
import { figgoRoute, HttpUpgradeRouter, pathRoute } from './upgrade-router.js'

export type WebSocketServices = {
    figgo: FiggoServer
    workflowTest: WebSocketServer
}

/**
 * Registers bot (`/ws`) and workflow-test (`/ws/workflow-test`) WebSocket servers on one HTTP server.
 */
export function attachWebSockets(server: HttpServer): WebSocketServices {
    const figgo = initBotService()
    const workflowTest = createWorkflowTestSocket()

    new HttpUpgradeRouter(server)
        .register(figgoRoute(figgo))
        .register(pathRoute(workflowTest, WORKFLOW_TEST_WS_PATH, 'workflow-test'))
        .install()

    logger.info('WEBSOCKET_ROUTES_READY', {
        meta: { botPath: BOT_WS_PATH, workflowTestPath: WORKFLOW_TEST_WS_PATH }
    })

    return { figgo, workflowTest }
}

export { BOT_WS_PATH, WORKFLOW_TEST_WS_PATH } from './paths.js'
