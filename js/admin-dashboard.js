/**
 * The BC Cargo - Admin Dashboard Script
 * Handles Authentication, Statistics, Shipments, Blogs, Leads, FAQs, and Special Offers CMS
 */

const API = window.API_BASE_URL || window.location.origin;

let shipmentsData = [];
let blogsData = [];
let leadsData = [];
let faqsData = [];
let offersData = [];
let currentTimeline = [];

const COMPANY_NAME = "The BC Cargo";
const COMPANY_ADDRESS = "School Road, Hetauda-4, Nepal";
const COMPANY_PHONE = "+977-9855019485";
const COMPANY_EMAIL = "info@thebccargo.com";
const COMPANY_PAN = "62112666665";
const WEBSITE_URL = "https://thebccargo.com";

// ── Auth Check ──
async function checkAuth() {
  try {
    const res = await fetch(`${API}/api/auth/check`, { credentials: "include" });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    if (data.admin) {
      const uName = document.getElementById("userName");
      const uAvatar = document.getElementById("userAvatar");
      if (uName) uName.textContent = data.admin.username;
      if (uAvatar) uAvatar.textContent = data.admin.username.charAt(0).toUpperCase();
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
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
  } catch (e) {}
  window.location.href = "/hq-access";
}

// ── Page Titles & Navigation ──
const pageTitles = {
  dashboard: { title: "Dashboard", sub: "Overview of your logistics operations" },
  shipments: { title: "Shipments", sub: "Manage all cargo shipments" },
  blogs: { title: "Blog CMS", sub: "Create and manage articles" },
  leads: { title: "Leads", sub: "Track customer inquiries" },
  faqs: { title: "FAQs", sub: "Manage frequently asked questions" },
  offers: { title: "Special Offers", sub: "Manage dynamic promotions and discount deals" }
};

function navigateTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);

  if (pageEl) pageEl.classList.add("active");
  if (navEl) navEl.classList.add("active");

  const info = pageTitles[page] || {};
  const pTitle = document.getElementById("pageTitle");
  const pSub = document.getElementById("pageSubtitle");
  if (pTitle) pTitle.textContent = info.title || page;
  if (pSub) pSub.textContent = info.sub || "";

  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("mobileOverlay")?.classList.remove("open");

  if (page === "dashboard") loadStats();
  if (page === "shipments") loadShipments();
  if (page === "blogs") loadBlogs();
  if (page === "leads") loadLeads();
  if (page === "faqs") loadFaqs();
  if (page === "offers") loadOffers();
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("mobileOverlay")?.classList.toggle("open");
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  const iconName = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle";
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${iconName}"></i> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s var(--ease) forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── API Helpers ──
async function apiGet(endpoint) {
  const res = await fetch(`${API}${endpoint}`, { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || "Request failed");
  }
  return res.json();
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || "Request failed");
  }
  return res.json();
}

async function apiPut(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || "Request failed");
  }
  return res.json();
}

async function apiPatch(endpoint, body = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    if (res.status === 401 && window.location.origin === API) {
      window.location.href = "/hq-access";
      return null;
    }
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || "Request failed");
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
    const errObj = await res.json().catch(() => ({}));
    throw new Error(errObj.message || "Request failed");
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
  return str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") : "";
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
  if (s === "draft") return "draft";
  if (s === "published") return "published";
  return "";
}

function numberToWords(num) {
  if (num == null || isNaN(num)) return "Zero";
  const n = Math.floor(Number(num));
  if (n === 0) return "Zero";
  if (n < 0) return "Minus " + numberToWords(Math.abs(n));
  
  function convert(val) {
    if (val < 20) return ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"][val];
    if (val < 100) return ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"][Math.floor(val/10)] + (val % 10 !== 0 ? " " + convert(val % 10) : "");
    if (val < 1000) return convert(Math.floor(val/100)) + " Hundred" + (val % 100 !== 0 ? " and " + convert(val % 100) : "");
    if (val < 100000) return convert(Math.floor(val/1000)) + " Thousand" + (val % 1000 !== 0 ? " " + convert(val % 1000) : "");
    if (val < 10000000) return convert(Math.floor(val/100000)) + " Lakh" + (val % 100000 !== 0 ? " " + convert(val % 100000) : "");
    return convert(Math.floor(val/10000000)) + " Crore" + (val % 10000000 !== 0 ? " " + convert(val % 10000000) : "");
  }
  return convert(n);
}

