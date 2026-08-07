const express = require("express");
const router = express.Router();
const googleSheets = require("../services/googleSheets");

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD STATS
// ═══════════════════════════════════════════════════════════

router.get("/stats", async (req, res) => {
  const db = req.app.get("db");
  const stats = {};

  try {
    const liveShipments = await googleSheets.getAllShipments();
    stats.shipments = liveShipments.length;
  } catch (e) {
    stats.shipments = 0;
  }

  db.get("SELECT COUNT(*) AS count FROM articles", (err2, row2) => {
    stats.blogs = row2 ? row2.count : 0;

    db.get("SELECT COUNT(*) AS count FROM inquiries", (err3, row3) => {
      stats.leads = row3 ? row3.count : 0;

        db.get("SELECT COUNT(*) AS count FROM faqs", (err4, row4) => {
          stats.faqs = row4 ? row4.count : 0;

          db.get("SELECT COUNT(*) AS count FROM offers", (err5, row5) => {
            stats.offers = row5 ? row5.count : 0;

            db.get(
              "SELECT COUNT(*) AS count FROM inquiries WHERE status = ?",
              ["New"],
              (err6, row6) => {
                stats.newLeads = row6 ? row6.count : 0;
                return res.json({ success: true, stats });
              },
            );
          });
        });
    });
  });
});

// ═══════════════════════════════════════════════════════════
// SHIPMENTS CRUD (Google Sheets Single Source of Truth)
// ═══════════════════════════════════════════════════════════

// GET all shipments live from Google Sheets
router.get("/shipments", async (req, res) => {
  try {
    const shipments = await googleSheets.getAllShipments();
    return res.json({ success: true, shipments });
  } catch (err) {
    console.error("Admin shipments fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch shipments from Google Sheets." });
  }
});

// POST create shipment in Google Sheets
router.post("/shipments", async (req, res) => {
  const { tracking_id } = req.body;

  if (!tracking_id) {
    return res
      .status(400)
      .json({ success: false, message: "Tracking ID is required." });
  }

  try {
    const existing = await googleSheets.getShipmentById(tracking_id);
    if (existing) {
      return res.status(409).json({ success: false, message: `Tracking ID "${tracking_id.toUpperCase()}" already exists.` });
    }

    const result = await googleSheets.createShipment(req.body);
    return res.json({ success: true, message: "Shipment created in Google Sheets.", result });
  } catch (err) {
    console.error("Admin shipment creation error:", err);
    return res.status(500).json({ success: false, message: "Failed to create shipment in Google Sheets." });
  }
});

// PUT update shipment in Google Sheets
router.put("/shipments/:tracking_id", async (req, res) => {
  const { tracking_id } = req.params;

  try {
    const result = await googleSheets.updateShipment(tracking_id, req.body);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json({ success: true, message: "Shipment updated in Google Sheets." });
  } catch (err) {
    console.error("Admin shipment update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update shipment in Google Sheets." });
  }
});

// DELETE shipment from Google Sheets
router.delete("/shipments/:tracking_id", async (req, res) => {
  const { tracking_id } = req.params;

  try {
    const result = await googleSheets.deleteShipment(tracking_id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.json({ success: true, message: "Shipment deleted from Google Sheets." });
  } catch (err) {
    console.error("Admin shipment delete error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete shipment from Google Sheets." });
  }
});

// ═══════════════════════════════════════════════════════════
// BLOGS (Articles) CRUD
// ═══════════════════════════════════════════════════════════

// GET all blogs
router.get("/blogs", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM articles ORDER BY id DESC", [], (err, rows) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, blogs: rows || [] });
  });
});

