import mongoose from 'mongoose'

const CitixoPlansSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingPeriod: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    default: 'Monthly'
  },
  features: [{
    type: String,
    required: true
  }],
  benefits: {
    serviceDiscount: { type: Number, default: 0 }, // percentage
    prioritySupport: { type: Boolean, default: false },
    freeServices: { type: Number, default: 0 }, // number of free services per period
    emergencySupport: { type: Boolean, default: false }
  },
  limits: {
    maxBookingsPerMonth: { type: Number, default: null }, // null means unlimited
    maxServiceCategories: [String] // which categories are included
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  colors: {
    background: { type: String, default: '#f3f4f6' },
    text: { type: String, default: '#1f2937' },
    accent: { type: String, default: '#0095FF' }
  },
  subscriberCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes
CitixoPlansSchema.index({ status: 1, displayOrder: 1 })
CitixoPlansSchema.index({ isPopular: -1, price: 1 })

export default mongoose.models.CitixoPlans || mongoose.model('CitixoPlans', CitixoPlansSchema)
