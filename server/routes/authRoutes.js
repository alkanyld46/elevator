const express = require('express')
const { register, login } = require('../controllers/authController')
const { protect, authorize } = require('../middleware/auth')
const router = express.Router()

router.post('/login', login)
router.post(
    '/register',
    protect,
    authorize('admin'),
    register
)

module.exports = router
