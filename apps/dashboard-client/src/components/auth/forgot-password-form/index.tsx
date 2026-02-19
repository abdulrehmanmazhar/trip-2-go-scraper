import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import constants, { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
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
                        <h1 className="text-xl font-bold">Forgot {constants.NAME} account password</h1>
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
                        {/* <a href="/login">Back to login</a> */}
                        <Link to={ROUTES.LOGIN}>
                            <span
                                // href="/forgot-password"
                                className="text-sm text-muted-foreground hover:underline cursor-pointer">
                                Back to login
                            </span>
                        </Link>
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
