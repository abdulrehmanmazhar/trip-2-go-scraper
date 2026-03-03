import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

type Props = {}

function ForgotPassword({}: Props) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <ForgotPasswordForm />
        </div>
    )
}

export default ForgotPassword
