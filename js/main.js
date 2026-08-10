const root = document.documentElement,
  THEME_KEY = "bc-theme",
  API_BASE_URL = window.API_BASE_URL || window.location.origin;
let pendingTrackingId = null;

const FLAGS = [
  { code: "cn", name: "China" },
  { code: "in", name: "India" },
  { code: "us", name: "USA" },
  { code: "gb", name: "UK" },
  { code: "ae", name: "UAE" },
  { code: "de", name: "Germany" },
  { code: "jp", name: "Japan" },
  { code: "sg", name: "Singapore" },
  { code: "au", name: "Australia" },
  { code: "ca", name: "Canada" },
  { code: "kr", name: "South Korea" },
  { code: "fr", name: "France" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "bd", name: "Bangladesh" },
  { code: "th", name: "Thailand" },
  { code: "my", name: "Malaysia" },
  { code: "id", name: "Indonesia" },
  { code: "br", name: "Brazil" },
  { code: "za", name: "South Africa" },
  { code: "tr", name: "Turkey" },
  { code: "pk", name: "Pakistan" },
  { code: "np", name: "Nepal" }
];

const PARTNERS = [
  {
    id: "dhl",
    name: "DHL Express",
    icon: "fas fa-shipping-fast",
    category: "Global Express Courier & Air Freight",
    hq: "Bonn, Germany",
    coverage: "220+ Countries & Territories",
    description:
      "DHL Express is the world's leading logistics and express courier company. Through our strategic partnership, THE BC Cargo provides seamless door-to-door express courier dispatches from Nepal to destinations worldwide with priority carrier allocation and end-to-end tracking.",
    services: [
      "International Priority Express Courier",
      "Next-Day / 3-Day Global Air Delivery",
      "Integrated Customs & Border Clearance",
      "Live GPS & Flight Telemetry Tracking"
    ]
  },
  {
    id: "qatar",
    name: "Qatar Airways",
    icon: "fas fa-plane",
    category: "International Air Cargo Carrier",
    hq: "Doha, Qatar",
    coverage: "160+ Global Hub Destinations",
    description:
      "Qatar Airways Cargo is one of the world's premier air cargo carriers. Our strategic alliance connects Tribhuvan International Airport (KTM) directly into Qatar Airways' Doha super-hub, facilitating ultra-fast transit times for commercial exports and diplomatic consignments.",
    services: [
      "Temperature-Controlled Pharma Flight",
      "High-Priority Air Cargo Capacity",
      "Custom Airport-to-Airport Charters",
      "Perishable & High-Value Export Transport"
    ]
  },
  {
    id: "maersk",
    name: "Maersk Line",
    icon: "fas fa-ship",
    category: "Ocean Freight & Intermodal Shipping",
    hq: "Copenhagen, Denmark",
    coverage: "130+ Countries & 300+ Ports",
    description:
      "A.P. Moller – Maersk is the global leader in container shipping. THE BC Cargo collaborates with Maersk to handle major sea freight imports and exports via Kolkata and Visakhapatnam ports, offering streamlined intermodal rail and road transit into Nepal.",
    services: [
      "Full Container Load (FCL) Solutions",
      "Less than Container Load (LCL) Consolidation",
      "Reefer Cold Chain Container Transit",
      "Seamless Port-to-Hetauda Intermodal Transit"
    ]
  },
  {
    id: "fedex",
    name: "FedEx Express",
    icon: "fas fa-box",
    category: "Express Courier & E-Commerce Freight",
    hq: "Memphis, Tennessee, USA",
    coverage: "220+ Countries & Territories",
    description:
      "FedEx Express provides rapid, time-definite parcel and freight delivery. Partnering with FedEx enables THE BC Cargo to dispatch urgent commercial trade samples, documents, and handcrafted Nepalese export goods across the Americas, Europe, and Asia.",
    services: [
      "International Priority Express",
      "Heavy Commercial Cargo Air Dispatch",
      "Pre-Arrival Customs Brokerage Integration",
      "Door-to-Door Parcel Delivery"
    ]
  },
  {
    id: "ups",
    name: "UPS Logistics",
    icon: "fas fa-truck",
    category: "Global Freight & Supply Chain",
    hq: "Atlanta, Georgia, USA",
    coverage: "200+ Countries & Regions",
    description:
      "United Parcel Service (UPS) is a global supply chain titan. Through our integration with UPS international hubs, THE BC Cargo ensures reliable cross-border supply chain management, customs compliance, and door-to-door delivery for Nepalese exporters.",
    services: [
      "Global Air & Sea Cargo Consolidation",
      "Cross-Border Supply Chain Management",
      "Worldwide Express Air Freight",
      "Export Duties & Tax Pre-Clearance"
    ]
  },
  {
    id: "cosco",
    name: "COSCO Shipping",
    icon: "fas fa-anchor",
    category: "Maritime Container & Ocean Freight",
    hq: "Shanghai, China",
    coverage: "350+ Global Ports & Maritime Corridors",
    description:
      "COSCO Shipping Lines is a maritime shipping giant. Our partnership facilitates industrial equipment, raw material, and containerized cargo movement between Chinese ports, regional transit hubs, and Nepal via optimized land-sea freight corridors.",
    services: [
      "Himalayan Land-Sea Corridor Cargo",
      "Heavy Machinery & Industrial Transit",
      "FCL & LCL Ocean Container Shipping",
      "Customs Bonded Transit Warehousing"
    ]
  },
  {
    id: "emirates",
    name: "Emirates SkyCargo",
    icon: "fas fa-globe",
    category: "Middle East & Global Air Freight",
    hq: "Dubai, United Arab Emirates",
    coverage: "140+ Destinations Across 6 Continents",
    description:
      "Emirates SkyCargo operates a modern air cargo fleet out of Dubai. THE BC Cargo leverages Emirates SkyCargo for daily cargo capacity, connecting Nepalese exports directly to Middle Eastern, European, African, and American consumer markets.",
    services: [
      "Dubai Super-Hub Express Transit",
      "Emirates Fresh Perishable Cold Chain",
      "Specialized Cargo & Dangerous Goods",
      "Daily Scheduled Air Cargo Flights"
    ]
  }
];

