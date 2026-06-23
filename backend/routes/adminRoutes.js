const express = require('express')
const { protect, restrictTo } = require('../middleware/authMiddleware')

const {
  getAdminDashboard
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

// users
router.get('/users', getUsers)
router.patch('/users/:userId/suspend', suspendUser)
router.patch('/users/:userId/ban', banUser)
router.patch('/users/:userId/activate', activateUser)
router.delete('/users/:userId', deleteUser)

module.exports = router