const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { serializeUser } = require('../utils/serializers');

function clearAuthCookie(res) {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

async function getTokenUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id || decoded.userId;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return serializeUser(user);
}

exports.protect = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    const token = bearerToken || req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await getTokenUser(token);

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (user.status === 'deleted' || user.status === 'banned') {
      clearAuthCookie(res);
      return res.status(403).json({
        message: user.status === 'deleted' ? 'This account has been deleted.' : 'Your account has been banned.',
      });
    }

    if (user.status === 'suspended') {
      if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        clearAuthCookie(res);
        return res.status(403).json({
          message: `Account suspended until ${new Date(user.suspendedUntil).toLocaleString()}`,
        });
      }

      await prisma.user.update({
        where: { id: user.id || user._id },
        data: {
          status: 'active',
          suspendedUntil: null,
        },
      })
    }

    req.user = user;
    return next();
  } catch (error) {
    clearAuthCookie(res);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to access this route' });
  }

  return next();
};