const FAQS = [
  {
    q: "How do I track my shipment?",
    a: "Enter your BC Cargo tracking number (e.g., BC2204AT) in the tracking box above. You'll get real-time updates on location, customs status, and estimated delivery."
  },
  {
    q: "What shipping services do you offer?",
    a: "We offer Ocean Freight (FCL/LCL), Air Freight, Land Transport, Warehousing, Customs Clearance, and professional Packaging — connecting Nepal to 120+ countries."
  },
  {
    q: "How long does international shipping take?",
    a: "Air freight typically takes 3–7 days, ocean freight 15–35 days depending on the route. We provide accurate ETAs at booking."
  },
  {
    q: "Is my cargo insured during transit?",
    a: "Yes, comprehensive cargo insurance covers loss, damage, and theft. We highly recommend insurance for all valuable shipments."
  },
  {
    q: "How do I get a shipping quote?",
    a: "Visit our Contact page, call us, or message on WhatsApp. Our team responds within hours with a transparent, competitive rate."
  },
  {
    q: "Do you handle customs clearance?",
    a: "Absolutely. Our experienced brokers handle all import/export documentation, duties, and compliance for smooth border clearance."
  }
];

const TEAM_MEMBERS = [
  {
    id: 1,
    slug: "ramesh-aryal",
    name: "Ramesh Aryal",
    initials: "RA",
    role: "Operations & Supply Chain Director",
    bio: "Managing air & ocean cargo dispatches, warehouse fulfillment, and real-time shipment monitoring.",
    email: "info@thebccargo.com",
    phone: "+977-9855019485",
    qualifications: "B.Sc. Logistics & Operations, Certified Customs Broker.",
    responsibilities: "Daily air and sea cargo operations, fleet management, warehouse operations, and shipment route optimization.",
    avatarStyle: "background: #112240; color: #FFFFFF; border: 2px solid rgba(255, 255, 255, 0.18); box-shadow: none;"
  },
  {
    id: 2,
    slug: "ayush-aryal",
    name: "Ayush Aryal",
    initials: "AA",
    role: "IT",
    bio: "Leading website architecture, digital systems, online billing, and core IT infrastructure.",
    email: "info@thebccargo.com",
    phone: "+977-9855019485",
    qualifications: "Full-Stack Web Development, Systems Architecture, Digital Infrastructure & IT Operations.",
    responsibilities: "Website architecture & UI design, automated billing system development, corporate logo & marketing banner creation, and live shipment tracking integration.",
    avatarStyle: "background: #1e293b; color: #FFFFFF; border: 2px solid rgba(255, 255, 255, 0.18); box-shadow: none;"
  }
];

