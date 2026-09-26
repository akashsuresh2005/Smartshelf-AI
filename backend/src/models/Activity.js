
import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    userName: { type: String, default: null },

    // original type field (keep existing values like 'item:add')
    type: { type: String, required: true },

    // human-friendly fields for UI
    verb: { type: String, default: null },
    emoji: { type: String, default: null },
    itemName: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    brief: { type: String, default: null },

    // keep message & meta for compat/debugging
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    // details is convenience copy of meta (used by frontend)
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
)

export default mongoose.model('Activity', activitySchema)
