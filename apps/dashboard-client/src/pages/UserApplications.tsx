import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowRight,
    MoreVertical,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    PlusCircle,
    Search,
    GraduationCap,
    Briefcase,
    FileText,
    Map
} from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useState } from 'react'
import UserFooter from '@/components/features/user-footer'
import User from '@/components/features/user'

interface Country {
    _id: string
    name: string
}

interface Price {
    amount: number
    currency: string
}

interface Appointment {
    _id: string
    name: string
    abbr: string
    price: Price
    platform: 'VFS' | 'TLS'
}

interface ApplicationCardProps {
    app: {
        _id: string
        stayedCountry: Country
        destinationCountry: Country
        appointment: Appointment
        appointmentStatus: 'Booked' | 'Not Booked' | 'Failed'
        payment: string | null
        dateRanges: { startDate: Date; endDate: Date }[]
        createdAt: Date
    }
}

export const dummyApplications: ApplicationCardProps['app'][] = [
    {
        _id: 'app_001',
        stayedCountry: {
            _id: 'country_pk',
            name: 'Pakistan'
        },
        destinationCountry: {
            _id: 'country_it',
            name: 'Italy'
        },
        appointment: {
            _id: 'apt_student_it',
            name: 'Student Visa',
            abbr: 'SV',
            price: {
                amount: 150,
                currency: 'EUR'
            },
            platform: 'VFS'
        },
        appointmentStatus: 'Booked',
        payment: 'payment_001',
        dateRanges: [
            {
                startDate: new Date('2026-03-01'),
                endDate: new Date('2026-03-15')
            }
        ],
        createdAt: new Date('2026-02-10')
    },
    {
        _id: 'app_002',
        stayedCountry: {
            _id: 'country_de',
            name: 'Germany'
        },
        destinationCountry: {
            _id: 'country_fr',
            name: 'France'
        },
        appointment: {
            _id: 'apt_tourist_fr',
            name: 'Tourist Visa',
            abbr: 'TV',
            price: {
                amount: 120,
                currency: 'EUR'
            },
            platform: 'TLS'
        },
        appointmentStatus: 'Not Booked',
        payment: null,
        dateRanges: [
            {
                startDate: new Date('2026-04-01'),
                endDate: new Date('2026-04-10')
            }
        ],
        createdAt: new Date('2026-02-18')
    },
    {
        _id: 'app_003',
        stayedCountry: {
            _id: 'country_ae',
            name: 'UAE'
        },
        destinationCountry: {
            _id: 'country_de',
            name: 'Germany'
        },
        appointment: {
            _id: 'apt_work_de',
            name: 'Work Visa',
            abbr: 'WV',
            price: {
                amount: 200,
                currency: 'EUR'
            },
            platform: 'VFS'
        },
        appointmentStatus: 'Failed',
        payment: 'payment_003',
        dateRanges: [
            {
                startDate: new Date('2026-01-20'),
                endDate: new Date('2026-01-25')
            }
        ],
        createdAt: new Date('2026-01-05')
    },
    {
        _id: 'app_004',
        stayedCountry: {
            _id: 'country_tr',
            name: 'Turkey'
        },
        destinationCountry: {
            _id: 'country_es',
            name: 'Spain'
        },
        appointment: {
            _id: 'apt_business_es',
            name: 'Business Visa',
            abbr: 'BV',
            price: {
                amount: 180,
                currency: 'EUR'
            },
            platform: 'TLS'
        },
        appointmentStatus: 'Booked',
        payment: 'payment_004',
        dateRanges: [
            {
                startDate: new Date('2026-05-05'),
                endDate: new Date('2026-05-12')
            }
        ],
        createdAt: new Date('2026-02-20')
    }
]

function StatusBadge({ status }: { status: 'Booked' | 'Not Booked' | 'Failed' }) {
    const icon =
        status === 'Booked' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
        ) : status === 'Failed' ? (
            <XCircle className="w-3.5 h-3.5" />
        ) : (
            <AlertCircle className="w-3.5 h-3.5" />
        )

    const variant = status === 'Booked' ? 'default' : status === 'Failed' ? 'destructive' : 'secondary'

    return (
        <Badge
            variant={variant}
            className="gap-1 text-[11px] px-2 py-0.5">
            {icon}
            {status}
        </Badge>
    )
}

function PaymentBadge({ paid }: { paid: boolean }) {
    return (
        <Badge
            variant={paid ? 'default' : 'secondary'}
            className="text-[11px] px-2 py-0.5">
            {paid ? 'Paid' : 'Unpaid'}
        </Badge>
    )
}

