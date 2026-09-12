import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin, requireAuth } from '../auth.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required.' })
    await pool.execute('INSERT INTO contact_messages (name,email,message) VALUES (?,?,?)', [name.trim(), email.trim().toLowerCase(), message.trim()])
    res.status(201).json({ message: 'Your message has been received.' })
  } catch (error) { next(error) }
})

router.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [messages] = await pool.execute('SELECT id,name,email,message,status,created_at FROM contact_messages ORDER BY created_at DESC')
    res.json({ messages })
  } catch (error) { next(error) }
})

export default router
