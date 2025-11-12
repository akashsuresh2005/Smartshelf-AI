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

export default mongoose.model('Notification', notificationSchema)
