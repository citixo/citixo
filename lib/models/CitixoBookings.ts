import mongoose from 'mongoose'

const CitixoBookingsSchema = new mongoose.Schema({
  bookingId: {
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
  serviceId: {
    type: String,
    required: true,
    ref: 'CitixoServices',
    index: true
  },
  // Customer details (snapshot at time of booking)
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  // Service details (snapshot at time of booking)
  serviceDetails: {
    name: { type: String, required: true },
    description: String,
    basePrice: { type: Number, required: true },
    categoryName: String
    // Note: No image field - we fetch images dynamically from the service record
  },
  // Booking specifics
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    amount: { type: Number, default: 0 },
    type: { type: String, enum: ['Fixed', 'Percentage'], default: 'Fixed' },
    couponCode: String
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Partial'],
    default: 'Pending'
  },
  // Professional assignment and details
  professionalId: {
    type: String,
    ref: 'CitixoUsers',
    default: null
  },
  professionalDetails: {
    id: String,
    name: String,
    phone: String,
    rating: Number,
    assignedAt: Date
  },
  // Review details
  reviewDetails: {
    reviewId: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: Date
  },
  // Additional information
  notes: {
    type: String,
    default: ''
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  // Tracking
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: String,
    notes: String
  }],
  // Completion details
  completedAt: {
    type: Date,
    default: null
  },
  // Cancellation details
  cancellation: {
    reason: String,
    cancelledBy: { type: String, enum: ['User', 'Admin', 'Professional'] },
    cancelledAt: Date,
    refundAmount: Number
  }
}, {
  timestamps: true
})

// Indexes for performance
CitixoBookingsSchema.index({ userId: 1, scheduledDate: -1 })
CitixoBookingsSchema.index({ serviceId: 1, status: 1 })
CitixoBookingsSchema.index({ professionalId: 1, scheduledDate: 1 })
CitixoBookingsSchema.index({ status: 1, scheduledDate: 1 })
CitixoBookingsSchema.index({ paymentStatus: 1 })

// Pre-save middleware to calculate final amount
CitixoBookingsSchema.pre('save', function(next) {
  if (this.discount && this.discount.amount > 0) {
    if (this.discount.type === 'Percentage') {
      this.finalAmount = this.totalAmount - (this.totalAmount * this.discount.amount / 100)
    } else {
      this.finalAmount = this.totalAmount - this.discount.amount
    }
  } else {
    this.finalAmount = this.totalAmount
  }
  next()
})

export default mongoose.models.CitixoBookings || mongoose.model('CitixoBookings', CitixoBookingsSchema)
