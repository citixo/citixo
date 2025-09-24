import mongoose from 'mongoose'

const CitixoUsersSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['User', 'Admin', 'Professional'],
    default: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: null
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' }
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: Date,
    userAgent: String,
    ip: String
  }],
  totalBookings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for better query performance
CitixoUsersSchema.index({ email: 1, status: 1 })
CitixoUsersSchema.index({ phone: 1 })
CitixoUsersSchema.index({ role: 1, status: 1 })

// Virtual for full name
CitixoUsersSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

export default mongoose.models.CitixoUsers || mongoose.model('CitixoUsers', CitixoUsersSchema)
