import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import constants, { APIS } from '@/constants'
import type { IUser, THttpResponse } from '@/types'
import { useDispatch } from 'react-redux'
import { setAccessToken, setStatus, setUser } from '@/redux/slices/auth.slice'

interface LoginResponse extends THttpResponse {
    data: {
        user: Omit<IUser, 'password'>
        accessToken: string
    }
}

export default function Callback() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [searchParams] = useSearchParams()
    const dispatch = useDispatch()
    const hasRun = useRef(false)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true
        const handleOAuth = async () => {
            try {
                const code = searchParams.get('code')
                const oauthError = searchParams.get('error')

                if (oauthError) {
                    throw new Error(oauthError)
                }

                if (!code) {
                    throw new Error('Missing authorization code')
                }

                const result = await fetch(`${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.GOOGLE_CALLBACK}?code=${code}`, {
                    credentials: 'include'
                })

                const response = (await result.json()) as LoginResponse

                if (!result.ok) {
                    throw new Error(response.message || 'Login failed')
                }

                dispatch(setUser(response.data.user))
                dispatch(setAccessToken(response.data.accessToken))
                dispatch(setStatus('checking'))
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
            } finally {
                setTimeout(() => {
                    navigate('/')
                }, 1200)
            }
        }

        handleOAuth()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                    {!error ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <div className="text-center space-y-2">
                                <h2 className="text-lg font-semibold">Connecting your account</h2>
                                <p className="text-sm text-muted-foreground">Please wait while we securely complete authentication...</p>
                            </div>
                        </>
                    ) : (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
