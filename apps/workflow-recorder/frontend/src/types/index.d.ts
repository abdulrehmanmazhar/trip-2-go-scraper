import type * as neutralino from '@neutralinojs/lib'

declare global {
    interface Window {
        platform: neutralino
    }
}

export {}
