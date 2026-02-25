import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon } from 'lucide-react'
import UserFooter from '@/components/features/user-footer'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import User from '@/components/features/user'

function AppointmentForm() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between px-6 py-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Appointment Form</h1>
                        <p className="text-muted-foreground text-sm">Fill the form to book appointment.</p>
                    </div>
                    <User />
                </div>
            </div>

            {/* Content  */}
            <div className="min-h-screen bg-muted/30 px-6 md:px-16 py-12">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Personal Information */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-semibold border-b pb-3">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input placeholder="Enter first name" />
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input placeholder="Enter last name" />
                            </div>

                            <div className="space-y-2">
                                <Label>Nationality</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select nationality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Pakistan</SelectItem>
                                        <SelectItem value="2">Italy</SelectItem>
                                        <SelectItem value="3">Germany</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Passport Number</Label>
                                <Input placeholder="Enter passport number" />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-semibold border-b pb-3">Contact Details</h2>

                        <div className="flex gap-4 max-w-xl">
                            <Input
                                className="w-28"
                                placeholder="+92"
                            />
                            <Input placeholder="Enter phone number" />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-semibold border-b pb-3">Travel Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label>From</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Pakistan</SelectItem>
                                        <SelectItem value="2">UAE</SelectItem>
                                        <SelectItem value="3">Turkey</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>To</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Italy</SelectItem>
                                        <SelectItem value="2">Germany</SelectItem>
                                        <SelectItem value="3">France</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Appointment */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-semibold border-b pb-3">Appointment Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label>Consulate</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select consulate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Islamabad</SelectItem>
                                        <SelectItem value="2">Lahore</SelectItem>
                                        <SelectItem value="3">Karachi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Appointment Category</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Student Visa</SelectItem>
                                        <SelectItem value="2">Work Visa</SelectItem>
                                        <SelectItem value="3">Tourist Visa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Sub Category</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Long Term</SelectItem>
                                        <SelectItem value="2">Short Term</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* Date Ranges */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-xl font-semibold">Preferred Date & Time Ranges</h2>
                            <Button
                                variant="outline"
                                size="sm">
                                Add Range
                            </Button>
                        </div>

                        {[1].map((range) => (
                            <div
                                key={range}
                                className="bg-background border rounded-xl p-6 space-y-6 relative">
                                {/* Remove button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4">
                                    ✕
                                </Button>

                                {/* Date Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    Pick start date
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    Pick end date
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Time Section */}
                                <div className="border-t pt-6 space-y-6">
                                    <h4 className="text-sm font-medium text-muted-foreground">Preferred Time</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                        <div className="space-y-2">
                                            <Label>Start Time</Label>
                                            {/* <Input
                                            type="time"
                                            className="w-full"
                                        /> */}
                                            <Select>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select start time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="08:00">08:00 AM</SelectItem>
                                                    <SelectItem value="08:30">08:30 AM</SelectItem>
                                                    <SelectItem value="09:00">09:00 AM</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>End Time</Label>

                                            <Select>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select end time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="08:00">08:00 AM</SelectItem>
                                                    <SelectItem value="08:30">08:30 AM</SelectItem>
                                                    <SelectItem value="09:00">09:00 AM</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center space-x-3 pt-6">
                                            <Checkbox id={`any-time-${range}`} />
                                            <Label
                                                htmlFor={`any-time-${range}`}
                                                className="text-sm font-medium cursor-pointer">
                                                Any Time
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Agreements */}
                    <div className="space-y-6 border-t pt-8">
                        <h3 className="text-sm font-semibold">Declarations & Agreements</h3>

                        <div className="space-y-4">
                            {/* Platform Policy */}
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="platform-policy"
                                    className="mt-1"
                                />

                                <Label
                                    htmlFor="platform-policy"
                                    className="text-sm leading-relaxed cursor-pointer">
                                    I confirm that I have read, understood, and agree to the platform’s terms of service, privacy policy, and
                                    appointment booking policies. I acknowledge that fees paid for appointment scheduling are subject to the
                                    platform’s refund and cancellation guidelines.
                                </Label>
                            </div>

                            {/* Government Declaration */}
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="government-terms"
                                    className="mt-1"
                                />

                                <Label
                                    htmlFor="government-terms"
                                    className="text-sm leading-relaxed cursor-pointer">
                                    I declare that the information provided in this application is true, complete, and accurate to the best of my
                                    knowledge. I understand that submitting false or misleading information may result in appointment cancellation or
                                    legal action by the respective consular authorities.
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-8 border-t mt-10">
                        <Link to={ROUTES.USER.DASHBOARD}>
                            <Button
                                type="button"
                                variant="secondary"
                                size="default"
                                className="h-10 px-6">
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            className="h-10 px-8 font-medium">
                            Submit Application
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer  */}
            <UserFooter />
        </div>
    )
}

export default AppointmentForm
