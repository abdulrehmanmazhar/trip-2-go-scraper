import mongoose, { Document, Schema } from 'mongoose'

export interface ICountry extends Document {
    name: string
    abbr: string
    icon: string
}

const CountrySchema = new Schema<ICountry>(
    {
        name: {
            type: String,
            required: [true, 'Please enter country name']
        },
        abbr: {
            type: String,
            required: [true, 'Please enter country abbreviation'],
            unique: true
        },
        icon: {
            type: String,
            required: [true, 'Please enter the icon for each country'],
            unique: true
        }
    },
    { timestamps: true }
)
const CountryModel = mongoose.model<ICountry>('Country', CountrySchema)

export default CountryModel
