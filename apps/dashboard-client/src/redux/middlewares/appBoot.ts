import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { setUser } from '../slices/auth.slice'

interface Action {
    type: string
    payload: unknown
}

export const appBootMiddleware: Middleware = (store) => (next) => async (action) => {
    const result = await next(action) // Let the action continue first

    const state: RootState = store.getState()
    const userState = state.auth.user

    try {
        switch ((action as Action).type) {
            case '/boot':
                const persistedUser = JSON.parse(localStorage.getItem('user')!) as typeof userState
                console.log(persistedUser)
                store.dispatch(setUser(persistedUser))
                break
        }
    } catch (error) {
        console.error('APP_BOOT MIDDLEWARE ERROR:', error)
    }
    return result
}
