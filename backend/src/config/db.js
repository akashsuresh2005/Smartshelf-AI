import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is missing in .env')

  mongoose.connection.on('connected', () => {
    console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected')
  })
  mongoose.connection.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', 'MongoDB error:', err.message)
  })

  await mongoose.connect(uri, { autoIndex: true })
}
