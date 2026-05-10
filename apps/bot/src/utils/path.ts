import fs from 'node:fs/promises'

export async function checkFile(path: string) {
    try {
        await fs.access(path, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}
