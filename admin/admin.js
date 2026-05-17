/* Admin dashboard logic — Shivanie & Theo wedding.
   Lock screen, totals, dietary, parties table, drawer, exports. */

import { listLocalSubmissions, loadSubmission } from '../js/persist.js';
import { exportCsv, copyToClipboard } from '../js/exporters.js';

/* SHA-256 hash of the passphrase "tamilthaali2026" */
const PASS_HASH = 'c5233ca9a7dd987e42fef4f7d32bedf2ba37708193bddf660abe430e3b81929b';
const SESSION_KEY = 'adminUnlocked';

let _state = {
  events: null,         // array of event metadata
  venues: null,         // map keyed by venue id
  parties: null,        // array of parties
  submissions: new Map(),   // invite_code -> submission
  filter: { category: '', status: '', search: '' }
};

/* ---------- Boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
  wireLock();
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    showDashboard();
    renderDashboard();
  }
});

/* ---------- Lock / unlock ---------- */

async function sha256Hex(str) {
  const buf = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function unlock(passphrase) {
  const hex = await sha256Hex(String(passphrase || ''));
  if (hex !== PASS_HASH) return false;
  sessionStorage.setItem(SESSION_KEY, '1');
  showDashboard();
  await renderDashboard();
  return true;
}

function wireLock() {
  const form  = document.getElementById('admin-lock-form');
  const input = document.getElementById('admin-lock-input');
  const err   = document.getElementById('admin-lock-error');
  const box   = document.getElementById('admin-lock-box');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = await unlock(input.value);
    if (ok) {
      input.value = '';
      err.hidden = true;
    } else {
      err.hidden = false;
      box.classList.remove('is-shaking');
      // force reflow so the animation re-runs
      void box.offsetWidth;
      box.classList.add('is-shaking');
      input.select();
    }
  });

  document.getElementById('admin-lock-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  document.getElementById('admin-refresh-btn')?.addEventListener('click', renderDashboard);

  // Drawer close
  document.getElementById('admin-drawer-close')?.addEventListener('click', closeDrawer);
  document.getElementById('admin-drawer-scrim')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Toolbar filters
  document.getElementById('filter-category')?.addEventListener('change', e => { _state.filter.category = e.target.value; rerenderTable(); });
  document.getElementById('filter-status')?.addEventListener('change',   e => { _state.filter.status   = e.target.value; rerenderTable(); });
  document.getElementById('filter-search')?.addEventListener('input',    e => { _state.filter.search   = e.target.value.toLowerCase(); rerenderTable(); });

  document.getElementById('export-csv-btn')?.addEventListener('click', exportAllCsv);
  document.getElementById('export-chase-btn')?.addEventListener('click', () => exportChaseList(_state.parties, _state.submissions));
}

function showDashboard() {
  document.getElementById('admin-lock').hidden = true;
  document.getElementById('admin-dashboard').hidden = false;
}

/* ---------- Data load ---------- */

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

async function loadAll() {
  // Fetch from ../data/ since admin sits in /admin/
  const [eventsDoc, guestsDoc, venuesDoc] = await Promise.all([
    fetchJson('../data/events.json'),
    fetchJson('../data/guests.json'),
    fetchJson('../data/venues.json')
  ]);

  _state.events  = eventsDoc.events || [];
  _state.parties = guestsDoc.parties || [];
  _state.venues  = venuesDoc.venues || {};

  // Build submission map from localStorage
  const subs = new Map();
  for (const s of listLocalSubmissions()) {
    if (s && s.invite_code) subs.set(s.invite_code, s);
  }
  _state.submissions = subs;
}

/* ---------- Render orchestration ---------- */

export async function renderDashboard() {
  try {
    await loadAll();
  } catch (e) {
    console.error(e);
    showToast('Failed to load data: ' + e.message);
    return;
  }

  const totals  = computeTotals(_state.parties, _state.submissions, _state.events);
  const diet    = computeDietary(_state.parties, _state.submissions, _state.events);

  document.getElementById('admin-totals').innerHTML   = renderTotalsStrip(totals, _state.events);
  document.getElementById('admin-dietary').innerHTML  = renderDietaryStrip(diet, _state.events);

  populateCategoryFilter(_state.parties);
  rerenderTable();
  setRefreshedAt();
}

