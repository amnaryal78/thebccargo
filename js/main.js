/**
 * The BC Cargo & Courier - Main JavaScript Module
 * Core logic for theme, navigation, tracking, hero slider, team profiles modal,
 * logistics partner marquee, and blog reader modal deep-linking.
 */

const root = document.documentElement;
const THEME_KEY = "bc-theme";
const API_BASE_URL = window.API_BASE_URL || window.location.origin;

let pendingTrackingId = null;

// Global Flag Data
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

// Logistics Partner Brands
const PARTNERS = [
    { icon: "fas fa-shipping-fast", name: "DHL Express" },
    { icon: "fas fa-plane", name: "Qatar Airways" },
    { icon: "fas fa-ship", name: "Maersk Line" },
    { icon: "fas fa-box", name: "FedEx" },
    { icon: "fas fa-truck", name: "UPS" },
    { icon: "fas fa-anchor", name: "COSCO" },
    { icon: "fas fa-globe", name: "Emirates SkyCargo" }
];

// Fallback FAQs
const FAQS = [
    { q: "How do I track my shipment?", a: "Enter your BC Cargo tracking number (e.g., BC2204AT) in the tracking box above. You'll get real-time updates on location, customs status, and estimated delivery." },
    { q: "What shipping services do you offer?", a: "We offer Ocean Freight (FCL/LCL), Air Freight, Land Transport, Warehousing, Customs Clearance, and professional Packaging — connecting Nepal to 120+ countries." },
    { q: "How long does international shipping take?", a: "Air freight typically takes 3–7 days, ocean freight 15–35 days depending on the route. We provide accurate ETAs at booking." },
    { q: "Is my cargo insured during transit?", a: "Yes, comprehensive cargo insurance covers loss, damage, and theft. We highly recommend insurance for all valuable shipments." },
    { q: "How do I get a shipping quote?", a: "Visit our Contact page, call us, or message on WhatsApp. Our team responds within hours with a transparent, competitive rate." },
    { q: "Do you handle customs clearance?", a: "Absolutely. Our experienced brokers handle all import/export documentation, duties, and compliance for smooth border clearance." }
];

// Strict Team Members Dataset
const TEAM_MEMBERS = [
    {
        id: 1,
        slug: "mohan-parajuli",
        name: "Mohan Parajuli",
        initials: "MP",
        role: "Managing Director / Leadership",
        bio: "Leading strategic growth, international trade partnerships, and core logistics expansion.",
        email: "mohan@bccargo.com",
        phone: "+977-9855019485",
        qualifications: "MBA in International Supply Chain Management, 15+ years experience.",
        responsibilities: "Overall corporate vision, global partner alliances, cross-border freight strategy, and client relations."
    },
    {
        id: 2,
        slug: "ramesh-aryal",
        name: "Ramesh Aryal",
        initials: "RA",
        role: "Operations & Supply Chain Director",
        bio: "Managing air & ocean cargo dispatches, warehouse fulfillment, and real-time shipment monitoring.",
        email: "ramesh@bccargo.com",
        phone: "+977-9855019485",
        qualifications: "B.Sc. Logistics & Operations, Certified Customs Broker.",
        responsibilities: "Daily air and sea cargo operations, fleet management, warehouse operations, and shipment route optimization."
    },
    {
        id: 3,
        slug: "vacant-specialist",
        name: "Vacant / Joining Soon",
        initials: "BC",
        role: "Logistics & Customs Specialist",
        bio: "Position open for senior customs brokerage and cross-border freight compliance.",
        email: "careers@bccargo.com",
        phone: "+977-9855019485",
        qualifications: "Customs Brokerage Certification, International Trade Compliance.",
        responsibilities: "Customs duty assessment, tariff classification, import/export documentation, regulatory liaison."
    },
    {
        id: 4,
        slug: "ramesh-aryal-it",
        name: "Ramesh Aryal",
        initials: "RI",
        role: "IT & Digital Infrastructure Lead",
        bio: "Leading website design, digital billing systems, corporate logo design, promotional banners, and core IT infrastructure.",
        email: "ramesh@bccargo.com",
        phone: "+977-9855019485",
        qualifications: "Full-Stack Web Development, Billing Systems Engineering, UI/UX & Graphic Branding.",
        responsibilities: "Website architecture & UI design, automated billing system development, corporate logo & marketing banner creation, and live shipment tracking integration."
    }
];

