import type { BotEvents } from '../types/types.js'

const isTaskPayload = (payload: unknown): payload is BotEvents['runTask']['payload'] => {
    return typeof payload === 'object' && payload !== null
}

export const runTaskHandler = (payload: unknown) => {
    if (!isTaskPayload(payload)) {
        throw new Error('Invalid task payload')
    }

    console.log(`Running task: ${payload.task}`)

    return { success: true }
}
