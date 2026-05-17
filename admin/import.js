/* Admin: Import RSVP tool — paste JSON or summary-text. */

import { importSubmission } from '../js/persist.js';

const PASS_HASH = 'c5233ca9a7dd987e42fef4f7d32bedf2ba37708193bddf660abe430e3b81929b';
const SESSION_KEY = 'adminUnlocked';

document.addEventListener('DOMContentLoaded', () => {
  wireLock();
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showTool();
  }
  document.getElementById('import-btn')?.addEventListener('click', runImport);
  document.getElementById('import-clear')?.addEventListener('click', () => {
    document.getElementById('import-input').value = '';
    document.getElementById('import-results').innerHTML = '';
  });
});

/* ---------- Lock screen ---------- */

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function wireLock() {
  const form  = document.getElementById('admin-lock-form');
  const input = document.getElementById('admin-lock-input');
  const err   = document.getElementById('admin-lock-error');
  const box   = document.getElementById('admin-lock-box');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hex = await sha256Hex(input.value);
    if (hex === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1');
      input.value = '';
      err.hidden = true;
      showTool();
    } else {
      err.hidden = false;
      box.classList.remove('is-shaking');
      void box.offsetWidth;
      box.classList.add('is-shaking');
      input.select();
    }
  });

  document.getElementById('admin-lock-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
}

function showTool() {
  document.getElementById('admin-lock').hidden = true;
  document.getElementById('admin-dashboard').hidden = false;
}

/* ---------- Import ---------- */

function runImport() {
  const raw = document.getElementById('import-input').value.trim();
  const out = document.getElementById('import-results');
  out.innerHTML = '';
  if (!raw) {
    out.appendChild(notice('error', 'Paste a payload before clicking Import.'));
    return;
  }

  // Try JSON first
  let parsed = null;
  try { parsed = JSON.parse(raw); } catch { /* fall through to summary parse */ }

  let payloads = [];
  if (Array.isArray(parsed)) {
    payloads = parsed;
  } else if (parsed && typeof parsed === 'object') {
    payloads = [parsed];
  } else {
    // Try summary-text parse
    const fromText = parseSummaryText(raw);
    if (fromText) {
      payloads = [fromText];
    } else {
      out.appendChild(notice('error', 'Could not parse input — please paste valid JSON (object or array). The summary-text parser also failed; common cause is missing the "Code: XXXXXX" line.'));
      return;
    }
  }

  let ok = 0, fail = 0;
  for (const p of payloads) {
    try {
      importSubmission(p);
      out.appendChild(notice('success', `Imported: ${escHtml(p.party_name || '(no party_name)')} — ${escHtml(p.invite_code)}`));
      ok++;
    } catch (e) {
      out.appendChild(notice('error', `Failed: ${escHtml(e.message || 'unknown error')}`));
      fail++;
    }
  }

  const summary = document.createElement('p');
  summary.style.marginTop = '12px';
  summary.style.fontWeight = '700';
  summary.textContent = `Done — ${ok} imported, ${fail} failed.`;
  out.appendChild(summary);
}

/* ---------- Summary-text parser ----------
   Mirrors the buildSummaryText format from js/exporters.js:
     RSVP — Party Name
     Code: XXXXXX
     Submitted: <iso>
     <blank>
     — Event Label (YYYY-MM-DD): YES|NO|MAYBE
       Attending: name, name
       Dietary: _party: vegetarian
       Song request: ...
       Notes: ...
*/

const EVENT_LABEL_TO_ID = {
  'mehendi':              'mehendi',
  'nalangu':              'nalangu',
  'nalangu & sangeeth':   'nalangu',
  'sangeeth':             'nalangu',
  'wedding':              'ceremony',
  'wedding & reception':  'ceremony',
  'ceremony':             'ceremony',
  'reception':            'ceremony'
};

function parseSummaryText(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  let party_name = '', invite_code = '', submitted_at = '';
  const events = {};

  let currentId = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('RSVP')) {
      const m = trimmed.match(/RSVP\s*[—-]\s*(.+)/);
      if (m) party_name = m[1].trim();
      continue;
    }
    if (/^Code\s*:/i.test(trimmed)) {
      invite_code = trimmed.replace(/^Code\s*:\s*/i, '').trim().toUpperCase();
      continue;
    }
    if (/^Submitted\s*:/i.test(trimmed)) {
      submitted_at = trimmed.replace(/^Submitted\s*:\s*/i, '').trim();
      continue;
    }

    // Event header: "— Label (date): STATUS"
    const evMatch = trimmed.match(/^[—-]\s*([^:()]+?)\s*(?:\(([^)]+)\))?\s*:\s*(YES|NO|MAYBE)/i);
    if (evMatch) {
      const labelKey = evMatch[1].toLowerCase().trim();
      currentId = EVENT_LABEL_TO_ID[labelKey] || null;
      // Fallback fuzzy lookup
      if (!currentId) {
        for (const [k, v] of Object.entries(EVENT_LABEL_TO_ID)) {
          if (labelKey.includes(k)) { currentId = v; break; }
        }
      }
      if (!currentId) continue;
      const status = evMatch[3].toLowerCase();
      events[currentId] = {
        status,
        attending_count: 0,
        dietary: 'none',
        song_request: '',
        special_notes: ''
      };
      continue;
    }

    if (!currentId) continue;
    const ev = events[currentId];
    if (!ev) continue;

    // v2 format: "Attending: 4 people"
    const attCountMatch = trimmed.match(/^Attending\s*:\s*(\d+)\s+(?:person|people)/i);
    if (attCountMatch) {
      ev.attending_count = parseInt(attCountMatch[1], 10) || 0;
      continue;
    }
    // legacy v1 format: "Attending: Suresh, Anitha, ..."
    const attMatch = trimmed.match(/^Attending\s*:\s*(.+)/i);
    if (attMatch) {
      const names = attMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      ev.attending_count = names.length;
      continue;
    }
    const dietMatch = trimmed.match(/^Dietary\s*:\s*(.+)/i);
    if (dietMatch) {
      // First non-empty value wins (v2 = single string)
      const first = dietMatch[1].split(/[;,]/).map(s => s.trim()).filter(Boolean)[0] || '';
      const v = first.includes(':') ? first.split(':')[1].trim() : first;
      if (v) ev.dietary = v;
      continue;
    }
    const songMatch = trimmed.match(/^Song request\s*:\s*(.+)/i);
    if (songMatch) { ev.song_request = songMatch[1].trim(); continue; }
    const notesMatch = trimmed.match(/^Notes\s*:\s*(.+)/i);
    if (notesMatch) { ev.special_notes = notesMatch[1].trim(); continue; }
  }

  if (!invite_code) return null;  // hard requirement
  if (!Object.keys(events).length) return null;

  return {
    invite_code,
    party_name,
    submitted_at: submitted_at || new Date().toISOString(),
    events
  };
}

/* ---------- Helpers ---------- */

function notice(kind, msg) {
  const el = document.createElement('div');
  el.className = `notice notice--${kind === 'success' ? 'success' : 'error'}`;
  el.innerHTML = `<div>${msg}</div>`;
  return el;
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