const ARTICLES_DATA = {
  "opening-of-our-cargo-courier": {
    id: 1,
    slug: "opening-of-our-cargo-courier",
    key: "article-1",
    title: "Opening of Our Cargo & Courier",
    category: "General",
    date: "August 17, 2026",
    author: { name: "Ramesh Aryal", role: "Operations & Supply Chain Director", avatar: "RA" },
    image: "https://files.catbox.moe/lpf0lv.png",
    summary:
      "BC Cargo & Courier Service is proud to announce its Grand Opening on Bhadra 1, 2083 (August 17, 2026). We are committed to providing fast, safe, and reliable domestic and international cargo, courier, express delivery, and door-to-door logistics services, connecting Nepal to the world.",
    contentHtml:
      "<h2>Grand Opening of BC Cargo & Courier Service</h2><p>We are excited to announce the official Grand Opening of <strong>BC Cargo & Courier Service</strong> on <strong>Bhadra 1, 2083 (August 17, 2026)</strong>. This marks the beginning of a new journey dedicated to providing reliable, secure, and efficient logistics solutions for individuals and businesses across Nepal and beyond.</p><p>Our mission is simple: <strong>Connecting Nepal to the World.</strong> Whether you need to send parcels within the country or ship internationally, BC Cargo is committed to delivering your packages safely and on time.</p><h3>Our Services</h3><ul><li>Domestic Cargo Services</li><li>International Courier</li><li>Express Delivery</li><li>Door-to-Door Delivery</li></ul><h3>Why Choose BC Cargo?</h3><ul><li>Fast and reliable delivery</li><li>Safe handling of shipments</li><li>Competitive pricing</li><li>Professional customer support</li><li>Nationwide and international coverage</li></ul><p>We sincerely thank everyone who has supported us throughout this journey. We look forward to serving our valued customers with excellence and building lasting relationships based on trust and reliability.</p><p>Join us as we celebrate this exciting milestone and experience a new standard in cargo and courier services.</p><p><strong>BC Cargo & Courier Service</strong><br>Connecting Nepal to the World.</p>"
  },
  "air-freight-expansion-2025": {
    id: 2,
    slug: "air-freight-expansion-2025",
    key: "article-2",
    title: "BC Cargo Expands Air Freight Routes to 15 New Destinations Across Asia and Europe",
    category: "Air Freight",
    date: "June 10, 2025",
    author: { name: "Anil Shrestha", role: "Logistics Specialist", avatar: "AS" },
    image: "https://files.catbox.moe/zmwxbk.png",
    summary: "Our latest expansion connects Nepal's exporters to 15 key logistics hubs with guaranteed capacity and express customs clearance.",
    contentHtml:
      "<p>THE BC Cargo & Courier is excited to announce a major expansion of our express air freight network. With direct carrier allocations connecting Tribhuvan International Airport (KTM) to key global hubs in Dubai, Singapore, Frankfurt, Tokyo, and New York, businesses can now experience unprecedented shipping speed and reliability.</p><h3>Key Benefits of the Expanded Corridors:</h3><ul><li>Daily express departures for urgent document and parcel dispatches</li><li>Temperature-controlled cargo hold for sensitive pharmaceuticals, electronics, and perishable goods</li><li>Integrated pre-arrival customs clearance at international destination hubs</li><li>Guaranteed airline space commitments during peak holiday shipping seasons</li></ul><p>Whether you are shipping urgent commercial samples or high-value export cargo, our dedicated air freight team provides 24/7 end-to-end telemetry and monitoring from pickup to final delivery.</p>"
  },

  "nepal-cargo-courier-advancements": {
    id: 3,
    slug: "nepal-cargo-courier-advancements",
    key: "article-3",
    title: "How Nepal's Export Industry is Transforming with Modern Logistics",
    category: "Industry",
    date: "May 15, 2025",
    readTime: "5 min read",
    author: { name: "Ramesh Aryal", role: "Operations & Supply Chain Director", avatar: "RA" },
    image: "https://files.catbox.moe/7j5mnn.png",
    summary: "From handcrafted goods to tea and textiles, discover how digital freight forwarding is expanding global market access for Nepalese exporters.",
    contentHtml:
      "<p>Nepal's freight forwarding and international courier sector is undergoing a profound digital transformation. High-altitude supply chain engineering, streamlined border customs procedures, and multimodal transport integration are opening new doors for local enterprises.</p><p>At THE BC Cargo & Courier, we are leading this shift by deploying API-driven tracking, automated document verification, and direct air/sea partnerships. Nepalese artisans, tea producers, and textile manufacturers can now quote landed costs accurately and deliver directly to international buyers across 120+ countries.</p>"
  },
  "customs-clearance-mistakes-nepal": {
    id: 4,
    slug: "customs-clearance-mistakes-nepal",
    key: "article-4",
    title: "5 Common Customs Clearance Mistakes Nepal Importers Make (And How to Avoid Them)",
    category: "Customs",
    date: "April 30, 2025",
    readTime: "4 min read",
    author: { name: "Ramesh Aryal", role: "IT & Systems Lead", avatar: "RI" },
    image: "https://files.catbox.moe/zmwxbk.png",
    summary: "Incorrect HS codes, missing certificates of origin, and incomplete invoices account for over 60% of customs delays. Learn expert prevention tips.",
    contentHtml:
      "<p>Customs bottlenecks can severely impact supply chain timelines and inflate import tariffs. Based on our analysis of border declarations at Birgunj, Tatopani, and KTM Airport, here are the top 5 mistakes importers make:</p><ol><li><strong>Inaccurate HS Code Classification:</strong> Misclassifying goods leads to penalty fines and unexpected tariff re-assessments.</li><li><strong>Missing Country of Origin Certificates:</strong> Tariff concessions under SAFTA or trade agreements require certified origin documents.</li><li><strong>Discrepancies Between Invoice & Packing List:</strong> Item count or weight mismatches trigger physical customs inspections.</li><li><strong>Delayed Valuation Submissions:</strong> Failing to submit declared value proof early causes demurrage charges.</li><li><strong>Non-Compliance with Product Standards:</strong> Regulated items require prior Department of Food Technology & Quality Control (DFTQC) clearances.</li></ol><p>Working with experienced, certified customs brokers eliminates these pitfalls before shipments depart origin ports.</p>"
  },
  "fcl-vs-lcl-ocean-freight-guide": {
    id: 5,
    slug: "fcl-vs-lcl-ocean-freight-guide",
    key: "article-5",
    title: "Understanding FCL vs LCL: Which Ocean Freight Option Saves Your Business More?",
    category: "Ocean Freight",
    date: "April 12, 2025",
    readTime: "4 min read",
    author: { name: "Anil Shrestha", role: "Logistics Specialist", avatar: "AS" },
    image: "https://files.catbox.moe/7j5mnn.png",
    summary: "Full Container Load or Less than Container Load? Compare cost parameters, transit times, and packaging requirements for sea freight.",
    contentHtml:
      "<p>Selecting between Full Container Load (FCL) and Less than Container Load (LCL) is a key strategic decision for importers and exporters shipping sea cargo to Nepal via Kolkata or Visakhapatnam ports.</p><h3>FCL (Full Container Load)</h3><p>Ideal for cargo volumes exceeding 15 CBM (Cubic Meters). You get exclusive access to a 20ft or 40ft container, sealed from origin to destination, minimizing handling and transit delays.</p><h3>LCL (Less than Container Load)</h3><p>Ideal for smaller shipments (1 to 14 CBM). Your goods share container space with other compatible cargo, allowing you to pay strictly for the volume you occupy.</p>"
  },
  "ultimate-cargo-packaging-guide": {
    id: 6,
    slug: "ultimate-cargo-packaging-guide",
    key: "article-6",
    title: "The Ultimate Cargo Packaging Guide: Protect Your Shipment Overseas to Nepal",
    category: "Tips",
    date: "March 25, 2025",
    readTime: "3 min read",
    author: { name: "Ramesh Aryal", role: "Operations Director", avatar: "RA" },
    image: "https://files.catbox.moe/o30o80.png",
    summary: "Proper packaging reduces damage claims by up to 80%. Learn best practices for double-walled cartons, moisture barriers, and shock absorbents.",
    contentHtml:
      "<p>Long-distance intermodal transit exposes cargo to shock, vibration, humidity, and compression forces. Implementing industrial packaging standards ensures your goods arrive in pristine condition.</p><h3>Core Packaging Principles:</h3><ul><li><strong>Double-Walled Corrugated Boxes:</strong> Standard single-wall boxes collapse under stack loads. Always opt for heavy-duty double or triple-wall boxes.</li><li><strong>Moisture & Desiccant Protection:</strong> Sea transit creates 'container rain'. Seal sensitive electronics and fabrics in vapor-barrier bags with silica desiccants.</li><li><strong>Palletization & Strapping:</strong> Secure box loads onto ISPM-15 heat-treated wooden pallets using stretch film and heavy-duty polyester strapping.</li></ul>"
  }
};

