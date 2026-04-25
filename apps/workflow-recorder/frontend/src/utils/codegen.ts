import { checkPathExists } from './appPaths'
import { platform } from './platform'

export const runCodegen = async (id: string) => {
    const tempPath = await platform.os.getPath('temp')

    const targetFolder = `${tempPath}/${id}`

    if (!(await checkPathExists(targetFolder))) {
        await platform.filesystem.createDirectory(targetFolder)
    }

    const playwrightPath = await platform.filesystem.getAbsolutePath(`${window.NL_PATH}/playwright/cli.js`)
    const nodePath = await platform.filesystem.getAbsolutePath(`${window.NL_PATH}/node/node.exe`)

    console.log({ playwrightPath, nodePath })

    const wrapPath = (path: string) => `"${path}"`

    const process = await platform.os.spawnProcess(
        `${wrapPath(nodePath)} ${wrapPath(playwrightPath)} codegen --target=jsonl -o actions.jsonl --channel=chrome --save-har=network_log.har`,
        {
            cwd: targetFolder
        }
    )

    return process
}

export const killCodegen = async (pid: number) => {
    let cmd

    if (window.NL_OS === 'Windows') {
        // cmd = `taskkill /PID ${pid} /T /F`
        cmd = `taskkill /PID ${pid} /T`
    } else {
        cmd = `kill -9 -${pid}`
    }

    console.log({ os: window.NL_OS, cmd })
    await platform.os.execCommand(cmd)
}
