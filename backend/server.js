const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./database/db');
const { verifyAdmin } = require('./middleware/auth');

// Route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const googleSheets = require('./services/googleSheets');

const app = express();

// ═════════════════════════════════════════════════════════════════
// SECURITY HEADERS (Helmet Configuration)
// ═════════════════════════════════════════════════════════════════
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://unpkg.com",
          "https://files.catbox.moe"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'",
          "https://thebccargo.onrender.com",
          "https://sheets.googleapis.com",
          "https://flagcdn.com",
          "https://api.qrserver.com"
        ],
        frameAncestors: ["'self'"]
      }
    },
    frameguard: {
      action: 'sameorigin'
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    hidePoweredBy: true
  })
);

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
  /^file:\/\//i, // Local development files
  /^null$/i     // Local browser sandboxed requests
];

const GATEWAY_SECURITY_TOKEN = process.env.GATEWAY_SECURITY_TOKEN || 'BC_CARGO_SECURE_GATEWAY_2026';

function isAuthorizedLink(originHeader, refererHeader, securityToken, req = null) {
  if (securityToken && securityToken === GATEWAY_SECURITY_TOKEN) {
    return true;
  }
  // Allow authenticated admin sessions (bc_admin_token cookie or Authorization header)
  if (req && (req.cookies?.bc_admin_token || req.headers?.authorization)) {
    return true;
  }
  // Allow requests where origin and referer are omitted (same-origin GET, direct navigation, local fetch)
  if (!originHeader && !refererHeader) {
    return true;
  }
  if (originHeader && ALLOWED_PATTERNS.some(pattern => pattern.test(originHeader))) {
    return true;
  }
  if (refererHeader && ALLOWED_PATTERNS.some(pattern => pattern.test(refererHeader))) {
    return true;
  }
  // Allow if Host header matches allowed patterns (e.g. localhost:3000, 127.0.0.1:3000, thebccargo.com)
  if (req && req.headers?.host && ALLOWED_PATTERNS.some(pattern => pattern.test(`http://${req.headers.host}`))) {
    return true;
  }
  // Allow local development mode
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return false;
}

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const gatewayToken = req.headers['x-bc-gateway-token'] || '';

  // Skip origin validation for static assets, GET HTML requests, and public form/content API endpoints
  const publicApiPaths = [
    '/api/inquire', '/api/public/inquire',
    '/api/contact', '/api/public/contact',
    '/api/careers', '/api/public/careers', '/api/career-apply', '/api/public/career-apply',
    '/api/partner-apply', '/api/public/partner-apply',
    '/api/partner-application', '/api/public/partner-application',
    '/api/partner-request', '/api/public/partner-request',
    '/api/offers', '/api/public/offers'
  ];
  const isPublicEndpoint = req.path.startsWith('/api/public/') || publicApiPaths.includes(req.path) || (req.method === 'GET' && !req.path.startsWith('/api/admin/'));
  const authorized = isPublicEndpoint || isAuthorizedLink(origin, referer, gatewayToken, req);

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
app.use('/api', publicRoutes);
app.use('/api/admin', verifyAdmin, adminRoutes);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const shipments = await googleSheets.getAllShipments();
    return res.json({
      success: true,
      status: 'Backend & SQLite Database Operational',
      sheets_status: 'Google Sheets Connection Active',
      gateway: 'Secured via Link Authorization Middleware',
      total_records: shipments ? shipments.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Health check error querying Google Sheets:", err);
    return res.status(500).json({
      success: false,
      status: 'Database/Integration Error',
      error: 'Failed to connect to Google Sheets: ' + err.message
    });
  }
});

// Secure Tracking Endpoint
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
      return res.status(404).json({ success: false, message: `Shipment ID "${targetId}" not found.` });
    }

    const cleanSender = (shipment.sender_phone || '').replace(/[\s\-\(\)\+]/g, '');
    const cleanReceiver = (shipment.receiver_phone || '').replace(/[\s\-\(\)\+]/g, '');

    const phoneMatches = (enteredPhone.length > 0) && (
      (cleanSender.length > 0 && cleanSender === enteredPhone) ||
      (cleanReceiver.length > 0 && cleanReceiver === enteredPhone) ||
      (cleanSender.length > 0 && cleanSender.includes(enteredPhone)) ||
      (cleanReceiver.length > 0 && cleanReceiver.includes(enteredPhone))
    );

    if (!phoneMatches) {
      return res.status(403).json({ success: false, message: 'Security verification failed: Phone number does not match.' });
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
        remark: shipment.remark,
        origin: shipment.origin,
        destination: shipment.destination,
        pieces: shipment.pieces,
        service: shipment.service,
        eta: shipment.eta,
        timeline: shipment.timeline,
        timeline_json: shipment.timeline_json
      }
    });
  } catch (err) {
    console.error("Google Sheets tracking query failure:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shipment data. Please try again later."
    });
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