function initSmoothScrollNav() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href !== "#") {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

function initTheme() {
  const e = localStorage.getItem(THEME_KEY) || localStorage.getItem("bc-cargo-theme-premium") || "dark";
  root.setAttribute("data-theme", e);
  const t = document.getElementById("themeIcon");
  t && (t.className = "dark" === e ? "fas fa-sun" : "fas fa-moon");
  const n = document.getElementById("themeToggle");
  n &&
    n.addEventListener("click", () => {
      const e = "dark" === root.getAttribute("data-theme") ? "light" : "dark";
      root.setAttribute("data-theme", e),
        localStorage.setItem(THEME_KEY, e),
        localStorage.setItem("bc-cargo-theme-premium", e),
        t && (t.className = "dark" === e ? "fas fa-sun" : "fas fa-moon");
    });
}

function initNavbar() {
  const e = document.getElementById("navbar"),
    t = document.getElementById("navToggle"),
    n = document.getElementById("mobileDrawer"),
    a = document.getElementById("drawerOverlay"),
    i = document.getElementById("drawerClose");

  if (e) {
    let t = !1;
    window.addEventListener(
      "scroll",
      () => {
        t ||
          (window.requestAnimationFrame(() => {
            e.classList.toggle("scrolled", window.scrollY > 50), (t = !1);
          }),
          (t = !0));
      },
      { passive: !0 }
    );
  }

  function o() {
    n?.classList.remove("open"),
      a?.classList.remove("open"),
      t?.classList.remove("open"),
      t?.setAttribute("aria-expanded", "false"),
      document.body.classList.remove("no-scroll");
  }

  t?.addEventListener("click", () => {
    n?.classList.contains("open")
      ? o()
      : (n?.classList.add("open"), a?.classList.add("open"), t?.classList.add("open"), t?.setAttribute("aria-expanded", "true"), document.body.classList.add("no-scroll"));
  }),
    i?.addEventListener("click", o),
    a?.addEventListener("click", o),
    n?.querySelectorAll("a").forEach((e) => e.addEventListener("click", o)),
    document.addEventListener("keydown", (e) => {
      "Escape" === e.key && n?.classList.contains("open") && o();
    });
}

function initHeroSlider() {
  const e = document.querySelectorAll(".hero-slide");
  if (!e || 0 === e.length) return;
  const t = document.querySelectorAll(".hero-dot"),
    n = document.getElementById("slideProgress"),
    a = document.querySelectorAll(".tagline-slide");
  let i = 0,
    o = null;

  function r(o) {
    e[i]?.classList.remove("active"),
      t[i]?.classList.remove("active"),
      a[i]?.classList.remove("active"),
      (i = ((o % e.length) + e.length) % e.length),
      e[i]?.classList.add("active"),
      t[i]?.classList.add("active"),
      a[i]?.classList.add("active"),
      n &&
        ((n.style.width = "0%"),
        (n.style.transition = "none"),
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            (n.style.transition = "width 5900ms linear"), (n.style.width = "100%");
          });
        }));
  }

  function s() {
    o && clearInterval(o), (o = setInterval(() => r(i + 1), 6000));
  }

  t.forEach((e, t) => {
    e.addEventListener("click", () => {
      r(t), clearInterval(o), s();
    });
  }),
    r(0),
    s();
}

function initFlags() {
  const e = document.getElementById("flagsTrack"),
    t = document.getElementById("flagsTrack2");
  if ((e && n(e, [...FLAGS, ...FLAGS]), t)) {
    const e = [...FLAGS].reverse();
    n(t, [...e, ...e]);
  }

  function n(e, t) {
    (e.innerHTML = ""),
      t.forEach((t) => {
        const n = document.createElement("div");
        (n.className = "flag-item"),
          (n.innerHTML = `<img src="https://flagcdn.com/w40/${t.code}.png" srcset="https://flagcdn.com/w80/${t.code}.png 2x" alt="${t.name} flag" class="flag-img" loading="lazy" decoding="async" width="40" height="25"> <span class="flag-name">${t.name}</span>`),
          e.appendChild(n);
      });
  }
}

function initPartners() {
  const e = document.getElementById("partnersTrack");
  if (!e) return;
  e.innerHTML = "";
  const list = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  list.forEach((t) => {
    const n = document.createElement("div");
    n.className = "partner-item";
    n.setAttribute("role", "button");
    n.setAttribute("tabindex", "0");
    n.setAttribute("title", `Click to view ${t.name} information`);
    n.setAttribute("aria-label", `View information about ${t.name}`);
    n.innerHTML = `<i class="${t.icon}" style="color:var(--accent-blue, #1a56db);"></i> <span>${t.name}</span>`;

    n.addEventListener("click", () => openPartnerDetailModal(t.id));
    n.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        openPartnerDetailModal(t.id);
      }
    });

    e.appendChild(n);
  });
}

function openPartnerDetailModal(partnerId) {
  const item = PARTNERS.find((p) => p.id === partnerId || p.name.toLowerCase().includes(String(partnerId).toLowerCase()));
  if (!item) return;
  const modal = document.getElementById("partnerDetailModal");
  if (!modal) return;

  const iconEl = document.getElementById("partnerInfoIcon");
  const nameEl = document.getElementById("partnerInfoName");
  const catEl = document.getElementById("partnerInfoCategory");
  const hqEl = document.getElementById("partnerInfoHq");
  const covEl = document.getElementById("partnerInfoCoverage");
  const descEl = document.getElementById("modalPartnerDesc");
  const servicesEl = document.getElementById("modalPartnerServices");

  if (iconEl) iconEl.className = item.icon;
  if (nameEl) nameEl.textContent = item.name;
  if (catEl) catEl.textContent = item.category;
  if (hqEl) hqEl.textContent = item.hq;
  if (covEl) covEl.textContent = item.coverage;
  if (descEl) descEl.textContent = item.description;

  if (servicesEl) {
    servicesEl.innerHTML = (item.services || [])
      .map(
        (s) => `
      <li style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;color:var(--text-secondary,#ccc);">
        <i class="fas fa-check-circle" style="color:var(--accent-cyan,#06b6d4);font-size:0.8rem;"></i> ${s}
      </li>
    `
      )
      .join("");
  }

  modal.classList.add("active", "open");
  document.body.classList.add("no-scroll");
}

function closePartnerDetailModal() {
  const modal = document.getElementById("partnerDetailModal");
  if (modal) {
    modal.classList.remove("active", "open");
    document.body.classList.remove("no-scroll");
  }
}

