import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/stats', async (req, res, next) => {
  try {
    const [[sales]] = await Promise.all([
      query(`SELECT
        COALESCE(SUM(total),0) AS revenue,
        COUNT(*) AS orders,
        SUM(status = 'Processing') AS processing
        FROM orders`),
    ])
    const [[productStats]] = await Promise.all([
      query(`SELECT
        COUNT(*) AS products,
        SUM(stock <= 7 AND active = 1) AS lowStock
        FROM products WHERE active = 1`),
    ])
    res.json({
      revenue: Number(sales.revenue || 0),
      orders: Number(sales.orders || 0),
      processing: Number(sales.processing || 0),
      products: Number(productStats.products || 0),
      lowStock: Number(productStats.lowStock || 0),
    })
  } catch (error) {
    next(error)
  }
})

router.get('/orders', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM orders ORDER BY created_at DESC')
    res.json({ orders: await Promise.all(rows.map(async (row) => {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [row.id])
      return {
        id: row.order_number,
        databaseId: Number(row.id),
        date: new Date(row.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: row.created_at,
        status: row.status,
        payment: row.payment_method,
        paymentStatus: row.payment_status,
        subtotal: Number(row.subtotal),
        delivery: Number(row.delivery),
        total: Number(row.total),
        customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, city: row.city, address: row.address },
        items: items.map((item) => ({ productId: Number(item.product_id), name: item.product_name, price: Number(item.unit_price), quantity: Number(item.quantity), image: item.image || '' })),
      }
    })) })
  } catch (error) {
    next(error)
  }
})

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const allowed = ['Processing','Confirmed','Shipped','Delivered','Cancelled']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' })
    const result = await query('UPDATE orders SET status = ? WHERE id = ? OR order_number = ?', [req.body.status, req.params.id, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Order not found.' })
    res.json({ message: 'Order status updated.' })
  } catch (error) {
    next(error)
  }
})

router.get('/customers', async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT
        u.id, u.name, u.email, u.phone,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.total),0) AS spend,
        MAX(o.created_at) AS last_order
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.phone
      ORDER BY spend DESC, u.created_at DESC
    `)
    res.json({
      customers: rows.map((row) => ({
        name: row.name,
        email: row.email,
        phone: row.phone || '—',
        orders: Number(row.orders),
        spend: Number(row.spend),
        lastOrder: row.last_order
          ? new Date(row.last_order).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'No orders yet',
      })),
    })
  } catch (error) {
    next(error)
  }
})

export default router
