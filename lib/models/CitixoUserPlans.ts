import mongoose from 'mongoose'

const CitixoUserPlansSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'CitixoUsers',
    index: true
  },
  planId: {
    type: String,
    required: true,
    ref: 'CitixoPlans',
    index: true
  },
  // Subscription details
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled', 'Paused', 'Pending'],
    default: 'Active',
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
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'],
    required: true
  },
  // Usage tracking
  usageStats: {
    servicesUsed: { type: Number, default: 0 },
    servicesRemaining: { type: Number, default: 0 },
    discountUsed: { type: Number, default: 0 },
    lastServiceDate: { type: Date, default: null }
  },
  // Auto-renewal
  autoRenewal: {
    enabled: { type: Boolean, default: true },
    nextRenewalDate: Date,
    renewalAmount: Number
  },
  // Cancellation details
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: { type: String, enum: ['User', 'Admin', 'System'] },
    refundAmount: { type: Number, default: 0 }
  },
  // Promo/Discount applied
  promoCode: {
    code: String,
    discount: Number,
    discountType: { type: String, enum: ['Fixed', 'Percentage'] }
  }
}, {
  timestamps: true
})

// Compound indexes for queries
CitixoUserPlansSchema.index({ userId: 1, status: 1, endDate: -1 })
CitixoUserPlansSchema.index({ planId: 1, status: 1 })
CitixoUserPlansSchema.index({ endDate: 1, 'autoRenewal.enabled': 1 })

// Check if subscription is active
CitixoUserPlansSchema.methods.isActive = function() {
  return this.status === 'Active' && this.endDate > new Date()
}

// Calculate remaining days
CitixoUserPlansSchema.virtual('remainingDays').get(function() {
  if (this.status !== 'Active') return 0
  const now = new Date()
  const diffTime = this.endDate - now
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

export default mongoose.models.CitixoUserPlans || mongoose.model('CitixoUserPlans', CitixoUserPlansSchema)