// ── Bill Generation ──
function generateBillHtml(shipment) {
  const trackingId = escapeHtml(shipment.tracking_id || "BC0000");
  const rawDate = shipment.shipping_date || shipment.created_at;
  let formattedDate = "";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d)) {
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  if (!formattedDate) {
    const d = new Date();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const senderName = escapeHtml(shipment.sender_name || "N/A");
  const senderPhone = escapeHtml(shipment.sender_phone || "N/A");
  const senderAddr = escapeHtml(shipment.sender_address || "");
  const senderCountry = escapeHtml(shipment.sender_country || shipment.origin || "Nepal");

  const receiverName = escapeHtml(shipment.receiver_name || "N/A");
  const receiverPhone = escapeHtml(shipment.receiver_phone || "N/A");
  const receiverAddr = escapeHtml(shipment.receiver_address || "");
  const receiverCountry = escapeHtml(shipment.receiver_country || shipment.destination || "N/A");

  const goodsDesc = escapeHtml(shipment.goods || shipment.service || shipment.remark || "Express Freight Shipment");
  const weight = parseFloat(String(shipment.weight || "").replace(/[^0-9.]/g, "")) || 1;
  const total = parseFloat(String(shipment.total || "").replace(/[^0-9.]/g, "")) || 0;
  const rate = weight > 0 ? Math.round((total / weight) * 100) / 100 : total;
  const grandTotal = Math.round(total * 100) / 100;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${WEBSITE_URL}/#track?t=${trackingId}`)}`;
  const amountWords = numberToWords(Math.round(grandTotal)) + " Rupees Only";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>${COMPANY_NAME} - Bill ${trackingId}</title>
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
  <button class='btn-print' onclick='window.print()'>🖨️ Print Bill</button>
  <button class='btn-close' onclick='window.close()'>✕ Close</button>
</div>
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
    <div class='number'>${trackingId}</div>
  </div>
  <div class='party-wrapper'>
    <table class='party-layout'>
      <tr>
        <td>
          <table class='sender-table'>
            <tr><td class='title-cell' colspan='2'>📤 SENDER</td></tr>
            <tr><td class='lbl'>Name:</td><td class='val'>${senderName}</td></tr>
            <tr><td class='lbl'>Phone:</td><td class='val'>${senderPhone}</td></tr>
            ${senderAddr ? `<tr><td class='lbl'>Address:</td><td class='val'>${senderAddr}</td></tr>` : ''}
            <tr><td class='lbl'>Country:</td><td class='val'>${senderCountry}</td></tr>
          </table>
        </td>
        <td>
          <table class='receiver-table'>
            <tr><td class='title-cell' colspan='2'>📥 RECEIVER</td></tr>
            <tr><td class='lbl'>Name:</td><td class='val'>${receiverName}</td></tr>
            <tr><td class='lbl'>Phone:</td><td class='val'>${receiverPhone}</td></tr>
            ${receiverAddr ? `<tr><td class='lbl'>Address:</td><td class='val'>${receiverAddr}</td></tr>` : ''}
            <tr><td class='lbl'>Country:</td><td class='val'>${receiverCountry}</td></tr>
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
          <td>1</td><td style='text-align:left;'>${goodsDesc}</td><td>1</td>
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
    <div style='font-size:8.5px;color:#475569;font-style:italic;'><strong>Amount in Words:</strong> ${amountWords}</div>
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

function printShipmentBill(trackingId) {
  const item = shipmentsData.find(s => s.tracking_id === trackingId);
  if (!item) return showToast("Shipment not found.", "error");
  const billHtml = generateBillHtml(item);
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(billHtml);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  } else {
    showToast("Pop-up blocked! Please allow pop-ups to print bill.", "error");
  }
}

// ── Overview Statistics ──
async function loadStats() {
  try {
    const data = await apiGet("/api/admin/stats");
    if (!data || !data.stats) return;
    const stats = data.stats;

    const elShipments = document.getElementById("statShipments");
    const elBlogs = document.getElementById("statBlogs");
    const elLeads = document.getElementById("statLeads");
    const elNewLeads = document.getElementById("statNewLeads");
    const elFaqs = document.getElementById("statFaqs");
    const elOffers = document.getElementById("statOffers");
    const elNavBadge = document.getElementById("leadsNavBadge");

    if (elShipments) elShipments.textContent = stats.shipments ?? 0;
    if (elBlogs) elBlogs.textContent = stats.blogs ?? 0;
    if (elLeads) elLeads.textContent = stats.leads ?? 0;
    if (elNewLeads) elNewLeads.textContent = stats.newLeads ?? 0;
    if (elFaqs) elFaqs.textContent = stats.faqs ?? 0;
    if (elOffers) elOffers.textContent = stats.offers ?? 0;

    if (elNavBadge) {
      if (stats.newLeads > 0) {
        elNavBadge.textContent = stats.newLeads;
        elNavBadge.style.display = "inline";
      } else {
        elNavBadge.style.display = "none";
      }
    }
  } catch (err) {
    console.error("loadStats error:", err);
    showToast("Failed to load dashboard stats: " + err.message, "error");
  }
}

// ── Shipments CMS ──
async function loadShipments() {
  try {
    const data = await apiGet("/api/admin/shipments");
    if (!data) return;
    shipmentsData = data.shipments || [];
    renderShipments(shipmentsData);
  } catch (err) {
    showToast("Failed to load shipments: " + err.message, "error");
  }
}

function renderShipments(data) {
  const tbody = document.getElementById("shipmentsTableBody");
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-box-open"></i><p>No shipments found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(s => `
    <tr>
      <td><strong style="color:var(--primary-light)">${escapeHtml(s.tracking_id)}</strong></td>
      <td>${escapeHtml(s.sender_name || "—")}</td>
      <td>${escapeHtml(s.receiver_name || "—")}</td>
      <td>${escapeHtml(s.origin || s.sender_country || "—")}</td>
      <td>${escapeHtml(s.destination || s.receiver_country || "—")}</td>
      <td><span class="status-badge ${getStatusClass(s.status)}">${escapeHtml(s.status)}</span></td>
      <td>${escapeHtml(s.shipping_date || "—")}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="printShipmentBill('${escapeHtml(s.tracking_id)}')" title="Print Bill"><i class="fas fa-print"></i></button>
        <button class="btn btn-sm btn-outline" onclick="editShipment('${escapeHtml(s.tracking_id)}')" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteShipment('${escapeHtml(s.tracking_id)}')" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function filterShipments() {
  const query = (document.getElementById("shipmentSearch")?.value || "").toLowerCase();
  renderShipments(shipmentsData.filter(s =>
    (s.tracking_id || "").toLowerCase().includes(query) ||
    (s.sender_name || "").toLowerCase().includes(query) ||
    (s.receiver_name || "").toLowerCase().includes(query) ||
    (s.status || "").toLowerCase().includes(query)
  ));
}

function openShipmentModal(shipment = null) {
  document.getElementById("shipmentModalTitle").textContent = shipment ? "Edit Shipment" : "New Shipment";
  document.getElementById("shipmentEditId").value = shipment ? shipment.tracking_id : "";

  const trackInput = document.getElementById("sTrackingId");
  if (trackInput) {
    trackInput.value = shipment?.tracking_id || "";
    trackInput.disabled = !!shipment;
  }

  document.getElementById("sStatus").value = shipment?.status || "Pending";
  document.getElementById("sSenderName").value = shipment?.sender_name || "";
  document.getElementById("sSenderPhone").value = shipment?.sender_phone || "";
  document.getElementById("sSenderCountry").value = shipment?.sender_country || "";
  document.getElementById("sSenderAddress").value = shipment?.sender_address || "";
  document.getElementById("sReceiverName").value = shipment?.receiver_name || "";
  document.getElementById("sReceiverPhone").value = shipment?.receiver_phone || "";
  document.getElementById("sReceiverCountry").value = shipment?.receiver_country || "";
  document.getElementById("sReceiverAddress").value = shipment?.receiver_address || "";
  document.getElementById("sSn").value = shipment?.sn || "";
  document.getElementById("sGoods").value = shipment?.goods || "";
  document.getElementById("sWeight").value = shipment?.weight || "";
  document.getElementById("sPricePerKg").value = shipment?.price_per_kg || "";
  document.getElementById("sTotal").value = shipment?.total || "";
  document.getElementById("sService").value = shipment?.service || shipment?.remark || "";
  document.getElementById("sEta").value = shipment?.eta || "";
  document.getElementById("sShippingDate").value = shipment?.shipping_date || "";

  try {
    currentTimeline = shipment?.timeline_json ? JSON.parse(shipment.timeline_json) : [];
  } catch {
    currentTimeline = [];
  }
  renderTimelineEvents();
  openModal("shipmentModal");
}

function editShipment(trackingId) {
  const item = shipmentsData.find(s => s.tracking_id === trackingId);
  if (item) openShipmentModal(item);
}

function renderTimelineEvents() {
  const list = document.getElementById("timelineEventsList");
  if (!list) return;
  if (!currentTimeline || currentTimeline.length === 0) {
    list.innerHTML = '<div style="font-size:0.78rem;color:var(--text-muted);padding:0.3rem 0;">No timeline events yet.</div>';
    return;
  }
  list.innerHTML = currentTimeline.map((ev, idx) => `
    <div class="timeline-event-item">
      <span class="event-date">${escapeHtml(ev.date || "")}</span>
      <span class="event-text">${escapeHtml(ev.event || "")}</span>
      <button class="btn-remove-event" onclick="removeTimelineEvent(${idx})"><i class="fas fa-times"></i></button>
    </div>
  `).join("");
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

function removeTimelineEvent(index) {
  currentTimeline.splice(index, 1);
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

  if (!payload.tracking_id) {
    return showToast("Tracking ID is required.", "error");
  }

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

async function deleteShipment(trackingId) {
  if (confirm(`Delete shipment ${trackingId}?`)) {
    try {
      await apiDelete(`/api/admin/shipments/${encodeURIComponent(trackingId)}`);
      showToast("Shipment deleted.", "success");
      loadShipments();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

// ── Blogs CMS ──
async function loadBlogs() {
  try {
    const data = await apiGet("/api/admin/blogs");
    if (!data) return;
    blogsData = data.blogs || [];
    renderBlogs(blogsData);
  } catch (err) {
    showToast("Failed to load blogs: " + err.message, "error");
  }
}

function renderBlogs(data) {
  const tbody = document.getElementById("blogsTableBody");
  if (!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-file-alt"></i><p>No articles found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(b => `
    <tr>
      <td><strong>${escapeHtml(truncate(b.title, 45))}</strong></td>
      <td>${escapeHtml(b.category || "—")}</td>
      <td>${escapeHtml(b.author_name || "—")}</td>
      <td>${escapeHtml(b.date || "—")}</td>
      <td><span class="status-badge ${getStatusClass(b.status || "published")}">${escapeHtml(b.status || "published")}</span></td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="editBlog(${b.id})" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlog(${b.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function autoSlug() {
  const title = document.getElementById("bTitle")?.value || "";
  const slugInput = document.getElementById("bSlug");
  if (slugInput) {
    slugInput.value = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
}

function openBlogModal(blog = null) {
  document.getElementById("blogModalTitle").textContent = blog ? "Edit Article" : "New Article";
  document.getElementById("blogEditId").value = blog ? blog.id : "";
  document.getElementById("bTitle").value = blog?.title || "";
  document.getElementById("bSlug").value = blog?.slug || "";
  document.getElementById("bCategory").value = blog?.category || "";
  document.getElementById("bReadTime").value = blog?.read_time || "";
  document.getElementById("bAuthorName").value = blog?.author_name || "BC Cargo Team";
  document.getElementById("bStatus").value = blog?.status || "draft";
  document.getElementById("bImage").value = blog?.image || "";
  document.getElementById("bSummary").value = blog?.summary || "";
  document.getElementById("bContent").value = blog?.content_html || "";
  openModal("blogModal");
}

function editBlog(id) {
  const blog = blogsData.find(b => b.id === id);
  if (blog) openBlogModal(blog);
}

async function saveBlog() {
  const id = document.getElementById("blogEditId").value;
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

  if (!payload.title || !payload.slug) {
    return showToast("Title and slug are required.", "error");
  }

  try {
    if (id) {
      await apiPut(`/api/admin/blogs/${id}`, payload);
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

// ── Leads CMS ──
async function loadLeads() {
  try {
    const data = await apiGet("/api/admin/leads");
    if (!data) return;
    leadsData = data.leads || [];
    renderLeads(leadsData);
  } catch (err) {
    showToast("Failed to load leads: " + err.message, "error");
  }
}

function renderLeads(data) {
  const tbody = document.getElementById("leadsTableBody");
  if (!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fas fa-inbox"></i><p>No leads yet</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(l => `
    <tr>
      <td><strong>${escapeHtml(l.full_name)}</strong></td>
      <td>${escapeHtml(l.email)}</td>
      <td>${escapeHtml(l.phone)}</td>
      <td>${escapeHtml(l.service || "—")}</td>
      <td>${escapeHtml(truncate(l.message, 30))}</td>
      <td>
        <select class="status-select" onchange="updateLeadStatus(${l.id}, this.value)" style="background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);padding:0.25rem 0.4rem;font-size:0.75rem;cursor:pointer;">
          <option value="New" ${l.status === "New" ? "selected" : ""}>New</option>
          <option value="Contacted" ${l.status === "Contacted" ? "selected" : ""}>Contacted</option>
          <option value="Closed" ${l.status === "Closed" ? "selected" : ""}>Closed</option>
        </select>
      </td>
      <td>${escapeHtml(l.created_at ? l.created_at.split("T")[0] : "—")}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="viewLead(${l.id})" title="View"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteLead(${l.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function filterLeads() {
  const query = (document.getElementById("leadSearch")?.value || "").toLowerCase();
  renderLeads(leadsData.filter(l =>
    (l.full_name || "").toLowerCase().includes(query) ||
    (l.email || "").toLowerCase().includes(query) ||
    (l.phone || "").toLowerCase().includes(query) ||
    (l.status || "").toLowerCase().includes(query)
  ));
}

function viewLead(id) {
  const lead = leadsData.find(l => l.id === id);
  if (!lead) return;
  document.getElementById("leadDetailBody").innerHTML = `
    <div style="display:grid;gap:0.75rem;">
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Name</label><div style="margin-top:0.2rem;">${escapeHtml(lead.full_name)}</div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Email</label><div style="margin-top:0.2rem;">${escapeHtml(lead.email)}</div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Phone</label><div style="margin-top:0.2rem;">${escapeHtml(lead.phone)}</div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Service</label><div style="margin-top:0.2rem;">${escapeHtml(lead.service || "General")}</div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Message</label><div style="margin-top:0.2rem;white-space:pre-wrap;line-height:1.5;">${escapeHtml(lead.message)}</div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Status</label><div style="margin-top:0.2rem;"><span class="status-badge ${getStatusClass(lead.status)}">${escapeHtml(lead.status)}</span></div></div>
      <div><label style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Submitted</label><div style="margin-top:0.2rem;">${escapeHtml(lead.created_at || "—")}</div></div>
    </div>
  `;
  openModal("leadModal");
}

async function updateLeadStatus(id, newStatus) {
  try {
    await apiPut(`/api/admin/leads/${id}`, { status: newStatus });
    showToast("Lead status updated.", "success");
    const item = leadsData.find(l => l.id === id);
    if (item) item.status = newStatus;
    loadStats();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteLead(id) {
  if (confirm("Delete this lead?")) {
    try {
      await apiDelete(`/api/admin/leads/${id}`);
      showToast("Lead deleted.", "success");
      loadLeads();
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  }
}

// ── FAQs CMS ──
async function loadFaqs() {
  try {
    const data = await apiGet("/api/admin/faqs");
    if (!data) return;
    faqsData = data.faqs || [];
    renderFaqs(faqsData);
  } catch (err) {
    showToast("Failed to load FAQs: " + err.message, "error");
  }
}

function renderFaqs(data) {
  const tbody = document.getElementById("faqsTableBody");
  if (!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-question"></i><p>No FAQs found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(f => `
    <tr>
      <td>${f.display_order}</td>
      <td><strong>${escapeHtml(truncate(f.question, 60))}</strong></td>
      <td>${escapeHtml(truncate(f.answer, 60))}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="editFaq(${f.id})" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteFaq(${f.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function openFaqModal(faq = null) {
  document.getElementById("faqModalTitle").textContent = faq ? "Edit FAQ" : "New FAQ";
  document.getElementById("faqEditId").value = faq ? faq.id : "";
  document.getElementById("fQuestion").value = faq?.question || "";
  document.getElementById("fAnswer").value = faq?.answer || "";
  document.getElementById("fOrder").value = faq?.display_order || 0;
  openModal("faqModal");
}

function editFaq(id) {
  const faq = faqsData.find(f => f.id === id);
  if (faq) openFaqModal(faq);
}

async function saveFaq() {
  const id = document.getElementById("faqEditId").value;
  const payload = {
    question: document.getElementById("fQuestion").value.trim(),
    answer: document.getElementById("fAnswer").value.trim(),
    display_order: parseInt(document.getElementById("fOrder").value) || 0
  };

  if (!payload.question || !payload.answer) {
    return showToast("Question and answer are required.", "error");
  }

  try {
    if (id) {
      await apiPut(`/api/admin/faqs/${id}`, payload);
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

// ── Special Offers CMS ──
async function loadOffers() {
  try {
    const data = await apiGet("/api/admin/offers");
    if (!data) return;
    offersData = data.offers || [];
    renderOffers(offersData);
  } catch (err) {
    showToast("Failed to load offers: " + err.message, "error");
  }
}

function renderOffers(data) {
  const tbody = document.getElementById("offersTableBody");
  if (!tbody) return;
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-tags"></i><p>No special offers found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(o => {
    const isActive = o.is_active === 1 || o.is_active === true || o.is_active === "1";
    const statusBadge = isActive
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
          <button class="btn btn-sm ${isActive ? 'btn-outline' : 'btn-primary'}" onclick="toggleOfferStatus(${o.id})" title="${isActive ? 'Deactivate' : 'Activate'}">
            <i class="fas fa-${isActive ? 'pause' : 'play'}"></i>
          </button>
          <button class="btn btn-sm btn-outline" onclick="editOffer(${o.id})" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteOffer(${o.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join("");
}

function filterOffers() {
  const query = (document.getElementById("offerSearch")?.value || "").toLowerCase();
  renderOffers(offersData.filter(o =>
    (o.title || "").toLowerCase().includes(query) ||
    (o.description || "").toLowerCase().includes(query) ||
    (o.discount_code || "").toLowerCase().includes(query)
  ));
}

function openOfferModal(offer = null) {
  document.getElementById("offerModalTitle").textContent = offer ? "Edit Special Offer" : "New Special Offer";
  document.getElementById("offerEditId").value = offer ? offer.id : "";
  document.getElementById("oTitle").value = offer?.title || "";
  document.getElementById("oDescription").value = offer?.description || "";
  document.getElementById("oDiscountCode").value = offer?.discount_code || "";
  document.getElementById("oValidUntil").value = offer?.valid_until || "";
  document.getElementById("oIsActive").value = offer ? (offer.is_active ? "1" : "0") : "1";
  openModal("offerModal");
}

function editOffer(id) {
  const offer = offersData.find(o => o.id === id);
  if (offer) openOfferModal(offer);
}

async function saveOffer() {
  const id = document.getElementById("offerEditId").value;
  const payload = {
    title: document.getElementById("oTitle").value.trim(),
    description: document.getElementById("oDescription").value.trim(),
    discount_code: document.getElementById("oDiscountCode").value.trim().toUpperCase(),
    valid_until: document.getElementById("oValidUntil").value,
    is_active: parseInt(document.getElementById("oIsActive").value, 10)
  };

  if (!payload.title || !payload.description) {
    return showToast("Offer title and description are required.", "error");
  }

  try {
    if (id) {
      await apiPut(`/api/admin/offers/${id}`, payload);
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

// ── DOM Ready Initialization ──
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("mobileOverlay")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("mobileOverlay")?.classList.remove("open");
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });

  await checkAuth();
  loadStats();

  const activePage = document.querySelector(".page.active")?.id?.replace("page-", "") || "dashboard";
  navigateTo(activePage);
});