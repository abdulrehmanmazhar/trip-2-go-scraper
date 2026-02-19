'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Plus, Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

// -----------------------------
// Types
// -----------------------------

export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled'

export type AppointmentStatus = 'Booked' | 'Not Booked'

export interface Application {
    _id: string
    username: string
    email: string
    passportNumber: string
    stayedCountry: string
    destinationCountry: string
    appointmentStatus: AppointmentStatus
    appointment: {
        name: string
        abbr: string
        code: number
        consulate: string
        type: 'parent' | 'child'
        parentId: string | null
        price: string
        availableSlotsUTC: string[]
        fetchedAt: string
    }
    startDate: string
    endDate: string
    tag: string
    payment: {
        amount: number
        currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD'
        paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Online' | 'Cheque'
        paymentType: 'Full' | 'Partial' | 'Deposit' | 'Installment'
        status: PaymentStatus
        receiptNumber: string
        dueDate?: string
        paidAt?: string
    }
}

// -----------------------------
// Dummy Data (Independent Page)
// -----------------------------

const applications: Application[] = [
    {
        _id: '1',
        username: 'Abdurrahman Mazhar',
        email: 'abdulrehmanmazhar02@gmail.com',
        passportNumber: 'PA1234567',
        stayedCountry: 'Pakistan',
        destinationCountry: 'Italy',
        appointmentStatus: 'Booked',
        appointment: {
            name: 'Italy National Visa',
            abbr: 'IT-NV',
            code: 101,
            consulate: 'consulate-rome',
            type: 'parent',
            parentId: null,
            price: 'price-1',
            availableSlotsUTC: ['2026-03-01T09:00:00Z'],
            fetchedAt: new Date().toISOString()
        },
        startDate: '2026-04-01',
        endDate: '2026-09-30',
        tag: 'Student Visa',
        payment: {
            amount: 120,
            currency: 'EUR',
            paymentMethod: 'Online',
            paymentType: 'Full',
            status: 'Completed',
            receiptNumber: 'REC-001',
            paidAt: '2026-02-10'
        }
    },
    {
        _id: '2',
        username: 'Abdurrahman Mazhar',
        email: 'abdulrehmanmazhar02@gmail.com',
        passportNumber: 'PA1234567',
        stayedCountry: 'Pakistan',
        destinationCountry: 'Germany',
        appointmentStatus: 'Not Booked',
        appointment: {
            name: 'Germany Schengen Visa',
            abbr: 'DE-SV',
            code: 202,
            consulate: 'consulate-berlin',
            type: 'child',
            parentId: '101',
            price: 'price-2',
            availableSlotsUTC: [],
            fetchedAt: new Date().toISOString()
        },
        startDate: '2026-05-10',
        endDate: '2026-06-10',
        tag: 'Tourist Visa',
        payment: {
            amount: 90,
            currency: 'EUR',
            paymentMethod: 'Bank Transfer',
            paymentType: 'Deposit',
            status: 'Pending',
            receiptNumber: 'REC-002',
            dueDate: '2026-02-25'
        }
    }
]

// -----------------------------
// Helper UI Functions
// -----------------------------

const paymentStatusVariant = (status: PaymentStatus) => {
    switch (status) {
        case 'Completed':
            return 'default'
        case 'Pending':
            return 'secondary'
        case 'Failed':
            return 'destructive'
        case 'Refunded':
            return 'outline'
        case 'Cancelled':
            return 'destructive'
        default:
            return 'outline'
    }
}

const appointmentVariant = (status: AppointmentStatus) => {
    return status === 'Booked' ? 'default' : 'outline'
}

// -----------------------------
// Component
// -----------------------------

export default function UserApplications() {
    const [search, setSearch] = useState('')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [appointmentFilter, setAppointmentFilter] = useState<string>('all')

    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const matchesSearch =
                app.username.toLowerCase().includes(search.toLowerCase()) ||
                app.destinationCountry.toLowerCase().includes(search.toLowerCase()) ||
                app.passportNumber.toLowerCase().includes(search.toLowerCase()) ||
                app.appointment.name.toLowerCase().includes(search.toLowerCase())

            const matchesPayment = paymentFilter === 'all' || app.payment.status === paymentFilter

            const matchesAppointment = appointmentFilter === 'all' || app.appointmentStatus === appointmentFilter

            return matchesSearch && matchesPayment && matchesAppointment
        })
    }, [search, paymentFilter, appointmentFilter])

    return (
        <div className="min-h-screen bg-muted/40 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
                        <p className="text-muted-foreground mt-1">Track your visa applications, payments and appointment status.</p>
                    </div>

                    <Button className="rounded-2xl shadow-md">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Application
                    </Button>
                </div>

                {/* Filters */}
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-6 grid md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, country, passport, appointment..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={paymentFilter}
                            onValueChange={setPaymentFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                                <SelectItem value="Refunded">Refunded</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={appointmentFilter}
                            onValueChange={setAppointmentFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Appointment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Appointments</SelectItem>
                                <SelectItem value="Booked">Booked</SelectItem>
                                <SelectItem value="Not Booked">Not Booked</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center text-sm text-muted-foreground">
                            <Filter className="w-4 h-4 mr-2" />
                            {filteredApplications.length} results
                        </div>
                    </CardContent>
                </Card>

                {/* Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredApplications.map((app) => (
                        <motion.div
                            key={app._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}>
                            <Card className="rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{app.destinationCountry}</CardTitle>
                                        <Badge variant={appointmentVariant(app.appointmentStatus)}>{app.appointmentStatus}</Badge>
                                    </div>
                                    <CardDescription>
                                        {app.appointment.name} ({app.appointment.type})
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="flex items-center">
                                            <CalendarDays className="w-4 h-4 mr-1" />
                                            {app.startDate} → {app.endDate}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Payment</span>
                                        <Badge variant={paymentStatusVariant(app.payment.status)}>{app.payment.status}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-medium">
                                            {app.payment.amount} {app.payment.currency}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Method</span>
                                        <span>{app.payment.paymentMethod}</span>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredApplications.length === 0 && (
                    <Card className="rounded-2xl p-10 text-center text-muted-foreground">No applications found.</Card>
                )}
            </div>
        </div>
    )
}
