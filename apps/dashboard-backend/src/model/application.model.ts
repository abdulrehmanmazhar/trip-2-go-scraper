import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IApplication extends Document {
    user: mongoose.Types.ObjectId
    firstName: string
    lastName: string
    nationality: mongoose.Types.ObjectId
    contactNumber: {
        countryCode: string
        number: string
    }
    passportNumber: string
    stayedCountry: mongoose.Types.ObjectId
    destinationCountry: mongoose.Types.ObjectId
    payment: mongoose.Types.ObjectId | null
    appointment: mongoose.Types.ObjectId
    bookedDate: Date | null
    appointmentStatus: 'Booked' | 'Not Booked' | 'Failed'
    dateRanges: {
        startDate: Date
        endDate: Date
        timeRange: {
            startTime: string
            endTime: string
        } | null
    }[]
    tag: 'Valid' | 'Expired'
}

const ApplicationSchema = new Schema<IApplication>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required']
        },
        firstName: {
            type: String,
            required: [true, 'First name is required']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required']
        },
        nationality: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country reference is required']
        },
        contactNumber: {
            countryCode: {
                type: String,
                required: [true, 'Country code is required'],
                trim: true
            },
            number: {
                type: String,
                required: [true, 'Contact number is required'],
                trim: true
            }
        },
        passportNumber: {
            type: String,
            required: [true, 'Passport number is required'],
            unique: true,
            trim: true,
            uppercase: true
        },
        stayedCountry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country reference is required']
        },
        destinationCountry: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country reference is required']
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            // required: [true, 'Payment reference is required']
            default: null
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: [true, 'Appointment reference is required']
        },
        bookedDate: {
            type: Date,
            default: null
        },
        appointmentStatus: {
            type: String,
            enum: {
                values: ['Booked', 'Not Booked', 'Failed'],
                message: 'Appointment status must be either Booked, Not Booked, or Failed'
            },
            default: 'Not Booked',
            required: [true, 'Appointment status is required']
        },
        dateRanges: {
            type: [
                {
                    startDate: {
                        type: Date,
                        required: [true, 'Start date is required for date range']
                    },
                    endDate: {
                        type: Date,
                        required: [true, 'End date is required for date range']
                    },
                    timeRange: {
                        startTime: {
                            type: String,
                            required: [true, 'Start time is required for date range']
                        },
                        endTime: {
                            type: String,
                            required: [true, 'End time is required for date range']
                        },
                        default: null
                    }
                }
            ],
            default: [],
            validate: {
                validator: function (dates: { startDate: Date; endDate: Date }[]) {
                    return dates.every((dateRange) => dateRange.startDate <= dateRange.endDate)
                },
                message: 'Start date must be before or equal to end date for all date ranges'
            }
        },
        tag: {
            type: String,
            enum: {
                values: ['Valid', 'Expired'],
                message: 'Tag must be either Valid or Expired'
            },
            default: 'Valid',
            required: [true, 'Tag is required']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Index for better query performance
ApplicationSchema.index({ user: 1, createdAt: -1 })
ApplicationSchema.index({ passportNumber: 1 }, { unique: true })
ApplicationSchema.index({ tag: 1 })
ApplicationSchema.index({ paymentStatus: 1 })
ApplicationSchema.index({ appointmentStatus: 1 })

// Virtual for checking if client has any upcoming appointments
ApplicationSchema.virtual('hasUpcomingDates').get(function (this: IApplication) {
    const now = new Date()
    return this.dateRanges.some((range) => range.endDate > now)
})

// Static method to find clients by date range
ApplicationSchema.statics.findByDateRange = function (startDate: Date, endDate: Date) {
    return this.find({
        dateRanges: {
            $elemMatch: {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            }
        }
    })
}

// Method to add a new date range
ApplicationSchema.methods.addDateRange = function (this: IApplication, startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
        throw new Error('Start date must be before end date')
    }
    this.dateRanges.push({ startDate, endDate, timeRange: null })
}

// Add types for static methods
interface ApplicationModel extends Model<IApplication> {
    findByDateRange(startDate: Date, endDate: Date): Promise<IApplication[]>
}

const ApplicationModel: ApplicationModel = mongoose.model<IApplication, ApplicationModel>('Application', ApplicationSchema)

export default ApplicationModel