function rerenderTable() {
  const body = document.getElementById('admin-table-body');
  if (!body) return;
  body.innerHTML = renderPartiesTable(_state.parties, _state.submissions, _state.events, _state.filter);
  // Wire row clicks
  for (const tr of body.querySelectorAll('tr[data-code]')) {
    tr.addEventListener('click', () => openDrawerFor(tr.dataset.code));
    tr.setAttribute('tabindex', '0');
    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawerFor(tr.dataset.code); }
    });
  }
}

function populateCategoryFilter(parties) {
  const sel = document.getElementById('filter-category');
  if (!sel) return;
  const cats = [...new Set(parties.map(p => p.category).filter(Boolean))].sort();
  const cur = sel.value;
  sel.innerHTML = `<option value="">All categories</option>` +
    cats.map(c => `<option value="${escHtml(c)}" ${c === cur ? 'selected' : ''}>${escHtml(c)}</option>`).join('');
}

function setRefreshedAt() {
  const el = document.getElementById('admin-refreshed-at');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}

/* ---------- Compute: totals ---------- */

export function computeTotals(parties, submissions, events) {
  const out = {};
  for (const ev of events) {
    out[ev.id] = { yes: 0, no: 0, maybe: 0, pending: 0, headcount: 0, capacity: ev.capacity || 0 };
  }
  for (const party of parties) {
    for (const evId of party.events_invited || []) {
      const bucket = out[evId];
      if (!bucket) continue;
      const sub = submissions.get ? submissions.get(party.invite_code) : null;
      const r = sub?.events?.[evId];
      const status = r?.status || 'pending';
      if (status === 'yes')        bucket.yes++;
      else if (status === 'no')    bucket.no++;
      else if (status === 'maybe') bucket.maybe++;
      else                         bucket.pending++;
      if (status === 'yes') {
        const n = Number(r.attending_count)
          || (Array.isArray(r.attending_names) ? r.attending_names.length : 0)
          || (Array.isArray(r.attending_ids)   ? r.attending_ids.length   : 0);
        bucket.headcount += n;
      }
    }
  }
  return out;
}

/* ---------- Compute: dietary ---------- */

export function computeDietary(parties, submissions, events) {
  const out = {};
  for (const ev of events) out[ev.id] = {};

  for (const party of parties) {
    const sub = submissions.get ? submissions.get(party.invite_code) : null;
    if (!sub) continue;
    for (const evId of Object.keys(sub.events || {})) {
      const r = sub.events[evId];
      if (!r || r.status !== 'yes') continue;
      const bucket = out[evId];
      if (!bucket) continue;
      const headcount = Number(r.attending_count)
        || (Array.isArray(r.attending_names) ? r.attending_names.length : 0)
        || (Array.isArray(r.attending_ids)   ? r.attending_ids.length   : 0);
      const diet = r.dietary;

      // Three shapes supported (v2 string, v1 _party, v1 per-member)
      if (typeof diet === 'string' && diet && diet !== 'none') {
        bucket[diet] = (bucket[diet] || 0) + headcount;
      } else if (diet && typeof diet === 'object') {
        if (diet._party && diet._party !== 'none') {
          bucket[diet._party] = (bucket[diet._party] || 0) + headcount;
        }
        for (const [k, v] of Object.entries(diet)) {
          if (k === '_party' || !v || v === 'none') continue;
          bucket[v] = (bucket[v] || 0) + 1;
        }
      }
    }
  }
  return out;
}

/* ---------- Render: totals strip ---------- */

