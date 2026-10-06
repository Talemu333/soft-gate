import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

function serializeProduct(row) {
  return {
    id: Number(row.id), name: row.name, category: row.category, price: Number(row.price),
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    rating: Number(row.rating), reviews: Number(row.reviews), stock: Number(row.stock),
    badge: row.badge || '', image: row.image || '', description: row.description || '',
    specs: typeof row.specs === 'string' ? JSON.parse(row.specs || '[]') : (row.specs || []),
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '', includeInactive = 'false' } = req.query
    const params = [], where = []
    if (includeInactive !== 'true') where.push('active = TRUE')
    if (category && category !== 'All') { params.push(category); where.push('category = $' + params.length) }
    if (search.trim()) { params.push('%' + search.trim() + '%', '%' + search.trim() + '%'); where.push('(name ILIKE $' + (params.length - 1) + ' OR category ILIKE $' + params.length + ')') }
    const sql = 'SELECT * FROM products ' + (where.length ? 'WHERE ' + where.join(' AND ') : '') + ' ORDER BY created_at DESC, id DESC'
    const rows = await query(sql, params)
    res.json({ products: rows.map(serializeProduct) })
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM products WHERE id = $1 AND active = TRUE', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = req.body
    if (!p.name?.trim() || !p.category?.trim() || Number.isNaN(Number(p.price))) return res.status(400).json({ message: 'Name, category and price are required.' })
    const rows = await query(
      'INSERT INTO products (name, category, price, old_price, rating, reviews, stock, badge, image, description, specs) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [p.name.trim(), p.category.trim(), Number(p.price), p.oldPrice ?? null, Number(p.rating || 5), Number(p.reviews || 0), Number(p.stock || 0), p.badge || 'New', p.image || '', p.description || '', JSON.stringify(p.specs || [])],
    )
    res.status(201).json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const p = req.body
    const rows = await query(
      'UPDATE products SET name=$1, category=$2, price=$3, old_price=$4, rating=$5, reviews=$6, stock=$7, badge=$8, image=$9, description=$10, specs=$11, active=$12, updated_at=NOW() WHERE id=$13 RETURNING *',
      [p.name?.trim(), p.category?.trim(), Number(p.price), p.oldPrice ?? null, Number(p.rating ?? 0), Number(p.reviews ?? 0), Number(p.stock ?? 0), p.badge || '', p.image || '', p.description || '', JSON.stringify(p.specs || []), p.active === false ? false : true, req.params.id],
    )
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const rows = await query('UPDATE products SET active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' })
    res.json({ message: 'Product removed.' })
  } catch (error) { next(error) }
})

export default router
