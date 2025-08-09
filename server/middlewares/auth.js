const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

// verifyToken: checks cookie "token" (JWT), sets req.user on success
exports.verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// isAdmin: ensures the authenticated user has admin privileges
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' })
  }
  
  // role is set to 'admin' or 'user' in authController
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' })
  }
  
  next()
}