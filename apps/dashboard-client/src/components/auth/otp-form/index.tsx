import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import constants, { APIS, ROUTES } from '@/constants'
import type { THttpResponse } from '@/types'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

const verifyUser = async ({ activation_token, activation_code }: { activation_token: string; activation_code: string }) => {
    const result = await fetch(
        `${constants.BACKEND_LINK}${constants.API_VERSION}${APIS.OTP}`,

        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // *HEADER* for JSON data
            },
            body: JSON.stringify({ activation_token, activation_code })
        }
    )

    const data = await result.json()

    if (!result.ok) {
        throw new Error(data.message || 'Verification failed')
    }

    return data as THttpResponse
}

export function OtpForm({ className, ...props }: React.ComponentProps<'div'>) {
    const length = 6
    const [otp, setOtp] = React.useState<string[]>(Array(length).fill(''))
    const inputsRef = React.useRef<(HTMLInputElement | null)[]>([])

    const [loading, setLoading] = React.useState(false)

    const navigate = useNavigate()

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return

        const next = [...otp]
        next[index] = value.slice(-1)
        setOtp(next)

        if (value && index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

        if (data.length === length) {
            setOtp(data.split(''))
            inputsRef.current[length - 1]?.focus()
        }
    }

    const verify = async (e: any) => {
        try {
            e.preventDefault()

            setLoading(true)

            const activation_token = sessionStorage.getItem('token') as string
            await verifyUser({ activation_token, activation_code: otp.join('') })
            navigate(ROUTES.LOGIN)

            toast('Verification successful!')
        } catch (error) {
            console.error(error)
            toast(error instanceof Error ? error.message : 'Verification failed!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className={cn('flex flex-col gap-6', className)}
            {...props}>
            <form>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <img
                            src={constants.LOGO_SRC}
                            alt={constants.NAME}
                            className="h-8 w-8 object-contain"
                        />
                        <h1 className="text-xl font-bold">Verify your {constants.NAME} account</h1>
                        <FieldDescription>Enter the 6-digit code sent to your email</FieldDescription>
                    </div>

                    <Field>
                        <FieldLabel>Verification code</FieldLabel>
                        <div
                            className="flex justify-between gap-2"
                            onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputsRef.current[index] = el as any)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="h-12 w-10 rounded-md border text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            ))}
                        </div>
                    </Field>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        onClick={verify}>
                        {loading ? <Spinner /> : 'Verify'}
                    </Button>

                    <FieldDescription className="text-center">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            className="underline">
                            Resend
                        </button>
                    </FieldDescription>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                By continuing, you agree to our{' '}
                <a
                    href={constants.T_AND_C_PAGE}
                    target="_blank">
                    Terms
                </a>{' '}
                and{' '}
                <a
                    href={constants.PRIVACY_POLICY_PAGE}
                    target="_blank">
                    Privacy Policy
                </a>
                .
            </FieldDescription>
        </div>
    )
}
