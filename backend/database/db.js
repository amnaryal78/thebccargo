const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "cargo_store.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(
      "❌ Failed to connect to embedded SQLite database:",
      err.message,
    );
  } else {
    console.log("⚡ Connected to embedded SQLite database at:", dbPath);
  }
});

// ═══════════════════════════════════════════════════════════
// Initialize Tables and Sync Records
// ═══════════════════════════════════════════════════════════
db.serialize(() => {
  // ─────────────────────────────────────────────
  // 1. Admins Table
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─────────────────────────────────────────────
  // 2. Inquiries (Leads) Table
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─────────────────────────────────────────────
  // 4. Articles (Blog CMS) Table
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      read_time TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT,
      author_avatar TEXT,
      image TEXT,
      summary TEXT,
      content_html TEXT,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(
    `ALTER TABLE articles ADD COLUMN status TEXT DEFAULT 'published'`,
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error("  ⚠ Could not add articles.status:", err.message);
      }
    },
  );

  // ─────────────────────────────────────────────
  // 5. FAQs Table
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─────────────────────────────────────────────
  // 6. Security Access Logs
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT,
      origin TEXT,
      referer TEXT,
      path TEXT,
      status_code INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ─────────────────────────────────────────────
  // 7. Special Offers Table
  // ─────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      discount_code TEXT,
      valid_until DATE,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ═══════════════════════════════════════════════════════════
  // Seed Default Admin Account
  // ═══════════════════════════════════════════════════════════
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "BcCargo@2026!";
  const hash = bcrypt.hashSync(defaultPassword, 12);

  db.run(
    `INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?, ?)`,
    ["admin", hash],
    (err) => {
      if (err) {
        console.error("  ⚠ Admin seed error:", err.message);
      } else {
        console.log("🔑 Default admin account ready (username: admin)");
      }
    },
  );

  // ═══════════════════════════════════════════════════════════
  // Seed Default FAQs (only if table is empty)
  // ═══════════════════════════════════════════════════════════
  db.get(`SELECT COUNT(*) AS cnt FROM faqs`, (err, row) => {
    if (err || (row && row.cnt > 0)) return;

    const defaultFaqs = [
      {
        q: "How do I track my shipment?",
        a: "Enter your BC Cargo tracking number (e.g., BC2204AT) in the tracking box. You'll get real-time updates on location, customs status, and estimated delivery.",
        o: 1,
      },
      {
        q: "What shipping services do you offer?",
        a: "We offer Ocean Freight (FCL/LCL), Air Freight, Land Transport, Warehousing, Customs Clearance, and Packaging — connecting Nepal to 120+ countries.",
        o: 2,
      },
      {
        q: "How long does international shipping take?",
        a: "Air freight typically takes 3–7 days, ocean freight 15–35 days depending on the route.",
        o: 3,
      },
      {
        q: "Is my cargo insured during transit?",
        a: "Yes, comprehensive cargo insurance covers loss, damage, and theft.",
        o: 4,
      },
      {
        q: "How do I get a shipping quote?",
        a: "Visit our Contact page, call us, or message on WhatsApp for an instant transparent rate.",
        o: 5,
      },
      {
        q: "Do you handle customs clearance?",
        a: "Absolutely. Our experienced brokers handle all import/export documentation and compliance.",
        o: 6,
      },
    ];

    const faqStmt = db.prepare(
      `INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)`,
    );
    defaultFaqs.forEach((f) => faqStmt.run(f.q, f.a, f.o));
    faqStmt.finalize();
    console.log("📋 Default FAQ entries seeded");
  });

  // ═══════════════════════════════════════════════════════════
  // Seed Default Special Offers (only if table is empty)
  // ═══════════════════════════════════════════════════════════
  db.get(`SELECT COUNT(*) AS cnt FROM offers`, (err, row) => {
    if (err || (row && row.cnt > 0)) return;

    const defaultOffers = [
      {
        title: "Express Air Freight Promotion",
        description: "Enjoy 15% off international express air cargo shipments to over 50 global destinations.",
        discount_code: "EXPRESS15",
        valid_until: "2026-10-31",
        is_active: 1
      },
      {
        title: "Bulk Warehousing Discount",
        description: "Get 20% discount on long-term climate-controlled storage and logistics fulfillment.",
        discount_code: "STORE20",
        valid_until: "2026-12-31",
        is_active: 1
      }
    ];

    const offerStmt = db.prepare(
      `INSERT INTO offers (title, description, discount_code, valid_until, is_active) VALUES (?, ?, ?, ?, ?)`
    );
    defaultOffers.forEach((o) => offerStmt.run(o.title, o.description, o.discount_code, o.valid_until, o.is_active));
    offerStmt.finalize();
    console.log("🎁 Default Special Offers seeded into database");
  });

  // ═══════════════════════════════════════════════════════════
  // Seed Default Articles (only if table is empty)
  // ═══════════════════════════════════════════════════════════
  db.get(`SELECT COUNT(*) AS cnt FROM articles`, (err, row) => {
    if (err || (row && row.cnt > 0)) return;

    const defaultArticles = [
      {
        slug: "opening-of-our-cargo-courier",
        title: "Opening of Our Cargo & Courier",
        category: "General",
        date: "2026-08-17",
        read_time: "",
        author_name: "Mohan Parajuli",
        author_role: "Managing Director",
        author_avatar: "MP",
        image: "https://files.catbox.moe/lpf0lv.png",
        summary: "BC Cargo & Courier Service is proud to announce its Grand Opening on Bhadra 1, 2083 (August 17, 2026). We are committed to providing fast, safe, and reliable domestic and international cargo, courier, express delivery, and door-to-door logistics services, connecting Nepal to the world.",
        content_html: "<h2>Grand Opening of BC Cargo & Courier Service</h2><p>We are excited to announce the official Grand Opening of <strong>BC Cargo & Courier Service</strong> on <strong>Bhadra 1, 2083 (August 17, 2026)</strong>. This marks the beginning of a new journey dedicated to providing reliable, secure, and efficient logistics solutions for individuals and businesses across Nepal and beyond.</p><p>Our mission is simple: <strong>Connecting Nepal to the World.</strong> Whether you need to send parcels within the country or ship internationally, BC Cargo is committed to delivering your packages safely and on time.</p><h3>Our Services</h3><ul><li>Domestic Cargo Services</li><li>International Courier</li><li>Express Delivery</li><li>Door-to-Door Delivery</li></ul><h3>Why Choose BC Cargo?</h3><ul><li>Fast and reliable delivery</li><li>Safe handling of shipments</li><li>Competitive pricing</li><li>Professional customer support</li><li>Nationwide and international coverage</li></ul><p>We sincerely thank everyone who has supported us throughout this journey. We look forward to serving our valued customers with excellence and building lasting relationships based on trust and reliability.</p><p>Join us as we celebrate this exciting milestone and experience a new standard in cargo and courier services.</p><p><strong>BC Cargo & Courier Service</strong><br>Connecting Nepal to the World.</p>",
        status: "published"
      },
      {
        slug: "air-freight-expansion-2025",
        title: "BC Cargo Expands Air Freight Routes to 15 New Destinations Across Asia and Europe",
        category: "Air Freight",
        date: "2025-06-10",
        read_time: "",
        author_name: "Anil Shrestha",
        author_role: "Logistics Specialist",
        author_avatar: "AS",
        image: "https://files.catbox.moe/kv8fb3.jpeg",
        summary: "Our latest expansion connects Nepal's exporters to 15 key logistics hubs with guaranteed capacity and express customs clearance.",
        content_html: "<p>THE BC Cargo & Courier is excited to announce a major expansion of our express air freight network. With direct carrier allocations connecting Tribhuvan International Airport (KTM) to key global hubs in Dubai, Singapore, Frankfurt, Tokyo, and New York, businesses can now experience unprecedented shipping speed and reliability.</p><h3>Key Benefits of the Expanded Corridors:</h3><ul><li>Daily express departures for urgent document and parcel dispatches</li><li>Temperature-controlled cargo hold for sensitive pharmaceuticals, electronics, and perishable goods</li><li>Integrated pre-arrival customs clearance at international destination hubs</li></ul>",
        status: "published"
      },
      {
        slug: "storage-logistics-hub-kathmandu",
        title: "New Climate-Controlled Storage & Logistics Hub Opens in Kathmandu",
        category: "Warehousing",
        date: "2025-05-28",
        read_time: "3 min read",
        author_name: "Ramesh Aryal",
        author_role: "Operations Director",
        author_avatar: "RA",
        image: "https://files.catbox.moe/4oqtfe.jpeg",
        summary: "State-of-the-art 25,000 sq ft climate-controlled warehousing facility equipped with real-time RFID tracking and 24/7 surveillance.",
        content_html: "<p>To support growing cross-border trade in South Asia, THE BC Cargo has officially commissioned a modern 25,000 sq ft logistics and fulfillment center in Kathmandu.</p><h3>Facility Capabilities & Tech:</h3><ul><li>Precision temperature-controlled zones (-20°C to +25°C) for pharmaceuticals and high-tech items</li><li>Real-time Warehouse Management System (WMS) integration</li><li>24/7 HD CCTV monitoring and biometric security control</li></ul>",
        status: "published"
      },
      {
        slug: "nepal-cargo-courier-advancements",
        title: "How Nepal's Export Industry is Transforming with Modern Logistics",
        category: "Industry",
        date: "2025-05-15",
        read_time: "5 min read",
        author_name: "Mohan Parajuli",
        author_role: "Managing Director",
        author_avatar: "MP",
        image: "https://files.catbox.moe/bvlydd.jpeg",
        summary: "From handcrafted goods to tea and textiles, discover how digital freight forwarding is expanding global market access for Nepalese exporters.",
        content_html: "<p>Nepal's freight forwarding and international courier sector is undergoing a profound digital transformation. High-altitude supply chain engineering, streamlined border customs procedures, and multimodal transport integration are opening new doors for local enterprises.</p>",
        status: "published"
      },
      {
        slug: "customs-clearance-mistakes-nepal",
        title: "5 Common Customs Clearance Mistakes Nepal Importers Make (And How to Avoid Them)",
        category: "Customs",
        date: "2025-04-30",
        read_time: "4 min read",
        author_name: "Ramesh Aryal",
        author_role: "IT & Systems Lead",
        author_avatar: "RI",
        image: "https://files.catbox.moe/lpf0lv.png",
        summary: "Incorrect HS codes, missing certificates of origin, and incomplete invoices account for over 60% of customs delays. Learn expert prevention tips.",
        content_html: "<p>Customs bottlenecks can severely impact supply chain timelines and inflate import tariffs. Working with experienced, certified customs brokers eliminates these pitfalls before shipments depart origin ports.</p>",
        status: "published"
      },
      {
        slug: "fcl-vs-lcl-ocean-freight-guide",
        title: "Understanding FCL vs LCL: Which Ocean Freight Option Saves Your Business More?",
        category: "Ocean Freight",
        date: "2025-04-12",
        read_time: "4 min read",
        author_name: "Anil Shrestha",
        author_role: "Logistics Specialist",
        author_avatar: "AS",
        image: "https://files.catbox.moe/bvlydd.jpeg",
        summary: "Full Container Load or Less than Container Load? Compare cost parameters, transit times, and packaging requirements for sea freight.",
        content_html: "<p>Selecting between Full Container Load (FCL) and Less than Container Load (LCL) is a key strategic decision for importers and exporters shipping sea cargo to Nepal via Kolkata or Visakhapatnam ports.</p>",
        status: "published"
      },
      {
        slug: "ultimate-cargo-packaging-guide",
        title: "The Ultimate Cargo Packaging Guide: Protect Your Shipment Overseas to Nepal",
        category: "Tips",
        date: "2025-03-25",
        read_time: "3 min read",
        author_name: "Ramesh Aryal",
        author_role: "Operations Director",
        author_avatar: "RA",
        image: "https://files.catbox.moe/4oqtfe.jpeg",
        summary: "Proper packaging reduces damage claims by up to 80%. Learn best practices for double-walled cartons, moisture barriers, and shock absorbents.",
        content_html: "<p>Long-distance intermodal transit exposes cargo to shock, vibration, humidity, and compression forces. Implementing industrial packaging standards ensures your goods arrive in pristine condition.</p>",
        status: "published"
      }
    ];


    const artStmt = db.prepare(`
      INSERT INTO articles (slug, title, category, date, read_time, author_name, author_role, author_avatar, image, summary, content_html, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultArticles.forEach((a) => {
      artStmt.run(
        a.slug,
        a.title,
        a.category,
        a.date,
        a.read_time,
        a.author_name,
        a.author_role,
        a.author_avatar,
        a.image,
        a.summary,
        a.content_html,
        a.status,
      );
    });
    artStmt.finalize();
    console.log("📰 Default blog articles seeded into database");
  });

  console.log("✅ SQLite database ready for admin/cms. Shipments served live via Google Sheets API.");
});

module.exports = db;
