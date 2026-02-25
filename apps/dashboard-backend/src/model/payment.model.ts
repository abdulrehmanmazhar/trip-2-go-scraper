import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
    client: mongoose.Types.ObjectId
    user: mongoose.Types.ObjectId
    amount: number
    currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD'
    paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Online' | 'Cheque'
    paymentType: 'Full' | 'Partial' | 'Deposit' | 'Installment'
    transactionId?: string
    receiptNumber: string
    status: 'Completed' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled'
    description?: string
    taxes?: {
        name: string
        rate: number
        amount: number
    }[]
    discount?: {
        type: 'Percentage' | 'Fixed'
        value: number
        amount: number
        reason?: string
    }
    refunds?: {
        amount: number
        reason: string
        date: Date
        transactionId?: string
        processedBy: mongoose.Types.ObjectId
    }[]
    metadata?: {
        ipAddress?: string
        userAgent?: string
        paymentGateway?: string
        gatewayResponse?: unknown
    }
    paidBy: {
        name: string
        email?: string
        phone?: string
    }
    receivedBy: mongoose.Types.ObjectId
    notes?: string
    attachments?: {
        filename: string
        url: string
        uploadedAt: Date
    }[]
    dueDate?: Date
    paidAt?: Date
    refundedAt?: Date
}

// Interface for payment summary aggregation
export interface IPaymentSummary {
    totalAmount: number
    completedAmount: number
    pendingAmount: number
    refundedAmount: number
    count: number
}

