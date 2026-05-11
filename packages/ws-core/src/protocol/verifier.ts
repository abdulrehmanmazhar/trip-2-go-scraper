import { createPublicKey, verify } from 'node:crypto'
import type { WSMessage } from '../types/message.js'
import { signingDigest } from './signer.js'

/**
 * Verifies Ed25519 signature over the same digest as {@link signMessage}.
 * publicKey must be SPKI PEM for Ed25519.
 */
export function verifyMessage<T>(publicKeyPem: string, message: WSMessage<T>): boolean {
    let sig: Buffer
    try {
        sig = Buffer.from(message.signature, 'base64')
    } catch {
        return false
    }
    if (sig.length === 0) return false
    const digest = signingDigest(message.payload, message.timestamp, message.nonce)
    const key = createPublicKey(publicKeyPem)
    try {
        return verify(null, digest, key, sig)
    } catch {
        return false
    }
}
