import { Router } from 'express'
import { query, transaction } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()

function mapOrder(row, items = []) {
  return {
    id: row.order_number, databaseId: Number(row.id),
    date: new Date(row.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: row.created_at, status: row.status, payment: row.payment_method, paymentStatus: row.payment_status,
    subtotal: Number(row.subtotal), delivery: Number(row.delivery), total: Number(row.total),
    customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, city: row.city, address: row.address },
    items: items.map((item) => ({ productId: Number(item.product_id), name: item.product_name, price: Number(item.unit_price), quantity: Number(item.quantity), image: item.image || '' })),
  }
}

async function getOrderById(id) {
  const rows = await query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [id])
  if (!rows[0]) return null
  const items = await query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [rows[0].id])
  return mapOrder(rows[0], items)
}

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { items, customer, subtotal, total, payment = 'transfer' } = req.body
    if (!Array.isArray(items) || !items.length || !customer?.name || !customer?.email || !customer?.phone || !customer?.city || !customer?.address) return res.status(400).json({ message: 'Complete customer and order information is required.' })
    if (!['transfer', 'card'].includes(payment)) return res.status(400).json({ message: 'Invalid payment method.' })

    const orderId = await transaction(async (connection) => {
      const productIds = [...new Set(items.map((item) => Number(item.productId)).filter(Number.isInteger))]
      if (!productIds.length || productIds.length !== items.length) throw Object.assign(new Error('Invalid product selection.'), { status: 400 })
      const placeholders = productIds.map((_, i) => '$' + (i + 1)).join(',')
      const productResult = await connection.query('SELECT * FROM products WHERE id IN (' + placeholders + ') AND active=TRUE FOR UPDATE', productIds)
      const productMap = new Map(productResult.rows.map((p) => [Number(p.id), p]))
      let calculatedSubtotal = 0
      const normalizedItems = []

      for (const item of items) {
        const product = productMap.get(Number(item.productId))
        const quantity = Math.floor(Number(item.quantity || 1))
        if (!product) throw Object.assign(new Error('One of the products is no longer available.'), { status: 409 })
        if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Invalid product quantity.'), { status: 400 })
        if (Number(product.stock) < quantity) throw Object.assign(new Error(product.name + ' does not have enough stock.'), { status: 409 })
        calculatedSubtotal += Number(product.price) * quantity
        normalizedItems.push({ product, quantity })
      }

      const calculatedDelivery = calculatedSubtotal >= 500000 ? 0 : 5000
      const calculatedTotal = calculatedSubtotal + calculatedDelivery
      if (Math.abs(Number(subtotal) - calculatedSubtotal) > 0.01 || Math.abs(Number(total) - calculatedTotal) > 0.01) throw Object.assign(new Error('The order total changed. Please review your cart and try again.'), { status: 409 })

      const orderNumber = 'SG-' + Date.now().toString().slice(-8)
      const orderResult = await connection.query(
        'INSERT INTO orders (order_number,user_id,customer_name,customer_email,customer_phone,city,address,subtotal,delivery,total,payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id',
        [orderNumber, req.user?.id || null, customer.name.trim(), customer.email.trim().toLowerCase(), customer.phone.trim(), customer.city.trim(), customer.address.trim(), calculatedSubtotal, calculatedDelivery, calculatedTotal, payment],
      )

      for (const item of normalizedItems) {
        await connection.query('INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity,image) VALUES ($1,$2,$3,$4,$5,$6)', [orderResult.rows[0].id, item.product.id, item.product.name, item.product.price, item.quantity, item.product.image || ''])
        await connection.query('UPDATE products SET stock=stock-$1, updated_at=NOW() WHERE id=$2', [item.quantity, item.product.id])
      }
      return orderResult.rows[0].id
    })

    res.status(201).json({ order: await getOrderById(orderId) })
  } catch (error) { next(error) }
})

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
    res.json({ orders: await Promise.all(rows.map((row) => getOrderById(row.id))) })
  } catch (error) { next(error) }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM orders WHERE id=$1 OR order_number=$1', [req.params.id])
    const row = rows[0]
    if (!row) return res.status(404).json({ message: 'Order not found.' })
    if (req.user.role !== 'admin' && Number(row.user_id) !== Number(req.user.id)) return res.status(403).json({ message: 'You do not have access to this order.' })
    res.json({ order: await getOrderById(row.id) })
  } catch (error) { next(error) }
})

export default router
