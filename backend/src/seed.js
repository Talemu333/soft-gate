import bcrypt from 'bcryptjs'
import 'dotenv/config'
import { pool } from './db.js'

const products = [
  ['HP EliteBook 840 G8','Laptops',685000,760000,4.8,42,8,'Best Seller','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85','Premium business laptop with dependable performance for work, study and everyday productivity.',['Intel Core i5','16GB RAM','512GB SSD','14-inch FHD']],
  ['Dell Latitude 5420','Laptops',595000,650000,4.7,31,11,'Popular','https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85','Reliable professional laptop designed for productivity, mobility and business use.',['Intel Core i5','16GB RAM','512GB SSD','14-inch FHD']],
  ['Lenovo ThinkPad T14','Laptops',625000,700000,4.9,27,6,'Premium','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85','A durable ThinkPad built for demanding work with a comfortable keyboard and excellent battery life.',['AMD Ryzen 5','16GB RAM','512GB SSD','14-inch FHD']],
  ['HP LaserJet Pro Printer','Office Tech',315000,350000,4.6,18,5,'Office Pick','https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=85','Fast, dependable monochrome printing for home offices and growing businesses.',['Laser','Wi-Fi','USB','20+ ppm']],
  ['Dell 24-inch Full HD Monitor','Monitors',185000,210000,4.7,36,14,'New','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=85','Crisp Full HD display with a clean professional design for work and entertainment.',['24-inch','1920×1080','HDMI','IPS']],
  ['Logitech Wireless Keyboard & Mouse','Accessories',35000,42000,4.5,64,22,'Best Value','https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85','A comfortable wireless combo for a clean, productive desk setup.',['Wireless','Full-size keyboard','Optical mouse','Long battery life']],
  ['Kingston 512GB SSD','Storage',72000,85000,4.8,29,19,'Fast','https://images.unsplash.com/photo-1597848212624-e19e7e7e2e5a?auto=format&fit=crop&w=900&q=85','Solid-state storage upgrade for faster boot times, applications and file transfers.',['512GB','SATA','Fast read speeds','2.5-inch']],
  ['8GB DDR4 Laptop RAM','Computer Parts',28000,33000,4.6,21,31,'Value','https://images.unsplash.com/photo-1597848212624-e19e7e7e2e5a?auto=format&fit=crop&w=900&q=85','Reliable DDR4 memory for compatible laptops and desktop systems.',['8GB','DDR4','3200MHz','SODIMM']],
  ['Universal Laptop Charger','Accessories',25000,30000,4.4,16,25,'Essential','https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85','Versatile replacement charger for compatible laptop models.',['65W','Multiple tips','Over-voltage protection','Universal']],
  ['SanDisk 128GB USB Drive','Storage',12500,15000,4.7,38,40,'Popular','https://images.unsplash.com/photo-1597848212624-e19e7e7e2e5a?auto=format&fit=crop&w=900&q=85','Compact and convenient storage for documents, photos and everyday files.',['128GB','USB 3.0','Compact','Portable']],
  ['High-Speed HDMI Cable','Accessories',8500,10000,4.5,25,50,'Essential','https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85','Reliable HDMI connection for monitors, TVs, projectors and laptops.',['High speed','4K support','HDMI','Durable']],
  ['HP ProDesk Business Desktop','Desktops',425000,470000,4.7,23,7,'Business','https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=85','Compact business desktop for productive office environments and professional workloads.',['Intel Core i5','8GB RAM','512GB SSD','Windows-ready']],
]

async function seed() {
  const password = process.env.ADMIN_PASSWORD
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  if (!password || password.length < 8 || !email) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding.')
  const hash = await bcrypt.hash(password, 12)
  await pool.execute("INSERT INTO users (name,email,password_hash,role) VALUES ('Soft-Gate Admin',?,?, 'admin') ON DUPLICATE KEY UPDATE role='admin'", [email, hash])
  for (const p of products) await pool.execute('INSERT INTO products (name,category,price,old_price,rating,reviews,stock,badge,image,description,specs) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE category=VALUES(category),price=VALUES(price),old_price=VALUES(old_price),badge=VALUES(badge),image=VALUES(image),description=VALUES(description),specs=VALUES(specs)', p)
  console.log(`Seeded ${products.length} products and admin ${email}.`)
}

seed().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => pool.end())
