import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, type BrowserContext } from 'playwright'
import { appRoot } from '../../constant/application.js'
import type { RuntimeConfig } from './types.js'

export const resolveUserDataDir = (configured: string, workflowName: string) => {
    if (configured && !configured.includes('/path/to/') && configured !== '/path/to/user-data') {
        return configured
    }
    return path.join(appRoot, 'workflows', workflowName, 'chrome-profile')
}

export class BrowserManager {
    async launch(userDataDir: string, launch: RuntimeConfig['launch']): Promise<BrowserContext> {
        await fs.mkdir(userDataDir, { recursive: true })
        return chromium.launchPersistentContext(userDataDir, launch)
    }

    async launchForWorkflow(config: RuntimeConfig, workflowName: string): Promise<BrowserContext> {
        const recordHar =
            config.launch.recordHar ??
            ({
                path: path.join(appRoot, 'workflows', workflowName, 'network.har'),
                content: 'embed',
                mode: 'minimal'
            } as const)

        return this.launch(config.userDataDir, { ...config.launch, recordHar })
    }

    async close(context: BrowserContext, reason = 'normal'): Promise<void> {
        await context.close({ reason })
    }
}
