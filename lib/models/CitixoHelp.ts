import mongoose from 'mongoose'

const CitixoHelpSchema = new mongoose.Schema({
  helpId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    index: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      default: 'System'
    }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
CitixoHelpSchema.index({ category: 1, isActive: 1, priority: -1 })
CitixoHelpSchema.index({ tags: 1, isActive: 1 })
CitixoHelpSchema.index({ 
  title: 'text', 
  question: 'text', 
  answer: 'text',
  tags: 'text'
})

export default mongoose.models.CitixoHelp || mongoose.model('CitixoHelp', CitixoHelpSchema)
