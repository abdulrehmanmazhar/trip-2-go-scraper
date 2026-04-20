import { spawn } from 'child_process'

export const generateCode = () => {
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    spawn(npxCommand, ['playwright', 'codegen', '--target=jsonl', '-o', 'actions.jsonl', '--save-har=network_log.har'], {
        shell: 'cmd.exe',
        stdio: 'inherit'
    })
}
