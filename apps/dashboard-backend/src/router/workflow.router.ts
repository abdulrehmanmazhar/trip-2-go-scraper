import { Router } from 'express'
import multer from 'multer'
import workflowController from '../controller/workflow.controller.js'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js'

const router = Router()

const MAX_WORKFLOW_UPLOAD = 10 * 1024 * 1024

const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_WORKFLOW_UPLOAD },
    fileFilter: (_req, file, cb) => {
        const name = file.originalname.toLowerCase()
        const okJson =
            file.mimetype === 'application/json' || name.endsWith('.json') || (file.mimetype === 'application/octet-stream' && name.endsWith('.json'))
        if (okJson) {
            cb(null, true)
            return
        }
        cb(new Error('Only JSON workflow definition files are allowed for create and update'))
    }
})

const uploadBundle = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_WORKFLOW_UPLOAD },
    fileFilter: (_req, file, cb) => {
        if (file.originalname.toLowerCase().endsWith('.workflow')) {
            cb(null, true)
            return
        }
        cb(new Error('Only .workflow bundle files are allowed for import'))
    }
})

router.get('/countries', isAuthenticated, authorizeRoles('admin'), workflowController.listCountries)

router.get('/workflows', isAuthenticated, authorizeRoles('admin'), workflowController.listWorkflows)

router.post('/workflows', isAuthenticated, authorizeRoles('admin'), uploadMemory.single('workflowFile'), workflowController.createWorkflow)

router.post('/workflows/import', isAuthenticated, authorizeRoles('admin'), uploadBundle.single('workflowFile'), workflowController.importWorkflow)

router.patch('/workflows/:id', isAuthenticated, authorizeRoles('admin'), uploadMemory.single('workflowFile'), workflowController.updateWorkflow)

router.delete('/workflows/:id', isAuthenticated, authorizeRoles('admin'), workflowController.deleteWorkflow)

router.get('/workflows/:id/export', isAuthenticated, authorizeRoles('admin'), workflowController.exportWorkflow)

export default router
