// import { launchCodegen } from './utils/codegen.js'
import { chromium } from 'playwright'
try {
    // launchCodegen()
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    // Open the page you want to record
    // await page.goto('https://example.com')

    // Trigger the inspector and codegen
    await page.pause()
} catch (error) {}