// Articles Dataset for Blog Reader & Deep-Linking
const ARTICLES_DATA = {
    "opening-of-our-cargo-courier": {
        id: 1,
        slug: "opening-of-our-cargo-courier",
        key: "article-1",
        title: "Opening of Our Cargo & Courier",
        category: "General",
        date: "August 17, 2026",
        author: { name: "Mohan Parajuli", role: "Managing Director", avatar: "MP" },
        image: "https://files.catbox.moe/lpf0lv.png",
        summary: "BC Cargo & Courier Service is proud to announce its Grand Opening on Bhadra 1, 2083 (August 17, 2026). We are committed to providing fast, safe, and reliable domestic and international cargo, courier, express delivery, and door-to-door logistics services, connecting Nepal to the world.",
        contentHtml: `<h2>Grand Opening of BC Cargo & Courier Service</h2><p>We are excited to announce the official Grand Opening of <strong>BC Cargo & Courier Service</strong> on <strong>Bhadra 1, 2083 (August 17, 2026)</strong>. This marks the beginning of a new journey dedicated to providing reliable, secure, and efficient logistics solutions for individuals and businesses across Nepal and beyond.</p><p>Our mission is simple: <strong>Connecting Nepal to the World.</strong> Whether you need to send parcels within the country or ship internationally, BC Cargo is committed to delivering your packages safely and on time.</p><h3>Our Services</h3><ul><li>Domestic Cargo Services</li><li>International Courier</li><li>Express Delivery</li><li>Door-to-Door Delivery</li></ul><h3>Why Choose BC Cargo?</h3><ul><li>Fast and reliable delivery</li><li>Safe handling of shipments</li><li>Competitive pricing</li><li>Professional customer support</li><li>Nationwide and international coverage</li></ul><p>We sincerely thank everyone who has supported us throughout this journey. We look forward to serving our valued customers with excellence and building lasting relationships based on trust and reliability.</p><p>Join us as we celebrate this exciting milestone and experience a new standard in cargo and courier services.</p><p><strong>BC Cargo & Courier Service</strong><br>Connecting Nepal to the World.</p>`
    },
    "air-freight-expansion-2025": {
        id: 2,
        slug: "air-freight-expansion-2025",
        key: "article-2",
        title: "BC Cargo Expands Air Freight Routes to 15 New Destinations Across Asia and Europe",
        category: "Air Freight",
        date: "June 10, 2025",
        author: { name: "Anil Shrestha", role: "Logistics Specialist", avatar: "AS" },
        image: "https://files.catbox.moe/kv8fb3.jpeg",
        summary: "Our latest expansion connects Nepal's exporters to 15 key logistics hubs with guaranteed capacity and express customs clearance.",
        contentHtml: `<p>THE BC Cargo & Courier is excited to announce a major expansion of our express air freight network. With direct carrier allocations connecting Tribhuvan International Airport (KTM) to key global hubs in Dubai, Singapore, Frankfurt, Tokyo, and New York, businesses can now experience unprecedented shipping speed and reliability.</p><h3>Key Benefits of the Expanded Corridors:</h3><ul><li>Daily express departures for urgent document and parcel dispatches</li><li>Temperature-controlled cargo hold for sensitive pharmaceuticals, electronics, and perishable goods</li><li>Integrated pre-arrival customs clearance at international destination hubs</li><li>Guaranteed airline space commitments during peak holiday shipping seasons</li></ul><p>Whether you are shipping urgent commercial samples or high-value export cargo, our dedicated air freight team provides 24/7 end-to-end telemetry and monitoring from pickup to final delivery.</p>`
    },
    "storage-logistics-hub-kathmandu": {
        id: 2,
        slug: "storage-logistics-hub-kathmandu",
        key: "article-2",
        title: "New Climate-Controlled Storage & Logistics Hub Opens in Kathmandu",
        category: "Warehousing",
        date: "May 28, 2025",
        readTime: "3 min read",
        author: { name: "Ramesh Aryal", role: "Operations Director", avatar: "RA" },
        image: "https://files.catbox.moe/4oqtfe.jpeg",
        summary: "State-of-the-art 25,000 sq ft climate-controlled warehousing facility equipped with real-time RFID tracking and 24/7 surveillance.",
        contentHtml: `<p>To support growing cross-border trade in South Asia, THE BC Cargo has officially commissioned a modern 25,000 sq ft logistics and fulfillment center in Kathmandu.</p><h3>Facility Capabilities & Tech:</h3><ul><li>Precision temperature-controlled zones (-20°C to +25°C) for pharmaceuticals, specialized foods, and high-tech items</li><li>Real-time Warehouse Management System (WMS) integration with barcode & RFID scan audit trails</li><li>24/7 HD CCTV monitoring, biometric access control, and fire suppression systems</li><li>Cross-docking bays for seamless truck-to-container load transfers</li></ul><p>This facility empowers local importers and exporters to store inventory safely, consolidate LCL shipments, and fulfill orders rapidly without incurring costly port demurrage or transit delays.</p>`
    },
    "nepal-cargo-courier-advancements": {
        id: 3,
        slug: "nepal-cargo-courier-advancements",
        key: "article-3",
        title: "How Nepal's Export Industry is Transforming with Modern Logistics",
        category: "Industry",
        date: "May 15, 2025",
        readTime: "5 min read",
        author: { name: "Mohan Parajuli", role: "Managing Director", avatar: "MP" },
        image: "https://files.catbox.moe/bvlydd.jpeg",
        summary: "From handcrafted goods to tea and textiles, discover how digital freight forwarding is expanding global market access for Nepalese exporters.",
        contentHtml: `<p>Nepal's freight forwarding and international courier sector is undergoing a profound digital transformation. High-altitude supply chain engineering, streamlined border customs procedures, and multimodal transport integration are opening new doors for local enterprises.</p><p>At THE BC Cargo & Courier, we are leading this shift by deploying API-driven tracking, automated document verification, and direct air/sea partnerships. Nepalese artisans, tea producers, and textile manufacturers can now quote landed costs accurately and deliver directly to international buyers across 120+ countries.</p>`
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
        image: "https://files.catbox.moe/kv8fb3.jpeg",
        summary: "Incorrect HS codes, missing certificates of origin, and incomplete invoices account for over 60% of customs delays. Learn expert prevention tips.",
        contentHtml: `<p>Customs bottlenecks can severely impact supply chain timelines and inflate import tariffs. Based on our analysis of border declarations at Birgunj, Tatopani, and KTM Airport, here are the top 5 mistakes importers make:</p><ol><li><strong>Inaccurate HS Code Classification:</strong> Misclassifying goods leads to penalty fines and unexpected tariff re-assessments.</li><li><strong>Missing Country of Origin Certificates:</strong> Tariff concessions under SAFTA or trade agreements require certified origin documents.</li><li><strong>Discrepancies Between Invoice & Packing List:</strong> Item count or weight mismatches trigger physical customs inspections.</li><li><strong>Delayed Valuation Submissions:</strong> Failing to submit declared value proof early causes demurrage charges.</li><li><strong>Non-Compliance with Product Standards:</strong> Regulated items require prior Department of Food Technology & Quality Control (DFTQC) clearances.</li></ol><p>Working with experienced, certified customs brokers eliminates these pitfalls before shipments depart origin ports.</p>`
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
        image: "https://files.catbox.moe/bvlydd.jpeg",
        summary: "Full Container Load or Less than Container Load? Compare cost parameters, transit times, and packaging requirements for sea freight.",
        contentHtml: `<p>Selecting between Full Container Load (FCL) and Less than Container Load (LCL) is a key strategic decision for importers and exporters shipping sea cargo to Nepal via Kolkata or Visakhapatnam ports.</p><h3>FCL (Full Container Load)</h3><p>Ideal for cargo volumes exceeding 15 CBM (Cubic Meters). You get exclusive access to a 20ft or 40ft container, sealed from origin to destination, minimizing handling and transit delays.</p><h3>LCL (Less than Container Load)</h3><p>Ideal for smaller shipments (1 to 14 CBM). Your goods share container space with other compatible cargo, allowing you to pay strictly for the volume you occupy.</p>`
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
        image: "https://files.catbox.moe/4oqtfe.jpeg",
        summary: "Proper packaging reduces damage claims by up to 80%. Learn best practices for double-walled cartons, moisture barriers, and shock absorbents.",
        contentHtml: `<p>Long-distance intermodal transit exposes cargo to shock, vibration, humidity, and compression forces. Implementing industrial packaging standards ensures your goods arrive in pristine condition.</p><h3>Core Packaging Principles:</h3><ul><li><strong>Double-Walled Corrugated Boxes:</strong> Standard single-wall boxes collapse under stack loads. Always opt for heavy-duty double or triple-wall boxes.</li><li><strong>Moisture & Desiccant Protection:</strong> Sea transit creates 'container rain'. Seal sensitive electronics and fabrics in vapor-barrier bags with silica desiccants.</li><li><strong>Palletization & Strapping:</strong> Secure box loads onto ISPM-15 heat-treated wooden pallets using stretch film and heavy-duty polyester strapping.</li></ul>`
    }
};


