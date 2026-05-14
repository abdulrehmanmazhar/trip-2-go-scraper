type Pending = {
    resolve: (value: unknown) => void
    reject: (reason: Error) => void
    timeout: ReturnType<typeof setTimeout>
}

export class RequestManager {
    private readonly pending = new Map<string, Pending>()
    private readonly defaultTimeoutMs: number

    constructor(defaultTimeoutMs = 600_000) {
        this.defaultTimeoutMs = defaultTimeoutMs
    }

    create(id: string): Promise<unknown> {
        return new Promise<unknown>((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(id)
                reject(new Error('Request timed out'))
            }, this.defaultTimeoutMs)
            this.pending.set(id, { resolve, reject, timeout })
        })
    }

    resolve(id: string, payload: unknown): void {
        const p = this.pending.get(id)
        if (!p) return
        clearTimeout(p.timeout)
        this.pending.delete(id)
        p.resolve(payload)
    }

    reject(id: string, error: Error): void {
        const p = this.pending.get(id)
        if (!p) return
        clearTimeout(p.timeout)
        this.pending.delete(id)
        p.reject(error)
    }

    clear(): void {
        for (const [, p] of this.pending) {
            clearTimeout(p.timeout)
            p.reject(new Error('Connection closed'))
        }
        this.pending.clear()
    }
}
