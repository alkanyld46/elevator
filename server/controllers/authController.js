const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// @route  POST /api/auth/register
// @role   admin only
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role })
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role })
}

// @route  POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' })

    // expires in 365 days
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '365d' }
    )
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
}