/* ── Theme Switcher ── */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem("bc-cargo-theme-premium") || "dark";
    root.setAttribute("data-theme", savedTheme);
    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
        themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", nextTheme);
            localStorage.setItem(THEME_KEY, nextTheme);
            localStorage.setItem("bc-cargo-theme-premium", nextTheme);
            if (themeIcon) {
                themeIcon.className = nextTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
            }
        });
    }
}

/* ── Navbar & Drawer ── */
function initNavbar() {
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const drawerClose = document.getElementById("drawerClose");

    if (navbar) {
        let isTicking = false;
        window.addEventListener("scroll", () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    navbar.classList.toggle("scrolled", window.scrollY > 50);
                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });
    }

    function closeDrawer() {
        mobileDrawer?.classList.remove("open");
        drawerOverlay?.classList.remove("open");
        navToggle?.classList.remove("open");
        navToggle?.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
    }

    navToggle?.addEventListener("click", () => {
        if (mobileDrawer?.classList.contains("open")) {
            closeDrawer();
        } else {
            mobileDrawer?.classList.add("open");
            drawerOverlay?.classList.add("open");
            navToggle?.classList.add("open");
            navToggle?.setAttribute("aria-expanded", "true");
            document.body.classList.add("no-scroll");
        }
    });

    drawerClose?.addEventListener("click", closeDrawer);
    drawerOverlay?.addEventListener("click", closeDrawer);
    mobileDrawer?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeDrawer));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileDrawer?.classList.contains("open")) {
            closeDrawer();
        }
    });
}

