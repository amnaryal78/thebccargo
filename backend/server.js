const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// ═════════════════════════════════════════════════════════════════
// STARTUP ENVIRONMENT VALIDATION
// ═════════════════════════════════════════════════════════════════
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ENV_WARNINGS = [];

if (!process.env.JWT_SECRET) {
  ENV_WARNINGS.push('JWT_SECRET is not set — using insecure default. Set it in .env for production.');
}
if (!process.env.ADMIN_DEFAULT_PASSWORD) {
  ENV_WARNINGS.push('ADMIN_DEFAULT_PASSWORD is not set — using insecure default. Set it in .env before first deploy.');
}
if (!process.env.GATEWAY_SECURITY_TOKEN) {
  ENV_WARNINGS.push('GATEWAY_SECURITY_TOKEN is not set — using insecure default.');
}
if (!process.env.GOOGLE_SHEETS_WEBAPP_URL) {
  ENV_WARNINGS.push('GOOGLE_SHEETS_WEBAPP_URL is not set — live shipment tracking will be disabled.');
}

if (ENV_WARNINGS.length > 0) {
  console.warn('\n⚠️  [ENV VALIDATION] Missing or defaulted environment variables:');
  ENV_WARNINGS.forEach(w => console.warn(`   • ${w}`));
  if (IS_PRODUCTION) {
    console.error('❌ Production startup with missing critical env vars. Please configure .env immediately.\n');
  } else {
    console.warn('   (Warnings only — non-production mode)\n');
  }
}

const db = require('./database/db');
const { verifyAdmin } = require('./middleware/auth');

// Route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();

// Make db accessible via req.app.get('db')
app.set('db', db);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ═════════════════════════════════════════════════════════════════
// 1. STRICT ORIGIN & SECURITY LINK VERIFICATION MIDDLEWARE
// ═════════════════════════════════════════════════════════════════
const ALLOWED_PATTERNS = [
  /^http:\/\/localhost:\d+/i,
  /^http:\/\/127\.0\.0\.1:\d+/i,
  /^https?:\/\/(www\.)?thebccargo\.com/i,
  /^https?:\/\/[a-zA-Z0-9-]+\.github\.io/i,
  /^https?:\/\/[a-zA-Z0-9-]+\.onrender\.com/i,
  /^https?:\/\/[a-zA-Z0-9-]+\.netlify\.app/i,
  /^file:\/\//i, // Local development files
  /^null$/i     // Local browser sandboxed requests
];

const GATEWAY_SECURITY_TOKEN = process.env.GATEWAY_SECURITY_TOKEN || 'BC_CARGO_SECURE_GATEWAY_2026';

function isAuthorizedLink(originHeader, refererHeader, securityToken, method = 'GET') {
  if (securityToken && securityToken === GATEWAY_SECURITY_TOKEN) {
    return true;
  }
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }
  if (!originHeader && !refererHeader) {
    return true;
  }
  if (originHeader && ALLOWED_PATTERNS.some(pattern => pattern.test(originHeader))) {
    return true;
  }
  if (refererHeader && ALLOWED_PATTERNS.some(pattern => pattern.test(refererHeader))) {
    return true;
  }
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const gatewayToken = req.headers['x-bc-gateway-token'] || '';

  const authorized = isAuthorizedLink(origin, referer, gatewayToken, req.method);

  db.run(
    `INSERT INTO access_logs (ip, origin, referer, path, status_code) VALUES (?, ?, ?, ?, ?)`,
    [req.ip || req.socket.remoteAddress, origin, referer, req.path, authorized ? 200 : 403],
    (err) => { if (err) console.error('Log error:', err.message); }
  );

  if (!authorized) {
    console.warn(`⛔ [BLOCKED REQUEST] Unauthorized origin/link: Origin="${origin}", Referer="${referer}", Path="${req.path}"`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Access Denied. Request link or origin is not authorized.',
      code: 403
    });
  }

  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || isAuthorizedLink(origin, null, null)) {
      callback(null, true);
    } else {
      callback(new Error('Access blocked by CORS security policy.'));
    }
  },
  credentials: true
}));

// ═════════════════════════════════════════════════════════════════
// 2. MOUNT API ROUTES
// ═════════════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', verifyAdmin, adminRoutes);

const googleSheets = require('./services/googleSheets');

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const liveShipments = await googleSheets.getAllShipments();
    return res.json({
      success: true,
      status: 'Backend & Google Sheets Database Operational',
      gateway: 'Secured via Link Authorization Middleware',
      total_records: liveShipments.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, status: 'Google Sheets Service Error', error: err.message });
  }
});

