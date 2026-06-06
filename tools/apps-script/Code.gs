/**
 * Shivanie & Theo wedding — RSVP receiver (Google Apps Script Web App)
 * ---------------------------------------------------------------------
 * Matches the REAL client payload produced by js/views/rsvp.js -> js/persist.js:
 *
 *   {
 *     invite_code:   "K7M2QH",
 *     party_name:    "The Naidoo Family",
 *     invited_count: 4,
 *     submitted_at:  "2026-11-02T18:44:12.000Z",
 *     events: {                                  // ONE entry per invited event
 *       mehendi:  { status: "yes|no|maybe|pending", attending_count: 2,
 *                   dietary: "vegetarian", song_request: "", special_notes: "" },
 *       nalangu:  { ... },
 *       ceremony: { ... }
 *     },
 *     _submitted_at: "...",   // added by persist.js
 *     _client:       "Mozilla/5.0 ..."
 *   }
 *
 * doPost: appends one row per submission to the "Submissions" tab (append-only
 *         history; the tab + header row are auto-created on first submit).
 * doGet:  returns the latest submission per invite_code as JSON (handy for a
 *         quick check or a future admin hook). No Live tab/formulas required.
 *
 * DEPLOY
 *   1. In your RSVP Google Sheet: Extensions > Apps Script.
 *   2. Delete the placeholder, paste this whole file, Save.
 *   3. Deploy > New deployment > (gear) Web app.
 *        - Execute as:      Me (your-gmail)
 *        - Who has access:  Anyone
 *   4. Authorise when prompted. Copy the Web app URL (.../exec).
 *   5. Paste that URL into data/config.json -> "rsvp_backend_url", commit, push.
 *
 *   (Optional) Add a "Parties" tab with invite codes in column A to reject
 *   submissions from codes that aren't on your guest list — see below.
 */

const SHEET_SUBMISSIONS = 'Submissions';
const SHEET_PARTIES     = 'Parties';   // optional master code list (column A = invite_code)
const EVENTS            = ['mehendi', 'nalangu', 'ceremony'];

const HEADERS = [
  'submitted_at', 'invite_code', 'party_name', 'invited_count',
  'mehendi_status', 'mehendi_count',
  'nalangu_status', 'nalangu_count',
  'ceremony_status', 'ceremony_count',
  'peak_headcount', 'dietary_summary', 'song_requests', 'notes',
  'payload_json', 'user_agent'
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const code = String(payload.invite_code || '').toUpperCase().trim();
    if (!code) return _json({ ok: false, error: 'missing invite_code' });

    const ss = SpreadsheetApp.getActive();

    // Optional junk rejection: if a populated Parties tab exists, the code must be on it.
    const parties = ss.getSheetByName(SHEET_PARTIES);
    if (parties && parties.getLastRow() > 1) {
      const known = parties.getRange(2, 1, parties.getLastRow() - 1, 1)
        .getValues().flat().map(c => String(c).toUpperCase().trim());
      if (known.indexOf(code) === -1) return _json({ ok: false, error: 'unknown invite_code' });
    }

    const ev = payload.events || {};
    const statusOf = id => (ev[id] ? (ev[id].status || 'pending') : '-');  // '-' = not invited / absent
    const countOf  = id => (ev[id] && ev[id].status === 'yes' ? (Number(ev[id].attending_count) || 0) : 0);
    const peak     = EVENTS.reduce((m, id) => Math.max(m, countOf(id)), 0);

    const dietary = EVENTS
      .filter(id => ev[id] && ev[id].status === 'yes' && ev[id].dietary && ev[id].dietary !== 'none')
      .map(id => id + ': ' + ev[id].dietary).join('; ');
    const songs = EVENTS
      .filter(id => ev[id] && String(ev[id].song_request || '').trim())
      .map(id => String(ev[id].song_request).trim()).join(' | ');
    const notes = EVENTS
      .filter(id => ev[id] && String(ev[id].special_notes || '').trim())
      .map(id => id + ': ' + String(ev[id].special_notes).trim()).join(' | ');

    _sheetWithHeaders(ss, SHEET_SUBMISSIONS).appendRow([
      payload._submitted_at || payload.submitted_at || new Date().toISOString(),
      code,
      payload.party_name || '',
      Number(payload.invited_count) || '',
      statusOf('mehendi'),  countOf('mehendi'),
      statusOf('nalangu'),  countOf('nalangu'),
      statusOf('ceremony'), countOf('ceremony'),
      peak, dietary, songs, notes,
      JSON.stringify(payload), payload._client || ''
    ]);

    return _json({ ok: true, received: code });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_SUBMISSIONS);
    if (!sheet || sheet.getLastRow() < 2) {
      return _json({ ok: true, rows: [], generated_at: new Date().toISOString() });
    }
    const values = sheet.getDataRange().getValues();
    const headers = values.shift();
    const byCode = {};
    values.forEach(r => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      byCode[obj.invite_code] = obj;   // append-only history => last row wins = latest
    });
    return _json({ ok: true, rows: Object.keys(byCode).map(k => byCode[k]), generated_at: new Date().toISOString() });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _sheetWithHeaders(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
