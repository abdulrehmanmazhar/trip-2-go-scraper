import { getChromeUserDataDir } from 'shared-utils'

try {
    const dir = getChromeUserDataDir()
    process.stdout.write(`${dir}\n`)
} catch {
    process.stdout.write('\n')
}
