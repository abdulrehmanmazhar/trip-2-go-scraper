import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import constants, { ROUTES } from '@/constants'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { selectAuthStatus, selectUser } from '@/redux/selectors/auth.selector'
import { Spinner } from '@/components/ui/spinner'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const user = useSelector(selectUser)
    const status = useSelector(selectAuthStatus)
    // console.log(user)

    const loading = status === 'checking'

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user || status === 'authenticated') return

        dispatch({ type: '/refresh-token' })
    }, [user, dispatch])

    useEffect(() => {
        if (status !== 'authenticated' || !user) return

        navigate(user.role === 'admin' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD)
    }, [status, user, navigate])

    const login = async (e: any) => {
        e.preventDefault()
        dispatch({ type: '/login', payload: { email, password } })
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
                        <h1 className="text-xl font-bold">Welcome to {constants.NAME}</h1>
                        <FieldDescription>
                            Don&apos;t have an account?{' '}
                            <Link to={ROUTES.SIGNUP}>
                                <span
                                    // href="/forgot-password"
                                    className="text-sm text-muted-foreground hover:underline cursor-pointer">
                                    Sign up
                                </span>
                            </Link>
                        </FieldDescription>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Link to={ROUTES.FORGOT_PASSWORD}>
                                <span
                                    // href="/forgot-password"
                                    className="text-sm text-muted-foreground hover:underline cursor-pointer">
                                    Forgot password?
                                </span>
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pr-10"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Field>

                    <Field>
                        <Button
                            // type="submit"
                            className="w-full"
                            disabled={!!user || loading}
                            onClick={login}>
                            {loading ? <Spinner /> : 'Login'}
                        </Button>
                    </Field>

                    <FieldSeparator>Or</FieldSeparator>

                    {/* OAuth buttons stay the same */}

                    <Field className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            type="button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path
                                    d="M11.5 3v8h-8v-8h8zm10 0v8h-8v-8h8zm-10 10v8h-8v-8h8zm10 0v8h-8v-8h8z"
                                    fill="currentColor"
                                />
                            </svg>
                            Continue with Microsoft
                        </Button>
                        <Button
                            variant="outline"
                            type="button">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            Continue with Google
                        </Button>
                    </Field>
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