// Secure Tracking Endpoint (Google Sheets Single Source of Truth)
app.post('/api/track', async (req, res) => {
  const { tracking_id, phone } = req.body;
  if (!tracking_id || !phone) {
    return res.status(400).json({ success: false, message: 'Tracking ID and phone number are required.' });
  }

  const targetId = tracking_id.toString().trim().toUpperCase();
  const enteredPhone = phone.toString().replace(/[\s\-\(\)\+]/g, '');

  try {
    const shipment = await googleSheets.getShipmentById(targetId);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment ID "${tracking_id}" not found in Google Sheets.` });
    }

    const cleanSender = (shipment.sender_phone || '').replace(/[\s\-\(\)\+]/g, '');
    const cleanReceiver = (shipment.receiver_phone || '').replace(/[\s\-\(\)\+]/g, '');

    const phoneMatches = (enteredPhone.length > 0) && (
      (cleanSender.length > 0 && cleanSender === enteredPhone) ||
      (cleanReceiver.length > 0 && cleanReceiver === enteredPhone) ||
      (cleanSender.length > 0 && (cleanSender.includes(enteredPhone) || enteredPhone.includes(cleanSender))) ||
      (cleanReceiver.length > 0 && (cleanReceiver.includes(enteredPhone) || enteredPhone.includes(cleanReceiver)))
    );

    if (!phoneMatches) {
      return res.status(403).json({ success: false, message: 'Security verification failed: Phone number does not match sender or receiver record.' });
    }

    return res.json({
      success: true,
      shipment: {
        tracking_id: shipment.tracking_id,
        sn: shipment.sn,
        sender_name: shipment.sender_name,
        sender_country: shipment.sender_country,
        sender_address: shipment.sender_address,
        receiver_name: shipment.receiver_name,
        receiver_country: shipment.receiver_country,
        receiver_address: shipment.receiver_address,
        goods: shipment.goods,
        weight: shipment.weight,
        total: shipment.total,
        status: shipment.status,
        shipping_date: shipment.shipping_date,
        origin: shipment.origin,
        destination: shipment.destination,
        pieces: shipment.pieces,
        service: shipment.service,
        eta: shipment.eta,
        remark: shipment.remark,
        timeline: shipment.timeline
      }
    });
  } catch (err) {
    console.error('Track endpoint error:', err);
    return res.status(500).json({ success: false, message: 'Failed to query tracking database.' });
  }
});

// Freight Inquiry Endpoint
app.post('/api/inquire', (req, res) => {
  const { full_name, email, phone, service, message } = req.body;
  if (!full_name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please provide full name, email, phone, and message.' });
  }

  const sql = `INSERT INTO inquiries (full_name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [full_name, email, phone, service || 'General', message], function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Failed to record inquiry.' });
    return res.json({ success: true, message: 'Freight inquiry recorded successfully.', inquiry_id: this.lastID });
  });
});

// Articles Legacy Endpoint
app.get('/api/articles', (req, res) => {
  db.all(`SELECT id, slug, title, category, date, read_time, author_name, author_role, author_avatar, image, summary FROM articles ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.json({ success: true, articles: rows || [] });
  });
});

// Active Offers Public Endpoint
app.get('/api/offers', (req, res) => {
  db.all(`SELECT * FROM offers WHERE is_active = 1 ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, offers: rows || [] });
  });
});

// ═════════════════════════════════════════════════════════════════
// 3. SERVE STATIC ASSETS & CLEAN URL HANDLERS
// ═════════════════════════════════════════════════════════════════

const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || '/bc-mgmt-x9k2p7';
const ROOT_DIR = path.join(__dirname, '..');

function getHtmlPath(filename) {
  return path.join(ROOT_DIR, filename);
}

// A. Block standard/guessable admin paths to prevent brute force scans
['/admin', '/dashboard', '/login', '/hq-access', '/admin/login'].forEach(blockedRoute => {
  app.get(blockedRoute, (req, res) => {
    return res.status(404).send('404 Not Found');
  });
});

// B. 301 Redirect Middleware: catch direct requests to .html URLs and redirect to clean URLs
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path === '/index.html' ? '/' : req.path.slice(0, -5);
    const query = req.url.slice(req.path.length);
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// C. Explicit Clean Route Handlers
app.get('/', (req, res) => res.sendFile(getHtmlPath('index.html')));
app.get('/about', (req, res) => res.sendFile(getHtmlPath('about.html')));
app.get('/services', (req, res) => res.sendFile(getHtmlPath('services.html')));
app.get('/blog', (req, res) => res.sendFile(getHtmlPath('blog.html')));
app.get('/contact', (req, res) => res.sendFile(getHtmlPath('contact.html')));
app.get('/policy', (req, res) => res.sendFile(getHtmlPath('policy.html')));
app.get('/careers', (req, res) => res.sendFile(getHtmlPath('careers.html')));

// Serve hidden admin login page ONLY on the unguessable dynamic secret route
app.get(ADMIN_SECRET_PATH, (req, res) => res.sendFile(getHtmlPath('hq-access.html')));

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => res.sendFile(getHtmlPath('admin-dashboard.html')));

// D. Serve static assets (CSS, JS, images, fonts) from project root with optimized Cache-Control headers
app.use(express.static(ROOT_DIR, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif', '.ico'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// E. Fallback route for SPA/Clean URLs
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  res.sendFile(getHtmlPath('index.html'));
});

// Global Fallback Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Gateway Error:', err.stack || err.message);
  res.status(500).json({ success: false, error: 'Internal Gateway Error' });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

function startServer(port) {
  googleSheets.validateConfig();

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 BC Cargo Backend & Embedded Database Gateway running on port ${port}`);
    console.log(`🔒 Link Security Verification Active (Unauthorized links will be rejected with 403)`);
    console.log(`🛡️  Admin Login Route (Secret): http://localhost:${port}${ADMIN_SECRET_PATH}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is currently in use. Automatically switching to port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server execution error:', err.message);
    }
  });
}

startServer(DEFAULT_PORT);