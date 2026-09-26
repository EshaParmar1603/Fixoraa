const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
const { errorResponse } = require('../utils/response');
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }
    if (!token) {
      return errorResponse(res, 'Authentication token missing. Please log in.', 401);
    }
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token. Please log in again.', 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        providerProfile: true
      }
    });
    if (!user) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }
        next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed: ' + error.message, 500);
  }
};
// Optional auth: populate req.user if token exists, but don't fail if absent
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { providerProfile: true }
        });
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (e) {
        // Token invalid, ignore for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
};
module.exports = {
  authenticate,
  optionalAuthenticate
};
