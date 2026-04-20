import type { TInterruptionAction } from '@/types/actions'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertOctagon } from 'lucide-react'

// Helper function to get action-specific details
const getActionDetails = (action: TInterruptionAction) => {
    return {
        label: 'Interruption',
        badgeIcon: AlertOctagon,
        badgeVariant: 'destructive' as const,
        timeout: action.timeout,
        resolveSelector: action.resolve.selector,
        resolveAttr: action.resolve.attr
    }
}

function InterruptionAction({ data }: NodeProps<TInterruptionAction>) {
    const { label, badgeIcon: BadgeIcon, badgeVariant, timeout, resolveSelector, resolveAttr } = getActionDetails(data)

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
                        <AlertOctagon className="w-5 h-5 text-destructive" />
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    </div>
                    <Badge
                        variant={badgeVariant}
                        className="text-xs px-2 py-0.5 gap-1">
                        <BadgeIcon className="w-3 h-3" />
                    </Badge>
                </CardHeader>

                <CardContent className="pt-2">
                    <div className="text-xs text-muted-foreground">Timeout: {timeout}ms</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Resolve: {resolveSelector} ({resolveAttr})
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default InterruptionAction
