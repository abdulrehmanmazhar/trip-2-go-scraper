import type { RootState } from '../store'

export const selectUser = (state: RootState) => state.auth.user
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectUserAcessToken = (state: RootState) => state.auth.accessToken