export function renderTotalsStrip(totals, events) {
  return events.map(ev => {
    const t = totals[ev.id] || { yes:0, no:0, maybe:0, pending:0, headcount:0, capacity: ev.capacity || 0 };
    const over = t.capacity && t.headcount > t.capacity;
    return `
      <article class="admin-total-card">
        <h3 class="admin-total-card__title">${escHtml(ev.label_en)}</h3>
        <p class="admin-total-card__date">${escHtml(ev.day || '')} &middot; ${escHtml(ev.date || '')}</p>
        <div class="admin-total-card__grid">
          <div class="admin-stat admin-stat--yes">     <span class="admin-stat__num">${t.yes}</span>     <span class="admin-stat__lbl">Yes</span></div>
          <div class="admin-stat admin-stat--no">      <span class="admin-stat__num">${t.no}</span>      <span class="admin-stat__lbl">No</span></div>
          <div class="admin-stat admin-stat--maybe">   <span class="admin-stat__num">${t.maybe}</span>   <span class="admin-stat__lbl">Maybe</span></div>
          <div class="admin-stat admin-stat--pending"> <span class="admin-stat__num">${t.pending}</span> <span class="admin-stat__lbl">Pending</span></div>
        </div>
        <div class="admin-total-card__hc">
          <span class="admin-total-card__hc-label">Headcount</span>
          <span class="admin-total-card__hc-val ${over ? 'is-over' : ''}">${t.headcount} <small>/ ${t.capacity || '—'}</small></span>
        </div>
      </article>
    `;
  }).join('');
}

/* ---------- Render: dietary strip ---------- */

export function renderDietaryStrip(diet, events) {
  return events.map(ev => {
    const counts = diet[ev.id] || {};
    const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    const tagsHtml = entries.length
      ? entries.map(([k,v]) => `${v} ${escHtml(prettyDiet(k))}`).join(' &middot; ')
      : '<em>No dietary preferences logged yet.</em>';
    return `
      <div class="admin-diet-row">
        <span class="admin-diet-row__name">${escHtml(ev.label_en)}</span>
        <span class="admin-diet-row__tags">${tagsHtml}</span>
      </div>
    `;
  }).join('');
}

function prettyDiet(k) {
  return {
    'vegetarian': 'Veg',
    'non-vegetarian': 'Non-veg',
    'vegan': 'Vegan',
    'halal': 'Halal',
    'jain': 'Jain',
    'gluten-free': 'Gluten-free',
    'other': 'Other'
  }[k] || k;
}

/* ---------- Render: parties table ---------- */

export function renderPartiesTable(parties, submissions, events, filter) {
  filter = filter || { category: '', status: '', search: '' };

  const rows = [];
  for (const party of parties) {
    if (filter.category && party.category !== filter.category) continue;

    const sub = submissions.get ? submissions.get(party.invite_code) : null;

    // Build the status set for this party (across invited events)
    const statuses = (party.events_invited || []).map(evId => sub?.events?.[evId]?.status || 'pending');
    if (!passesStatusFilter(statuses, filter.status)) continue;

    if (filter.search) {
      const hay = [
        party.party_name,
        party.invite_code,
        party.primary_contact?.name
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(filter.search)) continue;
    }

    const cells = ['mehendi', 'nalangu', 'ceremony'].map(evId => {
      if (!(party.events_invited || []).includes(evId)) {
        return `<td><span class="admin-table__cell-dash">not invited</span></td>`;
      }
      const r = sub?.events?.[evId];
      return `<td>${renderStatusBadge(r)}</td>`;
    });

    const lastUpd = sub?._submitted_at || sub?.submitted_at;
    const lastTxt = lastUpd ? formatShortDateTime(lastUpd) : '<span class="admin-table__cell-dash">no RSVP</span>';

    rows.push(`
      <tr data-code="${escHtml(party.invite_code)}">
        <td class="admin-table__party">
          ${escHtml(party.party_name)}
          <small>${escHtml(party.primary_contact?.name || '')}${party.invited_count ? ` &middot; invited for ${party.invited_count}` : ''}</small>
        </td>
        <td>${escHtml(party.category || '')}</td>
        <td class="admin-table__code">${escHtml(party.invite_code)}</td>
        ${cells.join('')}
        <td>${lastTxt}</td>
      </tr>
    `);
  }

  if (!rows.length) return `<tr class="admin-empty-row"><td colspan="7">No parties match the current filters.</td></tr>`;
  return rows.join('');
}

