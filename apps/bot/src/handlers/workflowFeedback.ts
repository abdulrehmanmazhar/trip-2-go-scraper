import type { FiggoClient } from 'ws-core'
import type { WorkflowFeedback, WorkflowFeedbackHandler } from '../core/orchestration/feedback.js'

export const WORKFLOW_FEEDBACK_EVENT = 'workflowFeedback'

export type WsWorkflowFeedbackOptions = {
    taskId?: string
    metadata?: Record<string, unknown>
}

/** Sends workflow execution feedback to the central server over the bot WebSocket. */
export const createWsWorkflowFeedback = (client: FiggoClient, options: WsWorkflowFeedbackOptions = {}): WorkflowFeedbackHandler => {
    return (feedback: WorkflowFeedback) => {
        client.sendEvent(WORKFLOW_FEEDBACK_EVENT, {
            ...feedback,
            taskId: feedback.taskId ?? options.taskId,
            metadata: { ...options.metadata, ...feedback.metadata }
        })
    }
}
