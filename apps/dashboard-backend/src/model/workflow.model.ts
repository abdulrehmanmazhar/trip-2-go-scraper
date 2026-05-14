import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IWorkflow extends Document {
    name: string
    description: string
    thumbnail?: string
    applicationCountry: Types.ObjectId
    destinationCountry: Types.ObjectId
    /** MinIO object key inside the `workflows` bucket (workflow definition JSON). */
    objectKey: string
}

const WorkflowSchema = new Schema<IWorkflow>(
    {
        name: {
            type: String,
            required: [true, 'Workflow name is required'],
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        thumbnail: {
            type: String
        },
        applicationCountry: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Application country is required']
        },
        destinationCountry: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Destination country is required']
        },
        objectKey: {
            type: String,
            required: [true, 'Workflow object key is required'],
            unique: true
        }
    },
    { timestamps: true }
)

const WorkflowModel = mongoose.model<IWorkflow>('Workflow', WorkflowSchema)

export default WorkflowModel
