'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'

export default function PaymentForm() {
    const [form, setForm] = useState({
        userId: '',
        appointmentId: '',
        amount: '',
        currency: 'EUR',
        status: 'pending',
        transactionId: ''
    })

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Payment Data:', {
            ...form,
            amount: Number(form.amount),
            paidAt: new Date().toISOString()
        })
    }

    return (
        <div className="min-h-screen bg-muted/40 p-6">
            <div className="max-w-2xl mx-auto">
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Entry
                        </CardTitle>
                        <CardDescription>Record and manage appointment payments.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6">
                            <div className="space-y-2">
                                <Label>User ID</Label>
                                <Input
                                    placeholder="user-123"
                                    value={form.userId}
                                    onChange={(e) => handleChange('userId', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Appointment ID</Label>
                                <Input
                                    placeholder="appointment-456"
                                    value={form.appointmentId}
                                    onChange={(e) => handleChange('appointmentId', e.target.value)}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="120"
                                        value={form.amount}
                                        onChange={(e) => handleChange('amount', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Input
                                        placeholder="EUR"
                                        value={form.currency}
                                        onChange={(e) => handleChange('currency', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Transaction ID</Label>
                                <Input
                                    placeholder="txn_987654"
                                    value={form.transactionId}
                                    onChange={(e) => handleChange('transactionId', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex gap-3">
                                    <Badge
                                        variant={form.status === 'pending' ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => handleChange('status', 'pending')}>
                                        Pending
                                    </Badge>
                                    <Badge
                                        variant={form.status === 'completed' ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => handleChange('status', 'completed')}>
                                        Completed
                                    </Badge>
                                    <Badge
                                        variant={form.status === 'failed' ? 'destructive' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => handleChange('status', 'failed')}>
                                        Failed
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl shadow-md">
                                    Save Payment
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
