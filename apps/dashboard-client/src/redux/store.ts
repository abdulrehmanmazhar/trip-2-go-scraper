import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth.slice'
import { loginMiddleware } from './middlewares/loginMiddleware'
import { appBootMiddleware } from './middlewares/appBoot'
import { userPersistMiddleware } from './middlewares/userPersistMiddleware'
import { refreshTokenMiddleware } from './middlewares/refreshTokenMiddleware'
const store = configureStore({
    reducer: {
        auth: authReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(appBootMiddleware, loginMiddleware, userPersistMiddleware, refreshTokenMiddleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
