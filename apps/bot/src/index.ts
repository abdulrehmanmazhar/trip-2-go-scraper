import { Command } from 'commander'
import { handleDemo } from './cli/demo.js'
import { handleLogin } from './cli/login.js'
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
// DEMO COMMAND
// ----------------------
program
    .command('demo')
    .description('Run the bundled YouTube workflow demo (JSON-driven Playwright automation)')
    .option('-w, --workflow <path>', 'Path to a workflow JSON file (default: workflows/youtube_workflow.json)')
    .action(async (opts: { workflow?: string }) => {
        try {
            await handleDemo(opts.workflow)
        } catch (err) {
            logger.error('DEMO_ERROR', { meta: err as Error })
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
