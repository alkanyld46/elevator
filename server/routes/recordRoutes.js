const express = require('express')
const { create, getAll, uploadAttachments } = require('../controllers/recordController')
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

// Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
]

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Maximum number of files per upload
const MAX_FILES = 10

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        // Generate secure random filename to prevent path traversal
        const ext = path.extname(file.originalname).toLowerCase()
        const randomName = crypto.randomBytes(16).toString('hex')
        cb(null, `${Date.now()}-${randomName}${ext}`)
    }
})

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    }
})

const { protect } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.post('/', create)
router.get('/', getAll)

// Handle file upload with error handling for multer errors
router.post('/:id/attachments', (req, res, next) => {
    upload.array('files', MAX_FILES)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` })
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ msg: `Too many files. Maximum is ${MAX_FILES} files` })
            }
            return res.status(400).json({ msg: err.message })
        } else if (err) {
            return res.status(400).json({ msg: err.message })
        }
        next()
    })
}, uploadAttachments)

module.exports = router
