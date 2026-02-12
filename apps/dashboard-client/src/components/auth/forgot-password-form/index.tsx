import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import constants from '@/constants'
import { cn } from '@/lib/utils'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex flex-col gap-6', className)}
            {...props}>
            <form>
                <FieldGroup>
                    <div className="text-center">
                        <h1 className="text-xl font-bold">Forgot password?</h1>
                        <FieldDescription>We’ll send you a reset link.</FieldDescription>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                    </Field>

                    <Button
                        type="submit"
                        className="w-full">
                        Send reset link
                    </Button>

                    <FieldDescription className="text-center">
                        <a href="/login">Back to login</a>
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
