import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import { pool } from './db.js'
import authRouter from './routes/auth.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'
import wishlistRouter from './routes/wishlist.js'
import contactRouter from './routes/contact.js'
import adminRouter from './routes/admin.js'

const app = express()
const port = Number(process.env.PORT || 5000)

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map((v) => v.trim()) || true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'mysql' })
  } catch {
    res.status(503).json({ ok: false, database: 'unavailable' })
  }
})

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/contact', contactRouter)
app.use('/api/admin', adminRouter)

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))
app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ message: error.message || 'Internal server error.' })
})

app.listen(port, () => console.log(`Soft-Gate API listening on http://localhost:${port}`))
