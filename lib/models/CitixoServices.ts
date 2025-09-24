import mongoose from 'mongoose'

const CitixoServicesSchema = new mongoose.Schema({
  serviceId: {
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
  categoryId: {
    type: String,
    required: true,
    ref: 'CitixoServiceCategories',
    index: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  priceType: {
    type: String,
    enum: ['Fixed', 'Starting', 'Per Hour', 'Per Square Foot'],
    default: 'Starting'
  },
  duration: {
    estimated: { type: Number, default: 60 }, // in minutes
    unit: { type: String, default: 'minutes' }
  },
  features: [{
    type: String
  }],
  images: {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    size: { type: Number }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  availability: {
    type: String,
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  seo: {
    slug: { type: String, unique: true, sparse: true },
    metaTitle: String,
    metaDescription: String
  }
}, {
  timestamps: true
})

// Indexes for better performance
CitixoServicesSchema.index({ categoryId: 1, status: 1 })
CitixoServicesSchema.index({ status: 1, availability: 1 })
CitixoServicesSchema.index({ 'rating.average': -1 })
CitixoServicesSchema.index({ bookingCount: -1 })
CitixoServicesSchema.index({ 'seo.slug': 1 })

// Virtual for formatted price
CitixoServicesSchema.virtual('formattedPrice').get(function() {
  return `${this.priceType} ₹${this.basePrice}`
})

export default mongoose.models.CitixoServices || mongoose.model('CitixoServices', CitixoServicesSchema)
