const express = require('express')
const { protect, restrictTo } = require('../middleware/authMiddleware')
const {
  createSystemQuery,
  listSystemQueries,
  updateSystemQueryStatus,
  deleteSystemQuery,
} = require('../controllers/queryController')

const router = express.Router()

router.use(protect)
router.post('/', createSystemQuery)
router.get('/', listSystemQueries)
router.patch('/:queryId/status', restrictTo('admin'), updateSystemQueryStatus)
router.delete('/:queryId', restrictTo('admin'), deleteSystemQuery)

module.exports = router
