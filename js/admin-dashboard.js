const API = window.API_BASE_URL || window.location.origin;

let shipmentsData = [],
  blogsData = [],
  leadsData = [],
  faqsData = [],
  offersData = [],
  currentTimeline = [],
  contactMessagesData = [],
  careerApplicationsData = [],
  partnerRequestsData = [],
  activeSubmissionTab = "contact",
  totalUnreadCount = 0,
  currentReplyContext = { toEmail: "", recipientName: "", subject: "" };

const COMPANY_NAME = "The BC Cargo",
  COMPANY_ADDRESS = "School Road, Hetauda-4, Nepal",
  COMPANY_PHONE = "+977-9855019485",
  COMPANY_EMAIL = "info@thebccargo.com",
  COMPANY_PAN = "62112666665",
  WEBSITE_URL = "https://thebccargo.com";

const GATEWAY_HEADERS = { "x-bc-gateway-token": "BC_CARGO_SECURE_GATEWAY_2026" };

async function checkAuth() {
  try {
    const res = await fetch(`${API}/api/auth/check`, { credentials: "include", headers: GATEWAY_HEADERS });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    if (data.admin) {
      const nameEl = document.getElementById("userName");
      const avatarEl = document.getElementById("userAvatar");
      if (nameEl) nameEl.textContent = data.admin.username;
      if (avatarEl) avatarEl.textContent = data.admin.username.charAt(0).toUpperCase();
    }
    return true;
  } catch (err) {
    console.warn("Admin Auth Check Failed:", err.message);
    if (window.location.origin === API) {
      window.location.href = "/hq-access";
    }
    return false;
  }
}

async function handleLogout() {
  try {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include", headers: GATEWAY_HEADERS });
  } catch (err) {}
  window.location.href = "/hq-access";
}

const pageTitles = {
  dashboard: { title: "Dashboard", sub: "Overview of your logistics operations" },
  submissions: { title: "Form Submissions", sub: "Review and manage Contact, Career, and Partner submissions" },
  shipments: { title: "Shipments", sub: "Manage all cargo shipments" },
  blogs: { title: "Blog CMS", sub: "Create and manage articles" },
  leads: { title: "Form Submissions", sub: "Review and manage Contact, Career, and Partner submissions" },
  faqs: { title: "FAQs", sub: "Manage frequently asked questions" },
  offers: { title: "Special Offers", sub: "Manage dynamic promotions and discount deals" }
};

function navigateTo(page, subtab = null, updateHash = true) {
  if (page === "leads") page = "submissions";

  // Clear active state on all page content views
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  
  // Clear active state on main navigation items
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));

  // Clear active state and inline styles on sub-navigation items
  document.querySelectorAll(".nav-sub-item").forEach((item) => {
    item.classList.remove("active");
    item.style.background = "transparent";
    item.style.color = "var(--text-secondary)";
    item.style.fontWeight = "500";
  });

  const targetPage = document.getElementById(`page-${page}`);
  const targetNav = document.querySelector(`.nav-item[data-page="${page}"]`) || document.querySelector(`[data-view="${page}"]`);

  if (targetPage) targetPage.classList.add("active");
  if (targetNav) targetNav.classList.add("active");

  // If navigating to submissions, handle parent accordion state
  if (page === "submissions") {
    const leadsNavToggle = document.getElementById("leadsAccordionToggle");
    if (leadsNavToggle) leadsNavToggle.classList.add("active");

    const subMenu = document.getElementById("leadsSubMenu");
    const chevron = document.getElementById("leadsChevron");
    if (subMenu) {
      subMenu.style.maxHeight = "240px";
      subMenu.style.opacity = "1";
    }
    if (chevron) chevron.style.transform = "rotate(180deg)";

    if (subtab) {
      switchSubmissionTab(subtab);
      const activeSub = document.getElementById("subnav-" + subtab);
      if (activeSub) {
        activeSub.classList.add("active");
        activeSub.style.background = "var(--primary-glow)";
        activeSub.style.color = "var(--primary-light)";
        activeSub.style.fontWeight = "600";
      }
    }
  }

  // Update Page Title and Subtitle
  const meta = pageTitles[page] || {};
  const titleEl = document.getElementById("pageTitle");
  const subEl = document.getElementById("pageSubtitle");
  if (titleEl) titleEl.textContent = meta.title || page;
  if (subEl) subEl.textContent = meta.sub || "";

  // Close mobile drawer
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("mobileOverlay")?.classList.remove("open");

  // Sync window location hash
  if (updateHash) {
    const hashTarget = (page === "submissions" && subtab) ? subtab : page;
    if (window.location.hash !== `#${hashTarget}`) {
      window.history.replaceState(null, "", `#${hashTarget}`);
    }
  }

  // Trigger data loader
  if (page === "dashboard") loadStats();
  else if (page === "shipments") loadShipments();
  else if (page === "blogs") loadBlogs();
  else if (page === "faqs") loadFaqs();
  else if (page === "offers") loadOffers();
  else if (page === "submissions") loadSubmissions();
}

function handleHashNavigation() {
  const hash = window.location.hash.replace("#", "").trim().toLowerCase();
  if (!hash) {
    navigateTo("dashboard", null, false);
    return;
  }

  if (["contact", "careers", "partner"].includes(hash)) {
    navigateToSubmissionTab(hash, false);
  } else if (["dashboard", "shipments", "blogs", "submissions", "faqs", "offers", "leads"].includes(hash)) {
    navigateTo(hash, null, false);
  } else {
    navigateTo("dashboard", null, false);
  }
}

function initSidebarNavigation() {
  // Attach event listeners to all sidebar buttons and links
  document.querySelectorAll(".sidebar-nav .nav-item[data-page], .sidebar-nav [data-view]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const page = btn.getAttribute("data-page") || btn.getAttribute("data-view");
      if (page && !btn.classList.contains("nav-accordion-toggle")) {
        e.preventDefault();
        navigateTo(page);
      }
    });
  });

  document.querySelectorAll(".sidebar-nav .nav-sub-item[data-subtab]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const subtab = btn.getAttribute("data-subtab");
      if (subtab) navigateToSubmissionTab(subtab);
    });
  });

  window.addEventListener("hashchange", handleHashNavigation);
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("mobileOverlay")?.classList.toggle("open");
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle";
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s var(--ease) forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

async function apiGet(endpoint) {
  const res = await fetch(`${API}${endpoint}`, { credentials: "include", headers: GATEWAY_HEADERS });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  }
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...GATEWAY_HEADERS },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  }
  return res.json();
}

async function apiPut(endpoint, data) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...GATEWAY_HEADERS },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  }
  return res.json();
}

async function apiPatch(endpoint, data = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...GATEWAY_HEADERS },
    credentials: "include",
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  }
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Request failed");
  }
  return res.json();
}

function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

function escapeHtml(str) {
  return str
    ? String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
    : "";
}

function truncate(str, len = 40) {
  return str ? (str.length > len ? str.substring(0, len) + "..." : str) : "";
}

function getStatusClass(status) {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s === "pending") return "pending";
  if (s.includes("transit")) return "in-transit";
  if (s === "delivered") return "delivered";
  if (s.includes("customs") || s.includes("clearance")) return "customs";
  if (s === "new") return "new";
  if (s === "contacted") return "contacted";
  if (s === "closed") return "closed";
  if (s === "paused") return "paused";
  if (s === "draft") return "draft";
  if (s === "published") return "published";
  return "";
}

function numberToWords(num) {
  if (num == null || isNaN(num)) return "Zero";
  const val = Math.floor(Number(num));
  if (val === 0) return "Zero";
  if (val < 0) return "Minus " + numberToWords(Math.abs(val));

  function convert(n) {
    if (n < 20)
      return [
        "Zero",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen"
      ][n];
    if (n < 100)
      return (
        ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"][
          Math.floor(n / 10)
        ] + (n % 10 !== 0 ? " " + convert(n % 10) : "")
      );
    if (n < 1000)
      return convert(Math.floor(n / 100)) + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000)
      return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  }

  return convert(val);
}

