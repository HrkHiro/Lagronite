const express = require('express')
const { protect, restrictTo } = require('../middleware/authMiddleware')

const {
  getAdminDashboard,
  getAdminExportData,
  listArchiveRecords,
} = require('../controllers/adminController')

const {
  getUsers,
  suspendUser,
  banUser,
  activateUser,
  deleteUser
} = require('../controllers/adminUserController')

const router = express.Router()

router.use(protect, restrictTo('admin'))

// dashboard
router.get('/dashboard', getAdminDashboard)
router.get('/dashboard/export-data', getAdminExportData)
router.get('/archive', listArchiveRecords)

// users
router.get('/users', getUsers)
router.patch('/users/:userId/suspend', suspendUser)
router.patch('/users/:userId/ban', banUser)
router.patch('/users/:userId/activate', activateUser)
router.delete('/users/:userId', deleteUser)

module.exports = router