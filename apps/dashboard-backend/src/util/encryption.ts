import crypto from 'crypto'
import config from '../config/config.js'

const ENCRYPTION_SECRET = config.ENCRYPTION_SECRET

if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET not defined in env')
}

// Derive 32-byte key from secret
const KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest()

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv)

    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])

    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decrypt(encryptedText: string): string {
    const data = Buffer.from(encryptedText, 'base64')

    const iv = data.slice(0, 16)
    const authTag = data.slice(16, 32)
    const encrypted = data.slice(32)

    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

    return decrypted.toString('utf8')
}
