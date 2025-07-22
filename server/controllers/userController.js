const User = require('../models/User')

// @route GET /api/users
exports.getAll = async (req, res) => {
    const users = await User.find().select('-password')
    res.json(users)
}

// @route GET /api/users/:id
exports.getOne = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ msg: 'User not found' })
    res.json(user)
}

// @route DELETE /api/users/:id
exports.remove = async (req, res) => {
    await User.findByIdAndDelete(req.params.id)
    res.json({ msg: 'Deleted' })
}