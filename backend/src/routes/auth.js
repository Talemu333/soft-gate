import { Router } from 'express'
import { pool } from '../db.js'
import { comparePassword, hashPassword, requireAuth, signToken } from '../auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = null } = req.body
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email and a password of at least 6 characters are required.' })
    const normalizedEmail = email.trim().toLowerCase()
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail])
    if (existing.length) return res.status(409).json({ message: 'An account with this email already exists.' })
    const passwordHash = await hashPassword(password)
    const [result] = await pool.execute('INSERT INTO users (name,email,password_hash,phone) VALUES (?,?,?,?)', [name.trim(), normalizedEmail, passwordHash, phone])
    const user = { id: result.insertId, name: name.trim(), email: normalizedEmail, phone, role: 'customer' }
    res.status(201).json({ user, token: signToken(user) })
  } catch (error) { next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })
    const [rows] = await pool.execute('SELECT id,name,email,password_hash,phone,role FROM users WHERE email = ?', [email.trim().toLowerCase()])
    if (!rows.length || !(await comparePassword(password, rows[0].password_hash))) return res.status(401).json({ message: 'Invalid email or password.' })
    const { password_hash: _hash, ...user } = rows[0]
    res.json({ user, token: signToken(user) })
  } catch (error) { next(error) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id,name,email,phone,role,created_at FROM users WHERE id = ?', [req.user.id])
    if (!rows.length) return res.status(404).json({ message: 'User not found.' })
    res.json({ user: rows[0] })
  } catch (error) { next(error) }
})

export default router
