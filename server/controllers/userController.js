const db = require('../config/db')
const bcrypt = require('bcrypt')

// GET /api/users
exports.list = async (req, res) => {
  try {
    // Приводим все параметры к нормальным типам
    const pageNum = parseInt(req.query.page, 10) || 1
    const limitNum = parseInt(req.query.limit, 10) || 10
    const sort = req.query.sort || 'username'
    const order = req.query.order || 'asc'
    const search = req.query.search ? req.query.search.trim() : ''

    const offset = (pageNum - 1) * limitNum

    // Разрешённые поля для сортировки
    const allowedSort = ['id', 'username', 'first_name', 'last_name', 'birthdate']
    const sortField = allowedSort.includes(sort) ? sort : 'username'
    const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC'

    // Поиск
    let searchCondition = ''
    const searchParams = []
    if (search) {
      searchCondition = `
        WHERE username ILIKE $${searchParams.length + 1}
           OR first_name ILIKE $${searchParams.length + 1}
           OR last_name ILIKE $${searchParams.length + 1}
      `
      searchParams.push(`%${search}%`)
    }

    // Считаем общее количество
    const countResult = await db.query(
      `SELECT COUNT(*) AS count FROM users ${searchCondition}`,
      searchParams
    )
    const total = parseInt(countResult.rows[0].count, 10)

    // Получаем данные пользователей
    const usersResult = await db.query(
      `SELECT id, username, first_name, last_name, gender, birthdate, is_admin
       FROM users
       ${searchCondition}
       ORDER BY ${sortField} ${sortOrder}
       LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}`,
      [...searchParams, limitNum, offset]
    )

    res.json({
      users: usersResult.rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (err) {
    console.error('[list] Error:', err)
    res.status(500).json({ message: 'Error fetching users' })
  }
}

// GET /api/users/:id
exports.get = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      `SELECT id, username, first_name, last_name, gender, birthdate, is_admin
       FROM users
       WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('[get] Error:', err)
    res.status(500).json({ message: 'Error fetching user details' })
  }
}

// POST /api/users
exports.create = async (req, res) => {
  try {
    const { username, password, first_name, last_name, gender, birthdate, is_admin } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const exists = await db.query('SELECT 1 FROM users WHERE username = $1', [username])
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query(
      `INSERT INTO users (username, password, first_name, last_name, gender, birthdate, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        username,
        hashedPassword,
        first_name || null,
        last_name || null,
        gender || null,
        birthdate || null,
        is_admin === true || is_admin === 'true'
      ]
    )

    res.status(201).json({ message: 'User created successfully' })
  } catch (err) {
    console.error('[create] Error:', err)
    res.status(500).json({ message: 'Error creating user' })
  }
}

// PUT /api/users/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, first_name, last_name, gender, birthdate, is_admin } = req.body

    const fields = ['username', 'first_name', 'last_name', 'gender', 'birthdate', 'is_admin']
    const values = [username, first_name, last_name, gender, birthdate, is_admin === true || is_admin === 'true']
    const setParts = []
    const params = []
    let paramIndex = 1

    fields.forEach((field, idx) => {
      if (values[idx] !== undefined) {
        setParts.push(`${field} = $${paramIndex++}`)
        params.push(values[idx])
      }
    })

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      setParts.push(`password = $${paramIndex++}`)
      params.push(hashedPassword)
    }

    if (setParts.length === 0) {
      return res.status(400).json({ message: 'No data to update' })
    }

    params.push(id)
    const query = `UPDATE users SET ${setParts.join(', ')} WHERE id = $${paramIndex}`
    const result = await db.query(query, params)

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User updated successfully' })
  } catch (err) {
    console.error('[update] Error:', err)
    res.status(500).json({ message: 'Error updating user' })
  }
}

// DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete yourself' })
    }

    const result = await db.query('DELETE FROM users WHERE id = $1', [id])

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error('[remove] Error:', err)
    res.status(500).json({ message: 'Error deleting user' })
  }
}

// POST /api/users/delete-multiple
exports.removeMultiple = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs array is required' })
    }

    const safeIds = ids.filter(id => parseInt(id) !== req.user.id)

    if (safeIds.length === 0) {
      return res.status(400).json({ message: 'Cannot delete yourself' })
    }

    const placeholders = safeIds.map((_, i) => `$${i + 1}`).join(', ')
    await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, safeIds)

    res.json({ message: 'Selected users deleted successfully' })
  } catch (err) {
    console.error('[removeMultiple] Error:', err)
    res.status(500).json({ message: 'Error deleting multiple users' })
  }
}