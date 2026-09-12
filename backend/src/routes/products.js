import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin, requireAuth } from '../auth.js'

const router = Router()

function serializeProduct(row) {
  return { ...row, oldPrice: row.old_price, specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || []) }
}

router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query
    let sql = 'SELECT id,name,category,price,old_price AS oldPrice,rating,reviews,stock,badge,image,description,specs FROM products WHERE 1=1'
    const params = []
    if (category && category !== 'All') { sql += ' AND category = ?'; params.push(category) }
    if (search) { sql += ' AND (name LIKE ? OR category LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
    sql += ' ORDER BY created_at DESC'
    const [rows] = await pool.execute(sql, params)
    res.json({ products: rows.map(serializeProduct) })
  } catch (error) { next(error) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id,name,category,price,old_price AS oldPrice,rating,reviews,stock,badge,image,description,specs FROM products WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ message: 'Product not found.' })
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, category, price, oldPrice = null, stock = 0, badge = 'New', image = null, description, specs = [], rating = 5, reviews = 0 } = req.body
    if (!name || !category || price == null || !description) return res.status(400).json({ message: 'Name, category, price and description are required.' })
    const [result] = await pool.execute('INSERT INTO products (name,category,price,old_price,rating,reviews,stock,badge,image,description,specs) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [name, category, price, oldPrice, rating, reviews, stock, badge, image, description, JSON.stringify(specs)])
    const [rows] = await pool.execute('SELECT id,name,category,price,old_price AS oldPrice,rating,reviews,stock,badge,image,description,specs FROM products WHERE id = ?', [result.insertId])
    res.status(201).json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const fields = { name: 'name', category: 'category', price: 'price', oldPrice: 'old_price', stock: 'stock', badge: 'badge', image: 'image', description: 'description', rating: 'rating', reviews: 'reviews' }
    const sets = []; const params = []
    for (const [key, column] of Object.entries(fields)) if (req.body[key] !== undefined) { sets.push(`${column} = ?`); params.push(req.body[key]) }
    if (req.body.specs !== undefined) { sets.push('specs = ?'); params.push(JSON.stringify(req.body.specs)) }
    if (!sets.length) return res.status(400).json({ message: 'No changes supplied.' })
    params.push(req.params.id)
    const [result] = await pool.execute(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, params)
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' })
    const [rows] = await pool.execute('SELECT id,name,category,price,old_price AS oldPrice,rating,reviews,stock,badge,image,description,specs FROM products WHERE id = ?', [req.params.id])
    res.json({ product: serializeProduct(rows[0]) })
  } catch (error) { next(error) }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' })
    res.status(204).end()
  } catch (error) { next(error) }
})

export default router
