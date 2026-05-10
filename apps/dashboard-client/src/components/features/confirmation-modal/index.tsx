'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConfirmationModalType = 'normal' | 'destructive'

export type ConfirmationModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    type?: ConfirmationModalType
    confirmLabel?: string
    cancelLabel?: string
    onConfirmation: () => void | Promise<void>
    onCancel: () => void
    pending?: boolean
    children?: React.ReactNode
    className?: string
}

export function ConfirmationModal({
    open,
    onOpenChange,
    title,
    description,
    type = 'normal',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirmation,
    onCancel,
    pending = false,
    children,
    className
}: ConfirmationModalProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className={cn('gap-0 overflow-hidden p-0 sm:max-w-md', className)}>
                <div className="px-5 pt-5 pr-12 pb-2">
                    <DialogHeader className="text-left">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                </div>

                {children ? <div className="px-5 pb-4">{children}</div> : null}

                <div
                    className={cn(
                        'flex flex-col-reverse gap-3 border-t border-border/60 bg-muted/30',
                        'px-5 py-4 sm:flex-row sm:justify-end sm:gap-3'
                    )}>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full min-h-10 px-5 sm:w-auto"
                        disabled={pending}
                        onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'destructive' ? 'destructive' : 'default'}
                        className="w-full min-h-10 px-6 sm:w-auto"
                        disabled={pending}
                        onClick={() => void onConfirmation()}>
                        {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
