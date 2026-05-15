import type { WorkflowGraph } from '../types/workflow.js'
import { buildWorkflowGraphIndex } from './buildWorkflowGraph.js'
import logger from './logger.js'

export type GraphRunCallbacks = {
    onStepStart: (nodeId: string, stepIndex: number) => void
    onStepComplete: (nodeId: string, stepIndex: number, durationMs: number) => void
    onStepFailed: (nodeId: string, stepIndex: number, error: string, durationMs: number) => void
    runNode: (nodeId: string, stepIndex: number) => Promise<void>
}

/**
 * Parallel DAG executor: a node runs when every parent has finished.
 * Sibling nodes (same parent) run concurrently via Promise.all.
 */
export const executeWorkflowGraph = async (graph: WorkflowGraph, callbacks: GraphRunCallbacks) => {
    const index = buildWorkflowGraphIndex(graph)
    const { reachable, parents, launchNodeId } = index

    const completed = new Set<string>()
    const inFlight = new Set<string>()
    const stepIndexByNode = new Map<string, number>()
    index.executionOrder.forEach((id, i) => stepIndexByNode.set(id, i))

    let launchCompleted = false

    const getReady = (): string[] => {
        const ready: string[] = []

        for (const nodeId of reachable) {
            if (completed.has(nodeId) || inFlight.has(nodeId)) continue

            const preds = (parents.get(nodeId) ?? []).filter((p) => reachable.has(p))
            if (!preds.every((p) => completed.has(p))) continue

            // launchBrowser must finish before anything else runs
            if (nodeId !== launchNodeId && !launchCompleted) continue

            ready.push(nodeId)
        }

        return ready
    }

    const runOne = async (nodeId: string) => {
        const stepIndex = stepIndexByNode.get(nodeId) ?? completed.size
        inFlight.add(nodeId)
        callbacks.onStepStart(nodeId, stepIndex)
        const started = Date.now()

        try {
            await callbacks.runNode(nodeId, stepIndex)
            completed.add(nodeId)
            if (nodeId === launchNodeId) launchCompleted = true

            callbacks.onStepComplete(nodeId, stepIndex, Date.now() - started)
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err)
            callbacks.onStepFailed(nodeId, stepIndex, error, Date.now() - started)
            throw err
        } finally {
            inFlight.delete(nodeId)
        }
    }

    while (completed.size < reachable.size) {
        const ready = getReady()

        if (ready.length === 0) {
            if (inFlight.size > 0) {
                await new Promise((r) => setTimeout(r, 10))
                continue
            }
            const pending = [...reachable].filter((id) => !completed.has(id))
            throw new Error(
                `Workflow deadlock: ${pending.length} node(s) never became ready (${pending.slice(0, 3).join(', ')}…). Check edges and join nodes.`
            )
        }

        if (ready.length > 1) {
            logger.info('WORKFLOW_PARALLEL_FORK', { meta: { nodes: ready.map((id) => index.nodesById.get(id)?.data.name) } })
        }

        await Promise.all(ready.map((nodeId) => runOne(nodeId)))
    }

    return index
}