const getThumbnail = (type: string) => {
    switch (type) {
        case 'Student Visa':
            return {
                icon: GraduationCap,
                bg: 'bg-primary/5'
            }
        case 'Work Visa':
            return {
                icon: Briefcase,
                bg: 'bg-muted'
            }
        case 'Tourist Visa':
            return {
                icon: Map,
                bg: 'bg-accent/40'
            }
        default:
            return {
                icon: FileText,
                bg: 'bg-muted'
            }
    }
}

function ApplicationCard({ app }: ApplicationCardProps) {
    const firstRange = app.dateRanges?.[0]
    const thumbnail = getThumbnail(app.appointment.name)
    const Icon = thumbnail.icon

    return (
        <Card className="h-full border-border/60 hover:shadow-md transition-all rounded-xl overflow-hidden">
            {/* Thumbnail */}
            <div className={`relative h-24 flex items-center justify-between px-4 border-b overflow-hidden ${thumbnail.bg}`}>
                {/* Decorative Center Icon */}
                <Icon
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-foreground/5 pointer-events-none"
                    aria-hidden
                />

                {/* Left Content */}
                <div className="relative z-10">
                    <p className="text-xs text-muted-foreground">{app.appointment.platform}</p>
                    <p className="font-semibold text-sm">{app.appointment.abbr}</p>
                </div>

                {/* Right Badges */}
                <div className="relative z-10 flex flex-col items-end gap-2">
                    <PaymentBadge paid={!!app.payment} />
                    <StatusBadge status={app.appointmentStatus} />
                </div>
            </div>

            <CardHeader className="px-4 py-3 space-y-2">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        {/* Route */}
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{app.stayedCountry.name}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                            <span>{app.destinationCountry.name}</span>
                        </div>

                        <p className="text-xs text-muted-foreground">Applied on {format(new Date(app.createdAt), 'PPP')}</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-0 space-y-4">
                {/* Progress */}

                {/* Preferred Date */}
                {firstRange && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            Preferred: {format(new Date(firstRange.startDate), 'PPP')} – {format(new Date(firstRange.endDate), 'PPP')}
                        </span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-semibold">
                            {app.appointment.price.amount} {app.appointment.price.currency}
                        </p>
                    </div>

                    <Link to={`${ROUTES.USER.PAYMENT}/${app._id}`}>
                        <Button size="sm">Manage</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default function UserApplications() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [platform, setPlatform] = useState('all')
    const [sort, setSort] = useState('latest')

    const filteredApplications = dummyApplications
        .filter((app) => {
            const matchesSearch =
                app.destinationCountry.name.toLowerCase().includes(search.toLowerCase()) ||
                app.stayedCountry.name.toLowerCase().includes(search.toLowerCase())

            const matchesStatus = status === 'all' || app.appointmentStatus === status

            const matchesPlatform = platform === 'all' || app.appointment.platform === platform

            return matchesSearch && matchesStatus && matchesPlatform
        })
        .sort((a, b) => {
            if (sort === 'latest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })

    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Applications</h1>
                        <p className="text-muted-foreground text-sm">Manage your appointment applications.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to={ROUTES.USER.APPOINTMENT}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2">
                                <PlusCircle className="w-4 h-4" />
                                New Appointment
                            </Button>
                        </Link>

                        <User />
                    </div>
                </div>
            </div>

            {/* Filters (NOT sticky) */}
            <div className="border-b bg-muted/30">
                <div className="container px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                        {/* Search */}
                        <div className="relative w-full lg:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select
                            value={status}
                            onValueChange={setStatus}>
                            <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Booked">Booked</SelectItem>
                                <SelectItem value="Not Booked">Not Booked</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Platform Filter */}
                        <Select
                            value={platform}
                            onValueChange={setPlatform}>
                            <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Platforms</SelectItem>
                                <SelectItem value="VFS">VFS</SelectItem>
                                <SelectItem value="TLS">TLS</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort */}
                        <Select
                            value={sort}
                            onValueChange={setSort}>
                            <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">Latest</SelectItem>
                                <SelectItem value="oldest">Oldest</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Reset */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('')
                                setStatus('all')
                                setPlatform('all')
                                setSort('latest')
                            }}>
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 container px-6 py-6">
                {filteredApplications.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">No applications found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredApplications.map((app) => (
                            <ApplicationCard
                                key={app._id}
                                app={app}
                            />
                        ))}
                    </div>
                )}
            </div>

            <UserFooter />
        </div>
    )
}
