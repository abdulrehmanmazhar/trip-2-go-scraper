import store from '@/redux/store'
import { waitForAuth } from '@/utils/waitForAuth'
import { redirect } from 'react-router-dom'

export const authGuard = async () => {
    // Wait until status is no longer 'checking'
    await waitForAuth()

    const state = store.getState()
    const { status } = state.auth

    if (status === 'unauthenticated') {
        return redirect('/auth/login')
    }

    return null
}

export const adminGuard = async () => {
    // Ensure auth is settled first
    await waitForAuth()

    const state = store.getState()
    const { status, user } = state.auth

    // If they aren't even logged in, redirect to login
    if (status === 'unauthenticated') return redirect('/auth/login')

    // If logged in but not admin, redirect to unauthorized
    if (user?.role !== 'admin') {
        return redirect('/auth/unauthorized')
    }

    return null
}