// POST create blog
router.post("/blogs", (req, res) => {
  const db = req.app.get("db");
  const {
    title,
    slug,
    category,
    image,
    read_time,
    summary,
    content_html,
    status,
    author_name,
    author_role,
    author_avatar,
  } = req.body;

  if (!title || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required." });
  }

  const sql = `INSERT INTO articles (title, slug, category, date, read_time, author_name, author_role, author_avatar, image, summary, content_html, status)
    VALUES (?, ?, ?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    sql,
    [
      title,
      slug.toLowerCase().replace(/\s+/g, "-"),
      category || "General",
      read_time || "3 min",
      author_name || "BC Cargo Team",
      author_role || "Editor",
      author_avatar || "",
      image || "",
      summary || "",
      content_html || "",
      status || "draft",
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint")) {
          return res
            .status(409)
            .json({ success: false, message: "Slug already exists." });
        }
        return res.status(500).json({ success: false, message: err.message });
      }
      return res.json({
        success: true,
        message: "Article created.",
        id: this.lastID,
      });
    },
  );
});

// PUT update blog
router.put("/blogs/:id", (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;
  const fields = req.body;

  const allowed = [
    "title",
    "slug",
    "category",
    "image",
    "read_time",
    "summary",
    "content_html",
    "status",
    "author_name",
    "author_role",
    "author_avatar",
    "date",
  ];

  const updates = [];
  const values = [];

  allowed.forEach((col) => {
    if (fields[col] !== undefined) {
      updates.push(`${col} = ?`);
      values.push(fields[col]);
    }
  });

  if (updates.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No valid fields to update." });
  }

  values.push(id);
  const sql = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;

  db.run(sql, values, function (err) {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0)
      return res
        .status(404)
        .json({ success: false, message: "Article not found." });
    return res.json({ success: true, message: "Article updated." });
  });
});

// DELETE blog
router.delete("/blogs/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM articles WHERE id = ?", [req.params.id], function (err) {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0)
      return res
        .status(404)
        .json({ success: false, message: "Article not found." });
    return res.json({ success: true, message: "Article deleted." });
  });
});

// ═══════════════════════════════════════════════════════════
// LEADS (Inquiries) CRUD
// ═══════════════════════════════════════════════════════════

// GET all leads
router.get("/leads", (req, res) => {
  const db = req.app.get("db");
  db.all(
    "SELECT * FROM inquiries ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      return res.json({ success: true, leads: rows || [] });
    },
  );
});

// PUT update lead status
router.put("/leads/:id", (req, res) => {
  const db = req.app.get("db");
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "Status is required." });
  }

  db.run(
    "UPDATE inquiries SET status = ? WHERE id = ?",
    [status, req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      if (this.changes === 0)
        return res
          .status(404)
          .json({ success: false, message: "Lead not found." });
      return res.json({ success: true, message: "Lead status updated." });
    },
  );
});

// DELETE lead
router.delete("/leads/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM inquiries WHERE id = ?", [req.params.id], function (err) {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0)
      return res
        .status(404)
        .json({ success: false, message: "Lead not found." });
    return res.json({ success: true, message: "Lead deleted." });
  });
});

// ═══════════════════════════════════════════════════════════
// FAQs CRUD
// ═══════════════════════════════════════════════════════════

// GET all FAQs
router.get("/faqs", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM faqs ORDER BY display_order ASC", [], (err, rows) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, faqs: rows || [] });
  });
});

// POST create FAQ
router.post("/faqs", (req, res) => {
  const db = req.app.get("db");
  const { question, answer, display_order } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ success: false, message: "Question and answer are required." });
  }

  db.run(
    "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
    [question, answer, display_order || 0],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      return res.json({
        success: true,
        message: "FAQ created.",
        id: this.lastID,
      });
    },
  );
});

// PUT update FAQ
router.put("/faqs/:id", (req, res) => {
  const db = req.app.get("db");
  const { question, answer, display_order } = req.body;
  const updates = [];
  const values = [];

  if (question !== undefined) {
    updates.push("question = ?");
    values.push(question);
  }
  if (answer !== undefined) {
    updates.push("answer = ?");
    values.push(answer);
  }
  if (display_order !== undefined) {
    updates.push("display_order = ?");
    values.push(display_order);
  }

  if (updates.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No valid fields to update." });
  }

  values.push(req.params.id);
  db.run(
    `UPDATE faqs SET ${updates.join(", ")} WHERE id = ?`,
    values,
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      if (this.changes === 0)
        return res
          .status(404)
          .json({ success: false, message: "FAQ not found." });
      return res.json({ success: true, message: "FAQ updated." });
    },
  );
});

// DELETE FAQ
router.delete("/faqs/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM faqs WHERE id = ?", [req.params.id], function (err) {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0)
      return res
        .status(404)
        .json({ success: false, message: "FAQ not found." });
    return res.json({ success: true, message: "FAQ deleted." });
  });
});

// ═══════════════════════════════════════════════════════════
// SPECIAL OFFERS CRUD
// ═══════════════════════════════════════════════════════════

// GET all offers (admin view)
router.get("/offers", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM offers ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, offers: rows || [] });
  });
});

// POST create new offer
router.post("/offers", (req, res) => {
  const db = req.app.get("db");
  const { title, description, discount_code, valid_until, is_active } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required." });
  }

  const activeVal = is_active === false || is_active === 0 || is_active === "0" ? 0 : 1;
  const sql = `INSERT INTO offers (title, description, discount_code, valid_until, is_active) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [title, description, discount_code || "", valid_until || "", activeVal], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, message: "Offer created successfully.", offer_id: this.lastID });
  });
});

// PUT update offer
router.put("/offers/:id", (req, res) => {
  const db = req.app.get("db");
  const { title, description, discount_code, valid_until, is_active } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: "Title and description are required." });
  }

  const activeVal = is_active === false || is_active === 0 || is_active === "0" ? 0 : 1;
  const sql = `UPDATE offers SET title = ?, description = ?, discount_code = ?, valid_until = ?, is_active = ? WHERE id = ?`;

  db.run(sql, [title, description, discount_code || "", valid_until || "", activeVal, req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, message: "Offer not found." });
    return res.json({ success: true, message: "Offer updated successfully." });
  });
});

// PATCH toggle offer active status
router.patch("/offers/:id/toggle", (req, res) => {
  const db = req.app.get("db");
  db.get("SELECT is_active FROM offers WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!row) return res.status(404).json({ success: false, message: "Offer not found." });

    const newStatus = row.is_active ? 0 : 1;
    db.run("UPDATE offers SET is_active = ? WHERE id = ?", [newStatus, req.params.id], function (err2) {
      if (err2) return res.status(500).json({ success: false, message: err2.message });
      return res.json({ success: true, message: `Offer ${newStatus ? "activated" : "deactivated"}.`, is_active: newStatus });
    });
  });
});

// DELETE offer
router.delete("/offers/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM offers WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (this.changes === 0) return res.status(404).json({ success: false, message: "Offer not found." });
    return res.json({ success: true, message: "Offer deleted successfully." });
  });
});

module.exports = router;
