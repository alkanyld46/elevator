const express = require('express')
const { register, login } = require('../controllers/authController')
const { protect, authorize } = require('../middleware/auth')
const { registerValidation, loginValidation } = require('../middleware/validators')
const router = express.Router()

router.post('/login', loginValidation, login)
router.post(
    '/register',
    protect,
    authorize('admin'),
    registerValidation,
    register
)

module.exports = router
