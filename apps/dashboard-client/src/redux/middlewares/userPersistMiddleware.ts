import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { setAccessToken } from '../slices/auth.slice'

interface Action {
    type: string
    payload: unknown
}

export const userPersistMiddleware: Middleware = (store) => (next) => async (action) => {
    const result = await next(action) // Let the action continue first

    const state: RootState = store.getState()
    const authState = state.auth

    try {
        switch ((action as Action).type) {
            case setAccessToken.type:
                localStorage.setItem('user', JSON.stringify(authState.user))
                break
        }
    } catch (error) {
        console.error('USER_PERSIST MIDDLEWARE ERROR:', error)
    }
    return result
}
