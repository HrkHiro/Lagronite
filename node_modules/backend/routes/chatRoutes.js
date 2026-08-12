const express = require('express')
const { protect, restrictTo } = require('../middleware/authMiddleware')
const { getChatForReport, sendMessage, closeChat } = require('../controllers/chatController')

const router = express.Router()

router.use(protect)
router.get('/:reportType/:reportId', getChatForReport)
router.post('/:reportType/:reportId', sendMessage)
router.put('/:reportType/:reportId/close', restrictTo('admin'), closeChat)

module.exports = router
