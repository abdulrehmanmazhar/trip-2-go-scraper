import React from 'react'
import { cn } from '@/lib/utils'

type HeaderProps = {
    title?: string
    subtitle?: string
    actions?: React.ReactNode
    className?: string
}

function Header({ title, subtitle, actions, className }: HeaderProps) {
    return (
        <header className={cn('flex items-center justify-between gap-4 border-b px-6 py-4', className)}>
            {/* Left */}
            <div className="min-w-0">
                {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>

            {/* Right */}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
    )
}

export default Header
