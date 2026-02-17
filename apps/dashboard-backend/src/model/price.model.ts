import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IPrice extends Document {
    // Basic Info
    name: string
    code: string
    description?: string
    type: 'Service' | 'Product' | 'Consultation' | 'Processing' | 'Visa Fee' | 'Other'
    category?: string

    // Pricing Details
    amount: number
    currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'CAD' | 'AUD'
    billingCycle: 'One-time' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Per Project'

    // Cost Breakdown
    costBreakdown?: {
        baseCost: number
        taxes?: {
            name: string
            rate: number
            amount: number
            type: 'Inclusive' | 'Exclusive'
        }[]
        fees?: {
            name: string
            amount: number
            type: 'Fixed' | 'Percentage'
        }[]
        discounts?: {
            name: string
            type: 'Percentage' | 'Fixed'
            value: number
            amount: number
            validFrom?: Date
            validUntil?: Date
        }[]
    }

    // Final Amounts
    subtotal: number
    taxTotal: number
    feeTotal: number
    discountTotal: number
    totalAmount: number

    // Applicability
    applicableTo?: {
        countries?: string[]
        visaTypes?: string[]
        clientTypes?: string[]
        minimumOrderValue?: number
        maximumOrderValue?: number
    }

    // Validity
    validFrom: Date
    validUntil?: Date
    isActive: boolean

    // Tiered Pricing
    tieredPricing?: {
        enabled: boolean
        tiers: {
            minQuantity: number
            maxQuantity?: number
            price: number
            discount?: number
        }[]
    }

    // Dynamic Pricing
    dynamicPricing?: {
        enabled: boolean
        basePrice: number
        factors: {
            name: string
            weight: number
            multiplier: number
        }[]
        seasonality?: {
            month: number
            multiplier: number
        }[]
    }

    // Markup Rules
    markupRules?: {
        enabled: boolean
        type: 'Percentage' | 'Fixed'
        value: number
        conditions?: {
            field: string
            operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in'
            value: any
        }[]
    }[]

    // Exchange Rate Settings
    exchangeRateSettings?: {
        autoUpdate: boolean
        source: 'Manual' | 'API' | 'Fixed'
        margin: number
        lastUpdated?: Date
    }

    // Relationships
    createdBy: mongoose.Types.ObjectId
    updatedBy?: mongoose.Types.ObjectId

    // Metadata
    tags?: string[]
    metadata?: Map<string, any>

    // Version Control
    version: number
    previousVersion?: mongoose.Types.ObjectId
    changeLog?: {
        date: Date
        user: mongoose.Types.ObjectId
        changes: string
    }[]
}

// Interface for price calculation
export interface IPriceCalculation {
    baseAmount: number
    taxes: { name: string; amount: number }[]
    fees: { name: string; amount: number }[]
    discounts: { name: string; amount: number }[]
    subtotal: number
    taxTotal: number
    feeTotal: number
    discountTotal: number
    total: number
    breakdown: {
        description: string
        amount: number
        type: 'base' | 'tax' | 'fee' | 'discount'
    }[]
}

