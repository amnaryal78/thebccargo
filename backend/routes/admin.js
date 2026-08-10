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

    db.get("SELECT COUNT(*) AS c1 FROM contact_messages", (err3a, row3a) => {
      const c1 = row3a ? row3a.c1 : 0;
      db.get("SELECT COUNT(*) AS c2 FROM career_applications", (err3b, row3b) => {
        const c2 = row3b ? row3b.c2 : 0;
        db.get("SELECT COUNT(*) AS c3 FROM partner_requests", (err3c, row3c) => {
          const c3 = row3c ? row3c.c3 : 0;
          stats.leads = c1 + c2 + c3;

          db.get("SELECT COUNT(*) AS count FROM faqs", (err4, row4) => {
            stats.faqs = row4 ? row4.count : 0;

            db.get("SELECT COUNT(*) AS count FROM offers", (err5, row5) => {
              stats.offers = row5 ? row5.count : 0;

              db.get(
                "SELECT COUNT(*) AS u1 FROM contact_messages WHERE is_read = 0 OR is_read IS NULL",
                (err6a, r6a) => {
                  const u1 = r6a ? r6a.u1 : 0;
                  db.get(
                    "SELECT COUNT(*) AS u2 FROM career_applications WHERE is_read = 0 OR is_read IS NULL",
                    (err6b, r6b) => {
                      const u2 = r6b ? r6b.u2 : 0;
                      db.get(
                        "SELECT COUNT(*) AS u3 FROM partner_requests WHERE is_read = 0 OR is_read IS NULL",
                        (err6c, r6c) => {
                          const u3 = r6c ? r6c.u3 : 0;
                          stats.newLeads = u1 + u2 + u3;
                          return res.json({ success: true, stats });
                        }
                      );
                    }
                  );
                }
              );
            });
          });
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

// ═══════════════════════════════════════════════════════════
// FORM SUBMISSIONS ADMIN CRUD (Contact, Careers, Partner)
// ═══════════════════════════════════════════════════════════

// A. Contact Messages
router.get("/contact-messages", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM contact_messages ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, messages: rows || [] });
  });
});

router.put("/contact-messages/:id", (req, res) => {
  const db = req.app.get("db");
  const { status } = req.body;
  db.run("UPDATE contact_messages SET status = ?, is_read = 1 WHERE id = ?", [status || 'Contacted', req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("UPDATE inquiries SET status = ?, is_read = 1 WHERE id = ?", [status || 'Contacted', req.params.id], () => {});
    return res.json({ success: true, message: "Contact message status updated." });
  });
});

router.delete("/contact-messages/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM contact_messages WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("DELETE FROM inquiries WHERE id = ?", [req.params.id], () => {});
    return res.json({ success: true, message: "Contact message deleted." });
  });
});

// B. Career Applications
router.get("/career-applications", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM career_applications ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, applications: rows || [] });
  });
});

router.put("/career-applications/:id", (req, res) => {
  const db = req.app.get("db");
  const { status } = req.body;
  db.run("UPDATE career_applications SET status = ?, is_read = 1 WHERE id = ?", [status || 'Reviewed', req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, message: "Career application status updated." });
  });
});

router.delete("/career-applications/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM career_applications WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, message: "Career application deleted." });
  });
});

// C. Partner Requests
router.get("/partner-requests", (req, res) => {
  const db = req.app.get("db");
  db.all("SELECT * FROM partner_requests ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      db.all("SELECT * FROM partner_applications ORDER BY id DESC", [], (err2, rows2) => {
        if (err2) return res.status(500).json({ success: false, message: err2.message });
        return res.json({ success: true, requests: rows2 || [] });
      });
      return;
    }
    return res.json({ success: true, requests: rows || [] });
  });
});

router.put("/partner-requests/:id", (req, res) => {
  const db = req.app.get("db");
  const { status } = req.body;
  db.run("UPDATE partner_requests SET status = ?, is_read = 1 WHERE id = ?", [status || 'Approved', req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("UPDATE partner_applications SET status = ?, is_read = 1 WHERE id = ?", [status || 'Approved', req.params.id], () => {});
    db.run("UPDATE partners SET status = ?, is_read = 1 WHERE id = ?", [status || 'Approved', req.params.id], () => {});
    return res.json({ success: true, message: "Partner request status updated." });
  });
});

router.delete("/partner-requests/:id", (req, res) => {
  const db = req.app.get("db");
  db.run("DELETE FROM partner_requests WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("DELETE FROM partner_applications WHERE id = ?", [req.params.id], () => {});
    db.run("DELETE FROM partners WHERE id = ?", [req.params.id], () => {});
    return res.json({ success: true, message: "Partner request deleted." });
  });
});

// D. Mark Lead as Read Handlers
router.put("/contact-messages/:id/read", (req, res) => {
  const db = req.app.get("db");
  db.run("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("UPDATE inquiries SET is_read = 1 WHERE id = ?", [req.params.id], () => {});
    return res.json({ success: true, message: "Contact message marked as read." });
  });
});

router.put("/career-applications/:id/read", (req, res) => {
  const db = req.app.get("db");
  db.run("UPDATE career_applications SET is_read = 1 WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    return res.json({ success: true, message: "Career application marked as read." });
  });
});

router.put("/partner-requests/:id/read", (req, res) => {
  const db = req.app.get("db");
  db.run("UPDATE partner_requests SET is_read = 1 WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    db.run("UPDATE partner_applications SET is_read = 1 WHERE id = ?", [req.params.id], () => {});
    return res.json({ success: true, message: "Partner request marked as read." });
  });
});

// E. Unread Count Endpoint
router.get("/unread-count", (req, res) => {
  const db = req.app.get("db");
  db.get("SELECT COUNT(*) AS count FROM contact_messages WHERE is_read = 0 OR is_read IS NULL", [], (err1, row1) => {
    const contactUnread = row1 ? row1.count : 0;
    db.get("SELECT COUNT(*) AS count FROM career_applications WHERE is_read = 0 OR is_read IS NULL", [], (err2, row2) => {
      const careerUnread = row2 ? row2.count : 0;
      db.get("SELECT COUNT(*) AS count FROM partner_requests WHERE is_read = 0 OR is_read IS NULL", [], (err3, row3) => {
        const partnerUnread = row3 ? row3.count : 0;
        const totalUnread = contactUnread + careerUnread + partnerUnread;
        return res.json({
          success: true,
          unreadCount: totalUnread,
          contactUnread,
          careerUnread,
          partnerUnread
        });
      });
    });
  });
});

// F. Direct Email Reply Route
const { sendReplyEmail } = require("../services/mailer");

router.post("/send-reply", async (req, res) => {
  const { to_email, recipient_name, subject, message_body } = req.body;

  if (!to_email || !message_body) {
    return res.status(400).json({ success: false, message: "Recipient email and message body are required." });
  }

  try {
    const result = await sendReplyEmail({
      toEmail: to_email,
      recipientName: recipient_name || 'Customer',
      subject: subject || 'Response from THE BC Cargo & Courier',
      messageBody: message_body
    });

    return res.json({
      success: true,
      message: result.message || `Reply email successfully sent to ${to_email}.`,
      simulated: result.simulated || false
    });
  } catch (err) {
    console.error("Admin send-reply error:", err);
    return res.status(500).json({ success: false, message: "Failed to send email reply: " + err.message });
  }
});

module.exports = router;
