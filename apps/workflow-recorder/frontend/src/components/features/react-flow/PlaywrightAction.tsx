import type { TPlaywrightAction } from '@/types/actions'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    MousePointerClick,
    MousePointer2,
    CheckSquare,
    Square,
    Type,
    Keyboard,
    ChevronDown,
    FileUp,
    Globe,
    ExternalLink,
    XCircle
} from 'lucide-react'
import playwrightIcon from '@/assets/playwright-logo.svg'

// Helper function to get action-specific details with icon
const getActionDetails = (action: TPlaywrightAction) => {
    switch (action.name) {
        case 'click':
            return {
                label: 'Click',
                details: `Button: ${action.button}, Count: ${action.clickCount}`,
                badgeIcon: MousePointerClick,
                badgeVariant: 'default' as const
            }
        case 'hover':
            return {
                label: 'Hover',
                details: 'Hover over element',
                badgeIcon: MousePointer2,
                badgeVariant: 'secondary' as const
            }
        case 'check':
            return {
                label: 'Check',
                details: 'Check checkbox/radio',
                badgeIcon: CheckSquare,
                badgeVariant: 'default' as const
            }
        case 'uncheck':
            return {
                label: 'Uncheck',
                details: 'Uncheck checkbox/radio',
                badgeIcon: Square,
                badgeVariant: 'secondary' as const
            }
        case 'fill':
            return {
                label: 'Fill',
                details: `Text: "${action.text.substring(0, 30)}${action.text.length > 30 ? '...' : ''}"`,
                badgeIcon: Type,
                badgeVariant: 'default' as const
            }
        case 'press':
            return {
                label: 'Press',
                details: `Key: ${action.key}`,
                badgeIcon: Keyboard,
                badgeVariant: 'default' as const
            }
        case 'select':
            return {
                label: 'Select',
                details: `Options: ${action.options.join(', ')}`,
                badgeIcon: ChevronDown,
                badgeVariant: 'default' as const
            }
        case 'setInputFiles':
            return {
                label: 'Set Input Files',
                details: `Files: ${action.files.join(', ')}`,
                badgeIcon: FileUp,
                badgeVariant: 'default' as const
            }
        case 'navigate':
            return {
                label: 'Navigate',
                details: `URL: ${action.url}`,
                badgeIcon: Globe,
                badgeVariant: 'outline' as const
            }
        case 'openPage':
            return {
                label: 'Open Page',
                details: `URL: ${action.url}`,
                badgeIcon: ExternalLink,
                badgeVariant: 'outline' as const
            }
        case 'closePage':
            return {
                label: 'Close Page',
                details: 'Close current page',
                badgeIcon: XCircle,
                badgeVariant: 'secondary' as const
            }
        default:
            return {
                label: 'Unknown',
                details: '',
                badgeIcon: MousePointerClick,
                badgeVariant: 'default' as const
            }
    }
}

function PlaywrightAction({ data }: NodeProps<TPlaywrightAction>) {
    const { label, details, badgeIcon: BadgeIcon, badgeVariant } = getActionDetails(data)

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

            {/* Main Card - removed shadow to match browser action */}
            <Card className="w-65 transition-all">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        {/* Playwright Icon */}
                        <img
                            src={playwrightIcon}
                            alt="Playwright"
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
                    <div className="text-xs text-muted-foreground wrap-break-words">{details || 'No additional details'}</div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PlaywrightAction
