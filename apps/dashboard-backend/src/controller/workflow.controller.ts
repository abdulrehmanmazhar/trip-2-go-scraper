import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import CountryModel from '../model/country.model.js'
import WorkflowModel from '../model/workflow.model.js'
import httpError from '../util/httpError.js'
import httpResponse from '../util/httpResponse.js'
import responseMessage from '../constant/responseMessage.js'
import { getWorkflowDefinitionBuffer, putWorkflowDefinition, removeWorkflowDefinition } from '../service/storageService.js'

/** Multer attaches `file` for multipart routes. */
type RequestWithFile = Request & { file?: Express.Multer.File }

const WORKFLOW_BUNDLE_VERSION = 1 as const
const MAX_DEFINITION_BYTES = 10 * 1024 * 1024

type CountryLean = { _id: mongoose.Types.ObjectId; name: string; abbr: string; icon: string }

type WorkflowBundle = {
    version: typeof WORKFLOW_BUNDLE_VERSION
    name: string
    description: string
    thumbnail?: string
    applicationCountry: string
    destinationCountry: string
    definition: unknown
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function assertObjectId(id: string, label: string, next: NextFunction, req: Request): boolean {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        httpError(next, new Error(`Invalid ${label}`), req, 400)
        return false
    }
    return true
}

function parseJsonBuffer(buf: Buffer, next: NextFunction, req: Request): unknown | null {
    if (buf.length > MAX_DEFINITION_BYTES) {
        httpError(next, new Error('Workflow file is too large'), req, 413)
        return null
    }
    try {
        return JSON.parse(buf.toString('utf8')) as unknown
    } catch {
        httpError(next, new Error('Invalid JSON in workflow file'), req, 400)
        return null
    }
}

function parseWorkflowBundle(raw: unknown, next: NextFunction, req: Request): WorkflowBundle | null {
    if (!isRecord(raw)) {
        httpError(next, new Error('Workflow file must be a JSON object'), req, 400)
        return null
    }
    const version = raw.version
    if (version !== WORKFLOW_BUNDLE_VERSION) {
        httpError(next, new Error(`Unsupported workflow version (expected ${WORKFLOW_BUNDLE_VERSION})`), req, 400)
        return null
    }
    const name = raw.name
    const applicationCountry = raw.applicationCountry
    const destinationCountry = raw.destinationCountry
    if (typeof name !== 'string' || !name.trim()) {
        httpError(next, new Error('Workflow file must include a non-empty name'), req, 400)
        return null
    }
    if (typeof applicationCountry !== 'string' || typeof destinationCountry !== 'string') {
        httpError(next, new Error('Workflow file must include applicationCountry and destinationCountry as id strings'), req, 400)
        return null
    }
    if (!mongoose.Types.ObjectId.isValid(applicationCountry) || !mongoose.Types.ObjectId.isValid(destinationCountry)) {
        httpError(next, new Error('Invalid country id in workflow file'), req, 400)
        return null
    }
    const description = typeof raw.description === 'string' ? raw.description : ''
    const thumbRaw = typeof raw.thumbnail === 'string' ? raw.thumbnail.trim() : ''
    if (!('definition' in raw)) {
        httpError(next, new Error('Workflow file must include a definition field'), req, 400)
        return null
    }
    const base: WorkflowBundle = {
        version: WORKFLOW_BUNDLE_VERSION,
        name: name.trim(),
        description,
        applicationCountry,
        destinationCountry,
        definition: raw.definition
    }
    return thumbRaw ? { ...base, thumbnail: thumbRaw } : base
}

function serializeCountry(c: CountryLean) {
    return {
        _id: String(c._id),
        name: c.name,
        abbr: c.abbr,
        icon: c.icon
    }
}

