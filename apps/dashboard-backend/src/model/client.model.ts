import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IClient extends Document {
    user: mongoose.Types.ObjectId
    passportNumber: string
    stayedCountry: mongoose.Types.ObjectId
    destinationCountry: mongoose.Types.ObjectId
    payment: mongoose.Types.ObjectId
    assignedGoogleAccount?: mongoose.Types.ObjectId
    appointment: mongoose.Types.ObjectId
    appointmentStatus: 'Booked' | 'Not Booked'
    dateRanges: {
        startDate: Date
        endDate: Date
    }[]
    tag: 'Valid' | 'Expired'
}

const ClientSchema = new Schema<IClient>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required']
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
            required: [true, 'Country reference is required']
        },
        assignedGoogleAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GoogleAccount'
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: [true, 'Appointment reference is required']
        },
        appointmentStatus: {
            type: String,
            enum: {
                values: ['Booked', 'Not Booked'],
                message: 'Appointment status must be either Booked or Not Booked'
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
ClientSchema.index({ user: 1, createdAt: -1 })
ClientSchema.index({ passportNumber: 1 }, { unique: true })
ClientSchema.index({ tag: 1 })
ClientSchema.index({ paymentStatus: 1 })
ClientSchema.index({ appointmentStatus: 1 })

// Virtual for checking if client has any upcoming appointments
ClientSchema.virtual('hasUpcomingDates').get(function (this: IClient) {
    const now = new Date()
    return this.dateRanges.some((range) => range.endDate > now)
})

// Static method to find clients by date range
ClientSchema.statics.findByDateRange = function (startDate: Date, endDate: Date) {
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
ClientSchema.methods.addDateRange = function (this: IClient, startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
        throw new Error('Start date must be before end date')
    }
    this.dateRanges.push({ startDate, endDate })
}

// Add types for static methods
interface ClientModel extends Model<IClient> {
    findByDateRange(startDate: Date, endDate: Date): Promise<IClient[]>
}

const ClientModel: ClientModel = mongoose.model<IClient, ClientModel>('Client', ClientSchema)

export default ClientModel
