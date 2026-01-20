const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization
    
    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token provided, please log in' })
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
        return res.status(401).json({ msg: 'No token provided, please log in' })
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Find user and attach to request
        const user = await User.findById(decoded.id).select('-password')
        
        // Check if user still exists (could have been deleted after token was issued)
        if (!user) {
            return res.status(401).json({ msg: 'User no longer exists' })
        }

        req.user = user
        next()
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired, please log in again' })
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' })
        }
        console.error('Auth Middleware Error:', err)
        res.status(401).json({ msg: 'Authentication failed' })
    }
}

exports.authorize = (...roles) => (req, res, next) => {
    // Safety check in case protect middleware didn't run
    if (!req.user) {
        return res.status(401).json({ msg: 'Not authenticated' })
    }
    
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'You do not have permission to perform this action' })
    }
    next()
}
