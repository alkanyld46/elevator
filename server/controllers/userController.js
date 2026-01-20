const User = require('../models/User')

// @route GET /api/users
exports.getAll = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })
        res.json(users)
    } catch (err) {
        console.error('GetAll Users Error:', err)
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route GET /api/users/:id
exports.getOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if (!user) return res.status(404).json({ msg: 'User not found' })
        res.json(user)
    } catch (err) {
        console.error('GetOne User Error:', err)
        // Handle invalid ObjectId
        if (err.name === 'CastError') {
            return res.status(400).json({ msg: 'Invalid user ID format' })
        }
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}

// @route DELETE /api/users/:id
exports.remove = async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ msg: 'You cannot delete your own account' })
        }

        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).json({ msg: 'User not found' })
        }
        res.json({ msg: 'User deleted successfully' })
    } catch (err) {
        console.error('Delete User Error:', err)
        // Handle invalid ObjectId
        if (err.name === 'CastError') {
            return res.status(400).json({ msg: 'Invalid user ID format' })
        }
        res.status(500).json({ msg: 'Server error', error: err.message })
    }
}
