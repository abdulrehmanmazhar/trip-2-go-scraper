import type { BotActions } from '../types/types.js'
import type { WorkflowGraph, WorkflowGraphNode } from '../types/workflow.js'

export type WorkflowGraphIndex = {
    nodesById: Map<string, WorkflowGraphNode>
    parents: Map<string, string[]>
    children: Map<string, string[]>
    /** Nodes on paths reachable from launchBrowser */
    reachable: Set<string>
    launchNodeId: string
    /** Topological layers for logging (optional) */
    executionOrder: string[]
}

const needsPageGuid = (name: string) => name !== 'launchBrowser' && name !== 'closeBrowser'

/** Copy pageGuid / frame metadata from an upstream openPage on the same branch. */
export const enrichPlaywrightNodeData = (nodeId: string, index: Pick<WorkflowGraphIndex, 'nodesById' | 'parents'>): Record<string, unknown> => {
    const node = index.nodesById.get(nodeId)
    if (!node) throw new Error(`Unknown node ${nodeId}`)

    const data = { ...node.data }

    if (data.pageGuid) return data

    if (data.name === 'openPage') {
        data.pageGuid = `page@${nodeId}`
        data.pageAlias = data.pageAlias ?? 'page'
        data.framePath = data.framePath ?? []
        data.signals = data.signals ?? []
        return data
    }

    if (data.signals === undefined) data.signals = []

    if (!needsPageGuid(String(data.name))) return data

    for (const parentId of index.parents.get(nodeId) ?? []) {
        const parentData = enrichPlaywrightNodeData(parentId, index)
        if (parentData.pageGuid) {
            data.pageGuid = parentData.pageGuid
            data.pageAlias = parentData.pageAlias ?? 'page'
            data.framePath = parentData.framePath ?? []
            return data
        }
    }

    throw new Error(`Node "${String(data.name)}" (${nodeId}) has no pageGuid and no upstream openPage — connect it to an openPage branch`)
}

export const buildWorkflowGraphIndex = (graph: WorkflowGraph): WorkflowGraphIndex => {
    const nodesById = new Map(graph.nodes.map((n) => [n.id, n]))
    const parents = new Map<string, string[]>()
    const children = new Map<string, string[]>()

    for (const node of graph.nodes) {
        parents.set(node.id, [])
        children.set(node.id, [])
    }

    for (const edge of graph.edges) {
        if (!nodesById.has(edge.source) || !nodesById.has(edge.target)) continue

        children.get(edge.source)?.push(edge.target)
        parents.get(edge.target)?.push(edge.source)
    }

    const launchNode = graph.nodes.find((n) => n.type === 'browserAction' && n.data.name === 'launchBrowser')
    if (!launchNode) throw new Error('Workflow must contain a launchBrowser node')

    const reachable = new Set<string>()
    const queue = [launchNode.id]

    while (queue.length > 0) {
        const id = queue.shift()!
        if (reachable.has(id)) continue
        reachable.add(id)

        for (const childId of children.get(id) ?? []) {
            queue.push(childId)
        }
    }

    const executionOrder = topologicalSort(reachable, parents, children)

    return {
        nodesById,
        parents,
        children,
        reachable,
        launchNodeId: launchNode.id,
        executionOrder
    }
}

/** Kahn sort over reachable nodes — used for step index ordering in feedback only. */
const topologicalSort = (reachable: Set<string>, parents: Map<string, string[]>, children: Map<string, string[]>) => {
    const inDegree = new Map<string, number>()
    for (const id of reachable) {
        inDegree.set(id, (parents.get(id) ?? []).filter((p) => reachable.has(p)).length)
    }

    const ready = [...reachable].filter((id) => inDegree.get(id) === 0)
    const order: string[] = []

    while (ready.length > 0) {
        const id = ready.shift()!
        order.push(id)

        for (const childId of children.get(id) ?? []) {
            if (!reachable.has(childId)) continue
            const next = (inDegree.get(childId) ?? 1) - 1
            inDegree.set(childId, next)
            if (next === 0) ready.push(childId)
        }
    }

    if (order.length !== reachable.size) {
        throw new Error('Workflow graph contains a cycle (or unreachable merge) in the reachable subgraph')
    }

    return order
}

export const getPlaywrightAction = (nodeId: string, index: WorkflowGraphIndex): BotActions => {
    return enrichPlaywrightNodeData(nodeId, index) as BotActions
}
