// // import { getTools } from './utils/getTools.js'
// // import { performTasks } from './utils/performTasks.js'
// // import { spawnMCP } from './utils/spawnMCP.js'
// // import { waitForEndpoint } from './utils/waitForEndpoint.js'

// import { generateCode } from './utils/codegen.js'
// // import { main } from './server/index.js'
// import logger from './utils/logger.js'
// // import { PlaywrightRuntime } from './utils/playwrightRuntime.js'

// try {
//     // spawnMCP()
//     // await waitForEndpoint('http://localhost:8931/mcp')
//     // await getTools()
//     // await performTasks()
//     generateCode()
//     // main()
//     // const runActions = async () => {
//     //     const runtime = new PlaywrightRuntime()
//     //     await runtime.run('./actions.jsonl')
//     // }
//     // await runActions()
// } catch (error) {
//     logger.error('APP_ERROR', { error })
// }

import { Command } from 'commander'
import { handleLogin } from './cli//login.js'
import { handleStart } from './cli/start.js'
import logger from './utils/logger.js'

const program = new Command()

program.name('figgo-bot').description('Figgo Bot CLI — manage and run your distributed bot nodes').version('1.0.0')

// ----------------------
// LOGIN COMMAND
// ----------------------
program
    .command('login')
    .description('Authenticate this machine as a bot node')
    // .option('--server <url>', 'Override server URL')
    .action(async () => {
        try {
            await handleLogin()
        } catch (err) {
            logger.error('LOGIN_ERROR', { meta: err as Error })
            process.exit(1)
        }
    })

// ----------------------
// START COMMAND
// ----------------------
program
    .command('start')
    .description('Start the bot and connect to central server')
    .action(async () => {
        try {
            await handleStart()
        } catch (err) {
            logger.error('START_ERROR', { meta: err as Error })
            process.exit(1)
        }
    })

// ----------------------
// DEFAULT HELP
// ----------------------
await program.parseAsync(process.argv)