const PriceSchema = new Schema<IPrice>(
    {
        name: {
            type: String,
            required: [true, 'Price name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
            index: true
        },
        code: {
            type: String,
            required: [true, 'Price code is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        type: {
            type: String,
            enum: {
                values: ['Service', 'Product', 'Consultation', 'Processing', 'Visa Fee', 'Other'],
                message: '{VALUE} is not a valid price type'
            },
            required: [true, 'Price type is required'],
            index: true
        },
        category: {
            type: String,
            trim: true,
            index: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
            validate: {
                validator: function (value: number) {
                    return value >= 0
                },
                message: 'Amount cannot be negative'
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
        billingCycle: {
            type: String,
            enum: {
                values: ['One-time', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Per Project'],
                message: '{VALUE} is not a valid billing cycle'
            },
            default: 'One-time',
            required: [true, 'Billing cycle is required']
        },
        costBreakdown: {
            baseCost: {
                type: Number,
                required: function (this: any) {
                    return !!this.costBreakdown
                },
                min: [0, 'Base cost cannot be negative']
            },
            taxes: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    rate: {
                        type: Number,
                        required: true,
                        min: [0, 'Tax rate cannot be negative'],
                        max: [100, 'Tax rate cannot exceed 100%']
                    },
                    amount: {
                        type: Number,
                        required: true,
                        min: [0, 'Tax amount cannot be negative']
                    },
                    type: {
                        type: String,
                        enum: ['Inclusive', 'Exclusive'],
                        default: 'Exclusive'
                    }
                }
            ],
            fees: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    amount: {
                        type: Number,
                        required: true,
                        min: [0, 'Fee amount cannot be negative']
                    },
                    type: {
                        type: String,
                        enum: ['Fixed', 'Percentage'],
                        default: 'Fixed'
                    }
                }
            ],
            discounts: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    type: {
                        type: String,
                        enum: ['Percentage', 'Fixed'],
                        required: true
                    },
                    value: {
                        type: Number,
                        required: true,
                        min: [0, 'Discount value cannot be negative']
                    },
                    amount: {
                        type: Number,
                        required: true,
                        min: [0, 'Discount amount cannot be negative']
                    },
                    validFrom: Date,
                    validUntil: Date
                }
            ]
        },
        subtotal: {
            type: Number,
            required: [true, 'Subtotal is required'],
            min: [0, 'Subtotal cannot be negative']
        },
        taxTotal: {
            type: Number,
            default: 0,
            min: [0, 'Tax total cannot be negative']
        },
        feeTotal: {
            type: Number,
            default: 0,
            min: [0, 'Fee total cannot be negative']
        },
        discountTotal: {
            type: Number,
            default: 0,
            min: [0, 'Discount total cannot be negative']
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative']
        },
        applicableTo: {
            countries: [String],
            visaTypes: [String],
            clientTypes: [String],
            minimumOrderValue: {
                type: Number,
                min: [0, 'Minimum order value cannot be negative']
            },
            maximumOrderValue: {
                type: Number,
                min: [0, 'Maximum order value cannot be negative']
            }
        },
        validFrom: {
            type: Date,
            required: [true, 'Valid from date is required'],
            default: Date.now
        },
        validUntil: {
            type: Date,
            validate: {
                validator: function (this: IPrice, value: Date) {
                    return !value || value > this.validFrom
                },
                message: 'Valid until date must be after valid from date'
            }
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        tieredPricing: {
            enabled: {
                type: Boolean,
                default: false
            },
            tiers: [
                {
                    minQuantity: {
                        type: Number,
                        required: true,
                        min: [1, 'Minimum quantity must be at least 1']
                    },
                    maxQuantity: {
                        type: Number,
                        min: [1, 'Maximum quantity must be at least 1']
                    },
                    price: {
                        type: Number,
                        required: true,
                        min: [0, 'Price cannot be negative']
                    },
                    discount: {
                        type: Number,
                        min: [0, 'Discount cannot be negative'],
                        max: [100, 'Discount cannot exceed 100%']
                    }
                }
            ]
        },
        dynamicPricing: {
            enabled: {
                type: Boolean,
                default: false
            },
            basePrice: {
                type: Number,
                required: function (this: any) {
                    return this.dynamicPricing?.enabled
                },
                min: [0, 'Base price cannot be negative']
            },
            factors: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    weight: {
                        type: Number,
                        required: true,
                        min: [0, 'Weight cannot be negative']
                    },
                    multiplier: {
                        type: Number,
                        required: true,
                        min: [0, 'Multiplier cannot be negative']
                    }
                }
            ],
            seasonality: [
                {
                    month: {
                        type: Number,
                        required: true,
                        min: [1, 'Month must be between 1 and 12'],
                        max: [12, 'Month must be between 1 and 12']
                    },
                    multiplier: {
                        type: Number,
                        required: true,
                        min: [0, 'Seasonality multiplier cannot be negative']
                    }
                }
            ]
        },
        markupRules: [
            {
                enabled: {
                    type: Boolean,
                    default: true
                },
                type: {
                    type: String,
                    enum: ['Percentage', 'Fixed'],
                    required: true
                },
                value: {
                    type: Number,
                    required: true,
                    min: [0, 'Markup value cannot be negative']
                },
                conditions: [
                    {
                        field: {
                            type: String,
                            required: true
                        },
                        operator: {
                            type: String,
                            enum: ['eq', 'gt', 'lt', 'gte', 'lte', 'in'],
                            required: true
                        },
                        value: {
                            type: Schema.Types.Mixed,
                            required: true
                        }
                    }
                ]
            }
        ],
        exchangeRateSettings: {
            autoUpdate: {
                type: Boolean,
                default: false
            },
            source: {
                type: String,
                enum: ['Manual', 'API', 'Fixed'],
                default: 'Manual'
            },
            margin: {
                type: Number,
                default: 0,
                min: [0, 'Margin cannot be negative'],
                max: [100, 'Margin cannot exceed 100%']
            },
            lastUpdated: Date
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator reference is required'],
            index: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        tags: [
            {
                type: String,
                trim: true
            }
        ],
        metadata: {
            type: Map,
            of: Schema.Types.Mixed
        },
        version: {
            type: Number,
            default: 1,
            required: true
        },
        previousVersion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Price'
        },
        changeLog: [
            {
                date: {
                    type: Date,
                    default: Date.now
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                changes: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Compound indexes for common queries
PriceSchema.index({ type: 1, isActive: 1, validFrom: 1, validUntil: 1 })
PriceSchema.index({ 'applicableTo.countries': 1 })
PriceSchema.index({ 'applicableTo.visaTypes': 1 })
PriceSchema.index({ tags: 1 })
PriceSchema.index({ createdAt: -1 })
PriceSchema.index({ version: 1, code: 1 })

// Pre-save middleware to calculate totals
PriceSchema.pre('save', function (next) {
    if (this.costBreakdown) {
        // Calculate tax total
        this.taxTotal = this.costBreakdown.taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0

        // Calculate fee total
        this.feeTotal = this.costBreakdown.fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0

        // Calculate discount total
        this.discountTotal = this.costBreakdown.discounts?.reduce((sum, discount) => sum + discount.amount, 0) || 0

        // Calculate subtotal (base cost + fees)
        this.subtotal = (this.costBreakdown.baseCost || 0) + this.feeTotal

        // Calculate total (subtotal + taxes - discounts)
        this.totalAmount = this.subtotal + this.taxTotal - this.discountTotal
    } else {
        // If no breakdown, use simple amount
        this.subtotal = this.amount
        this.totalAmount = this.amount
        this.taxTotal = 0
        this.feeTotal = 0
        this.discountTotal = 0
    }

    next()
})

// Virtual for checking if price is currently valid
PriceSchema.virtual('isValid').get(function (this: IPrice) {
    const now = new Date()
    return this.isActive && this.validFrom <= now && (!this.validUntil || this.validUntil >= now)
})

// Virtual for tiered pricing display
PriceSchema.virtual('tierDisplay').get(function (this: IPrice) {
    if (!this.tieredPricing?.enabled || !this.tieredPricing.tiers.length) {
        return null
    }

    return this.tieredPricing.tiers.map((tier) => ({
        range: tier.maxQuantity ? `${tier.minQuantity}-${tier.maxQuantity}` : `${tier.minQuantity}+`,
        price: tier.price,
        discount: tier.discount || 0
    }))
})

// Static methods
interface PriceModel extends Model<IPrice> {
    getActivePrices(type?: string): Promise<IPrice[]>
    getPriceByCode(code: string): Promise<IPrice | null>
    calculatePrice(priceId: string, quantity: number, context?: any): Promise<IPriceCalculation>
    getPricesByCountry(country: string): Promise<IPrice[]>
}

// Get all active prices
PriceSchema.statics.getActivePrices = async function (type?: string): Promise<IPrice[]> {
    const query: any = {
        isActive: true,
        validFrom: { $lte: new Date() },
        $or: [{ validUntil: null }, { validUntil: { $gte: new Date() } }]
    }

    if (type) {
        query.type = type
    }

    return await this.find(query).sort({ createdAt: -1 })
}

// Get price by code
PriceSchema.statics.getPriceByCode = async function (code: string): Promise<IPrice | null> {
    return await this.findOne({
        code: code.toUpperCase(),
        isActive: true
    })
}

// Calculate price with quantity and context
PriceSchema.statics.calculatePrice = async function (priceId: string, quantity: number = 1, context?: any): Promise<IPriceCalculation> {
    const price = await this.findById(priceId)

    if (!price) {
        throw new Error('Price not found')
    }

    if (!price.isValid) {
        throw new Error('Price is not currently valid')
    }

    let baseAmount = price.amount
    const breakdown: { description: string; amount: number; type: 'base' | 'tax' | 'fee' | 'discount' }[] = []

    // Apply tiered pricing if enabled
    if (price.tieredPricing?.enabled && price.tieredPricing.tiers.length) {
        const applicableTier = price.tieredPricing.tiers.find(
            (tier) => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity)
        )

        if (applicableTier) {
            baseAmount = applicableTier.price
            if (applicableTier.discount) {
                const discountAmount = (baseAmount * applicableTier.discount) / 100
                breakdown.push({
                    description: `Tier discount (${applicableTier.discount}%)`,
                    amount: -discountAmount,
                    type: 'discount'
                })
                baseAmount -= discountAmount
            }
        }
    }

    // Apply dynamic pricing if enabled
    if (price.dynamicPricing?.enabled && context) {
        let multiplier = 1
        for (const factor of price.dynamicPricing.factors || []) {
            if (context[factor.name]) {
                multiplier *= 1 + factor.weight * factor.multiplier
            }
        }

        // Apply seasonality
        if (price.dynamicPricing.seasonality && context.date) {
            const month = new Date(context.date).getMonth() + 1
            const seasonalityFactor = price.dynamicPricing.seasonality.find((s) => s.month === month)
            if (seasonalityFactor) {
                multiplier *= seasonalityFactor.multiplier
            }
        }

        if (multiplier !== 1) {
            const originalAmount = baseAmount
            baseAmount = price.dynamicPricing.basePrice * multiplier
            breakdown.push({
                description: `Dynamic pricing adjustment (${(((baseAmount - originalAmount) / originalAmount) * 100).toFixed(1)}%)`,
                amount: baseAmount - originalAmount,
                type: 'base'
            })
        }
    }

    // Apply quantity
    const subtotal = baseAmount * quantity
    breakdown.push({
        description: `Base price (${baseAmount} x ${quantity})`,
        amount: subtotal,
        type: 'base'
    })

    // Apply taxes
    const taxes: { name: string; amount: number }[] = []
    let taxTotal = 0

    if (price.costBreakdown?.taxes) {
        for (const tax of price.costBreakdown.taxes) {
            const taxAmount = tax.type === 'Inclusive' ? (subtotal * tax.rate) / (100 + tax.rate) : (subtotal * tax.rate) / 100

            taxes.push({ name: tax.name, amount: taxAmount })
            taxTotal += taxAmount
            breakdown.push({
                description: `${tax.name} (${tax.rate}%)`,
                amount: taxAmount,
                type: 'tax'
            })
        }
    }

    // Apply fees
    const fees: { name: string; amount: number }[] = []
    let feeTotal = 0

    if (price.costBreakdown?.fees) {
        for (const fee of price.costBreakdown.fees) {
            const feeAmount = fee.type === 'Percentage' ? (subtotal * fee.amount) / 100 : fee.amount

            fees.push({ name: fee.name, amount: feeAmount })
            feeTotal += feeAmount
            breakdown.push({
                description: `${fee.name}${fee.type === 'Percentage' ? ` (${fee.amount}%)` : ''}`,
                amount: feeAmount,
                type: 'fee'
            })
        }
    }

    // Apply discounts
    const discounts: { name: string; amount: number }[] = []
    let discountTotal = 0

    if (price.costBreakdown?.discounts) {
        const now = new Date()
        for (const discount of price.costBreakdown.discounts) {
            // Check if discount is valid
            if (discount.validFrom && new Date(discount.validFrom) > now) continue
            if (discount.validUntil && new Date(discount.validUntil) < now) continue

            const discountAmount = discount.type === 'Percentage' ? (subtotal * discount.value) / 100 : discount.value

            discounts.push({ name: discount.name, amount: discountAmount })
            discountTotal += discountAmount
            breakdown.push({
                description: `${discount.name}${discount.type === 'Percentage' ? ` (${discount.value}%)` : ''}`,
                amount: -discountAmount,
                type: 'discount'
            })
        }
    }

    // Apply markup rules
    if (price.markupRules && context) {
        for (const rule of price.markupRules) {
            if (!rule.enabled) continue

            let applies = true
            if (rule.conditions && rule.conditions.length) {
                for (const condition of rule.conditions) {
                    const contextValue = context[condition.field]

                    switch (condition.operator) {
                        case 'eq':
                            applies = applies && contextValue === condition.value
                            break
                        case 'gt':
                            applies = applies && contextValue > condition.value
                            break
                        case 'lt':
                            applies = applies && contextValue < condition.value
                            break
                        case 'gte':
                            applies = applies && contextValue >= condition.value
                            break
                        case 'lte':
                            applies = applies && contextValue <= condition.value
                            break
                        case 'in':
                            applies = applies && Array.isArray(condition.value) && condition.value.includes(contextValue)
                            break
                    }
                }
            }

            if (applies) {
                const markupAmount = rule.type === 'Percentage' ? (subtotal * rule.value) / 100 : rule.value

                breakdown.push({
                    description: `Markup: ${rule.type === 'Percentage' ? `${rule.value}%` : `$${rule.value}`}`,
                    amount: markupAmount,
                    type: 'fee'
                })
                feeTotal += markupAmount
                fees.push({ name: 'Markup', amount: markupAmount })
            }
        }
    }

    const total = subtotal + taxTotal + feeTotal - discountTotal

    return {
        baseAmount: subtotal,
        taxes,
        fees,
        discounts,
        subtotal,
        taxTotal,
        feeTotal,
        discountTotal,
        total,
        breakdown: breakdown.sort((a, b) => {
            const order = { base: 0, fee: 1, tax: 2, discount: 3 }
            return order[a.type] - order[b.type]
        })
    }
}

// Get prices by country
PriceSchema.statics.getPricesByCountry = async function (country: string): Promise<IPrice[]> {
    return await this.find({
        isActive: true,
        $or: [{ 'applicableTo.countries': { $in: [country] } }, { 'applicableTo.countries': { $size: 0 } }, { 'applicableTo.countries': null }],
        validFrom: { $lte: new Date() },
        $or: [{ validUntil: null }, { validUntil: { $gte: new Date() } }]
    }).sort({ type: 1, name: 1 })
}

// Instance methods
PriceSchema.methods.createNewVersion = async function (updates: Partial<IPrice>, userId: mongoose.Types.ObjectId): Promise<IPrice> {
    // Create new version document
    const newVersionData = {
        ...this.toObject(),
        _id: new mongoose.Types.ObjectId(),
        ...updates,
        version: this.version + 1,
        previousVersion: this._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        changeLog: [
            ...(this.changeLog || []),
            {
                date: new Date(),
                user: userId,
                changes: `Updated from version ${this.version} to ${this.version + 1}`
            }
        ]
    }

    delete newVersionData.__v

    const newVersion = await mongoose.model('Price').create(newVersionData)

    // Deactivate old version
    this.isActive = false
    await this.save()

    return newVersion
}

PriceSchema.methods.isApplicable = function (context: { country?: string; visaType?: string; clientType?: string; orderValue?: number }): boolean {
    if (!this.isValid) return false

    const applicable = this.applicableTo

    if (applicable?.countries?.length && context.country) {
        if (!applicable.countries.includes(context.country)) return false
    }

    if (applicable?.visaTypes?.length && context.visaType) {
        if (!applicable.visaTypes.includes(context.visaType)) return false
    }

    if (applicable?.clientTypes?.length && context.clientType) {
        if (!applicable.clientTypes.includes(context.clientType)) return false
    }

    if (applicable?.minimumOrderValue && context.orderValue) {
        if (context.orderValue < applicable.minimumOrderValue) return false
    }

    if (applicable?.maximumOrderValue && context.orderValue) {
        if (context.orderValue > applicable.maximumOrderValue) return false
    }

    return true
}

const PriceModel: PriceModel = mongoose.model<IPrice, PriceModel>('Price', PriceSchema)

export default PriceModel
