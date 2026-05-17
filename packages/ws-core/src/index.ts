/**
 * @example
 * ```ts
 * import http from 'node:http'
 * import { generateKeyPairSync } from 'node:crypto'
 * import { FiggoServer, FiggoClient } from 'ws-core'
 *
 * const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
 *   publicKeyEncoding: { type: 'spki', format: 'pem' },
 *   privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
 * })
 *
 * const httpServer = http.createServer((_req, res) => {
 *   res.writeHead(404)
 *   res.end()
 * })
 *
 * const figgo = new FiggoServer({
 *   server: httpServer,
 *   path: '/ws',
 *   getPublicKey: async (botId) => {
 *     if (botId !== 'bot-1') throw new Error('unknown')
 *     return publicKey
 *   }
 * })
 *
 * figgo.handle('task:ping', async () => ({ ok: true }))
 *
 * httpServer.listen(8080, async () => {
 *   const client = new FiggoClient({
 *     url: 'ws://127.0.0.1:8080/ws',
 *     botId: 'bot-1',
 *     privateKey
 *   })
 *   await client.connect()
 *   await client.request('task:ping', { x: 1 })
 *   client.disconnect()
 *   figgo.close()
 *   httpServer.close()
 * })
 * ```
 */

export { FiggoClient, HEARTBEAT_INTERVAL_MS } from './transport/client.js'
export type { FiggoClientOptions } from './transport/client.js'
export { FiggoServer, HEARTBEAT_DEAD_MS } from './transport/server.js'
export type { FiggoServerOptions } from './transport/server.js'

export { getUpgradePathname, matchesUpgradePath } from './http/upgrade-path.js'

export { BotConnectionManager } from './transport/connection-manager.js'

export { signMessage } from './protocol/signer.js'
export { signingDigest } from './protocol/signer.js'
export { verifyMessage } from './protocol/verifier.js'
export { NonceStore } from './protocol/nonce.js'
export { isTimestampValid, TIMESTAMP_SKEW_SECONDS } from './protocol/nonce.js'

export { RequestManager } from './runtime/request-manager.js'
export { MessageRouter } from './runtime/router.js'
export type { MessageHandler } from './runtime/router.js'

export type { WSMessage, UnsignedWSMessage, MessageDirection } from './types/message.js'
export { isWSMessage, SYSTEM_HANDSHAKE, SYSTEM_HEARTBEAT } from './types/message.js'

export type { ConnectionContext } from './types/connection.js'
