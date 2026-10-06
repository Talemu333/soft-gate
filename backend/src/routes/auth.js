import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()

const publicUser = (user) => ({
  id: Number(user.id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.created_at,
})

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = null } = req.body
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    const normalizedEmail = email.trim().toLowerCase()
    if ((await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])).length) return res.status(409).json({ message: 'An account with this email already exists.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const rows = await query('INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *', [name.trim(), normalizedEmail, passwordHash, phone?.trim() || null])
    const user = rows[0]
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'An account with this email already exists.' })
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required.' })
    const rows = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password.' })
    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (error) { next(error) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM users WHERE id = $1', [req.user.id])
    if (!rows[0]) return res.status(401).json({ message: 'Account no longer exists.' })
    res.json({ user: publicUser(rows[0]) })
  } catch (error) { next(error) }
})

export default router