function generateBillHtml(item) {
  const tracking = escapeHtml(item.tracking_id || "BC0000");
  const rawDate = item.shipping_date || item.created_at;
  let formattedDate = "";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d)) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  if (!formattedDate) {
    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const sName = escapeHtml(item.sender_name || "N/A");
  const sPhone = escapeHtml(item.sender_phone || "N/A");
  const sAddress = escapeHtml(item.sender_address || "");
  const sCountry = escapeHtml(item.sender_country || item.origin || "Nepal");

  const rName = escapeHtml(item.receiver_name || "N/A");
  const rPhone = escapeHtml(item.receiver_phone || "N/A");
  const rAddress = escapeHtml(item.receiver_address || "");
  const rCountry = escapeHtml(item.receiver_country || item.destination || "N/A");

  const goods = escapeHtml(item.goods || item.service || item.remark || "Express Freight Shipment");
  const weight = parseFloat(String(item.weight || "").replace(/[^0-9.]/g, "")) || 1;
  const total = parseFloat(String(item.total || "").replace(/[^0-9.]/g, "")) || 0;
  const rate = weight > 0 ? Math.round((total / weight) * 100) / 100 : total;
  const grandTotal = Math.round(100 * total) / 100;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${WEBSITE_URL}/#track?t=${tracking}`)}`;
  const words = numberToWords(Math.round(grandTotal)) + " Rupees Only";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>${COMPANY_NAME} - Bill ${tracking}</title>
<style>
@page { size: A5; margin: 0.2in; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 1.5; background: #f8f9fa; padding: 8px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
.bill-container { width: 100%; max-width: 5.43in; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 0.35in 0.4in; border: 1px solid #e8edf2; }
.header { text-align: center; border-bottom: 3px solid #1a3a6b; padding-bottom: 8px; margin-bottom: 6px; }
.company-name { font-size: 20px; font-weight: 800; color: #1a3a6b; letter-spacing: 1.5px; text-transform: uppercase; }
.company-name span { color: #f97316; }
.company-details { font-size: 9px; color: #475569; margin-top: 2px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; margin-bottom: 4px; font-size: 9.5px; }
.bill-number { text-align: center; padding: 6px 0; margin-bottom: 8px; background: linear-gradient(135deg, #f0f4f8, #e2e8f0); border-radius: 8px; border: 2px solid #1a3a6b; }
.bill-number .number { font-size: 16px; font-weight: 900; color: #1a3a6b; font-family: monospace; }
.party-wrapper { width: 100%; margin-bottom: 8px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; }
.party-layout { width: 100%; border-collapse: separate; border-spacing: 8px 0; table-layout: fixed; }
.sender-table, .receiver-table { width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 4px; }
.sender-table { border-left: 3px solid #1a3a6b; }
.receiver-table { border-right: 3px solid #0d9488; }
.title-cell { padding: 6px 10px 3px; font-size: 9px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #1a3a6b; }
.receiver-table .title-cell { border-bottom-color: #0d9488; color: #0d9488; }
.sender-table td.lbl, .receiver-table td.lbl { padding: 2px 4px 2px 10px; font-size: 8.5px; font-weight: 600; color: #64748b; width: 60px; }
.sender-table td.val, .receiver-table td.val { padding: 2px 10px 2px 0; font-size: 8.5px; color: #0f172a; word-break: break-word; }
.products-table { width: 100%; border-collapse: collapse; font-size: 8.5px; margin: 4px 0; }
.products-table th { background: #f0f4f8; border: 1px solid #d1d5db; padding: 3px 4px; text-align: center; color: #1a3a6b; text-transform: uppercase; }
.products-table td { border: 1px solid #d1d5db; padding: 2px 4px; text-align: center; }
.summary-section { display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 2px solid #1a3a6b; }
.total-amount { font-size: 16px; font-weight: 900; color: #1a3a6b; }
.footer-section { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 2px solid #1a3a6b; }
.no-print { text-align: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 12px; }
.no-print button { padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; border-radius: 8px; margin: 0 4px; }
.btn-print { background: #1a3a6b; color: white; }
.btn-close { background: #e8edf2; color: #475569; }
@media print { .no-print { display: none !important; } body { background: white; padding: 0; } .bill-container { box-shadow: none; border: none; padding: 0.2in; } }
</style>
</head>
<body>
<div class='no-print'>
  <button class='btn-print' id='btnPrintBillWindow'>🖨️ Print Bill</button>
  <button class='btn-close' id='btnCloseBillWindow'>✕ Close</button>
</div>
<script>
  document.getElementById('btnPrintBillWindow').addEventListener('click', function() { window.print(); });
  document.getElementById('btnCloseBillWindow').addEventListener('click', function() { window.close(); });
</script>
<div class='bill-container'>
  <div class='header'>
    <div class='company-name'>The BC <span>Cargo</span></div>
    <div class='company-details'>📌 ${COMPANY_ADDRESS} | 📞 ${COMPANY_PHONE} | ✉️ ${COMPANY_EMAIL}</div>
  </div>
  <div class='info-row'>
    <div><strong>📅 Date:</strong> ${formattedDate}</div>
    <div><strong>PAN:</strong> ${COMPANY_PAN}</div>
  </div>
  <div class='bill-number'>
    <div style='font-size:9px;color:#64748b;'>BILL NUMBER</div>
    <div class='number'>${tracking}</div>
  </div>
  <div class='party-wrapper'>
    <table class='party-layout'>
      <tr>
        <td>
          <table class='sender-table'>
            <tr><td class='title-cell' colspan='2'>📤 SENDER</td></tr>
            <tr><td class='lbl'>Name:</td><td class='val'>${sName}</td></tr>
            <tr><td class='lbl'>Phone:</td><td class='val'>${sPhone}</td></tr>
            ${sAddress ? `<tr><td class='lbl'>Address:</td><td class='val'>${sAddress}</td></tr>` : ""}
            <tr><td class='lbl'>Country:</td><td class='val'>${sCountry}</td></tr>
          </table>
        </td>
        <td>
          <table class='receiver-table'>
            <tr><td class='title-cell' colspan='2'>📥 RECEIVER</td></tr>
            <tr><td class='lbl'>Name:</td><td class='val'>${rName}</td></tr>
            <tr><td class='lbl'>Phone:</td><td class='val'>${rPhone}</td></tr>
            ${rAddress ? `<tr><td class='lbl'>Address:</td><td class='val'>${rAddress}</td></tr>` : ""}
            <tr><td class='lbl'>Country:</td><td class='val'>${rCountry}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  <div style='margin:4px 0;'>
    <div style='font-size:9px;font-weight:700;color:#1a3a6b;text-transform:uppercase;'>📦 Shipment Details</div>
    <table class='products-table'>
      <thead>
        <tr><th>#</th><th style='text-align:left;'>Description</th><th>Qty</th><th>Wt (kg)</th><th>Rate (Rs)</th><th>Amount (Rs)</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td><td style='text-align:left;'>${goods}</td><td>1</td>
          <td style='text-align:right;'>${weight.toFixed(2)}</td>
          <td style='text-align:right;'>${rate.toFixed(2)}</td>
          <td style='text-align:right;'>${grandTotal.toFixed(2)}</td>
        </tr>
        <tr style='font-weight:700;'>
          <td colspan='3'>TOTAL</td><td style='text-align:right;'>${weight.toFixed(2)}</td><td></td><td style='text-align:right;'>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class='summary-section'>
    <div style='font-size:8.5px;color:#475569;font-style:italic;'><strong>Amount in Words:</strong> ${words}</div>
    <div style='text-align:right;'><div style='font-size:9px;color:#64748b;'>Grand Total</div><div class='total-amount'>Rs. ${grandTotal.toFixed(2)}</div></div>
  </div>
  <div class='footer-section'>
    <div><div style='font-size:8px;color:#64748b;'>Authorized Signature</div><div style='width:120px;border-top:1px solid #0f172a;margin-top:2px;'></div></div>
    <div style='text-align:center;'>
      <img src='${qrUrl}' width='48' height='48' style='border:1px solid #e8edf2;border-radius:4px;' alt='QR'>
      <div style='font-size:7.5px;color:#94a3b8;'>Scan to Track</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function printShipmentBill(id) {
  const item = shipmentsData.find((t) => t.tracking_id === id);
  if (!item) return showToast("Shipment not found.", "error");
  const html = generateBillHtml(item);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 400);
  } else {
    showToast("Pop-up blocked! Please allow pop-ups to print bill.", "error");
  }
}

async function loadStats() {
  try {
    const res = await apiGet("/api/admin/stats");
    if (!res || !res.stats) return;
    const st = res.stats;
    const sShip = document.getElementById("statShipments");
    const sBlog = document.getElementById("statBlogs");
    const sLead = document.getElementById("statLeads");
    const sNLead = document.getElementById("statNewLeads");
    const sFaq = document.getElementById("statFaqs");
    const sOff = document.getElementById("statOffers");

    if (sShip) sShip.textContent = st.shipments ?? 0;
    if (sBlog) sBlog.textContent = st.blogs ?? 0;
    if (sLead) sLead.textContent = st.leads ?? 0;
    if (sNLead) sNLead.textContent = st.newLeads ?? 0;
    if (sFaq) sFaq.textContent = st.faqs ?? 0;
    if (sOff) sOff.textContent = st.offers ?? 0;

    await loadUnreadCounts();
  } catch (err) {
    console.error("loadStats error:", err);
    showToast("Failed to load dashboard stats: " + err.message, "error");
  }
}

async function loadShipments() {
  try {
    const res = await apiGet("/api/admin/shipments");
    if (!res) return;
    shipmentsData = res.shipments || [];
    renderShipments(shipmentsData);
  } catch (err) {
    showToast("Failed to load shipments: " + err.message, "error");
  }
}

function renderShipments(list) {
  const tbody = document.getElementById("shipmentsTableBody");
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-box-open"></i><p>No shipments found</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map((item) => {
      const isPaused = (item.status || "").toLowerCase() === "paused";
      return `
    <tr>
      <td><strong style="color:var(--primary-light)">${escapeHtml(item.tracking_id)}</strong></td>
      <td>${escapeHtml(item.sender_name || "—")}</td>
      <td>${escapeHtml(item.receiver_name || "—")}</td>
      <td>${escapeHtml(item.origin || item.sender_country || "—")}</td>
      <td>${escapeHtml(item.destination || item.receiver_country || "—")}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td>${escapeHtml(item.shipping_date || "—")}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="print-shipment" data-id="${escapeHtml(item.tracking_id)}" title="Print Bill"><i class="fas fa-print"></i></button>
        <button class="btn btn-sm btn-outline" data-action="edit-shipment" data-id="${escapeHtml(item.tracking_id)}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm ${isPaused ? "btn-primary" : "btn-outline"}" data-action="toggle-pause-shipment" data-id="${escapeHtml(item.tracking_id)}" title="${isPaused ? "Resume Shipment" : "Pause Shipment"}"><i class="fas ${isPaused ? "fa-play" : "fa-pause"}"></i></button>
        <button class="btn btn-sm btn-danger" data-action="delete-shipment" data-id="${escapeHtml(item.tracking_id)}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `;
    })
    .join("");
}

async function togglePauseShipment(id) {
  const item = shipmentsData.find((t) => t.tracking_id === id);
  if (!item) return;

  const isPaused = (item.status || "").toLowerCase() === "paused";
  const newStatus = isPaused ? "In Transit" : "Paused";
  const updatedItem = { ...item, status: newStatus };

  try {
    const res = await apiPut(`/api/admin/shipments/${encodeURIComponent(id)}`, updatedItem);
    if (res && res.success !== false) {
      item.status = newStatus;
      showToast(`Shipment ${id} ${isPaused ? "resumed" : "paused"}.`, "success");
      renderShipments(shipmentsData);
      loadStats();
    } else {
      throw new Error(res?.message || "Failed to update shipment status");
    }
  } catch (err) {
    showToast("Failed to update status: " + err.message, "error");
  }
}

function filterShipments() {
  const query = (document.getElementById("shipmentSearch")?.value || "").toLowerCase();
  renderShipments(
    shipmentsData.filter(
      (t) =>
        (t.tracking_id || "").toLowerCase().includes(query) ||
        (t.sender_name || "").toLowerCase().includes(query) ||
        (t.receiver_name || "").toLowerCase().includes(query) ||
        (t.status || "").toLowerCase().includes(query)
    )
  );
}

function openShipmentModal(item = null) {
  document.getElementById("shipmentModalTitle").textContent = item ? "Edit Shipment" : "New Shipment";
  document.getElementById("shipmentEditId").value = item ? item.tracking_id : "";

  const tId = document.getElementById("sTrackingId");
  if (tId) {
    tId.value = item?.tracking_id || "";
    tId.disabled = !!item;
  }

  document.getElementById("sStatus").value = item?.status || "Pending";
  document.getElementById("sSenderName").value = item?.sender_name || "";
  document.getElementById("sSenderPhone").value = item?.sender_phone || "";
  document.getElementById("sSenderCountry").value = item?.sender_country || "";
  document.getElementById("sSenderAddress").value = item?.sender_address || "";
  document.getElementById("sReceiverName").value = item?.receiver_name || "";
  document.getElementById("sReceiverPhone").value = item?.receiver_phone || "";
  document.getElementById("sReceiverCountry").value = item?.receiver_country || "";
  document.getElementById("sReceiverAddress").value = item?.receiver_address || "";
  document.getElementById("sSn").value = item?.sn || "";
  document.getElementById("sGoods").value = item?.goods || "";
  document.getElementById("sWeight").value = item?.weight || "";
  document.getElementById("sPricePerKg").value = item?.price_per_kg || "";
  document.getElementById("sTotal").value = item?.total || "";
  document.getElementById("sService").value = item?.service || item?.remark || "";
  document.getElementById("sEta").value = item?.eta || "";
  document.getElementById("sShippingDate").value = item?.shipping_date || "";

  try {
    currentTimeline = item?.timeline_json ? JSON.parse(item.timeline_json) : [];
  } catch {
    currentTimeline = [];
  }
  renderTimelineEvents();
  openModal("shipmentModal");
}

async function editShipment(id) {
  let item = shipmentsData.find((t) => t.tracking_id === id);
  if (!item) {
    showToast("Fetching shipment record...", "info");
    try {
      const res = await apiGet(`/api/admin/shipments/${encodeURIComponent(id)}`);
      if (res && res.shipment) item = res.shipment;
    } catch (err) {
      console.warn("Shipment fetch error:", err);
    }
  }
  if (item) {
    openShipmentModal(item);
  } else {
    showToast("Shipment record not found.", "error");
  }
}

function renderTimelineEvents() {
  const listEl = document.getElementById("timelineEventsList");
  if (!listEl) return;
  if (currentTimeline && currentTimeline.length > 0) {
    listEl.innerHTML = currentTimeline
      .map(
        (e, idx) => `
    <div class="timeline-event-item">
      <span class="event-date">${escapeHtml(e.date || "")}</span>
      <span class="event-text">${escapeHtml(e.event || "")}</span>
      <button class="btn-remove-event" data-action="remove-timeline-event" data-idx="${idx}"><i class="fas fa-times"></i></button>
    </div>
  `
      )
      .join("");
  } else {
    listEl.innerHTML = '<div style="font-size:0.78rem;color:var(--text-muted);padding:0.3rem 0;">No timeline events yet.</div>';
  }
}

function addTimelineEvent() {
  const dateVal = document.getElementById("newEventDate")?.value;
  const textVal = (document.getElementById("newEventText")?.value || "").trim();
  if (textVal) {
    currentTimeline.push({
      date: dateVal || new Date().toISOString().split("T")[0],
      event: textVal
    });
    if (document.getElementById("newEventDate")) document.getElementById("newEventDate").value = "";
    if (document.getElementById("newEventText")) document.getElementById("newEventText").value = "";
    renderTimelineEvents();
  } else {
    showToast("Please enter event description.", "error");
  }
}

function removeTimelineEvent(idx) {
  currentTimeline.splice(idx, 1);
  renderTimelineEvents();
}

async function saveShipment() {
  const editId = document.getElementById("shipmentEditId").value;
  const payload = {
    tracking_id: document.getElementById("sTrackingId").value.trim().toUpperCase(),
    status: document.getElementById("sStatus").value,
    sender_name: document.getElementById("sSenderName").value.trim(),
    sender_phone: document.getElementById("sSenderPhone").value.trim(),
    sender_country: document.getElementById("sSenderCountry").value.trim(),
    sender_address: document.getElementById("sSenderAddress").value.trim(),
    receiver_name: document.getElementById("sReceiverName").value.trim(),
    receiver_phone: document.getElementById("sReceiverPhone").value.trim(),
    receiver_country: document.getElementById("sReceiverCountry").value.trim(),
    receiver_address: document.getElementById("sReceiverAddress").value.trim(),
    sn: document.getElementById("sSn").value.trim(),
    goods: document.getElementById("sGoods").value.trim(),
    weight: document.getElementById("sWeight").value.trim(),
    price_per_kg: document.getElementById("sPricePerKg").value.trim(),
    total: document.getElementById("sTotal").value.trim(),
    remark: document.getElementById("sService").value.trim(),
    service: document.getElementById("sService").value.trim(),
    eta: document.getElementById("sEta").value,
    shipping_date: document.getElementById("sShippingDate").value,
    origin: document.getElementById("sSenderCountry").value.trim(),
    destination: document.getElementById("sReceiverCountry").value.trim(),
    timeline_json: JSON.stringify(currentTimeline)
  };

  if (!payload.tracking_id) return showToast("Tracking ID is required.", "error");

  try {
    if (editId) {
      await apiPut(`/api/admin/shipments/${encodeURIComponent(editId)}`, payload);
      showToast("Shipment updated successfully.", "success");
    } else {
      await apiPost("/api/admin/shipments", payload);
      showToast("Shipment created successfully.", "success");
    }
    closeModal("shipmentModal");
    loadShipments();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteShipment(id) {
  if (confirm(`Delete shipment ${id}?`)) {
    try {
      await apiDelete(`/api/admin/shipments/${encodeURIComponent(id)}`);
      showToast("Shipment deleted.", "success");
      loadShipments();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function loadBlogs() {
  try {
    const res = await apiGet("/api/admin/blogs");
    if (!res) return;
    blogsData = res.blogs || [];
    renderBlogs(blogsData);
  } catch (err) {
    showToast("Failed to load blogs: " + err.message, "error");
  }
}

function renderBlogs(list) {
  const tbody = document.getElementById("blogsTableBody");
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-file-alt"></i><p>No articles found</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map(
      (b) => `
    <tr>
      <td><strong>${escapeHtml(truncate(b.title, 45))}</strong></td>
      <td>${escapeHtml(b.category || "—")}</td>
      <td>${escapeHtml(b.author_name || "—")}</td>
      <td>${escapeHtml(b.date || "—")}</td>
      <td><span class="status-badge ${getStatusClass(b.status || "published")}">${escapeHtml(b.status || "published")}</span></td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="edit-blog" data-id="${b.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" data-action="delete-blog" data-id="${b.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");
}

function autoSlug() {
  const title = document.getElementById("bTitle")?.value || "";
  const slugEl = document.getElementById("bSlug");
  if (slugEl) {
    slugEl.value = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
}

function openBlogModal(item = null) {
  document.getElementById("blogModalTitle").textContent = item ? "Edit Article" : "New Article";
  document.getElementById("blogEditId").value = item ? item.id : "";
  document.getElementById("bTitle").value = item?.title || "";
  document.getElementById("bSlug").value = item?.slug || "";
  document.getElementById("bCategory").value = item?.category || "";
  document.getElementById("bReadTime").value = item?.read_time || "";
  document.getElementById("bAuthorName").value = item?.author_name || "BC Cargo Team";
  document.getElementById("bStatus").value = item?.status || "draft";
  document.getElementById("bImage").value = item?.image || "";
  document.getElementById("bSummary").value = item?.summary || "";
  document.getElementById("bContent").value = item?.content_html || "";
  openModal("blogModal");
}

function editBlog(id) {
  const item = blogsData.find((b) => b.id === id);
  if (item) openBlogModal(item);
}

async function saveBlog() {
  const editId = document.getElementById("blogEditId").value;
  const payload = {
    title: document.getElementById("bTitle").value.trim(),
    slug: document.getElementById("bSlug").value.trim(),
    category: document.getElementById("bCategory").value.trim(),
    read_time: document.getElementById("bReadTime").value.trim(),
    author_name: document.getElementById("bAuthorName").value.trim(),
    status: document.getElementById("bStatus").value,
    image: document.getElementById("bImage").value.trim(),
    summary: document.getElementById("bSummary").value.trim(),
    content_html: document.getElementById("bContent").value
  };

  if (!payload.title || !payload.slug) return showToast("Title and slug are required.", "error");

  try {
    if (editId) {
      await apiPut(`/api/admin/blogs/${editId}`, payload);
      showToast("Article updated.", "success");
    } else {
      await apiPost("/api/admin/blogs", payload);
      showToast("Article created.", "success");
    }
    closeModal("blogModal");
    loadBlogs();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteBlog(id) {
  if (confirm("Delete this article?")) {
    try {
      await apiDelete(`/api/admin/blogs/${id}`);
      showToast("Article deleted.", "success");
      loadBlogs();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function loadFaqs() {
  try {
    const res = await apiGet("/api/admin/faqs");
    if (!res) return;
    faqsData = res.faqs || [];
    renderFaqs(faqsData);
  } catch (err) {
    showToast("Failed to load FAQs: " + err.message, "error");
  }
}

function renderFaqs(list) {
  const tbody = document.getElementById("faqsTableBody");
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-question"></i><p>No FAQs found</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map(
      (f) => `
    <tr>
      <td>${f.display_order}</td>
      <td><strong>${escapeHtml(truncate(f.question, 60))}</strong></td>
      <td>${escapeHtml(truncate(f.answer, 60))}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="edit-faq" data-id="${f.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" data-action="delete-faq" data-id="${f.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");
}

function openFaqModal(item = null) {
  document.getElementById("faqModalTitle").textContent = item ? "Edit FAQ" : "New FAQ";
  document.getElementById("faqEditId").value = item ? item.id : "";
  document.getElementById("fQuestion").value = item?.question || "";
  document.getElementById("fAnswer").value = item?.answer || "";
  document.getElementById("fOrder").value = item?.display_order || 0;
  openModal("faqModal");
}

function editFaq(id) {
  const item = faqsData.find((f) => f.id === id);
  if (item) openFaqModal(item);
}

async function saveFaq() {
  const editId = document.getElementById("faqEditId").value;
  const payload = {
    question: document.getElementById("fQuestion").value.trim(),
    answer: document.getElementById("fAnswer").value.trim(),
    display_order: parseInt(document.getElementById("fOrder").value) || 0
  };

  if (!payload.question || !payload.answer) return showToast("Question and answer are required.", "error");

  try {
    if (editId) {
      await apiPut(`/api/admin/faqs/${editId}`, payload);
      showToast("FAQ updated.", "success");
    } else {
      await apiPost("/api/admin/faqs", payload);
      showToast("FAQ created.", "success");
    }
    closeModal("faqModal");
    loadFaqs();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteFaq(id) {
  if (confirm("Delete this FAQ?")) {
    try {
      await apiDelete(`/api/admin/faqs/${id}`);
      showToast("FAQ deleted.", "success");
      loadFaqs();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

async function loadOffers() {
  try {
    const res = await apiGet("/api/admin/offers");
    if (!res) return;
    offersData = res.offers || [];
    renderOffers(offersData);
  } catch (err) {
    showToast("Failed to load offers: " + err.message, "error");
  }
}

function renderOffers(list) {
  const tbody = document.getElementById("offersTableBody");
  if (!tbody) return;
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-tags"></i><p>No special offers found</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = list
    .map((o) => {
      const active = o.is_active === 1 || o.is_active === true || o.is_active === "1";
      const statusBadge = active
        ? '<span class="status-badge published"><i class="fas fa-check-circle"></i> Active</span>'
        : '<span class="status-badge draft"><i class="fas fa-minus-circle"></i> Inactive</span>';
      return `
      <tr>
        <td>#${o.id}</td>
        <td><strong>${escapeHtml(o.title)}</strong></td>
        <td>${escapeHtml(truncate(o.description, 45))}</td>
        <td><code style="background:rgba(245,166,35,0.15);color:#fbbf24;padding:2px 8px;border-radius:4px;font-weight:700;">${escapeHtml(o.discount_code || "—")}</code></td>
        <td>${escapeHtml(o.valid_until || "No Expiry")}</td>
        <td>${statusBadge}</td>
        <td class="actions-cell">
          <button class="btn btn-sm ${active ? "btn-outline" : "btn-primary"}" data-action="toggle-offer-status" data-id="${o.id}" title="${active ? "Deactivate" : "Activate"}">
            <i class="fas fa-${active ? "pause" : "play"}"></i>
          </button>
          <button class="btn btn-sm btn-outline" data-action="edit-offer" data-id="${o.id}" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn btn-sm btn-danger" data-action="delete-offer" data-id="${o.id}" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function filterOffers() {
  const query = (document.getElementById("offerSearch")?.value || "").toLowerCase();
  renderOffers(
    offersData.filter(
      (o) =>
        (o.title || "").toLowerCase().includes(query) ||
        (o.description || "").toLowerCase().includes(query) ||
        (o.discount_code || "").toLowerCase().includes(query)
    )
  );
}

function openOfferModal(item = null) {
  document.getElementById("offerModalTitle").textContent = item ? "Edit Special Offer" : "New Special Offer";
  document.getElementById("offerEditId").value = item ? item.id : "";
  document.getElementById("oTitle").value = item?.title || "";
  document.getElementById("oDescription").value = item?.description || "";
  document.getElementById("oDiscountCode").value = item?.discount_code || "";
  document.getElementById("oValidUntil").value = item?.valid_until || "";
  document.getElementById("oIsActive").value = item ? (item.is_active ? "1" : "0") : "1";
  openModal("offerModal");
}

function editOffer(id) {
  const item = offersData.find((o) => o.id === id);
  if (item) openOfferModal(item);
}

async function saveOffer() {
  const editId = document.getElementById("offerEditId").value;
  const payload = {
    title: document.getElementById("oTitle").value.trim(),
    description: document.getElementById("oDescription").value.trim(),
    discount_code: document.getElementById("oDiscountCode").value.trim().toUpperCase(),
    valid_until: document.getElementById("oValidUntil").value,
    is_active: parseInt(document.getElementById("oIsActive").value, 10)
  };

  if (!payload.title || !payload.description) return showToast("Offer title and description are required.", "error");

  try {
    if (editId) {
      await apiPut(`/api/admin/offers/${editId}`, payload);
      showToast("Special offer updated.", "success");
    } else {
      await apiPost("/api/admin/offers", payload);
      showToast("Special offer created.", "success");
    }
    closeModal("offerModal");
    loadOffers();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleOfferStatus(id) {
  try {
    const res = await apiPatch(`/api/admin/offers/${id}/toggle`);
    if (res && res.success) {
      showToast(res.message, "success");
      loadOffers();
      loadStats();
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteOffer(id) {
  if (confirm("Are you sure you want to delete this offer?")) {
    try {
      await apiDelete(`/api/admin/offers/${id}`);
      showToast("Offer deleted.", "success");
      loadOffers();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// FORM SUBMISSIONS & LEADS MANAGEMENT
// ═══════════════════════════════════════════════════════════

function toggleLeadsFolder(e) {
  if (e) e.preventDefault();
  const subMenu = document.getElementById("leadsSubMenu");
  const chevron = document.getElementById("leadsChevron");
  if (!subMenu) return;

  const isExpanded = subMenu.style.maxHeight && subMenu.style.maxHeight !== "0px";
  if (isExpanded) {
    subMenu.style.maxHeight = "0px";
    subMenu.style.opacity = "0";
    if (chevron) chevron.style.transform = "rotate(0deg)";
  } else {
    subMenu.style.maxHeight = "240px";
    subMenu.style.opacity = "1";
    if (chevron) chevron.style.transform = "rotate(180deg)";
  }
}

function initLeadsAccordion() {
  const toggleBtn = document.getElementById("leadsAccordionToggle");
  if (toggleBtn) {
    toggleBtn.removeEventListener("click", toggleLeadsFolder);
    toggleBtn.addEventListener("click", toggleLeadsFolder);
  }
}

function navigateToSubmissionTab(subtab, updateHash = true) {
  const subMenu = document.getElementById("leadsSubMenu");
  const chevron = document.getElementById("leadsChevron");

  if (subMenu) {
    subMenu.style.maxHeight = "240px";
    subMenu.style.opacity = "1";
  }
  if (chevron) chevron.style.transform = "rotate(180deg)";

  document.querySelectorAll(".nav-sub-item").forEach((el) => {
    el.classList.remove("active");
    el.style.background = "transparent";
    el.style.color = "var(--text-secondary)";
    el.style.fontWeight = "500";
  });

  const activeSub = document.getElementById("subnav-" + subtab);
  if (activeSub) {
    activeSub.classList.add("active");
    activeSub.style.background = "var(--primary-glow)";
    activeSub.style.color = "var(--primary-light)";
    activeSub.style.fontWeight = "600";
  }

  navigateTo("submissions", subtab, updateHash);
}

function switchSubmissionTab(tab) {
  activeSubmissionTab = tab;
  ["contact", "careers", "partner"].forEach((t) => {
    const btn = document.getElementById("subtab" + t.charAt(0).toUpperCase() + t.slice(1) + "Btn");
    const content = document.getElementById("subtab-" + t);
    if (t === tab) {
      if (btn) {
        btn.classList.add("active");
        btn.style.background = "var(--primary-glow)";
        btn.style.color = "var(--primary-light)";
        btn.style.borderColor = "var(--primary-light)";
      }
      if (content) content.style.display = "block";
    } else {
      if (btn) {
        btn.classList.remove("active");
        btn.style.background = "rgba(255,255,255,0.03)";
        btn.style.color = "var(--text-secondary)";
        btn.style.borderColor = "var(--border-color)";
      }
      if (content) content.style.display = "none";
    }
  });
  filterSubmissions();
}

async function loadUnreadCounts() {
  try {
    const res = await apiGet("/api/admin/unread-count").catch(() => null);
    if (!res || !res.success) return;

    totalUnreadCount = res.unreadCount || 0;
    const leadsBadge = document.getElementById("leadsNavBadge");
    const cBadge = document.getElementById("contactNavBadge");
    const carBadge = document.getElementById("careersNavBadge");
    const pBadge = document.getElementById("partnerNavBadge");

    // Sidebar Accordion Main Badge
    if (leadsBadge) {
      if (totalUnreadCount > 0) {
        leadsBadge.textContent = totalUnreadCount;
        leadsBadge.style.background = "var(--accent-rose)";
        leadsBadge.style.display = "inline";
      } else {
        leadsBadge.style.display = "none";
      }
    }

    // Sidebar Sub-item Badges
    if (cBadge) {
      if (res.contactUnread > 0) {
        cBadge.textContent = res.contactUnread;
        cBadge.style.display = "inline";
      } else {
        cBadge.style.display = "none";
      }
    }

    if (carBadge) {
      if (res.careerUnread > 0) {
        carBadge.textContent = res.careerUnread;
        carBadge.style.display = "inline";
      } else {
        carBadge.style.display = "none";
      }
    }

    if (pBadge) {
      if (res.partnerUnread > 0) {
        pBadge.textContent = res.partnerUnread;
        pBadge.style.display = "inline";
      } else {
        pBadge.style.display = "none";
      }
    }

    // Subtab Navigation Dedicated Unread Badges
    const subtabCUnread = document.getElementById("badgeContactUnread");
    const subtabCarUnread = document.getElementById("badgeCareersUnread");
    const subtabPUnread = document.getElementById("badgePartnerUnread");

    if (subtabCUnread) {
      if (res.contactUnread > 0) {
        subtabCUnread.textContent = res.contactUnread + " NEW";
        subtabCUnread.style.display = "inline-block";
      } else {
        subtabCUnread.style.display = "none";
      }
    }

    if (subtabCarUnread) {
      if (res.careerUnread > 0) {
        subtabCarUnread.textContent = res.careerUnread + " NEW";
        subtabCarUnread.style.display = "inline-block";
      } else {
        subtabCarUnread.style.display = "none";
      }
    }

    if (subtabPUnread) {
      if (res.partnerUnread > 0) {
        subtabPUnread.textContent = res.partnerUnread + " NEW";
        subtabPUnread.style.display = "inline-block";
      } else {
        subtabPUnread.style.display = "none";
      }
    }
  } catch (err) {
    console.warn("Unread count load error:", err);
  }
}

async function loadSubmissions() {
  try {
    const results = await Promise.all([
      apiGet("/api/admin/contact-messages").catch(() => ({ messages: [] })),
      apiGet("/api/admin/career-applications").catch(() => ({ applications: [] })),
      apiGet("/api/admin/partner-requests").catch(() => ({ requests: [] }))
    ]);

    const resContact = results[0];
    const resCareers = results[1];
    const resPartner = results[2];

    contactMessagesData = resContact.messages || resContact.inquiries || [];
    careerApplicationsData = resCareers.applications || [];
    partnerRequestsData = resPartner.requests || resPartner.applications || [];

    const badgeC = document.getElementById("badgeContactCount");
    const badgeCar = document.getElementById("badgeCareersCount");
    const badgeP = document.getElementById("badgePartnerCount");

    if (badgeC) badgeC.textContent = contactMessagesData.length;
    if (badgeCar) badgeCar.textContent = careerApplicationsData.length;
    if (badgeP) badgeP.textContent = partnerRequestsData.length;

    await loadUnreadCounts();

    renderContactMessages(contactMessagesData);
    renderCareerApplications(careerApplicationsData);
    renderPartnerRequests(partnerRequestsData);
  } catch (err) {
    showToast("Failed to load form submissions: " + err.message, "error");
  }
}

function renderContactMessages(list) {
  const tbody = document.getElementById("contactTableBody");
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-inbox"></i><p>No contact messages yet</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((item) => {
      const name = escapeHtml(item.full_name || item.name);
      const email = escapeHtml(item.email);
      const phone = escapeHtml(item.phone || "—");
      const service = escapeHtml(item.service || "General");
      const msg = escapeHtml(truncate(item.message || item.details, 35));
      const date = escapeHtml(item.created_at ? item.created_at.split("T")[0] : "Recent");
      const isUnread = !item.is_read || item.is_read === 0;
      const rowStyle = isUnread ? 'style="font-weight:700;background:rgba(26,86,219,0.06);border-left:3px solid var(--accent-rose);"' : "";

      return `<tr id="row-contact-${item.id}" ${rowStyle}>
      <td>#${item.id}${isUnread ? ' <span style="color:var(--accent-rose);font-size:0.65rem;">NEW</span>' : ""}</td>
      <td><strong>${name}</strong></td>
      <td><a href="mailto:${email}" style="color:var(--primary-light);">${email}</a></td>
      <td>${phone}</td>
      <td><span class="status-badge" style="background:rgba(6,182,212,0.15);color:#06b6d4;">${service}</span></td>
      <td>${msg}</td>
      <td>
        <select data-action="update-contact-status" data-id="${item.id}" style="background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);padding:0.2rem 0.4rem;font-size:0.75rem;cursor:pointer;">
          <option value="New" ${item.status === "New" ? "selected" : ""}>New</option>
          <option value="Contacted" ${item.status === "Contacted" ? "selected" : ""}>Contacted</option>
          <option value="Closed" ${item.status === "Closed" ? "selected" : ""}>Closed</option>
        </select>
      </td>
      <td>${date}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="view-submission-detail" data-type="contact" data-id="${item.id}" title="View Details & Mark Read"><i class="fas fa-eye"></i></button> 
        <button class="btn btn-sm btn-danger" data-action="delete-contact-message" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
    })
    .join("");
}

function renderCareerApplications(list) {
  const tbody = document.getElementById("careersTableBody");
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><i class="fas fa-briefcase"></i><p>No career applications yet</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((item) => {
      const name = escapeHtml(item.full_name || item.name);
      const position = escapeHtml(item.position || "General");
      const email = escapeHtml(item.email);
      const phone = escapeHtml(item.phone || "—");
      const exp = escapeHtml(item.experience || "—");
      const note = escapeHtml(truncate(item.cover_letter || item.note, 30));
      const date = escapeHtml(item.created_at ? item.created_at.split("T")[0] : "Recent");
      const isUnread = !item.is_read || item.is_read === 0;
      const rowStyle = isUnread ? 'style="font-weight:700;background:rgba(139,92,246,0.06);border-left:3px solid var(--accent-rose);"' : "";

      return `<tr id="row-career-${item.id}" ${rowStyle}>
      <td>#${item.id}${isUnread ? ' <span style="color:var(--accent-rose);font-size:0.65rem;">NEW</span>' : ""}</td>
      <td><strong>${name}</strong></td>
      <td><span class="status-badge" style="background:rgba(139,92,246,0.15);color:#8b5cf6;">${position}</span></td>
      <td><a href="mailto:${email}" style="color:var(--primary-light);">${email}</a></td>
      <td>${phone}</td>
      <td>${exp}</td>
      <td>${note}</td>
      <td>
        <select data-action="update-career-status" data-id="${item.id}" style="background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);padding:0.2rem 0.4rem;font-size:0.75rem;cursor:pointer;">
          <option value="New" ${item.status === "New" ? "selected" : ""}>New</option>
          <option value="Reviewed" ${item.status === "Reviewed" ? "selected" : ""}>Reviewed</option>
          <option value="Shortlisted" ${item.status === "Shortlisted" ? "selected" : ""}>Shortlisted</option>
          <option value="Rejected" ${item.status === "Rejected" ? "selected" : ""}>Rejected</option>
        </select>
      </td>
      <td>${date}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="view-submission-detail" data-type="career" data-id="${item.id}" title="View Details & Mark Read"><i class="fas fa-eye"></i></button> 
        <button class="btn btn-sm btn-danger" data-action="delete-career-application" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
    })
    .join("");
}

function renderPartnerRequests(list) {
  const tbody = document.getElementById("partnerTableBody");
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><i class="fas fa-handshake"></i><p>No partner requests yet</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map((item) => {
      const company = escapeHtml(item.company_name);
      const country = escapeHtml(item.country);
      const contactName = escapeHtml(
        item.first_name && item.last_name ? item.first_name + " " + item.last_name : item.first_name || item.name || "N/A"
      );
      const email = escapeHtml(item.email);
      const phone = escapeHtml(item.phone || "—");
      const details = escapeHtml(truncate(item.details, 30));
      const date = escapeHtml(item.created_at ? item.created_at.split("T")[0] : "Recent");
      const isUnread = !item.is_read || item.is_read === 0;
      const rowStyle = isUnread ? 'style="font-weight:700;background:rgba(245,166,35,0.06);border-left:3px solid var(--accent-rose);"' : "";

      return `<tr id="row-partner-${item.id}" ${rowStyle}>
      <td>#${item.id}${isUnread ? ' <span style="color:var(--accent-rose);font-size:0.65rem;">NEW</span>' : ""}</td>
      <td><strong>${company}</strong></td>
      <td><span class="status-badge" style="background:rgba(245,166,35,0.15);color:#fbbf24;">${country}</span></td>
      <td>${contactName}</td>
      <td><a href="mailto:${email}" style="color:var(--primary-light);">${email}</a></td>
      <td>${phone}</td>
      <td>${details}</td>
      <td>
        <select data-action="update-partner-status" data-id="${item.id}" style="background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);padding:0.2rem 0.4rem;font-size:0.75rem;cursor:pointer;">
          <option value="Pending" ${item.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Contacted" ${item.status === "Contacted" ? "selected" : ""}>Contacted</option>
          <option value="Approved" ${item.status === "Approved" ? "selected" : ""}>Approved</option>
          <option value="Declined" ${item.status === "Declined" ? "selected" : ""}>Declined</option>
        </select>
      </td>
      <td>${date}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" data-action="view-submission-detail" data-type="partner" data-id="${item.id}" title="View Details & Mark Read"><i class="fas fa-eye"></i></button> 
        <button class="btn btn-sm btn-danger" data-action="delete-partner-request" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`;
    })
    .join("");
}

function filterSubmissions() {
  const query = (document.getElementById("submissionSearch")?.value || "").toLowerCase();

  if (activeSubmissionTab === "contact") {
    const filtered = contactMessagesData.filter(
      (i) =>
        (i.full_name || i.name || "").toLowerCase().includes(query) ||
        (i.email || "").toLowerCase().includes(query) ||
        (i.phone || "").toLowerCase().includes(query) ||
        (i.service || "").toLowerCase().includes(query) ||
        (i.message || i.details || "").toLowerCase().includes(query)
    );
    renderContactMessages(filtered);
  } else if (activeSubmissionTab === "careers") {
    const filtered = careerApplicationsData.filter(
      (i) =>
        (i.full_name || i.name || "").toLowerCase().includes(query) ||
        (i.email || "").toLowerCase().includes(query) ||
        (i.phone || "").toLowerCase().includes(query) ||
        (i.position || "").toLowerCase().includes(query) ||
        (i.cover_letter || i.note || "").toLowerCase().includes(query)
    );
    renderCareerApplications(filtered);
  } else if (activeSubmissionTab === "partner") {
    const filtered = partnerRequestsData.filter(
      (i) =>
        (i.company_name || "").toLowerCase().includes(query) ||
        (i.country || "").toLowerCase().includes(query) ||
        (i.first_name || "").toLowerCase().includes(query) ||
        (i.last_name || "").toLowerCase().includes(query) ||
        (i.email || "").toLowerCase().includes(query) ||
        (i.phone || "").toLowerCase().includes(query) ||
        (i.details || "").toLowerCase().includes(query)
    );
    renderPartnerRequests(filtered);
  }
}

async function markLeadAsRead(type, id, itemObj) {
  if (!itemObj || itemObj.is_read === 1) return;

  try {
    let endpoint = "";
    if (type === "contact") endpoint = `/api/admin/contact-messages/${id}/read`;
    else if (type === "career") endpoint = `/api/admin/career-applications/${id}/read`;
    else if (type === "partner") endpoint = `/api/admin/partner-requests/${id}/read`;

    await apiPut(endpoint, {});
    itemObj.is_read = 1;

    const row = document.getElementById(`row-${type}-${id}`);
    if (row) {
      row.style.fontWeight = "normal";
      row.style.background = "transparent";
      row.style.borderLeft = "none";
    }

    await loadUnreadCounts();
    await loadStats();
  } catch (err) {
    console.warn("Failed to mark lead as read:", err.message);
  }
}

function viewSubmissionDetail(type, id) {
  let title = "Submission Details";
  let html = "";
  let targetItem = null;
  let targetName = "Valued Customer";
  let targetEmail = "";
  let defaultSubject = "";

  if (type === "contact") {
    targetItem = contactMessagesData.find((i) => i.id === id);
    if (!targetItem) return;
    targetName = targetItem.full_name || targetItem.name || "Customer";
    targetEmail = targetItem.email;
    defaultSubject = "Re: THE BC Cargo Freight Inquiry - " + (targetItem.service || "General");
    title = "Contact Message Details";
    html = `<div style="display:grid;gap:0.75rem;">
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Full Name:</strong><div style="font-size:0.95rem;font-weight:700;">${escapeHtml(targetName)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Email Address:</strong><div><a href="mailto:${escapeHtml(targetEmail)}" style="color:var(--primary-light);">${escapeHtml(targetEmail)}</a></div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Phone / WhatsApp:</strong><div>${escapeHtml(targetItem.phone || "N/A")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Service Requested:</strong><div>${escapeHtml(targetItem.service || "General")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Message Body:</strong><div style="background:var(--bg-secondary);padding:0.75rem;border-radius:8px;margin-top:0.25rem;white-space:pre-wrap;">${escapeHtml(targetItem.message || targetItem.details)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Submitted Date:</strong><div>${escapeHtml(targetItem.created_at || "Recent")}</div></div>
    </div>`;
  } else if (type === "career") {
    targetItem = careerApplicationsData.find((i) => i.id === id);
    if (!targetItem) return;
    targetName = targetItem.full_name || targetItem.name || "Applicant";
    targetEmail = targetItem.email;
    defaultSubject = "Re: THE BC Cargo Job Application - " + (targetItem.position || "General");
    title = "Career Application Details";
    html = `<div style="display:grid;gap:0.75rem;">
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Applicant Name:</strong><div style="font-size:0.95rem;font-weight:700;">${escapeHtml(targetName)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Applied Position:</strong><div style="color:var(--accent-violet);font-weight:700;">${escapeHtml(targetItem.position || "General")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Email Address:</strong><div><a href="mailto:${escapeHtml(targetEmail)}" style="color:var(--primary-light);">${escapeHtml(targetEmail)}</a></div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Phone Number:</strong><div>${escapeHtml(targetItem.phone || "N/A")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Experience Level:</strong><div>${escapeHtml(targetItem.experience || "N/A")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Cover Note / Qualifications:</strong><div style="background:var(--bg-secondary);padding:0.75rem;border-radius:8px;margin-top:0.25rem;white-space:pre-wrap;">${escapeHtml(targetItem.cover_letter || targetItem.note || "None provided.")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Submitted Date:</strong><div>${escapeHtml(targetItem.created_at || "Recent")}</div></div>
    </div>`;
  } else if (type === "partner") {
    targetItem = partnerRequestsData.find((i) => i.id === id);
    if (!targetItem) return;
    targetName = targetItem.first_name && targetItem.last_name ? targetItem.first_name + " " + targetItem.last_name : targetItem.first_name || targetItem.name || "Partner";
    targetEmail = targetItem.email;
    defaultSubject = "Re: THE BC Cargo Partnership Alliance - " + targetItem.company_name;
    title = "Partner Request Details";
    html = `<div style="display:grid;gap:0.75rem;">
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Company Name:</strong><div style="font-size:0.95rem;font-weight:700;">${escapeHtml(targetItem.company_name)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Operating Country:</strong><div style="color:var(--accent-gold);font-weight:700;">${escapeHtml(targetItem.country)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Contact Person:</strong><div>${escapeHtml(targetName)}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Email Address:</strong><div><a href="mailto:${escapeHtml(targetEmail)}" style="color:var(--primary-light);">${escapeHtml(targetEmail)}</a></div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Phone Number:</strong><div>${escapeHtml(targetItem.phone || "N/A")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Alliance Details:</strong><div style="background:var(--bg-secondary);padding:0.75rem;border-radius:8px;margin-top:0.25rem;white-space:pre-wrap;">${escapeHtml(targetItem.details || "None provided.")}</div></div>
      <div><strong style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">Submitted Date:</strong><div>${escapeHtml(targetItem.created_at || "Recent")}</div></div>
    </div>`;
  }

  html += `<div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;">
    <button class="btn btn-primary" data-action="open-reply-composer" data-email="${escapeHtml(targetEmail)}" data-name="${escapeHtml(targetName)}" data-subject="${escapeHtml(defaultSubject)}"><i class="fas fa-reply"></i> Reply via Email</button>
  </div>`;

  const modalTitleEl = document.getElementById("submissionModalTitle");
  const modalBodyEl = document.getElementById("submissionModalBody");
  if (modalTitleEl) modalTitleEl.innerHTML = `<i class="fas fa-file-alt"></i> ${title}`;
  if (modalBodyEl) modalBodyEl.innerHTML = html;

  openModal("submissionDetailModal");
  markLeadAsRead(type, id, targetItem);
}

function openReplyComposer(toEmail, recipientName, defaultSubject) {
  closeModal("submissionDetailModal");
  currentReplyContext = { toEmail, recipientName, subject: defaultSubject };

  const emailInp = document.getElementById("replyToEmail");
  const subjectInp = document.getElementById("replySubject");
  const bodyInp = document.getElementById("replyMessageBody");

  if (emailInp) emailInp.value = toEmail;
  if (subjectInp) subjectInp.value = defaultSubject || "Response from THE BC Cargo & Courier";
  if (bodyInp)
    bodyInp.value =
      "Thank you for reaching out to THE BC Cargo & Courier.\n\nWe have reviewed your request and would like to provide you with the following updates...";

  openModal("emailReplyModal");
}

async function sendReplyEmailSubmit(e) {
  if (e) e.preventDefault();
  const submitBtn = document.getElementById("btnSendReplySubmit");
  const toEmail = document.getElementById("replyToEmail")?.value.trim();
  const subject = document.getElementById("replySubject")?.value.trim();
  const messageBody = document.getElementById("replyMessageBody")?.value.trim();

  if (!toEmail || !messageBody) {
    return showToast("Recipient email and message body are required.", "error");
  }

  const btnOriginal = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Email...';
  }

  try {
    const res = await apiPost("/api/admin/send-reply", {
      to_email: toEmail,
      recipient_name: currentReplyContext.recipientName || "Customer",
      subject,
      message_body: messageBody
    });

    if (res && res.success) {
      showToast(res.message || `Reply email sent successfully to ${toEmail}`, "success");
      closeModal("emailReplyModal");
    } else {
      showToast("Failed to send email: " + (res?.message || "Server error"), "error");
    }
  } catch (err) {
    showToast("Failed to send email: " + err.message, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = btnOriginal;
    }
  }
}

async function updateContactStatus(id, newStatus) {
  try {
    await apiPut("/api/admin/contact-messages/" + id, { status: newStatus });
    showToast("Contact message status updated to " + newStatus, "success");
    const item = contactMessagesData.find((i) => i.id === id);
    if (item) {
      item.status = newStatus;
      item.is_read = 1;
    }
    await loadUnreadCounts();
    await loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteContactMessage(id) {
  if (!confirm("Are you sure you want to delete this contact message?")) return;
  try {
    await apiDelete("/api/admin/contact-messages/" + id);
    showToast("Contact message deleted successfully.", "success");
    loadSubmissions();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updateCareerStatus(id, newStatus) {
  try {
    await apiPut("/api/admin/career-applications/" + id, { status: newStatus });
    showToast("Career application status updated to " + newStatus, "success");
    const item = careerApplicationsData.find((i) => i.id === id);
    if (item) {
      item.status = newStatus;
      item.is_read = 1;
    }
    await loadUnreadCounts();
    await loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteCareerApplication(id) {
  if (!confirm("Are you sure you want to delete this career application?")) return;
  try {
    await apiDelete("/api/admin/career-applications/" + id);
    showToast("Career application deleted successfully.", "success");
    loadSubmissions();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function updatePartnerStatus(id, newStatus) {
  try {
    await apiPut("/api/admin/partner-requests/" + id, { status: newStatus });
    showToast("Partner request status updated to " + newStatus, "success");
    const item = partnerRequestsData.find((i) => i.id === id);
    if (item) {
      item.status = newStatus;
      item.is_read = 1;
    }
    await loadUnreadCounts();
    await loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deletePartnerRequest(id) {
  if (!confirm("Are you sure you want to delete this partner request?")) return;
  try {
    await apiDelete("/api/admin/partner-requests/" + id);
    showToast("Partner request deleted successfully.", "success");
    loadSubmissions();
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("mobileOverlay")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("mobileOverlay")?.classList.remove("open");
  });

  document.getElementById("hamburgerBtn")?.addEventListener("click", toggleSidebar);
  document.getElementById("btnLogout")?.addEventListener("click", handleLogout);

  document.getElementById("btnNewShipment")?.addEventListener("click", () => openShipmentModal());
  document.getElementById("btnNewBlog")?.addEventListener("click", () => openBlogModal());
  document.getElementById("btnNewFaq")?.addEventListener("click", () => openFaqModal());
  document.getElementById("btnNewOffer")?.addEventListener("click", () => openOfferModal());

  document.getElementById("shipmentSaveBtn")?.addEventListener("click", saveShipment);
  document.getElementById("blogSaveBtn")?.addEventListener("click", saveBlog);
  document.getElementById("faqSaveBtn")?.addEventListener("click", saveFaq);
  document.getElementById("offerSaveBtn")?.addEventListener("click", saveOffer);
  document.getElementById("btnAddTimelineEvent")?.addEventListener("click", addTimelineEvent);

  document.getElementById("shipmentSearch")?.addEventListener("input", filterShipments);
  document.getElementById("submissionSearch")?.addEventListener("input", filterSubmissions);
  document.getElementById("offerSearch")?.addEventListener("input", filterOffers);
  document.getElementById("bTitle")?.addEventListener("input", autoSlug);

  document.getElementById("emailReplyForm")?.addEventListener("submit", sendReplyEmailSubmit);

  document.addEventListener("click", (evt) => {
    const closeBtn = evt.target.closest("[data-close-modal]");
    if (closeBtn) {
      const modalId = closeBtn.getAttribute("data-close-modal");
      if (modalId) closeModal(modalId);
      return;
    }

    const statCard = evt.target.closest(".stat-card[data-page], .stat-card[data-subtab]");
    if (statCard) {
      const page = statCard.getAttribute("data-page");
      const subtab = statCard.getAttribute("data-subtab");
      if (subtab) navigateToSubmissionTab(subtab);
      else if (page) navigateTo(page);
      return;
    }

    const actionEl = evt.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");
      const id = actionEl.getAttribute("data-id");
      if (action === "print-shipment") printShipmentBill(id);
      else if (action === "edit-shipment") editShipment(id);
      else if (action === "toggle-pause-shipment") togglePauseShipment(id);
      else if (action === "delete-shipment") deleteShipment(id);
      else if (action === "remove-timeline-event") {
        const idx = actionEl.getAttribute("data-idx");
        removeTimelineEvent(parseInt(idx, 10));
      }
      else if (action === "edit-blog") editBlog(id);
      else if (action === "delete-blog") deleteBlog(id);
      else if (action === "edit-faq") editFaq(id);
      else if (action === "delete-faq") deleteFaq(id);
      else if (action === "toggle-offer-status") toggleOfferStatus(id);
      else if (action === "edit-offer") editOffer(id);
      else if (action === "delete-offer") deleteOffer(id);
      else if (action === "view-submission-detail") {
        const type = actionEl.getAttribute("data-type");
        viewSubmissionDetail(type, id);
      }
      else if (action === "delete-contact-message") deleteContactMessage(id);
      else if (action === "delete-career-application") deleteCareerApplication(id);
      else if (action === "delete-partner-request") deletePartnerRequest(id);
      else if (action === "open-reply-composer") {
        const email = actionEl.getAttribute("data-email");
        const name = actionEl.getAttribute("data-name");
        const subject = actionEl.getAttribute("data-subject");
        openReplyComposer(email, name, subject);
      }
    }
  });

  document.addEventListener("change", (evt) => {
    const actionEl = evt.target.closest("[data-action]");
    if (actionEl) {
      const action = actionEl.getAttribute("data-action");
      const id = actionEl.getAttribute("data-id");
      const val = actionEl.value;
      if (action === "update-contact-status") updateContactStatus(id, val);
      else if (action === "update-career-status") updateCareerStatus(id, val);
      else if (action === "update-partner-status") updatePartnerStatus(id, val);
    }
  });

  document.querySelectorAll(".modal-overlay").forEach((el) => {
    el.addEventListener("click", (evt) => {
      if (evt.target === el) el.classList.remove("open");
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach((m) => m.classList.remove("open"));
    }
  });

  await checkAuth();
  initLeadsAccordion();
  initSidebarNavigation();
  handleHashNavigation();
});

// Window Exports for global actions & compatibility
window.navigateTo = navigateTo;
window.navigateToSubmissionTab = navigateToSubmissionTab;
window.switchSubmissionTab = switchSubmissionTab;
window.toggleLeadsFolder = toggleLeadsFolder;
window.openShipmentModal = openShipmentModal;
window.editShipment = editShipment;
window.deleteShipment = deleteShipment;
window.togglePauseShipment = togglePauseShipment;
window.printShipmentBill = printShipmentBill;
window.saveShipment = saveShipment;
window.addTimelineEvent = addTimelineEvent;
window.removeTimelineEvent = removeTimelineEvent;
window.openBlogModal = openBlogModal;
window.editBlog = editBlog;
window.deleteBlog = deleteBlog;
window.saveBlog = saveBlog;
window.autoSlug = autoSlug;
window.openFaqModal = openFaqModal;
window.editFaq = editFaq;
window.deleteFaq = deleteFaq;
window.saveFaq = saveFaq;
window.openOfferModal = openOfferModal;
window.editOffer = editOffer;
window.deleteOffer = deleteOffer;
window.saveOffer = saveOffer;
window.toggleOfferStatus = toggleOfferStatus;
window.viewSubmissionDetail = viewSubmissionDetail;
window.updateContactStatus = updateContactStatus;
window.deleteContactMessage = deleteContactMessage;
window.updateCareerStatus = updateCareerStatus;
window.deleteCareerApplication = deleteCareerApplication;
window.updatePartnerStatus = updatePartnerStatus;
window.deletePartnerRequest = deletePartnerRequest;
window.openReplyComposer = openReplyComposer;
window.sendReplyEmailSubmit = sendReplyEmailSubmit;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleLogout = handleLogout;
window.toggleSidebar = toggleSidebar;
window.filterShipments = filterShipments;
window.filterSubmissions = filterSubmissions;
window.filterOffers = filterOffers;

