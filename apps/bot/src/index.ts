// import { getTools } from './utils/getTools.js'
// import { performTasks } from './utils/performTasks.js'
// import { spawnMCP } from './utils/spawnMCP.js'
// import { waitForEndpoint } from './utils/waitForEndpoint.js'

import { generateCode } from './utils/codegen.js'
// import { main } from './server/index.js'
import logger from './utils/logger.js'
// import { PlaywrightRuntime } from './utils/playwrightRuntime.js'

try {
    // spawnMCP()
    // await waitForEndpoint('http://localhost:8931/mcp')
    // await getTools()
    // await performTasks()
    generateCode()
    // main()
    // const runActions = async () => {
    //     const runtime = new PlaywrightRuntime()
    //     await runtime.run('./actions.jsonl')
    // }
    // await runActions()
} catch (error) {
    logger.error('APP_ERROR', { error })
}
