import type { BuiltInServerAction, CustomServerAction, TServerAction } from '@/types/actions'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Server, Code, Wrench } from 'lucide-react'

// Helper function to get action-specific details
const getActionDetails = (action: TServerAction) => {
    const isCustom = action.type === 'custom'

    return {
        label: 'Server Action',
        badgeIcon: isCustom ? Code : Wrench,
        badgeVariant: isCustom ? ('default' as const) : ('secondary' as const),
        isCustom,
        runtimeEnvRef: action.runtimeEnvRef,
        action: action.action
    }
}

function ServerAction({ data }: NodeProps<TServerAction>) {
    const { label, badgeIcon: BadgeIcon, badgeVariant, isCustom, runtimeEnvRef, action } = getActionDetails(data)

    return (
        <div className="relative group">
            {/* Target Handle (Top) */}
            <Handle
                type="target"
                position={Position.Top}
                className="bg-border hover:bg-primary transition-colors w-3 h-3 border-2 border-background"
            />

            {/* Source Handle (Bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="bg-border hover:bg-primary transition-colors w-3 h-3 border-2 border-background"
            />

            {/* Main Card */}
            <Card className="w-65 transition-all">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    </div>
                    <Badge
                        variant={badgeVariant}
                        className="text-xs px-2 py-0.5 gap-1">
                        <BadgeIcon className="w-3 h-3" />
                    </Badge>
                </CardHeader>

                <CardContent className="pt-2">
                    <div className="text-xs text-muted-foreground">
                        {isCustom ? (
                            <>
                                {(action as CustomServerAction['action']).method} •{' '}
                                {(action as CustomServerAction['action']).url.length > 40
                                    ? `${(action as CustomServerAction['action']).url.substring(0, 40)}...`
                                    : (action as CustomServerAction['action']).url}
                            </>
                        ) : (
                            <>Get OTP • Timeout: {(action as BuiltInServerAction['action']).timeout}ms</>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Runtime: {runtimeEnvRef}</div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ServerAction
