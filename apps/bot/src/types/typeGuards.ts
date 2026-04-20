import type {
    Action,
    CheckAction,
    ClickAction,
    ClosesPageAction,
    FillAction,
    HoverAction,
    InturrptionAction,
    NavigateAction,
    OpenPageAction,
    PressAction,
    SelectAction,
    SelectorAction,
    ServerAction,
    SetInputFilesAction,
    UncheckAction
} from './types.js'
export const isUrlAction = (action: Action): action is OpenPageAction | NavigateAction => {
    return (action as OpenPageAction).url !== undefined
}

export const hasSelector = (action: Action): action is SelectorAction => {
    return (action as SelectorAction).selector !== undefined
}

export const isClickAction = (action: Action): action is ClickAction => {
    const isValid = validateInterfaceKeys(action as ClickAction, 'button', 'modifiers', 'clickCount')
    return isValid && (action as ClickAction).name === 'click'
}

export const isFillAction = (action: Action): action is FillAction => {
    const isValid = validateInterfaceKeys(action as FillAction, 'text')
    return isValid && (action as FillAction).name === 'fill'
}

export const isPressAction = (action: Action): action is PressAction => {
    const isValid = validateInterfaceKeys(action as PressAction, 'key')
    return isValid && (action as PressAction).name === 'press'
}

export const isCheckAction = (action: Action): action is CheckAction => {
    return (action as CheckAction).name === 'check'
}

export const isUnCheckAction = (action: Action): action is UncheckAction => {
    return (action as UncheckAction).name === 'uncheck'
}

export const isSelectAction = (action: Action): action is SelectAction => {
    const isValid = validateInterfaceKeys(action as SelectAction, 'options')
    return isValid && (action as SelectAction).name === 'select'
}

export const isSetInputFilesAction = (action: Action): action is SetInputFilesAction => {
    const isValid = validateInterfaceKeys(action as SetInputFilesAction, 'files')
    return isValid && (action as SetInputFilesAction).name === 'setInputFiles'
}

export const isHoverAction = (action: Action): action is HoverAction => {
    return (action as HoverAction).name === 'hover'
}

export const isPageCloseAction = (action: Action): action is ClosesPageAction => {
    return (action as ClosesPageAction).name === 'closePage'
}

export const isServerAction = (action: unknown): action is ServerAction => {
    return (action as ServerAction).name === 'serverAction'
}

export const isInturrptionAction = (action: unknown): action is InturrptionAction => {
    return (action as InturrptionAction).name === 'inturrptionAction'
}

export const isPlaywrightAction = (action: { name: string }): action is Action => {
    return action.name !== 'inturrptionAction' && action.name !== 'serverAction'
}

const validateInterfaceKeys = <T extends object>(interfaceArg: T, ...keys: (keyof T)[]) => {
    if (typeof interfaceArg !== 'object' || interfaceArg === null) return false

    for (const key of keys) {
        if (!(key in interfaceArg) || interfaceArg[key] === undefined) {
            return false
        }
    }

    return true
}
