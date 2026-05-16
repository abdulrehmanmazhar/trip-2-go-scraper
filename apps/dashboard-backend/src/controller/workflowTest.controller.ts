import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import WorkflowModel from '../model/workflow.model.js'
import { BotModel } from '../model/bot.model.js'
import { botService } from '../service/botService.js'
import { getWorkflowDefinitionBuffer } from '../service/storageService.js'
import { workflowTestHub } from '../service/workflowTestHub.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import config from '../config/config.js'
import { WORKFLOW_TEST_WS_PATH } from '../service/workflowTestStream.js'

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function toWorkflowFile(
    workflowId: string,
    name: string,
    description: string | undefined,
    definitionRaw: unknown
): { id: string; name: string; description?: string; graph: { nodes: unknown[]; edges: unknown[] } } {
    if (isRecord(definitionRaw) && Array.isArray(definitionRaw.nodes) && Array.isArray(definitionRaw.edges)) {
        const base = {
            id: workflowId,
            name,
            graph: { nodes: definitionRaw.nodes, edges: definitionRaw.edges }
        }
        return description ? { ...base, description } : base
    }

    if (isRecord(definitionRaw) && isRecord(definitionRaw.graph)) {
        const graph = definitionRaw.graph
        if (Array.isArray(graph.nodes) && Array.isArray(graph.edges)) {
            const base = {
                id: workflowId,
                name,
                graph: { nodes: graph.nodes, edges: graph.edges }
            }
            return description ? { ...base, description } : base
        }
    }

    throw new Error('Workflow definition must contain nodes and edges (graph or top-level)')
}

async function loadWorkflowFile(workflowId: string) {
    const doc = await WorkflowModel.findById(workflowId).lean()
    if (!doc) {
        throw new Error('Workflow not found')
    }

    const buf = await getWorkflowDefinitionBuffer(doc.objectKey)
    const definitionRaw = JSON.parse(buf.toString('utf8')) as unknown

    return {
        doc,
        workflow: toWorkflowFile(String(doc._id), doc.name, doc.description, definitionRaw)
    }
}

export default {
    async startTest(req: Request, res: Response, next: NextFunction) {
        const body = req.body as { botId?: string; workflowId?: string }
        const botId = typeof body.botId === 'string' ? body.botId.trim() : ''
        const workflowId = typeof body.workflowId === 'string' ? body.workflowId.trim() : ''

        if (!botId) {
            return httpError(next, new Error('botId is required'), req, 400)
        }
        if (!workflowId || !mongoose.Types.ObjectId.isValid(workflowId)) {
            return httpError(next, new Error('Valid workflowId is required'), req, 400)
        }

        const bot = await BotModel.findOne({ botId }).lean()
        if (!bot || bot.status !== 'approved' || bot.isRevoked || !bot.isOtpVerified) {
            return httpError(next, new Error('Bot is not available for testing (must be approved and connected)'), req, 400)
        }

        let workflowPayload: ReturnType<typeof toWorkflowFile>
        let workflowName: string
        try {
            const loaded = await loadWorkflowFile(workflowId)
            workflowPayload = loaded.workflow
            workflowName = loaded.doc.name
        } catch (e) {
            return httpError(next, e instanceof Error ? e : new Error('Failed to load workflow'), req, 400)
        }

        const testId = randomUUID()
        const sessionId = `test-${testId}`

        const run = workflowTestHub.create({
            botId,
            workflowId,
            workflowName,
            sessionId
        })

        const serverUrl = config.SERVER_URL ?? `http://localhost:${config.PORT ?? '5000'}`
        const wsBase = serverUrl.replace(/^http/, 'ws')
        const wsUrl = `${wsBase}${WORKFLOW_TEST_WS_PATH}?testId=${encodeURIComponent(testId)}`

        void botService
            .request(botId, 'runTask', {
                sessionId,
                workflow: workflowPayload,
                taskId: testId,
                metadata: { testId, workflowId, source: 'dashboard' },
                waitForCompletion: false
            })
            .then((result) => {
                workflowTestHub.markAccepted(testId, result)
            })
            .catch((err: Error) => {
                workflowTestHub.markFailed(testId, err.message || 'Failed to dispatch runTask to bot')
            })

        return httpResponse(req, res, 202, responseMessage.SUCCESS, {
            testId,
            sessionId,
            botId,
            workflowId,
            workflowName,
            status: run.status,
            wsUrl
        })
    },

    async getTest(req: Request, res: Response, next: NextFunction) {
        const testId = typeof req.params.testId === 'string' ? req.params.testId : ''
        if (!testId) {
            return httpError(next, new Error('testId is required'), req, 400)
        }

        const run = workflowTestHub.get(testId)
        if (!run) {
            return httpError(next, new Error('Test run not found'), req, 404)
        }

        const serverUrl = config.SERVER_URL ?? `http://localhost:${config.PORT ?? '5000'}`
        const wsBase = serverUrl.replace(/^http/, 'ws')
        const wsUrl = `${wsBase}${WORKFLOW_TEST_WS_PATH}?testId=${encodeURIComponent(testId)}`

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            testId: run.testId,
            sessionId: run.sessionId,
            botId: run.botId,
            workflowId: run.workflowId,
            workflowName: run.workflowName,
            status: run.status,
            startedAt: run.startedAt,
            endedAt: run.endedAt,
            lineCount: run.lines.length,
            wsUrl
        })
    },

    async listActive(req: Request, res: Response, _next: NextFunction) {
        const active = workflowTestHub.listActive().map((run) => ({
            testId: run.testId,
            sessionId: run.sessionId,
            botId: run.botId,
            workflowId: run.workflowId,
            workflowName: run.workflowName,
            status: run.status,
            startedAt: run.startedAt
        }))
        return httpResponse(req, res, 200, responseMessage.SUCCESS, active)
    }
}
