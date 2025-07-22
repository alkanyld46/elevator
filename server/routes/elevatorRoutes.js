const express = require('express')
const {
    getAll, create, update, remove, getCurrent
} = require('../controllers/elevatorController')
const { protect, authorize } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.get('/current', getCurrent)
router.get('/', getAll)
router.post('/', authorize('admin'), create)
router.put('/:id', authorize('admin'), update)
router.delete('/:id', authorize('admin'), remove)

module.exports = router
