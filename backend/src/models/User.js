// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema(
// {
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },

//   theme: { type: String, enum: ['light','dark','system'], default: 'light' },
//   accent: { type: String, default: '#0b5fff' },
//   layoutDensity: { type: String, enum: ['spacious','compact'], default: 'spacious' },

//   // ✅ FIXED STRUCTURE
//   notificationPrefs: {
//     emailEnabled: { type: Boolean, default: true },
//     pushEnabled: { type: Boolean, default: true },
//     expiringSoon: { type: Boolean, default: true },
//     expired: { type: Boolean, default: true },
//     digestDaily: { type: Boolean, default: false },
//     digestWeekly: { type: Boolean, default: true },
//     reminderDays: { type: Number, default: 3 }
//   },

//   // ✅ WHATSAPP
//   phone: { type: String },
//   whatsappEnabled: { type: Boolean, default: true },

//   avatarUrl: { type: String },
//   sessionsRevokedAt: { type: Date, default: null }
// },
// { timestamps: true }
// );

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.comparePassword = async function (candidate) {
//   return bcrypt.compare(candidate, this.password);
// };

// export default mongoose.model('User', userSchema);
/// backend/src/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Optional — Google OAuth users get a random unusable password
    password: { type: String, required: false },

    // Google OAuth
    googleId:  { type: String, sparse: true, index: true },
    avatarUrl: { type: String },

    // Appearance
    theme:         { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    accent:        { type: String, default: '#0b5fff' },
    layoutDensity: { type: String, enum: ['spacious', 'compact'], default: 'spacious' },

    // Notifications
    notificationPrefs: {
      emailEnabled:  { type: Boolean, default: true },
      pushEnabled:   { type: Boolean, default: true },
      expiringSoon:  { type: Boolean, default: true },
      expired:       { type: Boolean, default: true },
      digestDaily:   { type: Boolean, default: false },
      digestWeekly:  { type: Boolean, default: true },
      reminderDays:  { type: Number,  default: 3 }
    },

    // WhatsApp
    phone:           { type: String },
    whatsappEnabled: { type: Boolean, default: true },

    // Security
    sessionsRevokedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

// Hash password before saving — only when password field is actually modified
// and a password value exists (Google OAuth users may have no real password)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  if (!this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Returns false if no password set (Google-only account)
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)