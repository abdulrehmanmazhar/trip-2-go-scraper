import type { IUser } from '@/types'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    user: Omit<IUser, 'password'> | null
    accessToken: string | null
    status: 'checking' | 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    status: 'unauthenticated'
}

// const initialState: AuthState = {
//     user: {
//         id: '123',
//         email: 'acb@mail.com',
//         role: 'admin'
//     },
//     accessToken: '1234567',
//     status: 'authenticated'
// }

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Omit<IUser, 'password'> | null>) => {
            state.user = action.payload
        },
        setAccessToken: (state, action: PayloadAction<string | null>) => {
            state.accessToken = action.payload
        },
        setStatus: (state, action: PayloadAction<AuthState['status']>) => {
            state.status = action.payload
        }
    }
})

export default authSlice.reducer
export const { setUser, setAccessToken, setStatus } = authSlice.actions
