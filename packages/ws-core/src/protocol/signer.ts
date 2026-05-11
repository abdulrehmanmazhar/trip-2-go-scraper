import { createHash, createPrivateKey, sign } from 'node:crypto'
import type { UnsignedWSMessage } from '../types/message.js'

export function signingDigest(payload: unknown, timestamp: number, nonce: string): Buffer {
    const payloadPart = payload === undefined ? '' : JSON.stringify(payload)
    return createHash('sha256').update(payloadPart, 'utf8').update(String(timestamp), 'utf8').update(nonce, 'utf8').digest()
}

/**
 * Ed25519 sign over SHA-256(payload JSON || '' | timestamp | nonce).
 * privateKey must be a PKCS#8 PEM for Ed25519.
 */
export function signMessage<T>(privateKeyPem: string, message: UnsignedWSMessage<T>): string {
    const digest = signingDigest(message.payload, message.timestamp, message.nonce)
    const key = createPrivateKey(privateKeyPem)
    const sig = sign(null, digest, key)
    return sig.toString('base64')
}
