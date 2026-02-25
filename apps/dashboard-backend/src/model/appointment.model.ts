import mongoose, { Document, Schema } from 'mongoose'

export interface IAppointment extends Document {
    name: string
    abbr: string
    code: number
    consulate: mongoose.Types.ObjectId
    type: 'parent' | 'first-child'
    parentId: null | mongoose.Types.ObjectId
    price: mongoose.Types.ObjectId
    availableSlotsUTC: Date[]
    platform: 'VFS' | 'TLS'
    fetchedAt: Date
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        name: {
            type: String,
            required: [true, 'Please enter appointment name']
        },
        abbr: {
            type: String,
            required: [true, 'Please enter appointment abbreviation'],
            unique: true
        },
        code: {
            type: Number,
            required: [true, 'Please enter appointment code'],
            unique: true
        },
        consulate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Consulate',
            required: [true, 'Consulate reference is required']
        },
        type: {
            type: String,
            enum: {
                values: ['parent', 'first-child'],
                message: 'Appointment status must be either Booked or Not Booked'
            },
            default: 'parent',
            required: [true, 'Appointment type is required']
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: [true, 'Appointment reference is required'],
            default: null
        },
        price: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Price',
            required: [true, 'Price reference is required']
        },
        availableSlotsUTC: {
            type: [Date],
            default: []
        },
        platform: {
            type: String,
            enum: {
                values: ['VFS', 'TLS'],
                message: 'Platform must be either VFS or TLS'
            },
            required: [true, 'Platform is required']
        },
        fetchedAt: {
            type: Date,
            required: [true, 'Fetched At date is required'],
            default: Date.now
        }
    },
    { timestamps: true }
)
const AppointmentModel = mongoose.model<IAppointment>('Appointment', AppointmentSchema)

export default AppointmentModel
