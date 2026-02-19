'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default function AppointmentForm() {
    const [form, setForm] = useState({
        name: '',
        abbr: '',
        code: '',
        consulate: '',
        type: 'parent',
        parentId: '',
        price: '',
        availableSlotsUTC: ''
    })

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Appointment Data:', {
            ...form,
            availableSlotsUTC: form.availableSlotsUTC.split(',').map((d) => d.trim()),
            fetchedAt: new Date().toISOString()
        })
    }

    return (
        <div className="min-h-screen bg-muted/40 p-6">
            <div className="max-w-3xl mx-auto">
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Create Appointment
                        </CardTitle>
                        <CardDescription>Configure visa appointment details and slot information.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Appointment Name</Label>
                                    <Input
                                        placeholder="Italy National Visa"
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Abbreviation</Label>
                                    <Input
                                        placeholder="IT-NV"
                                        value={form.abbr}
                                        onChange={(e) => handleChange('abbr', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Code</Label>
                                    <Input
                                        type="number"
                                        placeholder="101"
                                        value={form.code}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Consulate ID</Label>
                                    <Input
                                        placeholder="consulate-rome"
                                        value={form.consulate}
                                        onChange={(e) => handleChange('consulate', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Appointment Type</Label>
                                    <Select
                                        value={form.type}
                                        onValueChange={(value) => handleChange('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="parent">Parent</SelectItem>
                                            <SelectItem value="child">Child</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {form.type === 'child' && (
                                    <div className="space-y-2">
                                        <Label>Parent Appointment ID</Label>
                                        <Input
                                            placeholder="parent-id"
                                            value={form.parentId}
                                            onChange={(e) => handleChange('parentId', e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Price ID</Label>
                                    <Input
                                        placeholder="price-1"
                                        value={form.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Available Slots (comma separated UTC dates)</Label>
                                    <Input
                                        placeholder="2026-03-01T09:00:00Z, 2026-03-02T10:00:00Z"
                                        value={form.availableSlotsUTC}
                                        onChange={(e) => handleChange('availableSlotsUTC', e.target.value)}
                                    />
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
                                    Save Appointment
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
