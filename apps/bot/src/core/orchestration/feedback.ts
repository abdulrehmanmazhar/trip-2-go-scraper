import type { WorkflowFile } from '../../types/workflow.js'
import logger from '../../utils/logger.js'
import type { WorkflowSession } from './session.js'
import type { SessionStatus, StepFeedback } from './types.js'

export type WorkflowFeedbackPhase =
    | 'workflow:start'
    | 'workflow:complete'
    | 'workflow:failed'
    | 'step:executing'
    | 'step:completed'
    | 'step:failed'
    | 'browser:launched'
    | 'browser:closed'

export type WorkflowFeedback = {
    phase: WorkflowFeedbackPhase
    sessionId: string
    sessionStatus: SessionStatus
    workflow: Pick<WorkflowFile, 'id' | 'name'>
    step?: StepFeedback
    action?: Record<string, unknown>
    environment?: Record<string, unknown>
    error?: string
    taskId?: string
    metadata?: Record<string, unknown>
}

export type WorkflowFeedbackHandler = (feedback: WorkflowFeedback) => void | Promise<void>

export type RunWorkflowOptions = {
    feedback?: WorkflowFeedbackHandler | WorkflowFeedbackHandler[]
    environment?: Record<string, unknown>
    taskId?: string
    metadata?: Record<string, unknown>
}

export const composeFeedbackHandlers = (...handlers: (WorkflowFeedbackHandler | undefined)[]): WorkflowFeedbackHandler => {
    const active = handlers.filter((h): h is WorkflowFeedbackHandler => h !== undefined)
    return async (feedback) => {
        for (const handler of active) {
            await handler(feedback)
        }
    }
}

export const createLoggerFeedback = (): WorkflowFeedbackHandler => {
    return (feedback) => {
        logger.info('WORKFLOW_FEEDBACK', { meta: feedback })
    }
}

export const buildWorkflowFeedback = (
    phase: WorkflowFeedbackPhase,
    session: WorkflowSession,
    workflow: WorkflowFile,
    options: RunWorkflowOptions,
    extras?: {
        step?: StepFeedback
        action?: Record<string, unknown>
        error?: string
    }
): WorkflowFeedback => {
    const feedback: WorkflowFeedback = {
        phase,
        sessionId: session.id,
        sessionStatus: session.status,
        workflow: { id: workflow.id, name: workflow.name },
        environment: { ...session.environment }
    }

    if (options.taskId !== undefined) feedback.taskId = options.taskId
    if (options.metadata !== undefined) feedback.metadata = options.metadata
    if (extras?.step !== undefined) feedback.step = extras.step
    if (extras?.action !== undefined) feedback.action = extras.action
    if (extras?.error !== undefined) feedback.error = extras.error

    return feedback
}