/* ── Hero Slider & Sliding Text Overlays ── */
function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    if (!slides || slides.length === 0) return;

    const dots = document.querySelectorAll(".hero-dot");
    const progress = document.getElementById("slideProgress");
    const taglineSlides = document.querySelectorAll(".tagline-slide");
    let currentIndex = 0;
    let timer = null;

    function goToSlide(index) {
        slides[currentIndex]?.classList.remove("active");
        dots[currentIndex]?.classList.remove("active");
        taglineSlides[currentIndex]?.classList.remove("active");

        currentIndex = (index % slides.length + slides.length) % slides.length;

        slides[currentIndex]?.classList.add("active");
        dots[currentIndex]?.classList.add("active");
        taglineSlides[currentIndex]?.classList.add("active");

        if (progress) {
            progress.style.width = "0%";
            progress.style.transition = "none";
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progress.style.transition = "width 5900ms linear";
                    progress.style.width = "100%";
                });
            });
        }
    }

    function startAutoplay() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => goToSlide(currentIndex + 1), 6000);
    }

    function resetAutoplay() {
        clearInterval(timer);
        startAutoplay();
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            goToSlide(idx);
            resetAutoplay();
        });
    });

    goToSlide(0);
    startAutoplay();
}

/* ── Flag Marquee ── */
function initFlags() {
    const flagsTrack1 = document.getElementById("flagsTrack");
    const flagsTrack2 = document.getElementById("flagsTrack2");

    if (flagsTrack1) {
        renderFlags(flagsTrack1, [...FLAGS, ...FLAGS]);
    }
    if (flagsTrack2) {
        const reversed = [...FLAGS].reverse();
        renderFlags(flagsTrack2, [...reversed, ...reversed]);
    }

    function renderFlags(container, items) {
        container.innerHTML = "";
        items.forEach(flag => {
            const div = document.createElement("div");
            div.className = "flag-item";
            div.innerHTML = `<img src="https://flagcdn.com/w40/${flag.code}.png" srcset="https://flagcdn.com/w80/${flag.code}.png 2x" alt="${flag.name} flag" class="flag-img" loading="lazy"> <span class="flag-name">${flag.name}</span>`;
            container.appendChild(div);
        });
    }
}

/* ── Faster Partner Marquee Loop ── */
function initPartners() {
    const partnersTrack = document.getElementById("partnersTrack");
    if (!partnersTrack) return;

    partnersTrack.innerHTML = "";
    // Triple the partner list to guarantee seamless infinite loop scrolling
    const list = [...PARTNERS, ...PARTNERS, ...PARTNERS];

    list.forEach(p => {
        const item = document.createElement("div");
        item.className = "partner-item";
        item.style.cssText = "display:flex;align-items:center;gap:0.5rem;opacity:0.75;font-size:0.9rem;font-weight:700;padding:0 1.25rem;";
        item.innerHTML = `<i class="${p.icon}" style="color:var(--accent-blue, #1a56db);"></i> <span>${p.name}</span>`;
        partnersTrack.appendChild(item);
    });
}

