const prisma = require('../utils/prisma')
const { serializeUser } = require('../utils/serializers')

// GET ALL STUDENTS
exports.getUsers = async (req, res) => {
  try {
    await prisma.user.updateMany({
      where: {
        status: 'suspended',
        suspendedUntil: { lte: new Date() },
      },
      data: {
        status: 'active',
        suspendedUntil: null,
      },
    });

    const users = await prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users: users.map(serializeUser) });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load users',
      error: err.message,
    });
  }
};

// SUSPEND USER (temporary ban with expiry)
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { until } = req.body // ISO date

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'suspended',
        suspendedUntil: until ? new Date(until) : null,
      },
    })

    res.json({ message: 'User suspended', user: serializeUser(user) })
  } catch (err) {
    res.status(500).json({
      message: 'Failed to suspend user',
      error: err.message,
    })
  }
}

// BAN USER (permanent)
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'banned' },
    })

    res.json({ message: 'User banned', user: serializeUser(user) })
  } catch (err) {
    res.status(500).json({
      message: 'Failed to ban user',
      error: err.message,
    })
  }
}

// ACTIVATE USER
exports.activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'active',
        suspendedUntil: null,
      },
    });

    res.json({ message: 'User activated', user: serializeUser(user) });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to activate user',
      error: err.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params

    await prisma.user.delete({ where: { id: userId } })

    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: err.message,
    })
  }
}