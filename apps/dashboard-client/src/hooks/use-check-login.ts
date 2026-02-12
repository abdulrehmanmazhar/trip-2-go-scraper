import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'auth:lastSeen'
const TTL = 0.5 * 60 * 1000

export function useCheckLogin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    const checkValidity = useCallback(() => {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return false

        const lastSeen = Number(raw)
        if (Number.isNaN(lastSeen)) return false

        return Date.now() - lastSeen < TTL
    }, [])

    const refreshLoginTimestamp = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString())
        setIsLoggedIn(true)
    }, [])

    useEffect(() => {
        setIsLoggedIn(checkValidity())
    }, [checkValidity])

    return {
        isLoggedIn,
        refreshLoginTimestamp
    }
}
