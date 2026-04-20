export const waitForEndpoint = async (url: string, timeout = 15000, interval = 500): Promise<void> => {
    const start = Date.now()

    while (true) {
        try {
            const res = await fetch(url)

            if (res.status !== 404) {
                return
            }
        } catch {
            // ignore errors while server boots
        }

        if (Date.now() - start > timeout) {
            throw new Error(`Timeout waiting for endpoint: ${url}`)
        }

        await new Promise((r) => setTimeout(r, interval))
    }
}