// Offers Legacy & Alias Endpoint
app.get('/api/offers', (req, res) => {
  db.all(`SELECT * FROM offers WHERE is_active = 1 ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
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
['/admin', '/dashboard', '/login', '/admin/login'].forEach(blockedRoute => {
  app.get(blockedRoute, (req, res) => {
    return res.status(404).send('404 Not Found');
  });
});

// B. Serve static assets (CSS, JS, images, fonts) from project root
app.use(express.static(ROOT_DIR, { extensions: ['html'] }));

// C. 301 Redirect Middleware: catch direct requests to .html URLs and redirect to clean URLs
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path.endsWith('.html')) {
    const cleanPath = req.path === '/index.html' ? '/' : req.path.slice(0, -5);
    const query = req.url.slice(req.path.length);
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// D. Explicit Clean Route Handlers
app.get('/', (req, res) => res.sendFile(getHtmlPath('index.html')));
app.get('/about', (req, res) => res.sendFile(getHtmlPath('about.html')));
app.get('/services', (req, res) => res.sendFile(getHtmlPath('services.html')));
app.get('/blog', (req, res) => res.sendFile(getHtmlPath('blog.html')));

// Dynamic SEO Blog Post Route
app.get('/blog/:slug', (req, res) => {
  const slug = req.params.slug;
  const blogHtmlPath = path.join(ROOT_DIR, 'blogs', `${slug}.html`);

  // 1. Serve static HTML file from /blogs/ if it exists
  if (fs.existsSync(blogHtmlPath)) {
    return res.sendFile(blogHtmlPath);
  }

  // 2. Fallback: Query database for articles created dynamically via admin panel
  db.get(`SELECT * FROM articles WHERE slug = ? AND status = 'published'`, [slug], (err, article) => {
    if (err || !article) {
      return res.status(404).sendFile(getHtmlPath('blog.html'));
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>${article.title} • THE BC Cargo &amp; Courier</title>
    <meta name="description" content="${(article.summary || article.title).replace(/"/g, '&quot;')}">
    <link rel="canonical" href="https://thebccargo.com/blog/${article.slug}">
    <link rel="icon" type="image/png" href="https://files.catbox.moe/eolcc7.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/css/home.css">
    <style>
        .article-container { max-width: 860px; margin: 8rem auto 4rem; padding: 0 1.5rem; }
        .article-title { font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
        .article-content { font-size: 1.1rem; line-height: 1.85; color: #cbd5e1; margin-top: 2rem; }
    </style>
</head>
<body>
    <main class="article-container">
        <h1 class="article-title">${article.title}</h1>
        ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width:100%;max-height:450px;object-fit:cover;border-radius:20px;margin-bottom:2rem;">` : ''}
        <div class="article-content">${article.content_html || article.summary}</div>
        <p style="margin-top:3rem;"><a href="/blog" style="color:#60a5fa;text-decoration:none;font-weight:700;">&larr; Back to Blog</a></p>
    </main>
</body>
</html>`;
    return res.send(htmlContent);
  });
});
app.get('/contact', (req, res) => res.sendFile(getHtmlPath('contact.html')));
app.get('/policy', (req, res) => res.sendFile(getHtmlPath('policy.html')));
app.get('/become-partner', (req, res) => res.sendFile(getHtmlPath('become-partner.html')));

// Secret gateway route: sets a 5-minute admin_entry_granted cookie and redirects to /hq-access
app.get(ADMIN_SECRET_PATH, (req, res) => {
  res.cookie('admin_entry_granted', 'true', {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.redirect('/hq-access');
});

// Protected HQ Access login page: requires admin_entry_granted cookie
app.get('/hq-access', (req, res) => {
  if (req.cookies && req.cookies.admin_entry_granted === 'true') {
    return res.sendFile(getHtmlPath('hq-access.html'));
  }
  return res.status(403).send('403 Forbidden: Access Denied');
});

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => res.sendFile(getHtmlPath('admin-dashboard.html')));

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
  const server = app.listen(port, () => {
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