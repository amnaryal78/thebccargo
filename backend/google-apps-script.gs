/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE BC CARGO & COURIER — GOOGLE APPS SCRIPT WEB APP BACKEND
 * Single Source of Truth CRUD API for Google Sheets Shipment Database
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet
 * 2. Click "Extensions" -> "Apps Script"
 * 3. Delete any code in Code.gs and paste this ENTIRE script
 * 4. Click "Deploy" -> "New deployment"
 * 5. Select type: "Web app"
 * 6. Description: "BC Cargo API v1"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy" and copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 10. Paste URL into backend/.env: GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/...
 */

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || 'read';
    const targetId = params.id ? params.id.toString().trim().toUpperCase() : '';

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    if (!data || data.length < 2) {
      return responseJson({ success: true, count: 0, values: [], shipment: null });
    }

    const headers = data[0].map(h => (h ? h.toString().toLowerCase().trim() : ''));
    const findIdx = (aliases) => headers.findIndex(h => aliases.some(a => h.includes(a)));

    const trackIdx = findIdx(['tracking', 'id', 'awb', 'sn_id']);

    // ACTION: get single shipment by tracking ID
    if (action === 'get' && targetId) {
      if (trackIdx === -1) {
        return responseJson({ success: false, message: 'Tracking ID column not found in Google Sheet headers.' }, 400);
      }

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowId = row[trackIdx] ? row[trackIdx].toString().trim().toUpperCase() : '';
        if (rowId === targetId) {
          const shipment = parseRowToShipment(headers, row, i + 1);
          return responseJson({ success: true, shipment: shipment });
        }
      }

      return responseJson({ success: false, message: 'Shipment not found for ID: ' + targetId }, 404);
    }

    // ACTION: read all shipments
    const shipments = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowId = trackIdx !== -1 && row[trackIdx] ? row[trackIdx].toString().trim().toUpperCase() : '';
      if (rowId) {
        shipments.push(parseRowToShipment(headers, row, i + 1));
      }
    }

    return responseJson({ success: true, count: shipments.length, shipments: shipments, values: data });

  } catch (err) {
    return responseJson({ success: false, error: err.toString() }, 500);
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || 'create';
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    if (!data || data.length === 0) {
      return responseJson({ success: false, message: 'Google Sheet is empty or unformatted.' }, 400);
    }

    const headers = data[0].map(h => (h ? h.toString().toLowerCase().trim() : ''));
    const findIdx = (aliases) => headers.findIndex(h => aliases.some(a => h.includes(a)));
    const trackIdx = findIdx(['tracking', 'id', 'awb', 'sn_id']);

    if (trackIdx === -1) {
      return responseJson({ success: false, message: 'Tracking ID column header missing in Google Sheet.' }, 400);
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE SHIPMENT
    // ─────────────────────────────────────────────────────────────
    if (action === 'create') {
      const payload = contents.shipment || {};
      const newId = payload.tracking_id ? payload.tracking_id.toString().trim().toUpperCase() : '';

      if (!newId) {
        return responseJson({ success: false, message: 'tracking_id is required.' }, 400);
      }

      // Check for duplicate ID
      for (let i = 1; i < data.length; i++) {
        const rowId = data[i][trackIdx] ? data[i][trackIdx].toString().trim().toUpperCase() : '';
        if (rowId === newId) {
          return responseJson({ success: false, message: 'Tracking ID already exists: ' + newId }, 409);
        }
      }

      const newRow = createRowFromPayload(headers, payload, data.length);
      sheet.appendRow(newRow);

      return responseJson({ success: true, message: 'Shipment created successfully in Google Sheet.', tracking_id: newId });
    }

    // ─────────────────────────────────────────────────────────────
    // UPDATE SHIPMENT
    // ─────────────────────────────────────────────────────────────
    if (action === 'update') {
      const targetId = (contents.tracking_id || (contents.shipment && contents.shipment.tracking_id) || '').toString().trim().toUpperCase();
      const payload = contents.shipment || contents;

      if (!targetId) {
        return responseJson({ success: false, message: 'tracking_id is required for update.' }, 400);
      }

      for (let i = 1; i < data.length; i++) {
        const rowId = data[i][trackIdx] ? data[i][trackIdx].toString().trim().toUpperCase() : '';
        if (rowId === targetId) {
          const rowIndex = i + 1; // 1-indexed row in Apps Script
          updateRowCells(sheet, headers, rowIndex, payload);
          return responseJson({ success: true, message: 'Shipment updated successfully in Google Sheet.', tracking_id: targetId });
        }
      }

      return responseJson({ success: false, message: 'Shipment not found for update: ' + targetId }, 404);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE SHIPMENT
    // ─────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const targetId = (contents.tracking_id || '').toString().trim().toUpperCase();
      if (!targetId) {
        return responseJson({ success: false, message: 'tracking_id is required for delete.' }, 400);
      }

      for (let i = 1; i < data.length; i++) {
        const rowId = data[i][trackIdx] ? data[i][trackIdx].toString().trim().toUpperCase() : '';
        if (rowId === targetId) {
          sheet.deleteRow(i + 1);
          return responseJson({ success: true, message: 'Shipment row deleted from Google Sheet.', tracking_id: targetId });
        }
      }

      return responseJson({ success: false, message: 'Shipment not found for deletion: ' + targetId }, 404);
    }

    return responseJson({ success: false, message: 'Invalid action specified: ' + action }, 400);

  } catch (err) {
    return responseJson({ success: false, error: err.toString() }, 500);
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function parseRowToShipment(headers, row, rowIndex) {
  const getVal = (aliases) => {
    const idx = headers.findIndex(h => aliases.some(a => h.includes(a)));
    return (idx !== -1 && row[idx] !== undefined && row[idx] !== null) ? row[idx].toString().trim() : '';
  };

  let timeline = [];
  const timelineStr = getVal(['timeline', 'timeline_json']);
  if (timelineStr) {
    try { timeline = JSON.parse(timelineStr); } catch (e) { timeline = []; }
  }

  return {
    rowIndex: rowIndex,
    sn: getVal(['sn', 's_n', 'serial']) || String(rowIndex - 1),
    tracking_id: getVal(['tracking', 'id', 'awb', 'sn_id']).toUpperCase(),
    sender_name: getVal(['sender_name', 'sender name', 's_name', 'sender']),
    sender_phone: getVal(['sender_phone', 'sender phone', 's_phone', 'sender mobile']),
    sender_country: getVal(['sender_country', 'sender country', 'origin', 'from', 's_country']),
    sender_address: getVal(['sender_address', 'sender address', 's_address']),
    receiver_name: getVal(['receiver_name', 'receiver name', 'r_name', 'receiver']),
    receiver_phone: getVal(['receiver_phone', 'receiver phone', 'r_phone', 'receiver mobile']),
    receiver_country: getVal(['receiver_country', 'receiver country', 'destination', 'to', 'r_country']),
    receiver_address: getVal(['receiver_address', 'receiver address', 'r_address']),
    goods: getVal(['goods', 'items', 'cargo']),
    weight: getVal(['weight', 'wt']),
    price_per_kg: getVal(['price_per_kg', 'rate', 'price']),
    total: getVal(['total', 'amount', 'cost']),
    status: getVal(['status', 'state']),
    shipping_date: getVal(['shipping_date', 'shipping date', 'date', 'bill_date']),
    remark: getVal(['remark', 'note', 'details']),
    origin: getVal(['sender_country', 'sender country', 'origin', 'from', 's_country']),
    destination: getVal(['receiver_country', 'receiver country', 'destination', 'to', 'r_country']),
    pieces: getVal(['pieces', 'pcs', 'boxes']),
    service: getVal(['service', 'mode', 'type']) || getVal(['remark', 'note', 'details']),
    eta: getVal(['eta', 'delivery date']),
    timeline: timeline,
    timeline_json: timelineStr || '[]'
  };
}

function createRowFromPayload(headers, payload, nextSn) {
  return headers.map(header => {
    const h = header.toLowerCase();
    if (h.includes('sn') && !h.includes('tracking')) return payload.sn || String(nextSn);
    if (h.includes('tracking') || h.includes('awb')) return (payload.tracking_id || '').toUpperCase();
    if (h.includes('sender') && h.includes('name')) return payload.sender_name || '';
    if (h.includes('sender') && h.includes('phone')) return payload.sender_phone || '';
    if (h.includes('sender') && h.includes('country')) return payload.sender_country || '';
    if (h.includes('sender') && h.includes('address')) return payload.sender_address || '';
    if (h.includes('receiver') && h.includes('name')) return payload.receiver_name || '';
    if (h.includes('receiver') && h.includes('phone')) return payload.receiver_phone || '';
    if (h.includes('receiver') && h.includes('country')) return payload.receiver_country || '';
    if (h.includes('receiver') && h.includes('address')) return payload.receiver_address || '';
    if (h.includes('goods')) return payload.goods || '';
    if (h.includes('weight')) return payload.weight || '';
    if (h.includes('price')) return payload.price_per_kg || '';
    if (h.includes('total')) return payload.total || '';
    if (h.includes('status')) return payload.status || '';
    if (h.includes('shipping') || h.includes('date')) return payload.shipping_date || '';
    if (h.includes('remark')) return payload.remark || payload.service || '';
    if (h.includes('pieces')) return payload.pieces || '';
    if (h.includes('service')) return payload.service || '';
    if (h.includes('eta')) return payload.eta || '';
    if (h.includes('timeline')) return payload.timeline_json || '[]';
    return '';
  });
}

function updateRowCells(sheet, headers, rowIndex, payload) {
  headers.forEach((header, colIdx) => {
    const h = header.toLowerCase();
    const colNum = colIdx + 1;

    if (h.includes('sender') && h.includes('name') && payload.sender_name !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.sender_name);
    if (h.includes('sender') && h.includes('phone') && payload.sender_phone !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.sender_phone);
    if (h.includes('sender') && h.includes('country') && payload.sender_country !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.sender_country);
    if (h.includes('sender') && h.includes('address') && payload.sender_address !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.sender_address);
    if (h.includes('receiver') && h.includes('name') && payload.receiver_name !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.receiver_name);
    if (h.includes('receiver') && h.includes('phone') && payload.receiver_phone !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.receiver_phone);
    if (h.includes('receiver') && h.includes('country') && payload.receiver_country !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.receiver_country);
    if (h.includes('receiver') && h.includes('address') && payload.receiver_address !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.receiver_address);
    if (h.includes('goods') && payload.goods !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.goods);
    if (h.includes('weight') && payload.weight !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.weight);
    if (h.includes('price') && payload.price_per_kg !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.price_per_kg);
    if (h.includes('total') && payload.total !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.total);
    if (h.includes('status') && payload.status !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.status);
    if (h.includes('shipping') && payload.shipping_date !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.shipping_date);
    if (h.includes('remark') && payload.remark !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.remark);
    if (h.includes('pieces') && payload.pieces !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.pieces);
    if (h.includes('service') && payload.service !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.service);
    if (h.includes('eta') && payload.eta !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.eta);
    if (h.includes('timeline') && payload.timeline_json !== undefined) sheet.getRange(rowIndex, colNum).setValue(payload.timeline_json);
  });
}

function responseJson(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