const PaymentSchema = new Schema<IPayment>(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client reference is required'],
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true
        },
        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0.01, 'Amount must be greater than 0'],
            validate: {
                validator: function (value: number) {
                    return value > 0
                },
                message: 'Amount must be positive'
            }
        },
        currency: {
            type: String,
            enum: {
                values: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'CAD', 'AUD'],
                message: '{VALUE} is not a supported currency'
            },
            default: 'USD',
            required: [true, 'Currency is required']
        },
        paymentMethod: {
            type: String,
            enum: {
                values: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online', 'Cheque'],
                message: '{VALUE} is not a valid payment method'
            },
            required: [true, 'Payment method is required']
        },
        paymentType: {
            type: String,
            enum: {
                values: ['Full', 'Partial', 'Deposit', 'Installment'],
                message: '{VALUE} is not a valid payment type'
            },
            required: [true, 'Payment type is required']
        },
        transactionId: {
            type: String,
            sparse: true,
            trim: true
        },
        receiptNumber: {
            type: String,
            required: [true, 'Receipt number is required'],
            unique: true,
            trim: true
        },
        status: {
            type: String,
            enum: {
                values: ['Completed', 'Pending', 'Failed', 'Refunded', 'Cancelled'],
                message: '{VALUE} is not a valid status'
            },
            default: 'Pending',
            required: [true, 'Payment status is required'],
            index: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        taxes: [
            {
                name: {
                    type: String,
                    required: [true, 'Tax name is required']
                },
                rate: {
                    type: Number,
                    required: [true, 'Tax rate is required'],
                    min: [0, 'Tax rate cannot be negative'],
                    max: [100, 'Tax rate cannot exceed 100%']
                },
                amount: {
                    type: Number,
                    required: [true, 'Tax amount is required'],
                    min: [0, 'Tax amount cannot be negative']
                }
            }
        ],
        discount: {
            type: {
                type: String,
                enum: ['Percentage', 'Fixed'],
                required: function (this: IPayment) {
                    return this.discount && this.discount.value !== undefined
                }
            },
            value: {
                type: Number,
                min: [0, 'Discount value cannot be negative'],
                required: function (this: IPayment) {
                    return this.discount && this.discount.type !== undefined
                }
            },
            amount: {
                type: Number,
                min: [0, 'Discount amount cannot be negative'],
                required: function (this: IPayment) {
                    return this.discount && this.discount.value !== undefined
                }
            },
            reason: {
                type: String,
                trim: true
            }
        },
        refunds: [
            {
                amount: {
                    type: Number,
                    required: [true, 'Refund amount is required'],
                    min: [0.01, 'Refund amount must be greater than 0']
                },
                reason: {
                    type: String,
                    required: [true, 'Refund reason is required'],
                    trim: true
                },
                date: {
                    type: Date,
                    default: Date.now,
                    required: [true, 'Refund date is required']
                },
                transactionId: {
                    type: String,
                    trim: true
                },
                processedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: [true, 'Processor reference is required']
                }
            }
        ],
        metadata: {
            ipAddress: String,
            userAgent: String,
            paymentGateway: String,
            gatewayResponse: Schema.Types.Mixed
        },
        paidBy: {
            name: {
                type: String,
                required: [true, 'Payer name is required'],
                trim: true
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
            },
            phone: {
                type: String,
                trim: true
            }
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver reference is required'],
            index: true
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters']
        },
        attachments: [
            {
                filename: {
                    type: String,
                    required: [true, 'Filename is required']
                },
                url: {
                    type: String,
                    required: [true, 'File URL is required']
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        dueDate: {
            type: Date,
            validate: {
                validator: function (this: IPayment, value: Date) {
                    return !value || value >= new Date(new Date().setHours(0, 0, 0, 0))
                },
                message: 'Due date cannot be in the past'
            }
        },
        paidAt: {
            type: Date
        },
        refundedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Compound indexes for common queries
PaymentSchema.index({ client: 1, status: 1, createdAt: -1 })
PaymentSchema.index({ user: 1, status: 1, createdAt: -1 })
PaymentSchema.index({ receivedBy: 1, createdAt: -1 })
PaymentSchema.index({ paymentMethod: 1, status: 1 })
PaymentSchema.index({ dueDate: 1 }, { sparse: true })
PaymentSchema.index({ 'refunds.date': 1 })

// Pre-save middleware to generate receipt number if not provided
PaymentSchema.pre('save', async function () {
    if (!this.receiptNumber) {
        const date = new Date()
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const count = await mongoose.model('Payment').countDocuments()
        this.receiptNumber = `RCP-${year}${month}-${(count + 1).toString().padStart(6, '0')}`
    }

    // Set paidAt if status is Completed and not already set
    if (this.status === 'Completed' && !this.paidAt) {
        this.paidAt = new Date()
    }

    // Set refundedAt if status is Refunded
    if (this.status === 'Refunded' && !this.refundedAt) {
        this.refundedAt = new Date()
    }
})

// // Virtual for net amount (after taxes and discounts)
// PaymentSchema.virtual('netAmount').get(function (this: IPayment) {
//     let netAmount = this.amount

//     // Apply discount
//     if (this.discount && this.discount.amount) {
//         netAmount -= this.discount.amount
//     }

//     // Apply taxes
//     if (this.taxes && this.taxes.length > 0) {
//         const taxTotal = this.taxes.reduce((sum, tax) => sum + tax.amount, 0)
//         netAmount += taxTotal
//     }

//     return netAmount
// })

// // Virtual for total refunded amount
// PaymentSchema.virtual('totalRefunded').get(function (this: IPayment) {
//     if (!this.refunds || this.refunds.length === 0) return 0
//     return this.refunds.reduce((sum, refund) => sum + refund.amount, 0)
// })

// // Virtual for remaining amount (if partial payments/refunds)
// PaymentSchema.virtual('remainingAmount').get(function (this: IPayment) {
//     const netAmount = this.netAmount
//     const totalRefunded = this.totalRefunded
//     return netAmount - totalRefunded
// })

// // Static methods
// interface PaymentModel extends Model<IPayment> {
//     getSummaryByClient(clientId: string): Promise<IPaymentSummary>
//     getSummaryByDateRange(startDate: Date, endDate: Date): Promise<IPaymentSummary>
//     getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year'): Promise<any[]>
// }

// // Get payment summary for a client
// PaymentSchema.statics.getSummaryByClient = async function (clientId: string): Promise<IPaymentSummary> {
//     const result = await this.aggregate([
//         { $match: { client: new mongoose.Types.ObjectId(clientId) } },
//         {
//             $group: {
//                 _id: null,
//                 totalAmount: { $sum: '$amount' },
//                 completedAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Completed'] }, '$amount', 0]
//                     }
//                 },
//                 pendingAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0]
//                     }
//                 },
//                 refundedAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Refunded'] }, '$amount', 0]
//                     }
//                 },
//                 count: { $sum: 1 }
//             }
//         }
//     ])

//     return (
//         result[0] || {
//             totalAmount: 0,
//             completedAmount: 0,
//             pendingAmount: 0,
//             refundedAmount: 0,
//             count: 0
//         }
//     )
// }

// // Get payment summary by date range
// PaymentSchema.statics.getSummaryByDateRange = async function (startDate: Date, endDate: Date): Promise<IPaymentSummary> {
//     const result = await this.aggregate([
//         {
//             $match: {
//                 createdAt: { $gte: startDate, $lte: endDate }
//             }
//         },
//         {
//             $group: {
//                 _id: null,
//                 totalAmount: { $sum: '$amount' },
//                 completedAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Completed'] }, '$amount', 0]
//                     }
//                 },
//                 pendingAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0]
//                     }
//                 },
//                 refundedAmount: {
//                     $sum: {
//                         $cond: [{ $eq: ['$status', 'Refunded'] }, '$amount', 0]
//                     }
//                 },
//                 count: { $sum: 1 }
//             }
//         }
//     ])

//     return (
//         result[0] || {
//             totalAmount: 0,
//             completedAmount: 0,
//             pendingAmount: 0,
//             refundedAmount: 0,
//             count: 0
//         }
//     )
// }

// // Get revenue grouped by period
// PaymentSchema.statics.getRevenueByPeriod = async function (period: 'day' | 'week' | 'month' | 'year'): Promise<any[]> {
//     let groupFormat: any

//     switch (period) {
//         case 'day':
//             groupFormat = {
//                 year: { $year: '$createdAt' },
//                 month: { $month: '$createdAt' },
//                 day: { $dayOfMonth: '$createdAt' }
//             }
//             break
//         case 'week':
//             groupFormat = {
//                 year: { $year: '$createdAt' },
//                 week: { $week: '$createdAt' }
//             }
//             break
//         case 'month':
//             groupFormat = {
//                 year: { $year: '$createdAt' },
//                 month: { $month: '$createdAt' }
//             }
//             break
//         case 'year':
//             groupFormat = {
//                 year: { $year: '$createdAt' }
//             }
//             break
//     }

//     return await this.aggregate([
//         { $match: { status: 'Completed' } },
//         {
//             $group: {
//                 _id: groupFormat,
//                 totalRevenue: { $sum: '$amount' },
//                 count: { $sum: 1 },
//                 averageAmount: { $avg: '$amount' }
//             }
//         },
//         { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
//     ])
// }

// // Instance methods
// PaymentSchema.methods.processRefund = async function (
//     amount: number,
//     reason: string,
//     processedBy: mongoose.Types.ObjectId,
//     transactionId?: string
// ): Promise<IPayment> {
//     if (this.status === 'Refunded') {
//         throw new Error('Payment is already fully refunded')
//     }

//     const totalRefunded = this.refunds?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0
//     const remainingAmount = this.amount - totalRefunded

//     if (amount > remainingAmount) {
//         throw new Error(`Refund amount (${amount}) exceeds remaining payment amount (${remainingAmount})`)
//     }

//     if (!this.refunds) {
//         this.refunds = []
//     }

//     this.refunds.push({
//         amount,
//         reason,
//         date: new Date(),
//         transactionId,
//         processedBy
//     })

//     // Update status if fully refunded
//     const newTotalRefunded = totalRefunded + amount
//     if (Math.abs(newTotalRefunded - this.amount) < 0.01) {
//         // Account for floating point
//         this.status = 'Refunded'
//         this.refundedAt = new Date()
//     }

//     return await this.save()
// }

// PaymentSchema.methods.markAsCompleted = async function (): Promise<IPayment> {
//     if (this.status === 'Completed') {
//         return this
//     }

//     this.status = 'Completed'
//     this.paidAt = new Date()
//     return await this.save()
// }

// PaymentSchema.methods.markAsFailed = async function (reason?: string): Promise<IPayment> {
//     this.status = 'Failed'
//     if (reason) {
//         this.notes = this.notes ? `${this.notes}\nFailed: ${reason}` : `Failed: ${reason}`
//     }
//     return await this.save()
// }

// const PaymentModel: PaymentModel = mongoose.model<IPayment, PaymentModel>('Payment', PaymentSchema)
const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema)

export default PaymentModel
