import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already used' })
    const user = await User.create({ name, email, password })
    const token = signToken(user)
    res.json({ message: 'Signup successful', token })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ message: 'Login successful', token })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res) {
  // Stateless JWT — client should delete token.
  res.json({ message: 'Logged out' })
}

export async function forgotPassword(req, res) {
  // Stub: you could send reset email here via mailer
  res.json({ message: 'If that email exists, we sent a reset link.' })
}
