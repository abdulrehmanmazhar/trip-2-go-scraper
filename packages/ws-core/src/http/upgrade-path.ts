import type { IncomingMessage } from 'node:http'

/** Pathname portion of an HTTP upgrade request URL (without query string). */
export function getUpgradePathname(req: IncomingMessage): string {
    const url = req.url ?? ''
    const index = url.indexOf('?')
    return index !== -1 ? url.slice(0, index) : url
}

export function matchesUpgradePath(req: IncomingMessage, path: string): boolean {
    return getUpgradePathname(req) === path
}
