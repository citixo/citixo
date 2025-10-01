import mongoose from "mongoose"

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 6
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    userId: {
      type: String,
      required: true
    },
    bookingId: {
      type: String,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
CouponSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for efficient queries
CouponSchema.index({ code: 1 })
CouponSchema.index({ isActive: 1 })
CouponSchema.index({ startDate: 1 })
CouponSchema.index({ expiryDate: 1 })

// Force model recreation to ensure schema updates are applied
if (mongoose.models.CitixoCoupons) {
  delete mongoose.models.CitixoCoupons
}

export default mongoose.model("CitixoCoupons", CouponSchema)
