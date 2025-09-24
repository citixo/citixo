import mongoose from "mongoose"

// Define the schema for our single collection that holds all data
const CitixoDataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["service", "user", "booking", "plan"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "CitixoCollection",
  },
)

// Update the updatedAt field before saving
CitixoDataSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

// Create indexes for better performance
CitixoDataSchema.index({ type: 1 })
CitixoDataSchema.index({ "data.id": 1 })
CitixoDataSchema.index({ "data.status": 1 })

export default mongoose.models.CitixoData || mongoose.model("CitixoData", CitixoDataSchema)
