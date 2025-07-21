const express = require('express')
const { create, getAll } = require('../controllers/recordController')
const { protect } = require('../middleware/auth')
const router = express.Router()

router.use(protect)
router.post('/', create)
router.get('/', getAll)

module.exports = router
