import { OtpForm } from '@/components/auth/otp-form'

type Props = {}

function Otp({}: Props) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <OtpForm />
        </div>
    )
}

export default Otp
