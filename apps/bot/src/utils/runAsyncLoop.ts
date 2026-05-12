type LoopOptions = {
    intervalMs: number // delay between successful runs
    retryDelayMs?: number // delay between retries (default = intervalMs)
    maxRetries: number // how many retries after error before exit
    onError?: (err: unknown, attempt: number) => void
    signal?: AbortSignal // optional cancellation
}

export async function runAsyncLoop(fn: () => Promise<void>, options: LoopOptions): Promise<void> {
    const { intervalMs, retryDelayMs = intervalMs, maxRetries, onError, signal } = options

    let retries = 0

    const sleep = (ms: number) =>
        new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, ms)

            if (signal) {
                signal.addEventListener(
                    'abort',
                    () => {
                        clearTimeout(timeout)
                        reject(new Error('Aborted'))
                    },
                    { once: true }
                )
            }
        })

    while (true) {
        if (signal?.aborted) {
            throw new Error('Loop aborted')
        }

        try {
            await fn()

            // reset retries on success
            retries = 0

            await sleep(intervalMs)
        } catch (err) {
            retries++
            onError?.(err, retries)

            if (retries > maxRetries) {
                // exit loop completely
                throw err
            }

            await sleep(retryDelayMs)
        }
    }
}