function passesStatusFilter(statuses, key) {
  if (!key) return true;
  if (key === 'all-yes')     return statuses.length > 0 && statuses.every(s => s === 'yes');
  if (key === 'any-yes')     return statuses.includes('yes');
  if (key === 'any-pending') return statuses.includes('pending');
  if (key === 'all-pending') return statuses.length > 0 && statuses.every(s => s === 'pending');
  if (key === 'any-no')      return statuses.includes('no');
  if (key === 'any-maybe')   return statuses.includes('maybe');
  return true;
}

function renderStatusBadge(r) {
  const status = r?.status || 'pending';
  const count  = (status === 'yes')
    ? (Number(r.attending_count)
       || (Array.isArray(r.attending_names) ? r.attending_names.length : 0)
       || (Array.isArray(r.attending_ids)   ? r.attending_ids.length   : 0))
    : null;
  const cls = {
    yes: 'badge badge--ok',
    no:  'badge badge--err',
    maybe: 'badge badge--warn',
    pending: 'badge'
  }[status] || 'badge';
  const label = status === 'pending' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1);
  const countHtml = (count != null) ? ` <small>&middot; ${count}</small>` : '';
  return `<span class="${cls} admin-cell-badge">${label}${countHtml}</span>`;
}

function formatShortDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return escHtml(iso); }
}

/* ---------- Drawer ---------- */

function openDrawerFor(code) {
  const party = _state.parties.find(p => p.invite_code === code);
  if (!party) return;
  const sub = _state.submissions.get(code);
  const drawer = document.getElementById('admin-drawer');
  const body   = document.getElementById('admin-drawer-body');
  const title  = document.getElementById('admin-drawer-title');
  const scrim  = document.getElementById('admin-drawer-scrim');

  title.textContent = party.party_name;
  body.innerHTML = renderDrawer(party, sub, _state.events, _state.venues);
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  scrim.hidden = false;
}

function closeDrawer() {
  const drawer = document.getElementById('admin-drawer');
  const scrim  = document.getElementById('admin-drawer-scrim');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  if (scrim) scrim.hidden = true;
}

export function renderDrawer(party, submission, events, venues) {
  const contact = party.primary_contact || {};
  const lastUpd = submission?._submitted_at || submission?.submitted_at;

  const metaHtml = `
    <dl class="admin-drawer__meta">
      <dt>Code</dt>     <dd>${escHtml(party.invite_code)}</dd>
      <dt>Category</dt> <dd>${escHtml(party.category || '—')}</dd>
      <dt>Contact</dt>  <dd>${escHtml(contact.name || '—')}${contact.whatsapp ? ` &middot; ${escHtml(contact.whatsapp)}` : ''}</dd>
      <dt>Invited for</dt><dd>${party.invited_count || 1} ${(party.invited_count || 1) === 1 ? 'person' : 'people'}</dd>
      ${party.notes_internal ? `<dt>Notes</dt><dd>${escHtml(party.notes_internal)}</dd>` : ''}
      ${party.accessibility?.notes ? `<dt>A11y</dt><dd>${escHtml(party.accessibility.notes)}</dd>` : ''}
      <dt>Last RSVP</dt><dd>${lastUpd ? escHtml(formatShortDateTime(lastUpd)) : '<em>none on record</em>'}</dd>
    </dl>
  `;

  const eventsHtml = (party.events_invited || []).map(evId => {
    const ev = events.find(e => e.id === evId) || { id: evId, label_en: evId, date: '' };
    const r  = submission?.events?.[evId] || { status: 'pending' };
    const status = r.status || 'pending';
    const venue  = venues?.[ev.venue_id]?.name || '';
    const count  = Number(r.attending_count) || 0;
    const dietStr = dietToString(r.dietary);

    return `
      <article class="admin-drawer__event">
        <header class="admin-drawer__event-head">
          <h3 class="admin-drawer__event-title">${escHtml(ev.label_en)}</h3>
          ${renderStatusBadge(r)}
        </header>
        <div class="admin-drawer__event-line"><strong>Venue</strong>${escHtml(venue)} &middot; ${escHtml(ev.date || '')}</div>
        ${status === 'yes' ? `
          <div class="admin-drawer__event-line"><strong>Attending</strong>${count} of ${party.invited_count || count} ${count === 1 ? 'person' : 'people'}</div>
          ${dietStr ? `<div class="admin-drawer__event-line"><strong>Dietary</strong>${escHtml(prettyDiet(dietStr))}</div>` : ''}
          ${r.song_request ? `<div class="admin-drawer__event-line"><strong>Song request</strong>${escHtml(r.song_request)}</div>` : ''}
          ${r.special_notes ? `<div class="admin-drawer__event-line"><strong>Notes / accessibility</strong>${escHtml(r.special_notes)}</div>` : ''}
        ` : (status === 'no' ? `<div class="admin-drawer__event-line"><em>Declined.</em>${r.special_notes ? ` ${escHtml(r.special_notes)}` : ''}</div>`
            : status === 'maybe' ? `<div class="admin-drawer__event-line"><em>Tentative.</em>${r.special_notes ? ` ${escHtml(r.special_notes)}` : ''}</div>`
            : `<div class="admin-drawer__event-line"><em>No response yet.</em></div>`)}
      </article>
    `;
  }).join('');

  return metaHtml + eventsHtml;
}

