import path from 'node:path'
import os from 'node:os'

export function getChromeUserDataDir() {
    const platform = process.platform
    const home = os.homedir()

    if (platform === 'linux') return path.join(home, '.config', 'google-chrome')

    if (platform === 'darwin') return path.join(home, 'Library', 'Application Support', 'Google', 'Chrome')

    if (platform === 'win32') return path.join(process.env.LOCALAPPDATA!, 'Google', 'Chrome', 'User Data')

    throw new Error('Unsupported OS')
}
