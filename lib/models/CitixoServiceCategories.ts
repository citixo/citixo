import mongoose from 'mongoose'

const CitixoServiceCategoriesSchema = new mongoose.Schema({
  categoryId: {
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
  icon: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#0095FF'
  }
}, {
  timestamps: true
})

// Indexes
CitixoServiceCategoriesSchema.index({ status: 1, displayOrder: 1 })

export default mongoose.models.CitixoServiceCategories || mongoose.model('CitixoServiceCategories', CitixoServiceCategoriesSchema)
