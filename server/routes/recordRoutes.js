const express = require('express')
const { create, getAll, uploadAttachments } = require('../controllers/recordController')
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '')
        cb(null, unique)
    }
})
const upload = multer({ storage })
const { protect } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.post('/', create)
router.get('/', getAll)
router.post('/:id/attachments', upload.array('files'), uploadAttachments)

module.exports = router
