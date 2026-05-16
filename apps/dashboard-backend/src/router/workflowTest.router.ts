import { Router } from 'express'
import workflowTestController from '../controller/workflowTest.controller.js'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js'

const router = Router()

router.post('/workflow-tests', isAuthenticated, authorizeRoles('admin'), workflowTestController.startTest)
router.get('/workflow-tests/active', isAuthenticated, authorizeRoles('admin'), workflowTestController.listActive)
router.get('/workflow-tests/:testId', isAuthenticated, authorizeRoles('admin'), workflowTestController.getTest)

export default router
