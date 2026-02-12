import {
    LayoutDashboard,
    Activity,
    Bot,
    Boxes,
    Clock,
    AlertTriangle,
    Workflow,
    Wand2,
    Zap,
    Filter,
    Play,
    Repeat,
    Users,
    Database,
    ArrowLeftRight,
    BarChart3,
    Network,
    ShieldCheck,
    FileText,
    Bug,
    Fingerprint,
    Radar,
    Info
} from 'lucide-react'

import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from '@/components/ui/sidebar'
import { Link } from 'react-router-dom'

export function AppSidebarContent() {
    return (
        <SidebarContent>
            {/* ================= OPERATIONS ================= */}
            <SidebarGroup>
                <SidebarGroupLabel>Operations</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link to={'/'}>
                                <SidebarMenuButton>
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/live-activity'}>
                                <SidebarMenuButton>
                                    <Activity />
                                    <span>Live Activity</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/bots'}>
                                <SidebarMenuButton>
                                    <Bot />
                                    <span>Bots</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Boxes />
                                <span>Bot Instances</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Clock />
                                <span>Schedules</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <AlertTriangle />
                                <span>Incidents & Alerts</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* ================= WORKFLOWS & DATA ================= */}
            <SidebarGroup>
                <SidebarGroupLabel>Workflows & Data</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link to={'/workflows'}>
                                <SidebarMenuButton>
                                    <Workflow />
                                    <span>Workflows</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/workflow-builder'}>
                                <SidebarMenuButton>
                                    <Wand2 />
                                    <span>Workflow Builder</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Zap />
                                <span>Triggers</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Filter />
                                <span>Rules & Conditions</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Play />
                                <span>Actions</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Repeat />
                                <span>Retries & Limits</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/clients'}>
                                <SidebarMenuButton>
                                    <Users />
                                    <span>Clients</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/client-data'}>
                                <SidebarMenuButton>
                                    <Database />
                                    <span>Client Data</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <ArrowLeftRight />
                                <span>Imports / Exports</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* ================= INSIGHTS & CONTROL ================= */}
            <SidebarGroup>
                <SidebarGroupLabel>Insights & Control</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <BarChart3 />
                                <span>Analytics</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Network />
                                <span>Traffic Overview</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <ShieldCheck />
                                <span>Bot vs Human</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <FileText />
                                <span>Execution Logs</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Bug />
                                <span>Error Logs</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Fingerprint />
                                <span>Security Events</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Radar />
                                <span>Detection Rules</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* ================= ABOUT SECTION ================= */}
            <SidebarGroup>
                <SidebarGroupLabel>About & Legal</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Link to={'/about'}>
                                <SidebarMenuButton>
                                    <Info className="h-4 w-4" />
                                    <span>About FIGGO DEV</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/terms'}>
                                <SidebarMenuButton>
                                    <FileText className="h-4 w-4" />
                                    <span>Terms & Conditions</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link to={'/privacy'}>
                                <SidebarMenuButton>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Privacy Policy</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    )
}
