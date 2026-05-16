import type { WorkflowGraph, WorkflowGraphNode } from '../../types/workflow.js'
import logger from '../../utils/logger.js'

/**
 * Walks the workflow graph from launchBrowser (or the sole source node) along edges
 * into a single execution list. Parallel branches are not supported yet — first edge wins.
 */
export function linearizeWorkflowGraph(graph: WorkflowGraph): WorkflowGraphNode[] {
    const nodesById = new Map(graph.nodes.map((n) => [n.id, n]))
    const outgoing = new Map<string, string[]>()
    const incomingCount = new Map<string, number>()

    for (const node of graph.nodes) {
        incomingCount.set(node.id, 0)
        outgoing.set(node.id, [])
    }

    for (const edge of graph.edges) {
        outgoing.get(edge.source)?.push(edge.target)
        incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1)
    }

    let startId = graph.nodes.find((n) => n.type === 'browserAction' && n.data.name === 'launchBrowser')?.id

    if (!startId) {
        const roots = graph.nodes.filter((n) => incomingCount.get(n.id) === 0)
        if (roots.length === 1) startId = roots[0]?.id
        else if (roots.length > 1) {
            throw new Error(`Workflow has multiple start nodes (${roots.map((r) => r.id).join(', ')}); add a launchBrowser node`)
        }
    }

    if (!startId) throw new Error('Could not find workflow start node')

    const ordered: WorkflowGraphNode[] = []
    let current: string | undefined = startId
    const visited = new Set<string>()

    while (current) {
        if (visited.has(current)) {
            throw new Error(`Workflow graph cycle detected at node ${current}`)
        }
        visited.add(current)

        const node = nodesById.get(current)
        if (!node) break

        ordered.push(node)

        const nextTargets: string[] = outgoing.get(current) ?? []
        if (nextTargets.length === 0) break

        if (nextTargets.length > 1) {
            logger.warn('WORKFLOW_PARALLEL_BRANCH', {
                meta: { nodeId: current, targets: nextTargets, message: 'Using first edge only' }
            })
        }

        current = nextTargets[0]
    }

    return ordered
}