async function initFAQ() {
  const e = document.getElementById("faqWrap");
  if (e) {
    try {
      const e = await fetch(`${API_BASE_URL}/api/public/faqs`);
      if (e.ok) {
        const n = await e.json();
        if (n.success && n.faqs && n.faqs.length > 0) return void t(n.faqs);
      }
    } catch (e) {
      console.warn("FAQ API fetch failed, fallback to static FAQs:", e);
    }
    t(FAQS);
  }

  function t(t) {
    (e.innerHTML = ""),
      t.forEach((t) => {
        const n = t.question || t.q,
          a = t.answer || t.a,
          i = document.createElement("div");
        (i.className = "faq-item"),
          (i.innerHTML = `
                <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
                    <span class="faq-q-text">${n}</span>
                    <div class="faq-icon"><i class="fas fa-plus"></i></div>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-inner">${a}</div>
                </div>
            `),
          e.appendChild(i);
        const o = i.querySelector(".faq-question");

        function r() {
          const e = i.classList.contains("open");
          document.querySelectorAll(".faq-item.open").forEach((e) => {
            e.classList.remove("open"), e.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
          }),
            e || (i.classList.add("open"), o?.setAttribute("aria-expanded", "true"));
        }

        o.addEventListener("click", r),
          o.addEventListener("keydown", (e) => {
            ("Enter" !== e.key && " " !== e.key) || (e.preventDefault(), r());
          });
      });
  }
}

function initBackToTop() {
  const e = document.getElementById("backTop");
  e &&
    (window.addEventListener(
      "scroll",
      () => {
        e.classList.toggle("visible", window.scrollY > 400);
      },
      { passive: !0 }
    ),
    e.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
}

function initLoader() {
  const e = document.getElementById("loader"),
    t = document.getElementById("loaderProgress");

  function n() {
    e &&
      (t && (t.style.width = "100%"),
      setTimeout(() => {
        e.classList.add("hidden"), (e.style.display = "none"), document.body.classList.remove("no-scroll");
      }, 80));
  }

  "interactive" === document.readyState || "complete" === document.readyState
    ? n()
    : (document.addEventListener("DOMContentLoaded", n), window.addEventListener("load", n)),
    setTimeout(n, 300);
}

function renderTeamMembers() {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;
  grid.innerHTML = TEAM_MEMBERS.map(
    (m) => `
      <div class="team-card tilt-card"
           tabindex="0"
           role="button"
           aria-haspopup="dialog"
           aria-label="View full bio for ${m.name}"
           data-team-id="${m.id}">
          <div class="team-avatar" style="${m.avatarStyle || ''}">${m.initials}</div>
          <span class="hero-brand-badge" style="font-size:0.72rem;margin-bottom:0.5rem;display:inline-block;padding:0.25rem 0.85rem;font-weight:600;">${m.role}</span>
          <h3 class="team-name">${m.name}</h3>
          <p class="team-bio">${m.bio}</p>
          <button class="btn btn-outline-primary btn-sm team-expand-btn" type="button" data-expand-id="${m.id}">
              <i class="fas fa-expand-alt" aria-hidden="true"></i> Click to Expand
          </button>
      </div>
  `
  ).join("");

  grid.querySelectorAll(".team-card").forEach(card => {
    card.addEventListener("click", (e) => {
      // If clicking the button specifically, we can stop propagation if needed, 
      // but since both do the same thing, it's fine.
      if (e.target.closest(".team-expand-btn")) {
         e.stopPropagation();
      }
      openTeamModal(card.getAttribute("data-team-id"));
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTeamModal(card.getAttribute("data-team-id"));
      }
    });
  });
}

function openTeamModal(id) {
  const member = TEAM_MEMBERS.find((m) => String(m.id) === String(id) || m.slug === String(id));
  if (!member) return;
  const modal = document.getElementById("profileModal");
  if (!modal) return;

  const avatar = document.getElementById("modalTeamAvatar");
  const name = document.getElementById("modalTeamName");
  const role = document.getElementById("modalTeamRole");
  const bio = document.getElementById("modalTeamBio");
  const qual = document.getElementById("modalTeamQualifications");
  const resp = document.getElementById("modalTeamResponsibilities");
  const email = document.getElementById("modalTeamEmail");
  const emailTxt = document.getElementById("modalTeamEmailText");
  const phone = document.getElementById("modalTeamPhone");
  const phoneTxt = document.getElementById("modalTeamPhoneText");

  if (avatar) {
    avatar.textContent = member.initials;
    avatar.setAttribute("style", `margin: 0; width: 70px; height: 70px; font-size: 1.6rem; ${member.avatarStyle || ''}`);
  }
  if (name) name.textContent = member.name;
  if (role) role.textContent = member.role;
  if (bio) bio.textContent = member.bio;
  if (qual) qual.textContent = member.qualifications;
  if (resp) resp.textContent = member.responsibilities;
  if (email) email.href = `mailto:${member.email}`;
  if (emailTxt) emailTxt.textContent = member.email;
  if (phone) phone.href = `tel:${member.phone.replace(/[\s\-]/g, "")}`;
  if (phoneTxt) phoneTxt.textContent = member.phone;

  modal.classList.add("active", "open");
  modal.style.display = "flex";
  modal.style.opacity = "1";
  modal.style.visibility = "visible";
  modal.style.pointerEvents = "auto";
  document.body.classList.add("no-scroll");

  setTimeout(() => {
    document.getElementById("closeProfileModal")?.focus();
  }, 50);
}

function closeTeamModal() {
  const modal = document.getElementById("profileModal");
  if (modal) {
    modal.classList.remove("active", "open");
    modal.style.display = "";
    modal.style.opacity = "";
    modal.style.visibility = "";
    modal.style.pointerEvents = "";
    document.body.classList.remove("no-scroll");
  }
}

window.openTeamModal = openTeamModal;
window.closeTeamModal = closeTeamModal;

function findArticle(e) {
  if (!e) return null;
  const t = e.toString().toLowerCase().trim();
  return ARTICLES_DATA[t] || Object.values(ARTICLES_DATA).find((e) => e.slug === t || e.id.toString() === t || e.key === t);
}

function openArticleModal(e) {
  const t = findArticle(e);
  const slug = t ? t.slug || t.key || t.id : e;
  window.location.href = `/blog/${slug}`;
}

function closeArticleModal() {
  const e = document.getElementById("articleModal");
  e && (e.classList.remove("active", "open"), document.body.classList.remove("no-scroll")),
    window.location.search.includes("slug=") && window.history.pushState({}, "", window.location.pathname);
}

function resolveUrlSlug() {
  const e = new URLSearchParams(window.location.search).get("slug");
  e &&
    setTimeout(() => {
      openArticleModal(e);
    }, 150);
}

