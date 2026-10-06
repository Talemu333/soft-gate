import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { query, closePool } from './db.js'
import { products } from '../../src/data/products.js'

dotenv.config()

async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@soft-gate.com').trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
    [process.env.ADMIN_NAME || 'Soft-Gate Admin', adminEmail, passwordHash],
  )

  for (const product of products) {
    await query(
      `INSERT INTO products
      (id, name, category, price, old_price, rating, reviews, stock, badge, image, description, specs, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
      name=VALUES(name), category=VALUES(category), price=VALUES(price), old_price=VALUES(old_price),
      rating=VALUES(rating), reviews=VALUES(reviews), stock=VALUES(stock), badge=VALUES(badge),
      image=VALUES(image), description=VALUES(description), specs=VALUES(specs), active=1`,
      [
        product.id, product.name, product.category, product.price, product.oldPrice ?? null,
        product.rating || 0, product.reviews || 0, product.stock || 0, product.badge || '',
        product.image || '', product.description || '', JSON.stringify(product.specs || []),
      ],
    )
  }

  console.log(`Seeded ${products.length} products and admin ${adminEmail}.`)
  await closePool()
}

seed().catch(async (error) => {
  console.error(error)
  await closePool()
  process.exit(1)
})
