import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import { query } from './db.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 5000)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, service: 'soft-gate-api', database: 'connected' })
  } catch {
    res.status(503).json({ ok: false, service: 'soft-gate-api', database: 'unavailable' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }))

app.use((error, req, res, next) => {
  console.error(error)
  const status = Number(error.status || 500)
  res.status(status).json({
    message: status < 500 ? error.message : 'Something went wrong on the server.',
  })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Soft-Gate API listening on port ${port}`)
})