function showSecurityModal(e) {
  const t = document.getElementById("securityModal"),
    n = document.getElementById("modalTrackingIdText") || document.getElementById("modalTrackingId"),
    a = document.getElementById("phoneVerification"),
    i = document.getElementById("phoneError");

  t &&
    ((pendingTrackingId = e),
    n && (n.textContent = e),
    a && (a.value = ""),
    i && ((i.textContent = ""), i.classList.remove("show")),
    t.classList.add("open", "active"),
    document.body.classList.add("no-scroll"),
    a && setTimeout(() => a.focus(), 250));
}

function hideSecurityModal() {
  const e = document.getElementById("securityModal");
  e && e.classList.remove("open", "active"),
    document.body.classList.remove("no-scroll"),
    (pendingTrackingId = null),
    document.getElementById("trackingInput")?.focus();
}

function trapFocus(e) {
  const t = e.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (!t.length) return;
  const n = t[0],
    a = t[t.length - 1];
  e.addEventListener("keydown", function (e) {
    "Tab" === e.key &&
      (e.shiftKey
        ? document.activeElement === n && (e.preventDefault(), a.focus())
        : document.activeElement === a && (e.preventDefault(), n.focus()));
  });
}

async function verifyPhoneNumber() {
  const e = document.getElementById("phoneVerification"),
    t = document.getElementById("phoneError"),
    n = document.getElementById("verifyBtn");
  if (!e || !t) return;
  const a = e.value.trim().replace(/[\s\-\+\(\)]/g, "");
  if (!a) return (t.textContent = "❌ Please enter sender or receiver phone number."), t.classList.add("show"), void e.focus();
  if (!pendingTrackingId) return (t.textContent = "❌ No tracking ID specified."), void t.classList.add("show");
  const i = n ? n.innerHTML : "";
  n && ((n.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...'), (n.disabled = !0));
  try {
    const e = await fetch(`${API_BASE_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id: pendingTrackingId, phone: a })
      }),
      n = await e.json().catch(() => ({}));
    if (e.ok && n.success && n.shipment) return hideSecurityModal(), void displayTrackingResult(n.shipment, pendingTrackingId);
    if (n.message) return (t.textContent = `❌ ${n.message}`), void t.classList.add("show");
  } catch (e) {
    console.warn("API Verification error:", e);
  } finally {
    n && ((n.innerHTML = i), (n.disabled = !1));
  }
  (t.textContent = "❌ Phone number does not match sender or receiver record."), t.classList.add("show"), e.focus();
}

function showTrackingError(e) {
  const t = document.getElementById("trackingResult");
  t &&
    ((t.innerHTML = `
        <div class="track-result-card" role="alert" style="border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);padding:1.5rem;text-align:center;color:#ef4444;border-radius:12px;">
            <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:0.5rem;" aria-hidden="true"></i>
            <h4 style="margin:0.3rem 0;font-size:1.1rem;color:#ef4444;">${e}</h4>
        </div>
    `),
    (t.style.display = "block"),
    t.scrollIntoView({ behavior: "smooth", block: "nearest" }));
}

async function handleTracking(e) {
  e && e.preventDefault && e.preventDefault();
  const t = document.getElementById("trackingInput");
  if (!t) return !1;
  const n = t.value.trim().toUpperCase();
  if (!n) return showTrackingError("Please enter a tracking number."), t.focus(), !1;
  const a = document.getElementById("trackingResult");
  a && ((a.innerHTML = ""), (a.style.display = "none"));
  try {
    const e = await fetch(`${API_BASE_URL}/api/public/shipment/${encodeURIComponent(n)}`),
      t = await e.json().catch(() => ({}));
    if (e.ok && t.success && t.shipment) return showSecurityModal(n), !1;
    a &&
      ((a.innerHTML = `
                <div class="track-result-card" style="border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); padding: 1.5rem; text-align: center; color: #ef4444; border-radius: 12px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <h4 style="margin: 0.3rem 0; font-size: 1.1rem; color: #ef4444;">Shipment Not Found</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted, #888);">${
                      t.message || `No record found for tracking number "${n}". Please verify your ID.`
                    }</p>
                </div>
            `),
      (a.style.display = "block"),
      a.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  } catch (e) {
    console.warn("Public API inquiry error:", e), showTrackingError("Unable to connect to the tracking server. Please try again later.");
  }
  return !1;
}

function displayTrackingResult(e, t) {
  const n = document.getElementById("trackingResult");
  if (!n) return;
  const a = e.sender?.name || e.sender_name || e.s_name || "N/A",
    i = e.from || e.sender_country || e.s_country || e.origin || "N/A",
    o = e.receiver?.name || e.receiver_name || e.r_name || "N/A",
    r = e.to || e.receiver_country || e.r_country || e.destination || "N/A",
    s = e.weight || "N/A",
    l = e.status || "Pending",
    c = e.shipping_date || e.updated || e.bill_date || "Recent",
    d = e.service || "Standard Freight",
    m = "delivered" === l.toLowerCase(),
    u = m ? "delivered" : "in-transit",
    g = m ? "✅ Delivered" : "📦 " + l;

  let p = [];
  if (Array.isArray(e.timeline) && e.timeline.length > 0) p = e.timeline;
  else if ("string" == typeof e.timeline_json)
    try {
      p = JSON.parse(e.timeline_json);
    } catch (e) {}

  let f = "";
  (f =
    p && p.length > 0
      ? p
          .map(
            (e) => `
            <div class="timeline-item">
                <div class="timeline-dot ${e.done ? "done" : e.current ? "current" : ""}"><i class="${
              e.done ? "fas fa-check" : e.current ? "fas fa-plane" : "fas fa-clock"
            }"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${e.event}</div>
                    <div class="timeline-location">📍 ${e.location} (${e.date || ""})</div>
                </div>
            </div>
        `
          )
          .join("")
      : `
            <div class="timeline-item">
                <div class="timeline-dot done"><i class="fas fa-check"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">In Our Warehouse</div>
                    <div class="timeline-location">📍 Origin Facility (${i})</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot ${m ? "done" : "current"}"><i class="fas fa-plane"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${m ? "Customs Cleared" : "In Transit"}</div>
                    <div class="timeline-location">📍 Logistics Hub (${d})</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot ${m ? "done" : ""}"><i class="fas fa-flag-checkered"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${m ? "Delivered" : "Expected Delivery"}</div>
                    <div class="timeline-location">📍 Destination (${r})</div>
                </div>
            </div>
        `),
    (n.innerHTML = `
        <div class="track-result-card">
            <div class="track-result-header">
                <span class="track-id-badge">🔍 T_ID: ${t}</span>
                <span class="track-status-badge ${u}">${g}</span>
            </div>
            <div class="track-result-body">
                <div class="track-info-grid">
                    <div class="track-info-item"><label>Sender</label><span>${a}</span></div>
                    <div class="track-info-item"><label>Receiver</label><span>${o}</span></div>
                    <div class="track-info-item"><label>Origin</label><span>${i}</span></div>
                    <div class="track-info-item"><label>Destination</label><span>${r}</span></div>
                    <div class="track-info-item"><label>Weight</label><span>${s}</span></div>
                    <div class="track-info-item"><label>Bill Date</label><span>${c}</span></div>
                </div>
                <div class="track-timeline">
                    ${f}
                </div>
                <div style="margin-top: 1rem; display:flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick="window.print()" style="min-height: 38px; padding: 0.4rem 1rem; font-size: 0.78rem;">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                </div>
            </div>
        </div>
    `),
    (n.style.display = "block"),
    n.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function initAOSAndGSAP() {
  "undefined" != typeof AOS &&
    setTimeout(() => {
      AOS.init({ duration: 800, once: !0 }), AOS.refresh && AOS.refresh();
    }, 100),
    setTimeout(() => {
      document.querySelectorAll("[data-aos]").forEach((e) => {
        e.classList.add("aos-animate"), (e.style.opacity = "1"), (e.style.transform = "none");
      });
    }, 350),
    "undefined" != typeof gsap &&
      window.addEventListener("load", () => {
        "undefined" != typeof ScrollTrigger && gsap.registerPlugin(ScrollTrigger),
          gsap.from(".slide-badge,.slide-title,.slide-desc,.slide-btns", {
            opacity: 0,
            y: 30,
            stagger: 0.12,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.4
          }),
          gsap.from(".navbar", { opacity: 0, y: -15, duration: 0.6, ease: "power2.out", delay: 0.2 });
      });
}

function initContactForm() {
  const e = document.getElementById("contactForm");
  e &&
    e.addEventListener("submit", async (t) => {
      t.preventDefault();
      const n = document.getElementById("cName")?.value.trim(),
        a = document.getElementById("cEmail")?.value.trim(),
        i = document.getElementById("cPhone")?.value.trim(),
        o = document.getElementById("cService")?.value || "General",
        r = document.getElementById("cMessage")?.value.trim(),
        s = e.querySelector("[type='submit']");

      if (!(n && a && i && r)) {
        const t = e.querySelector(".contact-form-error") || document.createElement("div");
        return (
          (t.className = "contact-form-error"),
          (t.style.cssText =
            "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);"),
          t.setAttribute("role", "alert"),
          (t.textContent = "Please fill in all required fields (Name, Email, Phone, Message)."),
          void (e.querySelector(".contact-form-error") || s.insertAdjacentElement("afterend", t))
        );
      }

      const l = s?.innerHTML;
      s && ((s.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...'), (s.disabled = !0)),
        e.querySelectorAll(".contact-form-error, .contact-form-success").forEach((e) => e.remove());

      try {
        const t = await fetch(`${API_BASE_URL}/api/inquire`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: n, email: a, phone: i, service: o, message: r })
          }),
          l = await t.json().catch(() => ({})),
          c = document.createElement("div");

        t.ok && l.success
          ? ((c.className = "contact-form-success"),
            (c.style.cssText =
              "color:#10b981;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(16,185,129,0.08);border-radius:10px;border:1px solid rgba(16,185,129,0.25);"),
            c.setAttribute("role", "status"),
            (c.innerHTML =
              '<i class="fas fa-check-circle" aria-hidden="true"></i> Your inquiry has been submitted! We\'ll respond within 24 hours.'),
            e.reset())
          : ((c.className = "contact-form-error"),
            (c.style.cssText =
              "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);"),
            c.setAttribute("role", "alert"),
            (c.textContent = l.message || "Failed to send. Please try WhatsApp or call us directly.")),
          s?.insertAdjacentElement("afterend", c);
      } catch (e) {
        console.warn("Contact form error:", e);
        const t = document.createElement("div");
        (t.className = "contact-form-error"),
          (t.style.cssText =
            "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);"),
          t.setAttribute("role", "alert"),
          (t.textContent = "Network error. Please try WhatsApp or call us directly."),
          s?.insertAdjacentElement("afterend", t);
      } finally {
        s && ((s.innerHTML = l), (s.disabled = !1));
      }
    });
}

async function initOffers() {
  const e = document.getElementById("offersSection"),
    t = document.getElementById("offersGrid");
  if (e && t)
    try {
      const n = await fetch(`${API_BASE_URL}/api/offers`);
      if (n.ok) {
        const a = (await n.json()).offers || [];
        if (a.length > 0) {
          (t.innerHTML = a
            .map((e) => {
              const t = e.valid_until ? `Valid until ${e.valid_until}` : "Limited Time Offer",
                n = e.discount_code ? String(e.discount_code).replace(/"/g, "&quot;") : "",
                a = e.discount_code
                  ? `<div class="promo-code-wrap" onclick="navigator.clipboard.writeText('${n}'); alert('Discount code copied to clipboard!');" title="Click to copy code">
                        <i class="fas fa-ticket-alt" style="color:var(--accent-gold);"></i>
                        <span class="promo-code-text">${String(e.discount_code)
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")}</span>
                        <i class="far fa-copy" style="font-size:0.75rem;color:var(--text-muted);"></i>
                   </div>`
                  : "";
              return `
                <div class="offer-card" data-aos="fade-up">
                    <div>
                        <div class="offer-card-badge">
                            <i class="fas fa-fire"></i> Special Promotion
                        </div>
                        <h3 class="offer-card-title">${String(e.title || "")
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")}</h3>
                        <p class="offer-card-desc">${String(e.description || "")
                          .replace(/&/g, "&amp;")
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")}</p>
                    </div>
                    <div class="offer-card-footer">
                        ${a}
                        <div class="offer-expiry">
                            <i class="far fa-clock"></i> ${String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                        </div>
                    </div>
                </div>
            `;
            })
            .join("")),
            (e.style.display = "block");
        }
      }
    } catch (t) {
      console.warn("Could not load special offers:", t);
    }
}

function openPartnerModal() {
  const e = document.getElementById("partnerModal"),
    t = document.getElementById("openPartnerModalBtn"),
    n = document.getElementById("partnerStatusMessage");
  e &&
    (e.classList.add("active", "open"),
    t?.setAttribute("aria-expanded", "true"),
    document.body.classList.add("no-scroll"),
    n && ((n.textContent = ""), (n.className = "partner-status-msg")),
    setTimeout(() => {
      document.getElementById("partnerCompany")?.focus();
    }, 150));
}

function closePartnerModal() {
  const e = document.getElementById("partnerModal"),
    t = document.getElementById("openPartnerModalBtn");
  e && (e.classList.remove("active", "open"), t?.setAttribute("aria-expanded", "false"), document.body.classList.remove("no-scroll"), t?.focus());
}

function initPartnerModal() {
  const e = document.getElementById("openPartnerModalBtn"),
    t = document.getElementById("partnerModal"),
    n = document.getElementById("closePartnerModal"),
    a = document.getElementById("partnerForm"),
    i = document.getElementById("submitPartnerBtn"),
    o = document.getElementById("partnerStatusMessage");

  t &&
    (e?.addEventListener("click", openPartnerModal),
    n?.addEventListener("click", closePartnerModal),
    t.addEventListener("click", (e) => {
      e.target === t && closePartnerModal();
    }),
    a &&
      a.addEventListener("submit", async (e) => {
        e.preventDefault();
        const t = document.getElementById("partnerCompany")?.value.trim(),
          n = document.getElementById("partnerCountry")?.value,
          r = document.getElementById("partnerFirstName")?.value.trim(),
          s = document.getElementById("partnerLastName")?.value.trim(),
          l = document.getElementById("partnerEmail")?.value.trim(),
          c = document.getElementById("partnerPhone")?.value.trim(),
          d = document.getElementById("partnerDetails")?.value.trim();

        if (!(t && n && r && s && l && c))
          return void (
            o &&
            ((o.textContent = "❌ Please fill in all required fields marked with an asterisk (*)."),
            (o.className = "partner-status-msg error"))
          );
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l))
          return void (o && ((o.textContent = "❌ Please enter a valid email address."), (o.className = "partner-status-msg error")));

        const m = i ? i.innerHTML : "";
        i && ((i.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...'), (i.disabled = !0)),
          o && ((o.textContent = ""), (o.className = "partner-status-msg"));

        try {
          const e = await fetch(`${API_BASE_URL}/api/public/partner-apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ company_name: t, country: n, first_name: r, last_name: s, email: l, phone: c, details: d })
            }),
            i = await e.json().catch(() => ({}));
          e.ok && i.success
            ? (o && ((o.textContent = `✅ ${i.message || "Application submitted successfully!"}`), (o.className = "partner-status-msg success")),
              a.reset(),
              setTimeout(() => {
                closePartnerModal();
              }, 3000))
            : o &&
              ((o.textContent = `❌ ${i.message || "Failed to submit application. Please try again."}`),
              (o.className = "partner-status-msg error"));
        } catch (e) {
          console.error("Partner application submit error:", e),
            o && ((o.textContent = "❌ Network error. Please check your connection and try again."), (o.className = "partner-status-msg error"));
        } finally {
          i && ((i.innerHTML = m), (i.disabled = !1));
        }
      }));
}

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScrollNav();
  initTheme();
  initNavbar();
  initHeroSlider();
  initFlags();
  initFAQ();
  initPartners();
  initBackToTop();
  initLoader();
  renderTeamMembers();
  resolveUrlSlug();
  initAOSAndGSAP();
  initContactForm();
  initOffers();

  const e = document.getElementById("securityModal");
  e && trapFocus(e),
    document.getElementById("verifyBtn")?.addEventListener("click", verifyPhoneNumber),
    document.getElementById("cancelModalBtn")?.addEventListener("click", hideSecurityModal),
    document.getElementById("phoneVerification")?.addEventListener("keydown", (e) => {
      "Enter" === e.key && verifyPhoneNumber();
    }),
    e?.addEventListener("click", function (e) {
      e.target === this && hideSecurityModal();
    }),
    document.getElementById("closeArticleModal")?.addEventListener("click", closeArticleModal),
    document.getElementById("articleModal")?.addEventListener("click", function (e) {
      (e.target === this || e.target.classList.contains("article-modal-overlay")) && closeArticleModal();
    }),
    document.getElementById("closeProfileModal")?.addEventListener("click", closeTeamModal),
    document.getElementById("profileModal")?.addEventListener("click", function (e) {
      (e.target === this || e.target.classList.contains("modal-overlay")) && closeTeamModal();
    }),
    document.getElementById("partnerDetailModal")?.addEventListener("click", function (e) {
      (e.target === this || e.target.classList.contains("modal-overlay")) && closePartnerDetailModal();
    }),
    initPartnerModal(),
    document.addEventListener("keydown", (e) => {
      if ("Escape" === e.key) {
        hideSecurityModal();
        closeArticleModal();
        closeTeamModal();
        closePartnerModal();
        closePartnerDetailModal();
        const e = document.getElementById("mobileDrawer");
        e?.classList.contains("open") && document.getElementById("drawerClose")?.click();
      }
    });
});

window.addEventListener("popstate", () => {
  const e = new URLSearchParams(window.location.search).get("slug");
  if (e) openArticleModal(e);
  else {
    const e = document.getElementById("articleModal");
    e?.classList.contains("active") && (e.classList.remove("active", "open"), document.body.classList.remove("no-scroll"));
  }
});

window.handleTracking = handleTracking;
window.openTeamModal = openTeamModal;
window.closeTeamModal = closeTeamModal;
window.openArticleModal = openArticleModal;
window.closeArticleModal = closeArticleModal;
window.openPartnerModal = openPartnerModal;
window.closePartnerModal = closePartnerModal;
window.openPartnerDetailModal = openPartnerDetailModal;
window.closePartnerDetailModal = closePartnerDetailModal;
window.showTrackingError = showTrackingError;