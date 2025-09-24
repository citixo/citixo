import mongoose from 'mongoose'

const CitixootpsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  purpose: {
    type: String,
    enum: ['signup', 'login', 'password_reset', 'email_verification'],
    default: 'signup'
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for better query performance
CitixootpsSchema.index({ email: 1, purpose: 1, isUsed: 1 })
CitixootpsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to generate OTP
CitixootpsSchema.statics.generateOTP = function(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to clean expired OTPs
CitixootpsSchema.statics.cleanExpiredOTPs = async function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } })
}

// Instance method to check if OTP is valid
CitixootpsSchema.methods.isValid = function(): boolean {
  return !this.isUsed && this.attempts < 3 && this.expiresAt > new Date()
}

// Instance method to mark as used
CitixootpsSchema.methods.markAsUsed = function() {
  this.isUsed = true
  return this.save()
}

// Instance method to increment attempts
CitixootpsSchema.methods.incrementAttempts = function() {
  this.attempts += 1
  return this.save()
}

export default mongoose.models.Citixootps || mongoose.model('Citixootps', CitixootpsSchema)
