import { Sidebar, SidebarHeader } from '@/components/ui/sidebar'
import { AppSidebarContent } from './AppSidebarContent'
import { AppSidebarFooter } from './AppSidebarFooter'
import constants from '@/constants'

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <div className="flex items-center gap-3">
                    <img
                        src={constants.LOGO_SRC}
                        alt={constants.NAME}
                        className="h-8 w-8 object-contain"
                    />
                    <span className="text-lg font-semibold tracking-tight">{constants.NAME}</span>
                </div>
            </SidebarHeader>

            <AppSidebarContent />

            <AppSidebarFooter />
        </Sidebar>
    )
}
