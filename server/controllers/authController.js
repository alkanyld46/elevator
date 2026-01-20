const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')

// JWT expiration time
const JWT_EXPIRES_IN = '7d'

// @route  POST /api/auth/register
// @role   admin only
exports.register = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() })
        }

        const { name, email, password, role, phone } = req.body
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' })
        }

        const lowerEmail = email.toLowerCase()
        const hashed = await bcrypt.hash(password, 12)
        const user = await User.create({
            name,
            email: lowerEmail,
            password: hashed,
            role,
            phone,
        })
        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone })
    } catch (err) {
        console.error('Register Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route  POST /api/auth/login
exports.login = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() })
        }

        const { email, password } = req.body
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(400).json({ msg: 'Invalid credentials' })

        // Sign token with expiration
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
    } catch (err) {
        console.error('Login Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}
