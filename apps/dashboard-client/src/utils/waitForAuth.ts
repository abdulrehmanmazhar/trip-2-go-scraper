// utils/waitForAuth.ts
import store from '@/redux/store'

export const waitForAuth = (): Promise<'authenticated' | 'unauthenticated'> => {
    return new Promise((resolve) => {
        const check = () => {
            const { status } = store.getState().auth
            if (status !== 'checking') {
                resolve(status)
                return true
            }
            return false
        }

        // 1. Instant check (in case it's already loaded)
        if (check()) return

        // 2. Subscribe to store changes if still 'checking'
        const unsubscribe = store.subscribe(() => {
            if (check()) unsubscribe()
        })
    })
}
