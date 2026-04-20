import type { TNetworkInterceptorAction } from '@/types/actions'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Wifi } from 'lucide-react'
import nodejsIcon from '@/assets/nodejs-logo.png'

// Helper function to get action-specific details
const getActionDetails = (action: TNetworkInterceptorAction) => {
    // Determine badge icon
    const BadgeIcon = action.type === 'http' ? Globe : Wifi

    // Create readable label
    const label = `${action.type.toUpperCase()} ${action.action} Interceptor`

    // Create badge variant
    const badgeVariant = action.action === 'request' ? ('default' as const) : ('secondary' as const)

    return {
        label,
        badgeIcon: BadgeIcon,
        badgeVariant,
        url: action.url,
        type: action.type,
        actionType: action.action
    }
}

function NetworkInterceptorAction({ data }: NodeProps<TNetworkInterceptorAction>) {
    const { label, badgeIcon: BadgeIcon, badgeVariant, url, type, actionType } = getActionDetails(data)

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
                        <img
                            src={nodejsIcon}
                            alt="Network"
                            className="w-5 h-5"
                        />
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    </div>
                    <Badge
                        variant={badgeVariant}
                        className="text-xs px-2 py-0.5 gap-1">
                        <BadgeIcon className="w-3 h-3" />
                    </Badge>
                </CardHeader>

                <CardContent className="pt-2">
                    <div className="text-xs text-muted-foreground wrap-break-words">{url.length > 50 ? `${url.substring(0, 50)}...` : url}</div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                        {type.toUpperCase()} • {actionType}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default NetworkInterceptorAction