/* ── FAQ Accordion ── */
async function initFAQ() {
    const faqWrap = document.getElementById("faqWrap");
    if (!faqWrap) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/public/faqs`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.faqs && data.faqs.length > 0) {
                renderFaqs(data.faqs);
                return;
            }
        }
    } catch (e) {
        console.warn("FAQ API fetch failed, fallback to static FAQs:", e);
    }
    renderFaqs(FAQS);

    function renderFaqs(items) {
        faqWrap.innerHTML = "";
        items.forEach(item => {
            const q = item.question || item.q;
            const a = item.answer || item.a;
            const div = document.createElement("div");
            div.className = "faq-item";
            div.innerHTML = `
                <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
                    <span class="faq-q-text">${q}</span>
                    <div class="faq-icon"><i class="fas fa-plus"></i></div>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-inner">${a}</div>
                </div>
            `;
            faqWrap.appendChild(div);
            const questionEl = div.querySelector(".faq-question");
            function toggleFaq() {
                const isOpen = div.classList.contains("open");
                document.querySelectorAll(".faq-item.open").forEach(el => {
                    el.classList.remove("open");
                    el.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
                });
                if (!isOpen) {
                    div.classList.add("open");
                    questionEl?.setAttribute("aria-expanded", "true");
                }
            }
            questionEl.addEventListener("click", toggleFaq);
            questionEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFaq();
                }
            });
        });
    }
}

/* ── Back to Top ── */
function initBackToTop() {
    const backTop = document.getElementById("backTop");
    if (!backTop) return;

    window.addEventListener("scroll", () => {
        backTop.classList.toggle("visible", window.scrollY > 400);
    }, { passive: true });

    backTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ── Page Loader ── */
function initLoader() {
    const loader = document.getElementById("loader");
    const loaderProgress = document.getElementById("loaderProgress");

    function hideLoader() {
        if (loader) {
            if (loaderProgress) loaderProgress.style.width = "100%";
            setTimeout(() => {
                loader.classList.add("hidden");
                loader.style.display = "none";
                document.body.classList.remove("no-scroll");
            }, 80);
        }
    }

    if (document.readyState === "interactive" || document.readyState === "complete") {
        hideLoader();
    } else {
        document.addEventListener("DOMContentLoaded", hideLoader);
        window.addEventListener("load", hideLoader);
    }
    setTimeout(hideLoader, 300);
}

/* ── Team Members & Profile Modal (Task 4) ── */
function renderTeamMembers() {
    const teamGrid = document.getElementById("teamGrid");
    if (!teamGrid) return;

    teamGrid.innerHTML = TEAM_MEMBERS.map(member => `
        <div class="team-card tilt-card" data-aos="fade-up">
            <div class="team-avatar">${member.initials}</div>
            <span class="hero-brand-badge" style="font-size:0.7rem;margin-bottom:0.4rem;display:inline-block;padding:0.25rem 0.75rem;">${member.role}</span>
            <h3 class="team-name">${member.name}</h3>
            <p class="team-bio">${member.bio}</p>
            <button class="btn btn-outline-primary btn-sm team-expand-btn" onclick="openTeamModal(${member.id})">
                <i class="fas fa-expand-alt"></i> Click to Expand
            </button>
        </div>
    `).join("");
}

function openTeamModal(id) {
    const member = TEAM_MEMBERS.find(m => m.id === id);
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
    const emailText = document.getElementById("modalTeamEmailText");
    const phone = document.getElementById("modalTeamPhone");
    const phoneText = document.getElementById("modalTeamPhoneText");

    if (avatar) avatar.textContent = member.initials;
    if (name) name.textContent = member.name;
    if (role) role.textContent = member.role;
    if (bio) bio.textContent = member.bio;
    if (qual) qual.textContent = member.qualifications;
    if (resp) resp.textContent = member.responsibilities;
    if (email) email.href = `mailto:${member.email}`;
    if (emailText) emailText.textContent = member.email;
    if (phone) phone.href = `tel:${member.phone.replace(/[\s\-]/g, "")}`;
    if (phoneText) phoneText.textContent = member.phone;

    modal.classList.add("active", "open");
    document.body.classList.add("no-scroll");
}

function closeTeamModal() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.classList.remove("active", "open");
        document.body.classList.remove("no-scroll");
    }
}

/* ── Blog Reader Modal & Deep-Linking (Task 2) ── */
function findArticle(query) {
    if (!query) return null;
    const key = query.toString().toLowerCase().trim();
    return ARTICLES_DATA[key] ||
           Object.values(ARTICLES_DATA).find(a => a.slug === key || a.id.toString() === key || a.key === key);
}

function openArticleModal(query) {
    const article = findArticle(query);
    if (!article) return;

    const modal = document.getElementById("articleModal");
    if (!modal) return;

    const cover = document.getElementById("modalArticleCover");
    const category = document.getElementById("modalArticleCategory");
    const title = document.getElementById("modalArticleTitle");
    const date = document.getElementById("modalArticleDate");
    const authorName = document.getElementById("modalArticleAuthorName");
    const authorRole = document.getElementById("modalArticleAuthorRole");
    const authorAvatar = document.getElementById("modalArticleAuthorAvatar");
    const body = document.getElementById("modalArticleBody");

    if (cover) { cover.src = article.image; cover.alt = article.title; }
    if (category) category.textContent = article.category;
    if (title) title.textContent = article.title;
    if (date) date.textContent = article.date;
    if (authorName) authorName.textContent = article.author?.name || "BC Cargo Team";
    if (authorRole) authorRole.textContent = article.author?.role || "Logistics Specialist";
    if (authorAvatar) authorAvatar.textContent = article.author?.avatar || "BC";
    if (body) body.innerHTML = article.contentHtml || `<p>${article.summary}</p>`;

    modal.classList.add("active", "open");
    document.body.classList.add("no-scroll");

    // SEO-friendly URL PushState
    const targetSlug = article.slug || article.key || article.id;
    const newUrl = '/blog?slug=' + encodeURIComponent(targetSlug);
    if (window.location.search !== '?slug=' + targetSlug) {
        window.history.pushState({ slug: targetSlug }, '', newUrl);
    }
}

function closeArticleModal() {
    const modal = document.getElementById("articleModal");
    if (modal) {
        modal.classList.remove("active", "open");
        document.body.classList.remove("no-scroll");
    }

    // Revert URL bar back to clean path without search params
    if (window.location.search.includes('slug=')) {
        window.history.pushState({}, '', window.location.pathname);
    }
}

function resolveUrlSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (slug) {
        openArticleModal(slug);
    }
}

/* ── Live Tracking & Security Modal ── */
function showSecurityModal(trackingId) {
    const modal = document.getElementById("securityModal");
    const trackingText = document.getElementById("modalTrackingIdText") || document.getElementById("modalTrackingId");
    const phoneInput = document.getElementById("phoneVerification");
    const phoneError = document.getElementById("phoneError");

    if (modal) {
        pendingTrackingId = trackingId;
        if (trackingText) trackingText.textContent = trackingId;
        if (phoneInput) phoneInput.value = "";
        if (phoneError) {
            phoneError.textContent = "";
            phoneError.classList.remove("show");
        }
        modal.classList.add("open", "active");
        document.body.classList.add("no-scroll");
        if (phoneInput) setTimeout(() => phoneInput.focus(), 250);
    }
}

function hideSecurityModal() {
    const modal = document.getElementById("securityModal");
    if (modal) modal.classList.remove("open", "active");
    document.body.classList.remove("no-scroll");
    pendingTrackingId = null;
    // Return focus to the tracking input after modal closes
    document.getElementById("trackingInput")?.focus();
}

/* ── Focus Trap Utility ── */
function trapFocus(modalEl) {
    const focusable = modalEl.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    modalEl.addEventListener("keydown", function handler(e) {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
}

async function verifyPhoneNumber() {
    const phoneInput = document.getElementById("phoneVerification");
    const phoneError = document.getElementById("phoneError");
    const verifyBtn = document.getElementById("verifyBtn");

    if (!phoneInput || !phoneError) return;
    const phoneVal = phoneInput.value.trim().replace(/[\s\-\+\(\)]/g, "");

    if (!phoneVal) {
        phoneError.textContent = "❌ Please enter sender or receiver phone number.";
        phoneError.classList.add("show");
        phoneInput.focus();
        return;
    }

    if (!pendingTrackingId) {
        phoneError.textContent = "❌ No tracking ID specified.";
        phoneError.classList.add("show");
        return;
    }

    const btnOriginal = verifyBtn ? verifyBtn.innerHTML : "";
    if (verifyBtn) {
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        verifyBtn.disabled = true;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tracking_id: pendingTrackingId, phone: phoneVal })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.shipment) {
            hideSecurityModal();
            displayTrackingResult(data.shipment, pendingTrackingId);
            return;
        }
        if (data.message) {
            phoneError.textContent = `❌ ${data.message}`;
            phoneError.classList.add("show");
            return;
        }
    } catch (e) {
        console.warn("API Verification error:", e);
    } finally {
        if (verifyBtn) {
            verifyBtn.innerHTML = btnOriginal;
            verifyBtn.disabled = false;
        }
    }

    phoneError.textContent = "❌ Phone number does not match sender or receiver record.";
    phoneError.classList.add("show");
    phoneInput.focus();
}

function showTrackingError(message) {
    const resultWrap = document.getElementById("trackingResult");
    if (!resultWrap) return;
    resultWrap.innerHTML = `
        <div class="track-result-card" role="alert" style="border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.05);padding:1.5rem;text-align:center;color:#ef4444;border-radius:12px;">
            <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:0.5rem;" aria-hidden="true"></i>
            <h4 style="margin:0.3rem 0;font-size:1.1rem;color:#ef4444;">${message}</h4>
        </div>
    `;
    resultWrap.style.display = "block";
    resultWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function handleTracking(e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById("trackingInput");
    if (!input) return false;

    const val = input.value.trim().toUpperCase();
    if (!val) {
        showTrackingError("Please enter a tracking number.");
        input.focus();
        return false;
    }

    const resultWrap = document.getElementById("trackingResult");
    if (resultWrap) {
        resultWrap.innerHTML = "";
        resultWrap.style.display = "none";
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/public/shipment/${encodeURIComponent(val)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.shipment) {
            showSecurityModal(val);
            return false;
        }

        if (resultWrap) {
            resultWrap.innerHTML = `
                <div class="track-result-card" style="border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); padding: 1.5rem; text-align: center; color: #ef4444; border-radius: 12px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <h4 style="margin: 0.3rem 0; font-size: 1.1rem; color: #ef4444;">Shipment Not Found</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted, #888);">${data.message || `No record found for tracking number "${val}". Please verify your ID.`}</p>
                </div>
            `;
            resultWrap.style.display = "block";
            resultWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    } catch (err) {
        console.warn("Public API inquiry error:", err);
        showTrackingError("Unable to connect to the tracking server. Please try again later.");
    }
    return false;
}

function displayTrackingResult(shipment, trackingId) {
    const resultWrap = document.getElementById("trackingResult");
    if (!resultWrap) return;

    const sender = shipment.sender?.name || shipment.sender_name || shipment.s_name || "N/A";
    const origin = shipment.from || shipment.sender_country || shipment.s_country || shipment.origin || "N/A";
    const receiver = shipment.receiver?.name || shipment.receiver_name || shipment.r_name || "N/A";
    const dest = shipment.to || shipment.receiver_country || shipment.r_country || shipment.destination || "N/A";
    const weight = shipment.weight || "N/A";
    const status = shipment.status || "Pending";
    const date = shipment.shipping_date || shipment.updated || shipment.bill_date || "Recent";
    const service = shipment.service || "Standard Freight";
    const statusLower = status.toLowerCase();
    const isDelivered = statusLower === "delivered";
    const statusClass = isDelivered ? "delivered" : "in-transit";
    const statusText = isDelivered ? "✅ Delivered" : "📦 " + status;

    let timeline = [];
    if (Array.isArray(shipment.timeline) && shipment.timeline.length > 0) {
        timeline = shipment.timeline;
    } else if (typeof shipment.timeline_json === "string") {
        try { timeline = JSON.parse(shipment.timeline_json); } catch (e) {}
    }

    let timelineHtml = "";
    if (timeline && timeline.length > 0) {
        timelineHtml = timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-dot ${item.done ? "done" : item.current ? "current" : ""}"><i class="${item.done ? "fas fa-check" : item.current ? "fas fa-plane" : "fas fa-clock"}"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${item.event}</div>
                    <div class="timeline-location">📍 ${item.location} (${item.date || ""})</div>
                </div>
            </div>
        `).join("");
    } else {
        timelineHtml = `
            <div class="timeline-item">
                <div class="timeline-dot done"><i class="fas fa-check"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">In Our Warehouse</div>
                    <div class="timeline-location">📍 Origin Facility (${origin})</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot ${isDelivered ? "done" : "current"}"><i class="fas fa-plane"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${isDelivered ? "Customs Cleared" : "In Transit"}</div>
                    <div class="timeline-location">📍 Logistics Hub (${service})</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot ${isDelivered ? "done" : ""}"><i class="fas fa-flag-checkered"></i></div>
                <div class="timeline-content">
                    <div class="timeline-event">${isDelivered ? "Delivered" : "Expected Delivery"}</div>
                    <div class="timeline-location">📍 Destination (${dest})</div>
                </div>
            </div>
        `;
    }

    resultWrap.innerHTML = `
        <div class="track-result-card">
            <div class="track-result-header">
                <span class="track-id-badge">🔍 T_ID: ${trackingId}</span>
                <span class="track-status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="track-result-body">
                <div class="track-info-grid">
                    <div class="track-info-item"><label>Sender</label><span>${sender}</span></div>
                    <div class="track-info-item"><label>Receiver</label><span>${receiver}</span></div>
                    <div class="track-info-item"><label>Origin</label><span>${origin}</span></div>
                    <div class="track-info-item"><label>Destination</label><span>${dest}</span></div>
                    <div class="track-info-item"><label>Weight</label><span>${weight}</span></div>
                    <div class="track-info-item"><label>Bill Date</label><span>${date}</span></div>
                </div>
                <div class="track-timeline">
                    ${timelineHtml}
                </div>
                <div style="margin-top: 1rem; display:flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick="window.print()" style="min-height: 38px; padding: 0.4rem 1rem; font-size: 0.78rem;">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                </div>
            </div>
        </div>
    `;
    resultWrap.style.display = "block";
    resultWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ── AOS & GSAP Animations ── */
