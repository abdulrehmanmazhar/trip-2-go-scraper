import { serverUtilities } from 'shared-utils'
import logger from './logger.js'
import config from '../config/config.js'

serverUtilities.configure(logger, config)

export const { httpError, httpResponse } = {
    httpResponse: serverUtilities.httpResponse(),
    httpError: serverUtilities.httpError()
}

export { responseMessage } from 'shared-utils'
