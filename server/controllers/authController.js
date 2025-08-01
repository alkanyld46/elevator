const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// @route  POST /api/auth/register
// @role   admin only
exports.register = async (req, res) => {
    const { name, email, password, role, phone } = req.body
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
}

// @route  POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
}
