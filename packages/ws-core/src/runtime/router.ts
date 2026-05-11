export type MessageHandler = (payload: unknown) => unknown | Promise<unknown>

export class MessageRouter {
    private readonly handlers = new Map<string, MessageHandler>()

    handle(type: string, handler: MessageHandler): void {
        this.handlers.set(type, handler)
    }

    has(type: string): boolean {
        return this.handlers.has(type)
    }

    async dispatch(type: string, payload: unknown): Promise<{ handled: true; result: unknown } | { handled: false }> {
        const fn = this.handlers.get(type)
        if (!fn) {
            return { handled: false }
        }
        const result = await fn(payload)
        return { handled: true, result }
    }
}
