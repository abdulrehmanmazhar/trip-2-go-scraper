import fs from 'fs'
import path from 'path'

export function readDirRecursive(dir: string): string[] {
    let results: string[] = []

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            results = results.concat(readDirRecursive(fullPath))
        } else {
            results.push(fullPath)
        }
    }

    return results
}