function dietToString(diet) {
  if (!diet) return '';
  if (typeof diet === 'string') return diet !== 'none' ? diet : '';
  if (typeof diet === 'object') {
    if (diet._party && diet._party !== 'none') return diet._party;
    const vals = Object.entries(diet).filter(([k, v]) => k !== '_party' && v && v !== 'none').map(([, v]) => v);
    if (vals.length) return vals.join(', ');
  }
  return '';
}

/* ---------- Exports ---------- */

export function exportAllCsv() {
  const rows = [];

  for (const party of _state.parties) {
    const sub = _state.submissions.get(party.invite_code);
    for (const evId of party.events_invited || []) {
      const r = sub?.events?.[evId];
      const status = r?.status || 'pending';
      const attending_count = (status === 'yes')
        ? (Number(r?.attending_count)
           || (Array.isArray(r?.attending_names) ? r.attending_names.length : 0)
           || (Array.isArray(r?.attending_ids)   ? r.attending_ids.length   : 0))
        : 0;
      rows.push({
        party: party.party_name,
        code: party.invite_code,
        category: party.category || '',
        contact_name: party.primary_contact?.name || '',
        contact_whatsapp: party.primary_contact?.whatsapp || '',
        event: evId,
        invited_count: party.invited_count || 1,
        status,
        attending_count,
        dietary: dietToString(r?.dietary) || '',
        accessibility: party.accessibility?.notes || '',
        song_request: r?.song_request || '',
        special_notes: r?.special_notes || '',
        last_update: sub?._submitted_at || sub?.submitted_at || ''
      });
    }
  }

  if (!rows.length) {
    showToast('Nothing to export yet.');
    return;
  }
  const ts = new Date().toISOString().slice(0, 10);
  exportCsv(rows, `wedding-rsvps-${ts}.csv`);
  showToast(`Exported ${rows.length} rows.`);
}

export async function exportChaseList(parties, submissions) {
  const lines = [];
  for (const party of parties) {
    const sub = submissions.get(party.invite_code);
    const statuses = (party.events_invited || []).map(evId => sub?.events?.[evId]?.status || 'pending');
    const allPending = statuses.length > 0 && statuses.every(s => s === 'pending');
    if (!allPending) continue;
    const contact = party.primary_contact || {};
    lines.push(`${party.party_name} — ${contact.name || ''} — ${contact.whatsapp || ''} — invite: ${party.invite_code}`);
  }

  if (!lines.length) {
    showToast('No fully pending parties. Nothing to chase.');
    return;
  }

  const text = lines.join('\n');
  const ok = await copyToClipboard(text);
  showToast(ok
    ? `Copied ${lines.length} ${lines.length === 1 ? 'party' : 'parties'} to clipboard.`
    : `Could not copy — here it is:\n${text}`);
  return text;
}

/* ---------- Utility ---------- */

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg) {
  const t = document.getElementById('admin-toast');
  if (!t) { alert(msg); return; }
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { t.hidden = true; }, 3200);
}
