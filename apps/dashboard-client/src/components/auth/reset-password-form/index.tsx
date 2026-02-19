import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import constants from '@/constants'
import { cn } from '@/lib/utils'

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
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
                        <h1 className="text-xl font-bold">Set {constants.NAME} account new password</h1>
                        <FieldDescription>Choose a strong password you don’t reuse elsewhere.</FieldDescription>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="password">New password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                        <Input
                            id="confirm"
                            type="password"
                            required
                        />
                    </Field>

                    <Button
                        type="submit"
                        className="w-full">
                        Reset password
                    </Button>
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
