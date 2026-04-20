import net from 'node:net'

export const waitForPort = (port: number, host = '127.0.0.1', timeout = 15000) =>
    new Promise<void>((resolve, reject) => {
        const start = Date.now()

        const check = () => {
            const socket = new net.Socket()

            socket.setTimeout(2000)

            socket.once('connect', () => {
                socket.destroy()
                resolve()
            })

            socket.once('timeout', () => {
                socket.destroy()
                retry()
            })

            socket.once('error', () => {
                socket.destroy()
                retry()
            })

            socket.connect(port, host)
        }

        const retry = () => {
            if (Date.now() - start > timeout) {
                reject(new Error(`Timeout waiting for port ${port}`))
                return
            }

            setTimeout(check, 500)
        }

        check()
    })
