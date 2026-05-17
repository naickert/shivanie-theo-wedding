/* RSVP exporters — clipboard, WhatsApp, mailto, ICS calendar, CSV.
   All pure functions where possible; DOM-side effects only in copyToClipboard,
   downloadIcs and exportCsv. */

/* ---------- Plain-text summary ---------- */

/**
 * Build a multi-line plain-text summary of an RSVP payload.
 * Used by clipboard, WhatsApp, mailto, and email body fallbacks.
 * @param {object} payload  — the RSVP payload (see rsvp.js submit shape)
 * @param {Array}  events   — event metadata array (id, label_en, date, day)
 */
export function buildSummaryText(payload, events) {
  if (!payload) return '';
  const lines = [];
  lines.push(`RSVP — ${payload.party_name || payload.invite_code}`);
  lines.push(`Code: ${payload.invite_code}`);
  if (payload._submitted_at || payload.submitted_at) {
    const ts = payload._submitted_at || payload.submitted_at;
    lines.push(`Submitted: ${ts}`);
  }
  lines.push('');

  const evMap = new Map((events || []).map(e => [e.id, e]));
  const evIds = Object.keys(payload.events || {});

  for (const evId of evIds) {
    const ev = evMap.get(evId) || { label_en: evId, date: '' };
    const r  = payload.events[evId] || {};
    const status = (r.status || 'pending').toUpperCase();
    lines.push(`— ${ev.label_en}${ev.date ? ` (${ev.date})` : ''}: ${status}`);

    if (r.status === 'yes') {
      const count = Number(r.attending_count) || 0;
      if (count > 0) lines.push(`  Attending: ${count} ${count === 1 ? 'person' : 'people'}`);

      // dietary is a single string in v2; fall back to legacy ._party / per-person map
      let dietStr = '';
      if (typeof r.dietary === 'string' && r.dietary && r.dietary !== 'none') {
        dietStr = r.dietary;
      } else if (r.dietary && typeof r.dietary === 'object') {
        const diet = Object.entries(r.dietary)
          .filter(([, v]) => v && v !== 'none')
          .map(([k, v]) => k === '_party' ? String(v) : `${k}: ${v}`);
        if (diet.length) dietStr = diet.join('; ');
      }
      if (dietStr) lines.push(`  Dietary: ${dietStr}`);

      if (r.song_request)  lines.push(`  Song request: ${r.song_request}`);
      if (r.special_notes) lines.push(`  Notes: ${r.special_notes}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim() + '\n';
}

/* ---------- WhatsApp + mailto link builders ---------- */

/** Build a wa.me URL — strips '+' and non-digits from phone. */
export function buildWhatsAppUrl(phone, text) {
  const digits = String(phone || '').replace(/\D+/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || '')}`;
}

/** Build a mailto: URL with subject + body. */
export function buildMailtoUrl(email, subject, body) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body)    params.push(`body=${encodeURIComponent(body)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return `mailto:${email || ''}${qs}`;
}

/* ---------- Clipboard ---------- */

/**
 * Copy text to the clipboard. Uses the async Clipboard API where available,
 * with a synchronous textarea+execCommand fallback for older browsers / non-secure
 * contexts. Returns Promise<boolean> — true on success.
 */
export async function copyToClipboard(text) {
  const str = String(text == null ? '' : text);
  try {
    if (navigator.clipboard && window.isSecureContext !== false) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (_) { /* fall through */ }

  try {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.left = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, str.length);
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  } catch (_) {
    return false;
  }
}

/* ---------- ICS calendar export ---------- */

/* SAST (UTC+2) event timings — these are converted to UTC for the ICS file. */
const ICS_EVENT_TIMES = {
  mehendi: {
    start_utc: '20261217T070000Z', // 09:00 SAST
    end_utc:   '20261217T160000Z', // 18:00 SAST
    title:     'Mehendi — Shivanie & Theo',
    location:  "Bride's home, Durban",
    desc:      'An intimate evening of henna, song and family. Day 1 of 3.'
  },
  nalangu: {
    start_utc: '20261218T150000Z', // 17:00 SAST
    end_utc:   '20261218T230000Z', // 01:00 SAST next day
    title:     'Nalangu & Sangeeth — Shivanie & Theo',
    location:  'Kendra Hall, 5 John Zikhali Road, Greyville, Durban',
    desc:      'A night for both families — playful games, then music and dance. Day 2 of 3.'
  },
  ceremony: {
    start_utc: '20261219T120000Z', // 14:00 SAST
    end_utc:   '20261219T210000Z', // 23:00 SAST
    title:     'Wedding & Reception — Shivanie & Theo',
    location:  'Maroupi Wedding Venue, Umhlali, KZN North Coast',
    desc:      'The sacred Tamil ceremony beneath the mandap, followed by feast and dance. Day 3 of 3. Ceremony begins promptly at 15:00.'
  }
};

function icsEscape(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function icsUid(evId, code) {
  const safeCode = String(code || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${evId}-${safeCode}-${Date.now().toString(36)}@shivanieandtheo`;
}

function icsTimestampNow() {
  // YYYYMMDDTHHMMSSZ in UTC
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * Build an ICS calendar string with one VEVENT per accepted event.
 * @param {Array}   events    — event ids the party accepted (e.g. ['mehendi','ceremony'])
 *                              OR full event metadata array (we accept either; we use ids only)
 * @param {object}  party     — party object (for code + party_name)
 * @param {Array<string>} attending — list of attendee names (joined into description)
 */
export function buildIcsForEvents(events, party, attending) {
  const ids = (events || []).map(e => (typeof e === 'string' ? e : e.id)).filter(Boolean);
  const code = party?.invite_code || '';
  const partyName = party?.party_name || '';
  const dtstamp = icsTimestampNow();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shivanie & Theo 2026//Wedding RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const id of ids) {
    const meta = ICS_EVENT_TIMES[id];
    if (!meta) continue;
    const attendeeLine = Array.isArray(attending) && attending.length
      ? `\n\nAttending from ${partyName || 'your party'}: ${attending.join(', ')}`
      : '';
    const desc = `${meta.desc}${attendeeLine}\n\nYour invite code: ${code}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsUid(id, code)}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${meta.start_utc}`,
      `DTEND:${meta.end_utc}`,
      `SUMMARY:${icsEscape(meta.title)}`,
      `LOCATION:${icsEscape(meta.location)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Trigger a browser download of an ICS file. */
export function downloadIcs(icsString, filename) {
  const name = filename || 'theo-shivanie-wedding.ics';
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/* ---------- CSV export ---------- */

function csvCell(v) {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : (typeof v === 'object' ? JSON.stringify(v) : String(v));
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Convert an array of objects to a CSV string and trigger a download.
 * Headers are taken from the keys of the first row.
 */
export function exportCsv(rows, filename) {
  const name = filename || 'export.csv';
  if (!Array.isArray(rows) || !rows.length) {
    const blob = new Blob([''], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, name);
    return '';
  }
  const headers = Object.keys(rows[0]);
  const head = headers.map(csvCell).join(',');
  const body = rows.map(r => headers.map(h => csvCell(r[h])).join(',')).join('\r\n');
  const csv = head + '\r\n' + body + '\r\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, name);
  return csv;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
