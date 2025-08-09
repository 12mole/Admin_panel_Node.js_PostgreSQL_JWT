// Authentication controller with JWT and CSRF protection

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const db = require('../config/db')
require('dotenv').config()

// Security configurations
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const JWT_EXPIRES = '1h'
const COOKIE_MAX_AGE = 60 * 60 * 1000 // 1 hour
const isProduction = process.env.NODE_ENV === 'production'

// Generates random CSRF token for anti-CSRF protection
function generateCsrfToken() {
  return crypto.randomBytes(24).toString('hex')
}

// Authenticates user and sets secure cookies
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

  
    if (!user || !(await bcrypt.compare(password, user.password)) || !user.is_admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: 'admin'
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
      maxAge: COOKIE_MAX_AGE
    })

    const csrfToken = generateCsrfToken();
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
      maxAge: COOKIE_MAX_AGE
    })

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: 'admin'
      }
    })
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Clears authentication cookies
exports.logout = (req, res) => {
  res.clearCookie('token')
  res.clearCookie('csrfToken')
  res.json({ message: 'Logged out successfully' })
}

// Verifies active session and CSRF token
exports.checkAuth = (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ isAuthenticated: false })
    
    // Refresh CSRF token if missing
    if (!req.cookies?.csrfToken) {
      res.cookie('csrfToken', generateCsrfToken(), {
        httpOnly: false,
        sameSite: isProduction ? 'strict' : 'lax',
        secure: isProduction,
        maxAge: COOKIE_MAX_AGE
      })
    }

    res.json({ isAuthenticated: true, user: req.user })
  } catch (err) {
    console.error('Auth check error:', err)
    res.status(500).json({ isAuthenticated: false })
  }
}

