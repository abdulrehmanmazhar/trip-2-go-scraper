import { ResetPasswordForm } from '@/components/auth/reset-password-form'

type Props = {}

function ResetPassword({}: Props) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <ResetPasswordForm />
        </div>
    )
}

export default ResetPassword