function initAOSAndGSAP() {
    if (typeof AOS !== "undefined") {
        setTimeout(() => {
            AOS.init({ duration: 800, once: true });
            if (AOS.refresh) AOS.refresh();
        }, 100);
    }

    // Reliable Fallback: Ensure all [data-aos] elements become visible
    setTimeout(() => {
        document.querySelectorAll("[data-aos]").forEach(el => {
            el.classList.add("aos-animate");
            el.style.opacity = "1";
            el.style.transform = "none";
        });
    }, 350);

    if (typeof gsap !== "undefined") {
        window.addEventListener("load", () => {
            if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
            gsap.from(".slide-badge,.slide-title,.slide-desc,.slide-btns", {
                opacity: 0, y: 30, stagger: 0.12, duration: 0.8, ease: "power2.out", delay: 0.4
            });
            gsap.from(".navbar", {
                opacity: 0, y: -15, duration: 0.6, ease: "power2.out", delay: 0.2
            });
        });
    }
}

/* ── Contact Form Handler ── */
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("cName")?.value.trim();
        const email = document.getElementById("cEmail")?.value.trim();
        const phone = document.getElementById("cPhone")?.value.trim();
        const service = document.getElementById("cService")?.value || "General";
        const message = document.getElementById("cMessage")?.value.trim();
        const submitBtn = form.querySelector("[type='submit']");

        // Basic client-side validation
        if (!name || !email || !phone || !message) {
            const errDiv = form.querySelector(".contact-form-error") || document.createElement("div");
            errDiv.className = "contact-form-error";
            errDiv.style.cssText = "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);";
            errDiv.setAttribute("role", "alert");
            errDiv.textContent = "Please fill in all required fields (Name, Email, Phone, Message).";
            if (!form.querySelector(".contact-form-error")) submitBtn.insertAdjacentElement("afterend", errDiv);
            return;
        }

        const originalHtml = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';
            submitBtn.disabled = true;
        }

        // Remove old messages
        form.querySelectorAll(".contact-form-error, .contact-form-success").forEach(el => el.remove());

        try {
            const res = await fetch(`${API_BASE_URL}/api/inquire`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: name, email, phone, service, message })
            });
            const data = await res.json().catch(() => ({}));

            const msgDiv = document.createElement("div");
            if (res.ok && data.success) {
                msgDiv.className = "contact-form-success";
                msgDiv.style.cssText = "color:#10b981;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(16,185,129,0.08);border-radius:10px;border:1px solid rgba(16,185,129,0.25);";
                msgDiv.setAttribute("role", "status");
                msgDiv.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Your inquiry has been submitted! We\'ll respond within 24 hours.';
                form.reset();
            } else {
                msgDiv.className = "contact-form-error";
                msgDiv.style.cssText = "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);";
                msgDiv.setAttribute("role", "alert");
                msgDiv.textContent = data.message || "Failed to send. Please try WhatsApp or call us directly.";
            }
            submitBtn?.insertAdjacentElement("afterend", msgDiv);
        } catch (err) {
            console.warn("Contact form error:", err);
            const msgDiv = document.createElement("div");
            msgDiv.className = "contact-form-error";
            msgDiv.style.cssText = "color:#ef4444;font-size:0.88rem;margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.25);";
            msgDiv.setAttribute("role", "alert");
            msgDiv.textContent = "Network error. Please try WhatsApp or call us directly.";
            submitBtn?.insertAdjacentElement("afterend", msgDiv);
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalHtml;
                submitBtn.disabled = false;
            }
        }
    });
}

