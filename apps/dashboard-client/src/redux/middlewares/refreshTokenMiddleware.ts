import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import constants, { APIS } from '@/constants'
import type { IUser, THttpResponse } from '@/types'
import { setAccessToken, setStatus, setUser } from '../slices/auth.slice'

interface Action {
    type: string
    payload: unknown
}

interface TokenRefreshResponse extends THttpResponse {
    data: {
        user: Omit<IUser, 'password'>
        accessToken: string
    }
}

const refreshToken = async () => {
    const result = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.UPDATE_ACCESS_TOKEN}`, {
        method: 'GET',
        credentials: 'include'
    })

    const data = await result.json()

    if (!result.ok) {
        throw new Error(data.message || 'Token Refresh failed')
    }

    return data as TokenRefreshResponse
}

export const refreshTokenMiddleware: Middleware = (store) => (next) => async (action) => {
    const result = await next(action) // Let the action continue first

    const state: RootState = store.getState()
    const authStatus = state.auth.status

    try {
        switch ((action as Action).type) {
            case '/refresh-token':
                authStatus !== 'checking' && store.dispatch(setStatus('checking'))
                const response = await refreshToken()
                store.dispatch(setUser(response.data.user))
                store.dispatch(setAccessToken(response.data.accessToken))
                store.dispatch(setStatus('authenticated'))
                break
        }
    } catch (error) {
        store.dispatch(setUser(null))
        store.dispatch(setAccessToken(null))
        store.dispatch(setStatus('unauthenticated'))
        console.error('REFRESH_TOKEN MIDDLEWARE ERROR:', error)
    }
    return result
}
