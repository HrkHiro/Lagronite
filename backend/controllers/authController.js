const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function setAuthCookie(res, token, rememberMe) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
  });
}

function sendAuthResponse(res, user, statusCode, rememberMe) {
  const token = getToken(user._id);

  setAuthCookie(res, token, rememberMe);

  return res.status(statusCode).json({
    message: statusCode === 201 ? 'Registration successful' : 'Login successful',
    token,
    user: buildUserPayload(user),
  });
}

function isDatabaseAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('auth required') || message.includes('not authorized') || message.includes('unauthorized');
}

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'student',
    });

    return sendAuthResponse(res, user, 201, true);
  } catch (error) {
    if (isDatabaseAuthError(error)) {
      return res.status(503).json({
        message: 'Database write access is not configured correctly. Update MONGOURL to a writable MongoDB Atlas connection string with valid credentials.',
        error: error.message,
      });
    }

    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🔒 BLOCK BANNED ACCOUNT
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned.' });
    }

    // ⏳ BLOCK ACTIVE SUSPENSION
    if (user.status === 'suspended') {
      if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        return res.status(403).json({
          message: `Account suspended until ${new Date(user.suspendedUntil).toLocaleString()}`,
        });
      }
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return sendAuthResponse(res, user, 200, Boolean(rememberMe));
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      ...buildUserPayload(req.user),
      status: req.user.status,
      suspendedUntil: req.user.suspendedUntil,
    },
  });
};