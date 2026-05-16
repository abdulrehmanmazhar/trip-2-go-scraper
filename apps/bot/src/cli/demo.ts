import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BotOrchestrator } from '../core/index.js'
import logger from '../utils/logger.js'

const botPackageRoot = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const defaultDemoWorkflowPath = () => path.join(botPackageRoot(), 'workflows', 'demo_workflow.json')

export async function handleDemo(workflowPath?: string) {
    const resolved = workflowPath ? path.resolve(workflowPath) : defaultDemoWorkflowPath()

    logger.info('DEMO_WORKFLOW_FILE', { meta: { path: resolved } })

    const orchestrator = new BotOrchestrator()

    try {
        await orchestrator.runWorkflowFromFile(resolved)
    } catch (err) {
        logger.error('DEMO_WORKFLOW_FAILED', { meta: err as Error })
        throw err
    }
}
