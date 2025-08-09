const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_admin',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
})

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: async () => {
    const client = await pool.connect()
    client.release()
  }
}