const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bc_cargo_jwt_secret_key_2026_change_me';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ [SECURITY WARNING] JWT_SECRET is not explicitly set in process.env. Using fallback secret for development.');
}

/**
 * verifyAdmin Middleware
 * Extracts JWT from the `bc_admin_token` HttpOnly cookie,
 * verifies it, and attaches the decoded admin payload to req.admin.
 * Returns 401 if no token or invalid token.
 */
function verifyAdmin(req, res, next) {
  const token = req.cookies?.bc_admin_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    // Clear invalid/expired cookie
    res.clearCookie('bc_admin_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

module.exports = { verifyAdmin, JWT_SECRET };
