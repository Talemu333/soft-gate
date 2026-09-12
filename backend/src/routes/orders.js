import { Router } from 'express'
import { pool, withTransaction } from '../db.js'
import { requireAdmin, requireAuth } from '../auth.js'

const router = Router()

const publicOrder = (row, items) => ({
  id: row.order_number,
  date: row.created_at,
  createdAt: row.created_at,
  status: row.status,
  subtotal: row.subtotal,
  delivery: row.delivery_fee,
  total: row.total,
  payment: row.payment_method,
  paymentStatus: row.payment_status,
  customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, city: row.city, address: row.delivery_address },
  items,
})

router.post('/', async (req, res, next) => {
  try {
    const { customer, items, payment = 'transfer' } = req.body
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.city || !customer?.address || !Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Complete customer details and at least one item are required.' })
    if (!['transfer', 'card'].includes(payment)) return res.status(400).json({ message: 'Unsupported payment method.' })

    const result = await withTransaction(async (connection) => {
      const normalizedItems = []
      let subtotal = 0
      for (const requested of items) {
        const [rows] = await connection.execute('SELECT id,name,price,stock,image FROM products WHERE id = ? FOR UPDATE', [requested.productId])
        if (!rows.length) { const error = new Error(`Product ${requested.productId} was not found.`); error.status = 400; throw error }
        const product = rows[0]
        const quantity = Number(requested.quantity)
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) { const error = new Error(`${product.name} does not have enough stock.`); error.status = 409; throw error }
        subtotal += Number(product.price) * quantity
        normalizedItems.push({ productId: product.id, name: product.name, price: Number(product.price), quantity, image: product.image })
        await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product.id])
      }
      const delivery = subtotal >= 500000 ? 0 : 5000
      const total = subtotal + delivery
      const orderNumber = `SG-${Date.now().toString().slice(-8)}`
      const [insert] = await connection.execute('INSERT INTO orders (order_number,user_id,customer_name,customer_email,customer_phone,city,delivery_address,payment_method,subtotal,delivery_fee,total) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [orderNumber, req.user?.id || null, customer.name.trim(), customer.email.trim().toLowerCase(), customer.phone.trim(), customer.city.trim(), customer.address.trim(), payment, subtotal, delivery, total])
      for (const item of normalizedItems) await connection.execute('INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity,image) VALUES (?,?,?,?,?,?)', [insert.insertId, item.productId, item.name, item.price, item.quantity, item.image])
      return { orderNumber, subtotal, delivery, total, items: normalizedItems }
    })
    res.status(201).json({ order: result })
  } catch (error) { next(error) }
})

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE user_id = ? OR customer_email = (SELECT email FROM users WHERE id = ?) ORDER BY created_at DESC', [req.user.id, req.user.id])
    const output = []
    for (const order of orders) {
      const [items] = await pool.execute('SELECT product_id AS productId,product_name AS name,unit_price AS price,quantity,image FROM order_items WHERE order_id = ?', [order.id])
      output.push(publicOrder(order, items))
    }
    res.json({ orders: output })
  } catch (error) { next(error) }
})

router.get('/', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC')
    const output = []
    for (const order of orders) {
      const [items] = await pool.execute('SELECT product_id AS productId,product_name AS name,unit_price AS price,quantity,image FROM order_items WHERE order_id = ?', [order.id])
      output.push(publicOrder(order, items))
    }
    res.json({ orders: output })
  } catch (error) { next(error) }
})

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' })
    const [result] = await pool.execute('UPDATE orders SET status = ? WHERE order_number = ?', [req.body.status, req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Order not found.' })
    res.json({ message: 'Order status updated.' })
  } catch (error) { next(error) }
})

export default router
