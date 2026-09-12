import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT p.id,p.name,p.category,p.price,p.old_price AS oldPrice,p.rating,p.reviews,p.stock,p.badge,p.image,p.description,p.specs FROM wishlist_items w JOIN products p ON p.id = w.product_id WHERE w.user_id = ? ORDER BY w.created_at DESC', [req.user.id])
    res.json({ products: rows.map((row) => ({ ...row, specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || []) })) })
  } catch (error) { next(error) }
})

router.post('/:productId', async (req, res, next) => {
  try {
    await pool.execute('INSERT IGNORE INTO wishlist_items (user_id,product_id) VALUES (?,?)', [req.user.id, req.params.productId])
    res.status(201).json({ message: 'Added to wishlist.' })
  } catch (error) { next(error) }
})

router.delete('/:productId', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId])
    res.status(204).end()
  } catch (error) { next(error) }
})

export default router
