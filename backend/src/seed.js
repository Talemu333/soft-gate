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
    'INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,role=EXCLUDED.role RETURNING id',
    [process.env.ADMIN_NAME || 'Soft-Gate Admin', adminEmail, passwordHash, 'admin'],
  )

  for (const product of products) {
    await query(
      'INSERT INTO products (id,name,category,price,old_price,rating,reviews,stock,badge,image,description,specs,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,category=EXCLUDED.category,price=EXCLUDED.price,old_price=EXCLUDED.old_price,rating=EXCLUDED.rating,reviews=EXCLUDED.reviews,stock=EXCLUDED.stock,badge=EXCLUDED.badge,image=EXCLUDED.image,description=EXCLUDED.description,specs=EXCLUDED.specs,active=TRUE,updated_at=NOW()',
      [product.id,product.name,product.category,product.price,product.oldPrice ?? null,product.rating || 0,product.reviews || 0,product.stock || 0,product.badge || '',product.image || '',product.description || '',JSON.stringify(product.specs || [])],
    )
  }

  await query("SELECT setval(pg_get_serial_sequence('products','id'), COALESCE((SELECT MAX(id) FROM products),1), TRUE)")
  await closePool()
  console.log('Seed complete: ' + products.length + ' products and admin ' + adminEmail)
}

seed().catch(async (error) => {
  console.error(error)
  await closePool()
  process.exit(1)
})
