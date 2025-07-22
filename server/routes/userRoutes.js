const express = require('express')
const { getAll, getOne, remove } = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.get('/', getAll)
router.get('/:id', getOne)
router.delete('/:id', remove)

module.exports = router