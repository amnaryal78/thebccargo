const express = require('express');
const router = express.Router();
const googleSheets = require('../services/googleSheets');

// ═══════════════════════════════════════════════════════════
// PUBLIC READ-ONLY ENDPOINTS
// Consumed by main website frontend & tracking system
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/public/shipment/:tracking_id or /api/track/:trackingId
 * Returns public shipment info directly from Google Sheets API.
 */
async function handlePublicTracking(req, res) {
  const rawId = req.params.tracking_id || req.params.trackingId;
  if (!rawId) {
    return res.status(400).json({ success: false, message: 'Tracking ID is required.' });
  }

  const trackingId = rawId.trim().toUpperCase();
  try {
    const shipment = await googleSheets.getShipmentById(trackingId);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: `Shipment ID "${trackingId}" not found in Google Sheets.`
      });
    }

    return res.json({
      success: true,
      shipment: {
        tracking_id: shipment.tracking_id,
        sn: shipment.sn,
        sender_name: shipment.sender_name,
        sender_country: shipment.sender_country,
        receiver_name: shipment.receiver_name,
        receiver_country: shipment.receiver_country,
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
    console.error('Public tracking route error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch shipment from Google Sheets.' });
  }
}

const { trackingLimiter } = require('../middleware/rateLimiter');

router.get('/shipment/:tracking_id', trackingLimiter, handlePublicTracking);
router.get('/track/:trackingId', trackingLimiter, handlePublicTracking);

/**
 * GET /api/public/blogs
 * Returns published articles from SQLite for the blog page.
 */
router.get('/blogs', (req, res) => {
  const db = req.app.get('db');
  db.all(
    `SELECT * FROM articles WHERE status = 'published' OR status IS NULL OR status = '' ORDER BY id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      const blogs = (rows || []).map(row => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        image_url: row.image || row.image_url || 'https://files.catbox.moe/kv8fb3.jpeg',
        image: row.image || row.image_url || 'https://files.catbox.moe/kv8fb3.jpeg',
        read_time: row.read_time || '3 min read',
        publish_date: row.date || row.publish_date || row.created_at || 'Recent',
        date: row.date || row.publish_date || row.created_at || 'Recent',
        summary: row.summary || '',
        content: row.content_html || row.content || '',
        content_html: row.content_html || row.content || '',
        status: row.status || 'published',
        author_name: row.author_name || 'BC Cargo Team',
        author_role: row.author_role || 'Logistics Specialist',
        author_avatar: row.author_avatar || 'BC'
      }));
      return res.json({ success: true, blogs });
    }
  );
});

/**
 * GET /api/public/blog-stats
 * Returns dynamic blog statistics calculated from SQLite database.
 */
router.get('/blog-stats', (req, res) => {
  const db = req.app.get('db');
  db.get(
    `SELECT COUNT(*) AS totalArticles, COUNT(DISTINCT author_name) AS totalAuthors FROM articles`,
    [],
    (err, row) => {
      const articlesPublished = (row && row.totalArticles > 0) ? row.totalArticles : 6;
      const expertAuthors = (row && row.totalAuthors > 0) ? row.totalAuthors : 3;
      return res.json({
        success: true,
        stats: {
          articlesPublished: String(articlesPublished),
          monthlyReaders: '8,400+',
          countriesCovered: '120+',
          expertAuthors: String(expertAuthors)
        }
      });
    }
  );
});

/**
 * GET /api/public/blog/:slug
 * Returns a single article by slug.
 */
router.get('/blog/:slug', (req, res) => {
  const db = req.app.get('db');
  db.get(
    `SELECT * FROM articles WHERE slug = ? AND status = 'published'`,
    [req.params.slug],
    (err, row) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!row) return res.status(404).json({ success: false, message: 'Article not found.' });
      return res.json({ success: true, blog: row });
    }
  );
});

/**
 * GET /api/public/faqs
 * Returns all FAQs ordered by display_order.
 */
router.get('/faqs', (req, res) => {
  const db = req.app.get('db');
  db.all('SELECT id, question, answer, display_order FROM faqs ORDER BY display_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, faqs: rows || [] });
  });
});

const { partnerApplyLimiter } = require('../middleware/rateLimiter');

/**
 * Helper to sanitize string input against XSS attacks
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Partner application handler function.
 * Enforces rate limiting, XSS sanitization, field validation, and parameterized SQL queries.
 */
function handlePartnerApplicationSubmission(req, res) {
  const db = req.app.get('db');

  const companyName = sanitizeInput(req.body.company_name);
  const country = sanitizeInput(req.body.country);
  const firstName = sanitizeInput(req.body.first_name);
  const lastName = sanitizeInput(req.body.last_name);
  const email = sanitizeInput(req.body.email);
  const phone = sanitizeInput(req.body.phone);
  const details = sanitizeInput(req.body.details || '');

  // Field validation
  if (!companyName || !country || !firstName || !lastName || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: Company name, country, first name, last name, email, and phone number are required.'
    });
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: Please provide a valid email address.'
    });
  }

  // String length validation bounds
  if (companyName.length > 150 || firstName.length > 80 || lastName.length > 80 || email.length > 120 || phone.length > 40 || details.length > 3000) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: Input data exceeds maximum allowed character length.'
    });
  }

  // Parameterized SQLite query (prevents SQL injection) into partner_applications and partners
  db.run(
    `INSERT INTO partner_applications (company_name, country, first_name, last_name, email, phone, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [companyName, country, firstName, lastName, email, phone, details],
    function (err) {
      if (err) {
        console.error('Partner application DB error:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Server error saving application. Please try again later.'
        });
      }

      const appId = this.lastID;

      // Sync into partners alias table for backwards compatibility
      db.run(
        `INSERT INTO partners (company_name, country, first_name, last_name, email, phone, details) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyName, country, firstName, lastName, email, phone, details],
        () => {}
      );

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your international partnership application has been submitted successfully. Our global network team will contact you within 24–48 hours.',
        application_id: appId
      });
    }
  );
}

router.post('/partner-apply', partnerApplyLimiter, handlePartnerApplicationSubmission);
router.post('/partner-application', partnerApplyLimiter, handlePartnerApplicationSubmission);

module.exports = router;