function serializeWorkflow(doc: {
    _id: mongoose.Types.ObjectId
    name: string
    description: string
    thumbnail?: string
    createdAt?: Date
    applicationCountry: CountryLean | mongoose.Types.ObjectId
    destinationCountry: CountryLean | mongoose.Types.ObjectId
}) {
    const app = doc.applicationCountry as CountryLean
    const dest = doc.destinationCountry as CountryLean
    const row = {
        id: String(doc._id),
        name: doc.name,
        description: doc.description,
        createdAt: doc.createdAt ? doc.createdAt.toISOString().slice(0, 10) : '',
        applicationCountry: serializeCountry(app),
        destinationCountry: serializeCountry(dest)
    }
    return doc.thumbnail ? { ...row, thumbnail: doc.thumbnail } : row
}

type WorkflowListLean = {
    _id: mongoose.Types.ObjectId
    name: string
    description: string
    thumbnail?: string
    createdAt?: Date
    applicationCountry: CountryLean
    destinationCountry: CountryLean
}

export default {
    async listCountries(req: Request, res: Response, _next: NextFunction) {
        const rows = await CountryModel.find().sort({ name: 1 }).lean<CountryLean[]>()
        const data = rows.map(serializeCountry)
        return httpResponse(req, res, 200, responseMessage.SUCCESS, data)
    },

    async listWorkflows(req: Request, res: Response, _next: NextFunction) {
        const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '9'), 10) || 9))
        const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''

        const filter: Record<string, unknown> = {}
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
            filter.$or = [{ name: rx }, { description: rx }]
        }

        const [total, docs] = await Promise.all([
            WorkflowModel.countDocuments(filter),
            WorkflowModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate<{ applicationCountry: CountryLean; destinationCountry: CountryLean }>(
                    'applicationCountry destinationCountry',
                    'name abbr icon'
                )
                .lean()
        ])

        const items = docs.map((d) => serializeWorkflow(d as WorkflowListLean))

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        })
    },

    async createWorkflow(req: Request, res: Response, next: NextFunction) {
        const file = (req as RequestWithFile).file
        if (!file?.buffer) {
            return httpError(next, new Error('Workflow JSON file is required'), req, 400)
        }

        const { name, description, thumbnail, applicationCountryId, destinationCountryId } = req.body as {
            name?: string
            description?: string
            thumbnail?: string
            applicationCountryId?: string
            destinationCountryId?: string
        }

        if (!name?.trim()) {
            return httpError(next, new Error('Name is required'), req, 400)
        }
        if (!applicationCountryId || !destinationCountryId) {
            return httpError(next, new Error('Application and destination countries are required'), req, 400)
        }
        if (!assertObjectId(applicationCountryId, 'application country id', next, req)) return
        if (!assertObjectId(destinationCountryId, 'destination country id', next, req)) return

        const [appCountry, destCountry] = await Promise.all([
            CountryModel.findById(applicationCountryId).lean(),
            CountryModel.findById(destinationCountryId).lean()
        ])
        if (!appCountry || !destCountry) {
            return httpError(next, new Error('One or both countries were not found'), req, 400)
        }

        const definitionRaw = parseJsonBuffer(file.buffer, next, req)
        if (definitionRaw === null) return

        const definitionBytes = Buffer.from(JSON.stringify(definitionRaw), 'utf8')
        if (definitionBytes.length > MAX_DEFINITION_BYTES) {
            return httpError(next, new Error('Workflow definition is too large'), req, 413)
        }

        const _id = new mongoose.Types.ObjectId()
        const objectKey = `wf/${String(_id)}/definition.json`

        try {
            await putWorkflowDefinition(objectKey, definitionBytes)
        } catch (e) {
            return httpError(next, e instanceof Error ? e : new Error('Failed to store workflow file'), req, 500)
        }

        const thumb = typeof thumbnail === 'string' && thumbnail.trim() ? thumbnail.trim() : ''
        const createPayload = {
            _id,
            name: name.trim(),
            description: typeof description === 'string' ? description : '',
            applicationCountry: applicationCountryId,
            destinationCountry: destinationCountryId,
            objectKey
        }

        try {
            await WorkflowModel.create(thumb ? { ...createPayload, thumbnail: thumb } : createPayload)
        } catch (e) {
            try {
                await removeWorkflowDefinition(objectKey)
            } catch {
                // best-effort cleanup
            }
            return httpError(next, e instanceof Error ? e : new Error('Failed to save workflow'), req, 500)
        }

        const populated = await WorkflowModel.findById(_id)
            .populate<{ applicationCountry: CountryLean; destinationCountry: CountryLean }>('applicationCountry destinationCountry', 'name abbr icon')
            .lean()

        if (!populated) {
            return httpError(next, new Error('Workflow not found after create'), req, 500)
        }

        return httpResponse(req, res, 201, responseMessage.SUCCESS, serializeWorkflow(populated))
    },

    async importWorkflow(req: Request, res: Response, next: NextFunction) {
        const file = (req as RequestWithFile).file
        if (!file?.buffer) {
            return httpError(next, new Error('.workflow file is required'), req, 400)
        }

        const raw = parseJsonBuffer(file.buffer, next, req)
        if (raw === null) return

        const bundle = parseWorkflowBundle(raw, next, req)
        if (!bundle) return

        const [appCountry, destCountry] = await Promise.all([
            CountryModel.findById(bundle.applicationCountry).lean(),
            CountryModel.findById(bundle.destinationCountry).lean()
        ])
        if (!appCountry || !destCountry) {
            return httpError(next, new Error('One or both countries in the file were not found'), req, 400)
        }

        const definitionBytes = Buffer.from(JSON.stringify(bundle.definition), 'utf8')
        if (definitionBytes.length > MAX_DEFINITION_BYTES) {
            return httpError(next, new Error('Workflow definition is too large'), req, 413)
        }

        const _id = new mongoose.Types.ObjectId()
        const objectKey = `wf/${String(_id)}/definition.json`

        try {
            await putWorkflowDefinition(objectKey, definitionBytes)
        } catch (e) {
            return httpError(next, e instanceof Error ? e : new Error('Failed to store workflow file'), req, 500)
        }

        const importPayload = {
            _id,
            name: bundle.name,
            description: bundle.description,
            applicationCountry: bundle.applicationCountry,
            destinationCountry: bundle.destinationCountry,
            objectKey
        }

        try {
            await WorkflowModel.create(bundle.thumbnail ? { ...importPayload, thumbnail: bundle.thumbnail } : importPayload)
        } catch (e) {
            try {
                await removeWorkflowDefinition(objectKey)
            } catch {
                // best-effort cleanup
            }
            return httpError(next, e instanceof Error ? e : new Error('Failed to save workflow'), req, 500)
        }

        const populated = await WorkflowModel.findById(_id)
            .populate<{ applicationCountry: CountryLean; destinationCountry: CountryLean }>('applicationCountry destinationCountry', 'name abbr icon')
            .lean()

        if (!populated) {
            return httpError(next, new Error('Workflow not found after import'), req, 500)
        }

        return httpResponse(req, res, 201, responseMessage.SUCCESS, serializeWorkflow(populated))
    },

    async updateWorkflow(req: Request, res: Response, next: NextFunction) {
        const id = typeof req.params.id === 'string' ? req.params.id : ''
        if (!id || !assertObjectId(id, 'workflow id', next, req)) return

        const doc = await WorkflowModel.findById(id)
        if (!doc) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('Workflow')), req, 404)
        }

        const { name, description, thumbnail, applicationCountryId, destinationCountryId } = req.body as {
            name?: string
            description?: string
            thumbnail?: string
            applicationCountryId?: string
            destinationCountryId?: string
        }

        if (name !== undefined) {
            if (!String(name).trim()) {
                return httpError(next, new Error('Name cannot be empty'), req, 400)
            }
            doc.name = String(name).trim()
        }
        if (description !== undefined) {
            doc.description = String(description)
        }
        if (thumbnail !== undefined) {
            const t = String(thumbnail).trim()
            if (t) {
                doc.thumbnail = t
            } else {
                doc.set('thumbnail', undefined)
            }
        }

        if (applicationCountryId !== undefined) {
            if (!assertObjectId(applicationCountryId, 'application country id', next, req)) return
            const c = await CountryModel.findById(applicationCountryId).lean()
            if (!c) {
                return httpError(next, new Error('Application country not found'), req, 400)
            }
            doc.applicationCountry = applicationCountryId as unknown as mongoose.Types.ObjectId
        }
        if (destinationCountryId !== undefined) {
            if (!assertObjectId(destinationCountryId, 'destination country id', next, req)) return
            const c = await CountryModel.findById(destinationCountryId).lean()
            if (!c) {
                return httpError(next, new Error('Destination country not found'), req, 400)
            }
            doc.destinationCountry = destinationCountryId as unknown as mongoose.Types.ObjectId
        }

        const file = (req as RequestWithFile).file
        if (file?.buffer) {
            const definitionRaw = parseJsonBuffer(file.buffer, next, req)
            if (definitionRaw === null) return
            const definitionBytes = Buffer.from(JSON.stringify(definitionRaw), 'utf8')
            if (definitionBytes.length > MAX_DEFINITION_BYTES) {
                return httpError(next, new Error('Workflow definition is too large'), req, 413)
            }
            try {
                await putWorkflowDefinition(doc.objectKey, definitionBytes)
            } catch (e) {
                return httpError(next, e instanceof Error ? e : new Error('Failed to update workflow file'), req, 500)
            }
        }

        await doc.save()

        const populated = await WorkflowModel.findById(doc._id)
            .populate<{ applicationCountry: CountryLean; destinationCountry: CountryLean }>('applicationCountry destinationCountry', 'name abbr icon')
            .lean()

        if (!populated) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('Workflow')), req, 404)
        }

        return httpResponse(req, res, 200, responseMessage.SUCCESS, serializeWorkflow(populated))
    },

    async deleteWorkflow(req: Request, res: Response, next: NextFunction) {
        const id = typeof req.params.id === 'string' ? req.params.id : ''
        if (!id || !assertObjectId(id, 'workflow id', next, req)) return

        const doc = await WorkflowModel.findById(id)
        if (!doc) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('Workflow')), req, 404)
        }

        try {
            await removeWorkflowDefinition(doc.objectKey)
        } catch {
            // Object may already be missing; continue removing the document.
        }

        await WorkflowModel.deleteOne({ _id: doc._id })
        return httpResponse(req, res, 200, responseMessage.SUCCESS, { id: String(doc._id) })
    },

    async exportWorkflow(req: Request, res: Response, next: NextFunction) {
        const id = typeof req.params.id === 'string' ? req.params.id : ''
        if (!id || !assertObjectId(id, 'workflow id', next, req)) return

        const doc = await WorkflowModel.findById(id).lean()
        if (!doc) {
            return httpError(next, new Error(responseMessage.NOT_FOUND('Workflow')), req, 404)
        }

        let definition: unknown
        try {
            const buf = await getWorkflowDefinitionBuffer(doc.objectKey)
            definition = parseJsonBuffer(buf, next, req)
        } catch {
            return httpError(next, new Error('Workflow file is missing or unreadable'), req, 500)
        }
        if (definition === null) return

        const bundleBase: WorkflowBundle = {
            version: WORKFLOW_BUNDLE_VERSION,
            name: doc.name,
            description: doc.description,
            applicationCountry: String(doc.applicationCountry),
            destinationCountry: String(doc.destinationCountry),
            definition
        }
        const bundle = doc.thumbnail ? { ...bundleBase, thumbnail: doc.thumbnail } : bundleBase

        const body = Buffer.from(JSON.stringify(bundle, null, 2), 'utf8')
        const safeName = doc.name.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'workflow'

        res.status(200)
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}.workflow"`)
        res.setHeader('Content-Length', String(body.length))
        return res.send(body)
    }
}
