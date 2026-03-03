import { SignupForm } from '@/components/auth/signup-form'

type Props = {}

function Signup({}: Props) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6">
            <SignupForm />
        </div>
    )
}

export default Signup
