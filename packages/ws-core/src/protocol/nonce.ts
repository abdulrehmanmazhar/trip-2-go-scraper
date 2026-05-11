/** Allowed clock skew when validating message timestamps (±seconds). */
export const TIMESTAMP_SKEW_SECONDS = 30

export function isTimestampValid(timestamp: number, nowMs: number): boolean {
    const skewMs = TIMESTAMP_SKEW_SECONDS * 1000
    return timestamp >= nowMs - skewMs && timestamp <= nowMs + skewMs
}

/**
 * Tracks nonces seen on a single WebSocket connection to reject replay within a sliding window.
 */
export class NonceStore {
    private readonly seen = new Map<string, number>()
    private readonly ttlMs: number

    constructor(ttlMs = 90_000) {
        this.ttlMs = ttlMs
    }

    /**
     * @returns false if nonce was already used in the retention window
     */
    tryUse(nonce: string, nowMs: number): boolean {
        this.prune(nowMs)
        if (this.seen.has(nonce)) {
            return false
        }
        this.seen.set(nonce, nowMs)
        return true
    }

    private prune(nowMs: number): void {
        const cutoff = nowMs - this.ttlMs
        for (const [nonce, t] of this.seen) {
            if (t < cutoff) {
                this.seen.delete(nonce)
            }
        }
    }
}
