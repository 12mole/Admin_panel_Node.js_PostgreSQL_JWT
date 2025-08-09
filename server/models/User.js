const db = require('../config/db')
const bcrypt = require('bcrypt')

class UserModel {
  static async findAll({ 
    offset = 0, limit = 10, sort = 'username', order = 'asc' } = {}) {
    // whitelist sort fields
    const allowedSort = ['username', 'first_name', 'birthdate']
    const s = allowedSort.includes(sort) ? sort : 'username'
    const direction = (order && order.toLowerCase() === 'desc') ? 'DESC' : 'ASC'

    const countRes = await db.query('SELECT COUNT(*)::int AS total FROM users')
    const total = countRes.rows[0].total

    const query = `SELECT id, username, first_name, last_name, gender, birthdate, is_admin
                   FROM users
                   ORDER BY ${s} ${direction}
                   LIMIT $1 OFFSET $2`
    const res = await db.query(query, [limit, offset])
    return { rows: res.rows, total }
  }

  static async findById(id) {
    const res = await db.query(
      'SELECT id, username, first_name, last_name, gender, birthdate, is_admin FROM users WHERE id = $1',
      [id]
    )
    return res.rows[0]
  }

  static async findByUsername(username) {
    const res = await db.query('SELECT * FROM users WHERE username = $1', [username])
    return res.rows[0]
  }

  static async create({ 
    username, password, first_name, last_name, gender, birthdate, is_admin = false }) {
    if (!username || !password) throw new Error('Username and password required')
    const hashed = await bcrypt.hash(password, 10)
    const res = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, gender, birthdate, is_admin)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, username, first_name, last_name, gender, birthdate, is_admin`,
      [username, hashed, first_name || null, last_name || null, gender || null, birthdate || null, is_admin]
    )
    return res.rows[0]
  }

  static async update(id, { 
    username, password, first_name, last_name, gender, birthdate, is_admin }) {
    // Fetch existing
    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id])
    if (existing.rows.length === 0) return null

    // Build dynamic params
    const fields = []
    const params = []
    let idx = 1

    if (username !== undefined) { fields.push(`username = $${idx++}`); params.push(username) }
    if (password !== undefined && password !== '') {
      const hashed = await bcrypt.hash(password, 10)
      fields.push(`password = $${idx++}`)
      params.push(hashed)
    }
    if (first_name !== undefined) { fields.push(`first_name = $${idx++}`); params.push(first_name) }
    if (last_name !== undefined) { fields.push(`last_name = $${idx++}`); params.push(last_name) }
    if (gender !== undefined) { fields.push(`gender = $${idx++}`); params.push(gender) }
    if (birthdate !== undefined) { fields.push(`birthdate = $${idx++}`); params.push(birthdate) }
    if (is_admin !== undefined) { fields.push(`is_admin = $${idx++}`); params.push(is_admin) }

    if (fields.length === 0) return this.findById(id)

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, first_name, last_name, gender, birthdate, is_admin`
    params.push(id)
    const res = await db.query(sql, params)
    return res.rows[0]
  }

  static async delete(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id])
  }

  static async deleteMultiple(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
    await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids)
  }
}

module.exports = UserModel