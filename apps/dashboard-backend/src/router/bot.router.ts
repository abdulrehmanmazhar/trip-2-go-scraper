import { Router } from 'express'
import botController from '../controller/bot.controller.js'

const router = Router()

router.route('/register-bot').post(botController.registerBot)
router.route('/verify-otp').post(botController.verifyOtp)
router.route('/approve-bot').post(botController.approveBot)
router.route('/resolve-bot/:botId').get(botController.resolveBot)

export default router
