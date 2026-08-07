const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { serializeUser } = require('../utils/serializers');
const { uploadProfileImage } = require('../utils/cloudinary');

function getToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function buildUserPayload(user) {
  const serializedUser = serializeUser(user);

  return {
    id: serializedUser.id,
    _id: serializedUser._id,
    name: serializedUser.name,
    email: serializedUser.email,
    role: serializedUser.role,
    profileImage: serializedUser.profileImage || null,
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
  const token = getToken(user.id || user._id);

  setAuthCookie(res, token, rememberMe);

  return res.status(statusCode).json({
    message: statusCode === 201 ? 'Registration successful' : 'Login successful',
    token,
    user: buildUserPayload(user),
  });
}

exports.updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword, profileImage } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id || req.user._id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const passwordMatches = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (name) {
      user.name = name.trim();
    }

    if (profileImage) {
      user.profileImage = await uploadProfileImage(profileImage);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        password: user.password,
        profileImage: user.profileImage,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: buildUserPayload(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

function isDatabaseAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('auth required') || message.includes('not authorized') || message.includes('unauthorized');
}

exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, quizScore, termsAgreed } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate terms quiz: require quizScore >= 4 and explicit agreement
    const numericScore = typeof quizScore === 'number' ? Math.floor(quizScore) : null;
    const passedQuiz = numericScore !== null && numericScore >= 4 && termsAgreed === true;

    if (!passedQuiz) {
      return res.status(400).json({ message: 'You must pass the Terms of Service quiz (minimum 4/6) and agree to the Terms before creating an account.' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'student',
        termsQuizScore: numericScore,
        termsQuizPassed: true,
        termsAgreed: true,
        termsAgreedAt: new Date(),
      },
    });

    return sendAuthResponse(res, user, 201, true);
  } catch (error) {
    if (isDatabaseAuthError(error)) {
      return res.status(503).json({
        message: 'Database write access is not configured correctly. Check DATABASE_URL and your MySQL credentials.',
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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🔒 BLOCK BANNED / DELETED ACCOUNT
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned.' });
    }

    if (user.status === 'deleted') {
      return res.status(403).json({ message: 'This account has been deleted.' });
    }

    // ⏳ BLOCK ACTIVE SUSPENSION
    if (user.status === 'suspended') {
      if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        return res.status(403).json({
          message: `Account suspended until ${new Date(user.suspendedUntil).toLocaleString()}`,
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'active',
          suspendedUntil: null,
        },
      })
    }

    // Require Terms quiz passed before allowing login
    if (!user.termsQuizPassed) {
      return res.status(403).json({ message: 'You must complete and pass the Terms of Service quiz before logging in.' });
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