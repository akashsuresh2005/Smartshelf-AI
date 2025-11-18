import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['email', 'push'], default: 'email' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Prevent duplicates at DB level: one (userId,itemId,type,title) combination
// Partial index so notifications not tied to an item are unaffected.
notificationSchema.index(
  { userId: 1, itemId: 1, type: 1, title: 1 },
  { unique: true, partialFilterExpression: { itemId: { $exists: true } } }
)

export default mongoose.model('Notification', notificationSchema)
