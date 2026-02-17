import mongoose, { Document, Schema } from 'mongoose'

export interface IConsulate extends Document {
    name: string
    abbr: string
    location: string
    ambassadorOf: mongoose.Types.ObjectId
    ambassadorTo: mongoose.Types.ObjectId
}

const ConsulateSchema = new Schema<IConsulate>(
    {
        name: {
            type: String,
            required: [true, 'Please enter consulate name']
        },
        abbr: {
            type: String,
            required: [true, 'Please enter consulate abbreviation'],
            unique: true
        },
        location: {
            type: String,
            required: [true, 'Please enter consulate location'],
            unique: true
        },
        ambassadorOf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country reference is required']
        },
        ambassadorTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country reference is required']
        }
    },
    { timestamps: true }
)
const ConsulateModel = mongoose.model<IConsulate>('Consulate', ConsulateSchema)

export default ConsulateModel
