import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkflowRunner } from '../utils/workflowRunner.js'
import logger from '../utils/logger.js'

const botPackageRoot = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const defaultDemoWorkflowPath = () => path.join(botPackageRoot(), 'workflows', 'demo_workflow.json')

export async function handleDemo(workflowPath?: string) {
    const resolved = workflowPath ? path.resolve(workflowPath) : defaultDemoWorkflowPath()

    process.stdout.write(`Workflow file: ${resolved}\n`)

    const runner = new WorkflowRunner()

    try {
        await runner.runFromFile(resolved)
    } catch (err) {
        logger.error('DEMO_WORKFLOW_FAILED', { meta: err as Error })
        throw err
    }
}
