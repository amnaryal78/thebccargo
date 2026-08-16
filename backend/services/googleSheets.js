const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const GOOGLE_WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL || '';

/**
 * FAIL-FAST STARTUP CONFIGURATION VALIDATION
 */
function validateConfig() {
  if (!GOOGLE_WEBAPP_URL) {
    console.warn('⚠️ [CONFIG NOTICE] GOOGLE_SHEETS_WEBAPP_URL is not set in environment (.env). Deploy backend/google-apps-script.gs in Google Sheets to enable live sheet synchronization.');
    return false;
  }
  console.log('⚡ [GOOGLE_SHEETS_CLIENT] Configured & Ready. WebApp Target:', GOOGLE_WEBAPP_URL.substring(0, 45) + '...');
  return true;
}

/**
 * STRUCTURED REQUEST LOGGER
 */
function logRequest(action, trackingId, durationMs, success, status = 200, extra = '') {
  const timestamp = new Date().toISOString();
  const icon = success ? '✅' : '❌';
  console.log(
    `${icon} [GOOGLE_SHEETS_API] timestamp="${timestamp}" action="${action}" id="${trackingId || 'N/A'}" duration="${durationMs}ms" status=${status} ${extra}`.trim()
  );
}

/**
 * Helper to perform HTTP GET to Google Apps Script Web App
 */
async function callGet(action, params = {}) {
  const startTime = Date.now();
  const urlParams = new URLSearchParams({ action, ...params });
  const url = `${GOOGLE_WEBAPP_URL}?${urlParams.toString()}`;

  try {
    const res = await fetch(url);
    const duration = Date.now() - startTime;
    if (!res.ok) {
      logRequest(action.toUpperCase(), params.id || '', duration, false, res.status, `http_error="${res.statusText}"`);
      return { success: false, status: res.status, message: `HTTP Error ${res.status}` };
    }
    const json = await res.json();
    logRequest(action.toUpperCase(), params.id || '', duration, json.success !== false, res.status);
    return json;
  } catch (err) {
    const duration = Date.now() - startTime;
    logRequest(action.toUpperCase(), params.id || '', duration, false, 500, `error="${err.message}"`);
    return { success: false, status: 500, message: err.message };
  }
}

/**
 * Helper to perform HTTP POST to Google Apps Script Web App
 */
async function callPost(action, body = {}) {
  const startTime = Date.now();
  const trackingId = body.tracking_id || (body.shipment && body.shipment.tracking_id) || '';

  try {
    const res = await fetch(GOOGLE_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body })
    });
    const duration = Date.now() - startTime;

    if (!res.ok) {
      logRequest(action.toUpperCase(), trackingId, duration, false, res.status, `http_error="${res.statusText}"`);
      return { success: false, status: res.status, message: `HTTP Error ${res.status}` };
    }
    const json = await res.json();
    logRequest(action.toUpperCase(), trackingId, duration, json.success !== false, res.status);
    return json;
  } catch (err) {
    const duration = Date.now() - startTime;
    logRequest(action.toUpperCase(), trackingId, duration, false, 500, `error="${err.message}"`);
    return { success: false, status: 500, message: err.message };
  }
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const cache = {
  allShipments: null,
  allShipmentsExpiry: 0,
  singleShipments: new Map()
};

function clearCache() {
  cache.allShipments = null;
  cache.allShipmentsExpiry = 0;
  cache.singleShipments.clear();
}

/**
 * READ ALL SHIPMENTS FROM GOOGLE SHEETS (Cached)
 */
async function getAllShipments() {
  validateConfig();
  const now = Date.now();
  if (cache.allShipments && cache.allShipmentsExpiry > now) {
    return cache.allShipments;
  }

  if (!GOOGLE_WEBAPP_URL) {
    throw new Error('Google Sheets WebApp URL is not configured.');
  }

  const json = await callGet('read');
  if (json && json.success && Array.isArray(json.shipments)) {
    cache.allShipments = json.shipments;
    cache.allShipmentsExpiry = now + CACHE_TTL_MS;
    return json.shipments;
  }
  const errMsg = json ? (json.message || 'Unknown Google Sheets error') : 'No response from Google Sheets';
  throw new Error(`Google Sheets integration error: ${errMsg}`);
}

/**
 * OPTIMIZED SINGLE SHIPMENT LOOKUP BY TRACKING ID (Cached)
 */
async function getShipmentById(trackingId) {
  validateConfig();
  if (!trackingId) return null;
  const targetId = trackingId.toString().trim().toUpperCase();
  const now = Date.now();

  const cached = cache.singleShipments.get(targetId);
  if (cached && cached.expiry > now) {
    return cached.data;
  }

  if (!GOOGLE_WEBAPP_URL) {
    throw new Error('Google Sheets WebApp URL is not configured.');
  }

  const json = await callGet('get', { id: targetId });
  if (json) {
    if (json.success) {
      if (json.shipment) {
        cache.singleShipments.set(targetId, { data: json.shipment, expiry: now + CACHE_TTL_MS });
        return json.shipment;
      }
      return null;
    }
    if (json.status === 404 || (json.message && json.message.toLowerCase().includes('not found'))) {
      return null;
    }
  }
  const errMsg = json ? (json.message || 'Unknown Google Sheets error') : 'No response from Google Sheets';
  throw new Error(`Google Sheets integration error: ${errMsg}`);
}

/**
 * CREATE SHIPMENT IN GOOGLE SHEETS
 */
async function createShipment(data) {
  validateConfig();
  if (!data || !data.tracking_id) {
    return { success: false, message: 'tracking_id is required.' };
  }
  const result = await callPost('create', { shipment: data });
  if (result.success) clearCache();
  return result;
}

/**
 * UPDATE SHIPMENT IN GOOGLE SHEETS
 */
async function updateShipment(trackingId, data) {
  validateConfig();
  if (!trackingId) {
    return { success: false, message: 'tracking_id is required.' };
  }
  const result = await callPost('update', { tracking_id: trackingId.toString().trim().toUpperCase(), shipment: data });
  if (result.success) clearCache();
  return result;
}

/**
 * DELETE SHIPMENT IN GOOGLE SHEETS
 */
async function deleteShipment(trackingId) {
  validateConfig();
  if (!trackingId) {
    return { success: false, message: 'tracking_id is required.' };
  }
  const result = await callPost('delete', { tracking_id: trackingId.toString().trim().toUpperCase() });
  if (result.success) clearCache();
  return result;
}

module.exports = {
  validateConfig,
  getAllShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  clearCache
};

