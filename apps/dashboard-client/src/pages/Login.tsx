import { LoginForm } from '@/components/auth/login-form'

type Props = {}

function Login({}: Props) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <LoginForm />
        </div>
    )
}

export default Login
