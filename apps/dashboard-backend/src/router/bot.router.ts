import { Router } from 'express'
import botController from '../controller/bot.controller.js'
import { authorizeRoles, isAuthenticated } from '../middleware/auth.js'

const router = Router()

router.get('/bots', isAuthenticated, authorizeRoles('admin'), botController.listBots)
router.patch('/bots/:botId', isAuthenticated, authorizeRoles('admin'), botController.updateBot)
router.delete('/bots/:botId', isAuthenticated, authorizeRoles('admin'), botController.deleteBot)
router.post('/approve-bot', isAuthenticated, authorizeRoles('admin'), botController.approveBot)
router.post('/reject-bot', isAuthenticated, authorizeRoles('admin'), botController.rejectBot)
router.post('/revoke-bot', isAuthenticated, authorizeRoles('admin'), botController.revokeBot)
router.post('/unrevoke-bot', isAuthenticated, authorizeRoles('admin'), botController.unrevokeBot)

router.post('/register-bot', botController.registerBot)
router.post('/verify-otp', botController.verifyOtp)
router.get('/resolve-bot/:botId', botController.resolveBot)

export default router
