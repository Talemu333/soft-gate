import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin, requireAuth } from '../auth.js'

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

export default router
