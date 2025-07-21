const express = require('express')
const {
    getAll, create, update, remove
} = require('../controllers/elevatorController')
const { protect, authorize } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.get('/', getAll)
router.post('/', authorize('admin'), create)
router.put('/:id', authorize('admin'), update)
router.delete('/:id', authorize('admin'), remove)

module.exports = router
