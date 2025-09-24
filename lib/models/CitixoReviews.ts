import mongoose from 'mongoose'

const CitixoReviewsSchema = new mongoose.Schema({
  reviewId: {
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
  bookingId: {
    type: String,
    required: true,
    ref: 'CitixoBookings',
    unique: true // One review per booking
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // Detailed ratings
  ratings: {
    quality: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  // Review metadata
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Hidden'],
    default: 'Pending',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerInitials: {
    type: String,
    required: true,
    trim: true
  },
  // Professional being reviewed
  professionalId: {
    type: String,
    ref: 'CitixoUsers',
    index: true
  },
  // Media attachments
  images: [{
    url: String,
    caption: String
  }],
  // Helpful votes
  helpfulVotes: {
    up: { type: Number, default: 0 },
    down: { type: Number, default: 0 },
    votedBy: [{ userId: String, vote: String }] // 'up' or 'down'
  },
  // Admin response
  adminResponse: {
    message: String,
    respondedBy: String,
    respondedAt: Date
  }
}, {
  timestamps: true
})

// Indexes for performance
CitixoReviewsSchema.index({ serviceId: 1, status: 1, rating: -1 })
CitixoReviewsSchema.index({ userId: 1, createdAt: -1 })
CitixoReviewsSchema.index({ professionalId: 1, rating: -1 })
CitixoReviewsSchema.index({ isVerified: 1, status: 1 })

// Calculate average detailed rating
CitixoReviewsSchema.virtual('averageDetailedRating').get(function() {
  if (!this.ratings) return this.rating
  
  const ratingsArray = Object.values(this.ratings).filter(r => r > 0)
  if (ratingsArray.length === 0) return this.rating
  
  return ratingsArray.reduce((sum, rating) => sum + rating, 0) / ratingsArray.length
})

export default mongoose.models.CitixoReviews || mongoose.model('CitixoReviews', CitixoReviewsSchema)
