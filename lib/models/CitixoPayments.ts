import mongoose from 'mongoose'

const CitixoPaymentsSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null but must be unique when present
  },
  userId: {
    type: String,
    required: true,
    ref: 'CitixoUsers',
    index: true
  },
  // Related entity
  entityType: {
    type: String,
    enum: ['Booking', 'Subscription', 'Wallet', 'Refund'],
    required: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Cash', 'Bank Transfer'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['Razorpay', 'Stripe', 'PayU', 'Paytm', 'PhonePe', 'GPay', 'Cash'],
    required: true
  },
  // Gateway specific data
  gatewayData: {
    orderId: String,
    paymentId: String,
    signature: String,
    receipt: String
  },
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Success', 'Failed', 'Cancelled', 'Refunded', 'Partial Refund'],
    default: 'Pending',
    index: true
  },
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Failure details
  failureReason: {
    type: String,
    default: null
  },
  failureCode: {
    type: String,
    default: null
  },
  // Refund details
  refund: {
    amount: { type: Number, default: 0 },
    reason: String,
    processedAt: Date,
    refundId: String
  },
  // Fees and charges
  platformFee: {
    type: Number,
    default: 0
  },
  gatewayFee: {
    type: Number,
    default: 0
  },
  tax: {
    amount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    type: String // GST, VAT, etc.
  },
  // Customer details (snapshot)
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  // Metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  // Webhook data
  webhookData: [{
    event: String,
    data: Object,
    receivedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

// Indexes for performance
CitixoPaymentsSchema.index({ userId: 1, status: 1, createdAt: -1 })
CitixoPaymentsSchema.index({ entityType: 1, entityId: 1 })
CitixoPaymentsSchema.index({ status: 1, paymentMethod: 1 })
CitixoPaymentsSchema.index({ transactionId: 1 })
CitixoPaymentsSchema.index({ 'gatewayData.orderId': 1 })

// Calculate net amount after fees
CitixoPaymentsSchema.virtual('netAmount').get(function() {
  return this.amount - this.platformFee - this.gatewayFee - this.tax.amount
})

// Check if payment is successful
CitixoPaymentsSchema.methods.isSuccessful = function() {
  return this.status === 'Success'
}

// Check if payment can be refunded
CitixoPaymentsSchema.methods.canRefund = function() {
  return this.status === 'Success' && this.refund.amount < this.amount
}

export default mongoose.models.CitixoPayments || mongoose.model('CitixoPayments', CitixoPaymentsSchema)
