import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

function serializeProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    stock: Number(row.stock),
    badge: row.badge || '',
    image: row.image || '',
    description: row.description || '',
    specs: typeof row.specs === 'string' ? JSON.parse(row.specs || '[]') : (row.specs || []),
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '', includeInactive = 'false' } = req.query
    const params = []
    const where = []

    if (includeInactive !== 'true') where.push('active = 1')
    if (category && category !== 'All') {
      where.push('category = ?')
      params.push(category)
    }
    if (search.trim()) {
      where.push('(name LIKE ? OR category LIKE ?)')
      params.push(`%${search.trim()}%`, `%${search.trim()}%`)
    }

    const rows = await query(
      `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC, id DESC`,
      params,
    )
    res.json({ products: rows.map(serializeProduct) })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM products WHERE id = ? AND active = 1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = req.body
    if (!p.name || !p.category || Number.isNaN(Number(p.price))) {
      return res.status(400).json({ message: 'Name, category and price are required.' })
    }

    const result = await query(
      `INSERT INTO products
      (name, category, price, old_price, rating, reviews, stock, badge, image, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.name.trim(), p.category.trim(), Number(p.price), p.oldPrice ?? null,
        Number(p.rating || 5), Number(p.reviews || 0), Number(p.stock || 0),
        p.badge || 'New', p.image || '', p.description || '', JSON.stringify(p.specs || []),
      ],
    )
    const rows = await query('SELECT * FROM products WHERE id = ?', [result.insertId])
    res.status(201).json({ product: serializeProduct(rows[0]) })
  } catch (error) {
    next(error)
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = req.body
    const fields = {
      name: p.name?.trim(),
      category: p.category?.trim(),
      price: Number(p.price),
      old_price: p.oldPrice ?? null,
      rating: Number(p.rating ?? 0),
      reviews: Number(p.reviews ?? 0),
      stock: Number(p.stock ?? 0),
      badge: p.badge || '',
      image: p.image || '',
      description: p.description || '',
      specs: JSON.stringify(p.specs || []),
      active: p.active === false ? 0 : 1,
    }
    await query(
      `UPDATE products SET
      name=?, category=?, price=?, old_price=?, rating=?, reviews=?, stock=?,
      badge=?, image=?, description=?, specs=?, active=?
      WHERE id=?`,
      [...Object.values(fields), req.params.id],
    )
    const rows = await query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await query('UPDATE products SET active = 0 WHERE id = ?', [req.params.id])
    res.json({ message: 'Product removed.' })
  } catch (error) {
    next(error)
  }
})

export default router
