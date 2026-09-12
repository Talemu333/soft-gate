import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin, requireAuth, hashPassword } from '../auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [[sales]] = await pool.query("SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders, COALESCE(SUM(status <> 'Cancelled'),0) AS activeOrders FROM orders")
    const [[customers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'")
    const [[products]] = await pool.query('SELECT COUNT(*) AS count, COALESCE(SUM(stock),0) AS units FROM products')
    const [[lowStock]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE stock <= 7')
    res.json({ revenue: Number(sales.revenue), orders: Number(sales.orders), activeOrders: Number(sales.activeOrders), customers: Number(customers.count), products: Number(products.count), unitsInStock: Number(products.units), lowStock: Number(lowStock.count) })
  } catch (error) { next(error) }
})

router.get('/customers', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT u.id,u.name,u.email,u.phone,COUNT(o.id) AS orders,COALESCE(SUM(o.total),0) AS spend,MAX(o.created_at) AS lastOrder FROM users u LEFT JOIN orders o ON o.user_id = u.id OR (o.user_id IS NULL AND LOWER(o.customer_email)=LOWER(u.email)) WHERE u.role='customer' GROUP BY u.id ORDER BY spend DESC`)
    res.json({ customers: rows })
  } catch (error) { next(error) }
})

router.post('/bootstrap', async (req, res, next) => {
  try {
    const email = (req.body.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const password = req.body.password || process.env.ADMIN_PASSWORD
    const name = req.body.name || 'Soft-Gate Admin'
    if (!email || !password || password.length < 8) return res.status(400).json({ message: 'A valid admin email and password of at least 8 characters are required.' })
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) return res.status(409).json({ message: 'A user already exists with this email.' })
    const passwordHash = await hashPassword(password)
    await pool.execute("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,'admin')", [name, email, passwordHash])
    res.status(201).json({ message: 'Admin account created. Sign in through /api/auth/login.' })
  } catch (error) { next(error) }
})

export default router
