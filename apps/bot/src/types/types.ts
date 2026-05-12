import { disconnect } from 'node:cluster'

export type ActionName =
    | 'check'
    | 'click'
    | 'hover'
    | 'closePage'
    | 'fill'
    | 'navigate'
    | 'openPage'
    | 'press'
    | 'select'
    | 'uncheck'
    | 'setInputFiles'
    | 'assertText'
    | 'assertValue'
    | 'assertChecked'
    | 'assertVisible'
    | 'assertSnapshot'

export type BaseSignal = {
    nope: unknown
}

export type NavigationSignal = BaseSignal & {
    name: 'navigation'
    url: string
}

export type PopupSignal = BaseSignal & {
    name: 'popup'
    popupAlias: string
}

export type DownloadSignal = BaseSignal & {
    name: 'download'
    downloadAlias: string
}

export type DialogSignal = BaseSignal & {
    name: 'dialog'
    dialogAlias: string
}

export type Signal = NavigationSignal | PopupSignal | DownloadSignal | DialogSignal

export type ActionBase = {
    name: ActionName
    signals: Signal[]
    ariaSnapshot?: string
    preconditionSelector?: string
}

export type ActionWithSelector = ActionBase & {
    selector: string
    ref?: string
}

export type ClickAction = ActionWithSelector & {
    name: 'click'
    button: 'left' | 'middle' | 'right'
    modifiers: number
    clickCount: number
    // position?: Point
}

export type HoverAction = ActionWithSelector & {
    name: 'hover'
    // position?: Point
}

export type CheckAction = ActionWithSelector & {
    name: 'check'
}

export type UncheckAction = ActionWithSelector & {
    name: 'uncheck'
}

export type FillAction = ActionWithSelector & {
    name: 'fill'
    text: string
}

export type NavigateAction = ActionBase & {
    name: 'navigate'
    url: string
}

export type OpenPageAction = ActionBase & {
    name: 'openPage'
    url: string
}

export type ClosesPageAction = ActionBase & {
    name: 'closePage'
}

export type PressAction = ActionWithSelector & {
    name: 'press'
    key: string
    modifiers: number
}

export type SelectAction = ActionWithSelector & {
    name: 'select'
    options: string[]
}

export type SetInputFilesAction = ActionWithSelector & {
    name: 'setInputFiles'
    files: string[]
}

export type AssertTextAction = ActionWithSelector & {
    name: 'assertText'
    text: string
    substring: boolean
}

export type AssertValueAction = ActionWithSelector & {
    name: 'assertValue'
    value: string
}

export type AssertCheckedAction = ActionWithSelector & {
    name: 'assertChecked'
    checked: boolean
}

export type AssertVisibleAction = ActionWithSelector & {
    name: 'assertVisible'
}

export type AssertSnapshotAction = ActionWithSelector & {
    name: 'assertSnapshot'
    ariaSnapshot: string
}

export type Action =
    | ClickAction
    | HoverAction
    | CheckAction
    | ClosesPageAction
    | OpenPageAction
    | UncheckAction
    | FillAction
    | NavigateAction
    | PressAction
    | SelectAction
    | SetInputFilesAction
    | AssertTextAction
    | AssertValueAction
    | AssertCheckedAction
    | AssertVisibleAction
    | AssertSnapshotAction

export type FrameDescription = {
    pageGuid: string
    pageAlias: string
    framePath: string[]
}

export type BotActions = Action & FrameDescription

export type SelectorAction =
    | ClickAction
    | HoverAction
    | CheckAction
    | UncheckAction
    | FillAction
    | PressAction
    | SelectAction
    | SetInputFilesAction
    | AssertTextAction
    | AssertValueAction
    | AssertCheckedAction
    | AssertVisibleAction
    | AssertSnapshotAction

export type ServerAction = {
    name: 'serverAction'
    type: 'custom' | 'built-in'
    runtimeEnvRef: 'environment' | 'context'
    action:
        | {
              timeout: number
              function: 'get-otp'
          }
        | {
              url: string
              method: 'GET' | 'POST' | 'PUT' | 'DELETE'
              body: unknown
          }
}

export type InturrptionAction = {
    name: 'inturrptionAction'
    timeout: number
    preconditionSelector: string | null
    resolve: {
        selector: string
        attr: 'visible' | 'hidden'
    }
}

type RunTask = { handler: 'runTask'; payload: { task: string } }
type disconnect = { handler: 'disconnect'; payload: null }

export type BotCommand = RunTask | disconnect
export type Handlers = BotCommand['handler']
export type Payloads = BotCommand['payload']

export interface BotEvents {
    disconnect: disconnect
    runTask: RunTask
}
