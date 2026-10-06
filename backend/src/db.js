import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. The API cannot connect to PostgreSQL until it is configured.')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_CONNECTION_LIMIT || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
})

export async function query(text, params = []) {
  const result = await pool.query(text, params)
  return result.rows
}

export async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closePool() {
  await pool.end()
}

export default pool
