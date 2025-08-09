const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken, isAdmin } = require('../middlewares/auth')
const { verifyCsrf } = require('../middlewares/csrf')

// All user-management routes require authentication and admin role
router.use(verifyToken, isAdmin)

// Read operations (safe)
router.get('/', userController.list)
router.get('/:id', userController.get)

// Mutating operations require CSRF verification
router.post('/', verifyCsrf, userController.create)
router.put('/:id', verifyCsrf, userController.update)
router.delete('/:id', verifyCsrf, userController.remove)
router.post('/delete-multiple', verifyCsrf, userController.removeMultiple)

module.exports = router
