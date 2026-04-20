import { spawn } from 'node:child_process'
import path from 'node:path'
import { findChromeExecutable, getChromeUserDataDir } from 'shared-utils'

export const spawnMCP = () => {
    const chromePath = findChromeExecutable()
    const profilePath = path.join(getChromeUserDataDir(), 'mcp')

    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'

    const mcpServer = spawn(
        npxCommand,
        [
            '-y',
            '@playwright/mcp@latest',
            '--port',
            '8931',
            '--browser',
            'chrome',
            '--executable-path',
            `"${chromePath}"`,
            '--user-data-dir',
            `"${profilePath}"`
        ],
        {
            shell: 'cmd.exe',
            stdio: 'inherit'
        }
    )

    // const mcpServer = exec(
    //     `npx -y @playwright/mcp@latest --port 8931 --browser chrome --executable-path "${chromePath}" --user-data-dir "${profilePath}"`,
    //     (err, stdout, stderr) => {
    //         if (err) {
    //             console.error(err)
    //             return
    //         }

    //         console.log(stdout)
    //         console.error(stderr)
    //     }
    // )

    // return new Promise((resolve, reject) => {
    //     mcpServer.on('spawn', () => {
    //         resolve(mcpServer)
    //         console.log('MCP Server process started.')
    //     })
    //     mcpServer.on('error', (err) => {
    //         reject(err)
    //     })
    // })

    return mcpServer
}
