import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { query, transaction } from '../db.js'
import { clearAuthCookie, requireAuth, setAuthCookie, signToken } from '../middleware/auth.js'
import { sendPasswordResetEmail } from '../services/email.js'

const router = Router()

const resetAttempts = new Map()

const publicUser = (user) => ({
  id: Number(user.id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.created_at,
})

function resetTokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

function canRequestReset(key) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxAttempts = 5
  const attempts = (resetAttempts.get(key) || []).filter((time) => now - time < windowMs)

  if (attempts.length >= maxAttempts) {
    resetAttempts.set(key, attempts)
    return false
  }

  attempts.push(now)
  resetAttempts.set(key, attempts)

  if (resetAttempts.size > 10000) {
    for (const [entry, times] of resetAttempts) {
      if (!times.some((time) => now - time < windowMs)) resetAttempts.delete(entry)
    }
  }

  return true
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone = null } = req.body
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' })
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    if (password.length > 72) return res.status(400).json({ message: 'Password must be 72 characters or fewer.' })

    const normalizedEmail = email.trim().toLowerCase()
    if ((await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])).length) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const rows = await query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), normalizedEmail, passwordHash, phone?.trim() || null],
    )
    const user = rows[0]
    setAuthCookie(res, signToken(user))
    res.status(201).json({ user: publicUser(user) })
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
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    setAuthCookie(res, signToken(user))
    res.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ message: 'Signed out successfully.' })
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM users WHERE id = $1', [req.user.id])
    if (!rows[0]) return res.status(401).json({ message: 'Account no longer exists.' })
    res.json({ user: publicUser(rows[0]) })
  } catch (error) {
    next(error)
  }
})

router.post('/forgot-password', async (req, res, next) => {
  const normalizedEmail = String(req.body?.email || '').trim().toLowerCase()
  const genericMessage = 'If an account exists for that email, we will send a password reset link.'

  if (!normalizedEmail || !canRequestReset(`${req.ip}:${normalizedEmail}`)) {
    return res.json({ message: genericMessage })
  }

  try {
    await query('DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used_at IS NOT NULL')

    const rows = await query('SELECT id, name, email FROM users WHERE email = $1', [normalizedEmail])
    const user = rows[0]

    if (user) {
      const recent = await query(
        'SELECT id FROM password_reset_tokens WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'60 seconds\' LIMIT 1',
        [user.id],
      )
      if (recent.length) return res.json({ message: genericMessage })

      await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id])

      const rawToken = randomBytes(32).toString('hex')
      const tokenHash = resetTokenHash(rawToken)

      await query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'30 minutes\')',
        [user.id, tokenHash],
      )

      const frontendUrl = (process.env.FRONTEND_URL || '').split(',')[0].trim().replace(/\/$/, '')
      if (!frontendUrl) throw new Error('FRONTEND_URL is not configured.')

      const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
    }

    res.json({ message: genericMessage })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const token = String(req.body?.token || '').trim()
    const newPassword = String(req.body?.newPassword || '')
    const confirmPassword = String(req.body?.confirmPassword || '')

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Reset token and both password fields are required.' })
    }
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    if (newPassword.length > 72) return res.status(400).json({ message: 'Password must be 72 characters or fewer.' })
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' })

    const tokenHash = resetTokenHash(token)
    const passwordHash = await bcrypt.hash(newPassword, 12)

    const resetSucceeded = await transaction(async (client) => {
      const result = await client.query(
        'SELECT id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE',
        [tokenHash],
      )
      const resetRecord = result.rows[0]

      if (!resetRecord) return false

      await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetRecord.user_id])
      await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [resetRecord.id])
      await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2', [resetRecord.user_id, resetRecord.id])
      return true
    })

    if (!resetSucceeded) {
      return res.status(400).json({ message: 'This password reset link is invalid or has expired. Please request a new one.' })
    }

    res.json({ message: 'Your password has been reset successfully. Please sign in with your new password.' })
  } catch (error) {
    next(error)
  }
})

export default router