/* ── DOM Ready Initialization ── */
document.addEventListener("DOMContentLoaded", () => {
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

    // Security Modal Event Listeners + Focus Trap
    const secModal = document.getElementById("securityModal");
    if (secModal) trapFocus(secModal);
    document.getElementById("verifyBtn")?.addEventListener("click", verifyPhoneNumber);
    document.getElementById("cancelModalBtn")?.addEventListener("click", hideSecurityModal);
    document.getElementById("phoneVerification")?.addEventListener("keydown", e => {
        if (e.key === "Enter") verifyPhoneNumber();
    });
    secModal?.addEventListener("click", function(e) {
        if (e.target === this) hideSecurityModal();
    });

    // Article Reader Modal Event Listeners
    document.getElementById("closeArticleModal")?.addEventListener("click", closeArticleModal);
    document.getElementById("articleModal")?.addEventListener("click", function(e) {
        if (e.target === this || e.target.classList.contains("article-modal-overlay")) {
            closeArticleModal();
        }
    });

    // Profile Detail Modal Event Listeners
    document.getElementById("closeProfileModal")?.addEventListener("click", closeTeamModal);
    document.getElementById("profileModal")?.addEventListener("click", function(e) {
        if (e.target === this || e.target.classList.contains("modal-overlay")) {
            closeTeamModal();
        }
    });

    // Universal Escape Key Handler
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            hideSecurityModal();
            closeArticleModal();
            closeTeamModal();
            const drawer = document.getElementById("mobileDrawer");
            if (drawer?.classList.contains("open")) {
                document.getElementById("drawerClose")?.click();
            }
        }
    });
});

// Popstate Handler for Browser Back/Forward URL Navigation
window.addEventListener("popstate", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");
    if (slug) {
        openArticleModal(slug);
    } else {
        const articleModal = document.getElementById("articleModal");
        if (articleModal?.classList.contains("active")) {
            articleModal.classList.remove("active", "open");
            document.body.classList.remove("no-scroll");
        }
    }
});

// Make functions globally available
window.handleTracking = handleTracking;
window.openTeamModal = openTeamModal;
window.closeTeamModal = closeTeamModal;
window.openArticleModal = openArticleModal;
window.closeArticleModal = closeArticleModal;
window.showTrackingError = showTrackingError;