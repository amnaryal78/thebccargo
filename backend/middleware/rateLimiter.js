/**
 * Lightweight In-Memory Rate Limiter Middleware
 * Prevents brute-force attacks on login and tracking enumeration attacks.
 */

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 5, message = 'Too many requests. Please try again later.' }) {
  const requests = new Map();

  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requests.entries()) {
      if (record.resetTime <= now) {
        requests.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = requests.get(ip);
    if (!record || record.resetTime <= now) {
      record = { count: 1, resetTime: now + windowMs };
      requests.set(ip, record);
      return next();
    }

    record.count++;
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message: message,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
}

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
});

const trackingLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Rate limit exceeded for shipment tracking requests. Please slow down.'
});

const partnerApplyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many partner applications submitted from this IP. Please try again after 15 minutes.'
});

module.exports = { loginLimiter, trackingLimiter, partnerApplyLimiter, createRateLimiter };


