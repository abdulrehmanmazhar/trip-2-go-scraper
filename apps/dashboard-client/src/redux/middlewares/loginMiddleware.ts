import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import constants, { APIS } from '@/constants'
import type { IUser, THttpResponse } from '@/types'
import { setAccessToken, setStatus, setUser } from '../slices/auth.slice'
import { toast } from 'sonner'

interface Action {
    type: string
    payload: { email: string; password: string }
}

interface LoginResponse extends THttpResponse {
    data: {
        user: Omit<IUser, 'password'>
        accessToken: string
    }
}

const loginUser = async ({ email, password }: { email: string; password: string }) => {
    const result = await fetch(
        `${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.LOGIN}`,

        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json' // *HEADER* for JSON data
            },
            body: JSON.stringify({ email, password })
        }
    )

    const data = await result.json()

    if (!result.ok) {
        throw new Error(data.message || 'Login failed')
    }

    return data as LoginResponse
}

export const loginMiddleware: Middleware = (store) => (next) => async (action) => {
    const result = await next(action) // Let the action continue first

    const state: RootState = store.getState()
    const authStatus = state.auth.status

    try {
        switch ((action as Action).type) {
            case '/login':
                authStatus !== 'checking' && store.dispatch(setStatus('checking'))
                const response = await loginUser((action as Action).payload)
                store.dispatch(setUser(response.data.user))
                store.dispatch(setAccessToken(response.data.accessToken))
                store.dispatch(setStatus('authenticated'))
                toast('Login successful!')
                break
        }
    } catch (error) {
        toast(error instanceof Error ? error.message : 'Login failed!')
        store.dispatch(setUser(null))
        store.dispatch(setAccessToken(null))
        store.dispatch(setStatus('unauthenticated'))
        console.error('LOGIN MIDDLEWARE ERROR:', error)
    }
    return result
}
