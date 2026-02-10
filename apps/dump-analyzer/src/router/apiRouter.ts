import { Router } from 'express'
import apiController from '../controller/apiController.js'

const router = Router()

router.route('/self').get(apiController.self)
router.route('/filter_dump').post(apiController.filter_dump)
router.route('/get_json').post(apiController.get_json)

export default router
