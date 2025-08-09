const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { verifyToken } = require('../middlewares/auth')

// POST /api/auth/login
router.post('/login', authController.login)

// POST /api/auth/logout
router.post('/logout', authController.logout)

// GET /api/auth/check  (protected)
router.get('/check', verifyToken, authController.checkAuth)

module.exports = router
