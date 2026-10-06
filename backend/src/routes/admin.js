import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/stats', async (req, res, next) => {
  try {
    const sales = await query("SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders, COUNT(*) FILTER (WHERE status='Processing') AS processing FROM orders")
    const productStats = await query("SELECT COUNT(*) AS products, COUNT(*) FILTER (WHERE stock<=7) AS low_stock FROM products WHERE active=TRUE")
    res.json({
      revenue: Number(sales[0]?.revenue || 0), orders: Number(sales[0]?.orders || 0),
      processing: Number(sales[0]?.processing || 0), products: Number(productStats[0]?.products || 0),
      lowStock: Number(productStats[0]?.low_stock || 0),
    })
  } catch (error) { next(error) }
})

router.get('/orders', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM orders ORDER BY created_at DESC')
    const orders = await Promise.all(rows.map(async (row) => {
      const items = await query('SELECT * FROM order_items WHERE order_id=$1 ORDER BY id', [row.id])
      return {
        id: row.order_number, databaseId: Number(row.id),
        date: new Date(row.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAt: row.created_at, status: row.status, payment: row.payment_method, paymentStatus: row.payment_status,
        subtotal: Number(row.subtotal), delivery: Number(row.delivery), total: Number(row.total),
        customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, city: row.city, address: row.address },
        items: items.map((item) => ({ productId: Number(item.product_id), name: item.product_name, price: Number(item.unit_price), quantity: Number(item.quantity), image: item.image || '' })),
      }
    }))
    res.json({ orders })
  } catch (error) { next(error) }
})

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const allowed = ['Processing','Confirmed','Shipped','Delivered','Cancelled']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' })
    const rows = /^\d+$/.test(req.params.id)
      ? await query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING id', [req.body.status, req.params.id])
      : await query('UPDATE orders SET status=$1, updated_at=NOW() WHERE order_number=$2 RETURNING id', [req.body.status, req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Order not found.' })
    res.json({ message: 'Order status updated.' })
  } catch (error) { next(error) }
})

router.get('/customers', async (req, res, next) => {
  try {
    const rows = await query("SELECT u.id,u.name,u.email,u.phone,COUNT(o.id)::INTEGER AS orders,COALESCE(SUM(o.total),0) AS spend,MAX(o.created_at) AS last_order FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE u.role='customer' GROUP BY u.id,u.name,u.email,u.phone ORDER BY spend DESC, MAX(u.created_at) DESC")
    res.json({ customers: rows.map((row) => ({
      name: row.name, email: row.email, phone: row.phone || '—', orders: Number(row.orders),
      spend: Number(row.spend),
      lastOrder: row.last_order ? new Date(row.last_order).toLocaleDateString('en-NG', { day:'2-digit', month:'short', year:'numeric' }) : 'No orders yet',
    })) })
  } catch (error) { next(error) }
})

export default router
