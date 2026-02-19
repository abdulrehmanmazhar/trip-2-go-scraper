import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
    id: string
    email: string
    role: 'admin' | 'user'
}
interface AuthState {
    user: User | null
    accessToken: string | null
    status: 'checking' | 'authenticated' | 'unauthenticated'
}

// const initialState: AuthState = {
//     user: null,
//     accessToken: null,
//     status: 'unauthenticated'
// }

const initialState: AuthState = {
    user: {
        id: '123',
        email: 'acb@mail.com',
        role: 'admin'
    },
    accessToken: '1234567',
    status: 'authenticated'
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        setStatus: (state, action: PayloadAction<AuthState['status']>) => {
            state.status = action.payload
        }
    }
})

export default authSlice.reducer
export const { setUser, setAccessToken, setStatus } = authSlice.actions
