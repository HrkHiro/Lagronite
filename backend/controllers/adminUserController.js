const User = require('../models/User')

// GET ALL STUDENTS
exports.getUsers = async (req, res) => {
  try {
    await User.updateMany(
      {
        status: 'suspended',
        suspendedUntil: { $lte: new Date() },
      },
      {
        status: 'active',
        suspendedUntil: null,
      }
    );

    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: 'suspended',
        suspendedUntil: until,
      },
      { new: true }
    ).select('-password')

    res.json({ message: 'User suspended', user })
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

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'banned' },
      { new: true }
    ).select('-password')

    res.json({ message: 'User banned', user })
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

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: 'active',
        suspendedUntil: null,
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'User activated', user });
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

    await User.findByIdAndDelete(userId)

    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete user',
      error: err.message,
    })
  }
}