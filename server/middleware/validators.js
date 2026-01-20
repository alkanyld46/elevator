// server/middleware/validators.js
const { body } = require('express-validator')

// Registration validation rules
exports.registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'tech'])
        .withMessage('Role must be either admin or tech'),
    body('phone')
        .optional()
        .trim()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
]

// Login validation rules
exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
]
