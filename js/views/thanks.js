/* Thank-you view — confirmation summary, calendar exports, share-with-family. */

import { get as getState } from '../state.js';
import { loadSubmission } from '../persist.js';
import {
  buildSummaryText, buildWhatsAppUrl, copyToClipboard,
  buildIcsForEvents, downloadIcs
} from '../exporters.js';

let _events = null;
async function loadEvents() {
  if (_events) return _events;
  const res = await fetch('data/events.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load events');
  const json = await res.json();
  _events = json.events;
  return _events;
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

export async function render(root) {
  const state = getState();
  const party = state.party;
  // Prefer in-memory submitted snapshot, fall back to persisted
  let payload = state.rsvp_submitted;
  if (!payload && party) payload = loadSubmission(party.invite_code);

  if (!payload) {
    root.innerHTML = `
      <section class="section">
        <div class="container container--text center-text">
          <span class="page-header__eyebrow">Thank you</span>
          <h1 class="page-header__title">We don&rsquo;t have your RSVP yet</h1>
          <p>It looks like you haven&rsquo;t submitted your RSVP from this device. Please return to the RSVP form.</p>
          <p style="margin-top:var(--sp-6)"><a href="#/rsvp" class="btn">Open the RSVP form</a></p>
        </div>
      </section>`;
    return;
  }

  let events;
  try { events = await loadEvents(); }
  catch { events = []; }

  const evMap = new Map(events.map(e => [e.id, e]));
  const evIds = Object.keys(payload.events || {});
  const acceptedIds = evIds.filter(id => payload.events[id]?.status === 'yes');

  const inviteLink = buildInviteLink(payload.invite_code);

  root.innerHTML = `
    <section class="section">
      <div class="page-header container container--text">
        <span class="page-header__eyebrow">RSVP received</span>
        <h1 class="page-header__title">Thank you, ${escHtml(payload.party_name || 'friend')}</h1>
        <p class="page-header__lead">
          We&rsquo;ve recorded your responses. We&rsquo;ll be in touch closer to the date with timings,
          arrival details and anything else you need. <span lang="ta">நன்றி &mdash;</span> thank you for celebrating with us.
        </p>
      </div>

      <div class="container container--narrow">
        <div class="rsvp-summary" aria-live="polite">
          <h3>Your responses</h3>
          ${evIds.map(id => renderSummaryRow(id, evMap.get(id), payload.events[id])).join('')}
        </div>

        ${acceptedIds.length ? `
          <h2 style="margin-top:var(--sp-7); text-align:center; color:var(--c-red); font-family:var(--ff-serif);">Add to your calendar</h2>
          <p style="text-align:center; color:var(--c-ink-soft); margin-top:0">Save the dates so you don&rsquo;t miss a moment.</p>
          <div style="display:grid; gap:var(--sp-3); max-width:32rem; margin:var(--sp-4) auto 0;">
            <button type="button" class="btn btn--outline" data-cal="all">
              Add all ${acceptedIds.length} event${acceptedIds.length > 1 ? 's' : ''} to calendar (.ics)
            </button>
            ${acceptedIds.map(id => `
              <button type="button" class="btn btn--ghost" data-cal="${id}">
                ${escHtml(evMap.get(id)?.label_en || id)} &mdash; .ics
              </button>
            `).join('')}
          </div>
        ` : ''}

        <h2 style="margin-top:var(--sp-7); text-align:center; color:var(--c-red); font-family:var(--ff-serif);">Share with the family</h2>
        <p style="text-align:center; color:var(--c-ink-soft); margin-top:0">
          Forward your personalised link so other family members on this RSVP can review or update it too.
        </p>
        <div style="display:grid; gap:var(--sp-3); max-width:32rem; margin:var(--sp-4) auto 0;">
          <button type="button" class="btn" id="copy-link-btn">Copy invitation link</button>
          <a class="btn btn--outline" id="wa-send-btn" href="#" target="_blank" rel="noopener">
            Send summary on WhatsApp
          </a>
          <!-- TODO: replace with Theo's WhatsApp number -->
        </div>
        <p id="share-feedback" class="field__hint" style="text-align:center; margin-top:var(--sp-3);" aria-live="polite"></p>

        <p style="text-align:center; margin-top:var(--sp-7);">
          <a href="#/rsvp" class="btn btn--ghost">&lsaquo; Update your RSVP</a>
        </p>
      </div>
    </section>
  `;

  wire(root, payload, events, acceptedIds, party, inviteLink);
}

function renderSummaryRow(id, ev, r) {
  if (!r) return '';
  const status = r.status || 'pending';
  const statusLabel = status === 'yes' ? 'Attending'
                    : status === 'no' ? 'Not attending'
                    : status === 'maybe' ? 'Maybe'
                    : 'No response';
  const count = (status === 'yes' && r.attending_count > 0) ? r.attending_count : null;
  const diet = (typeof r.dietary === 'string' && r.dietary && r.dietary !== 'none') ? r.dietary
             : (r.dietary && r.dietary._party && r.dietary._party !== 'none') ? r.dietary._party
             : '';
  const title = ev?.label_en || id;
  const date  = ev?.date ? formatDate(ev.date) : '';
  const peopleWord = n => n === 1 ? 'person' : 'people';

  return `
    <div style="margin-bottom:var(--sp-5)">
      <h4 style="margin:0 0 var(--sp-2); font-family:var(--ff-serif); color:var(--c-red);">
        ${escHtml(title)}
        ${date ? `<span style="font-size:.65em;color:var(--c-ink-soft);font-weight:400;margin-left:.5em">${escHtml(date)}</span>` : ''}
      </h4>
      <div class="rsvp-summary__line"><span>Status</span><strong>${escHtml(statusLabel)}</strong></div>
      ${count ? `<div class="rsvp-summary__line"><span>Attending</span><strong>${count} ${peopleWord(count)}</strong></div>` : ''}
      ${status === 'yes' && diet ? `<div class="rsvp-summary__line"><span>Dietary</span><span>${escHtml(diet)}</span></div>` : ''}
      ${r.song_request ? `<div class="rsvp-summary__line"><span>Song request</span><span>${escHtml(r.song_request)}</span></div>` : ''}
      ${r.special_notes ? `<div class="rsvp-summary__line"><span>Notes</span><span>${escHtml(r.special_notes)}</span></div>` : ''}
    </div>
  `;
}

function buildInviteLink(code) {
  try {
    const u = new URL(location.href);
    u.hash = '#/rsvp';
    u.search = `?i=${encodeURIComponent(code || '')}`;
    return u.toString();
  } catch {
    return `${location.origin}${location.pathname}?i=${encodeURIComponent(code || '')}#/rsvp`;
  }
}

function flashFeedback(root, msg) {
  const el = root.querySelector('#share-feedback');
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { if (el) el.textContent = ''; }, 2500);
}

function wire(root, payload, events, acceptedIds, party, inviteLink) {
  // Calendar buttons
  root.querySelectorAll('[data-cal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const which = btn.getAttribute('data-cal');
      const ids = (which === 'all') ? acceptedIds : [which];
      // Pass party_name + count summary as the attendee descriptor
      const peopleWord = n => n === 1 ? 'person' : 'people';
      const partySummary = ids.map(id => {
        const c = payload.events?.[id]?.attending_count || 0;
        return c ? `${c} ${peopleWord(c)}` : '';
      }).filter(Boolean);
      const allAttending = partySummary.length ? [payload.party_name + ` (${partySummary[0]})`] : [payload.party_name];
      const ics = buildIcsForEvents(ids, party || { invite_code: payload.invite_code, party_name: payload.party_name }, allAttending);
      const fname = ids.length === 1
        ? `theo-shivanie-${ids[0]}.ics`
        : `theo-shivanie-wedding.ics`;
      downloadIcs(ics, fname);
    });
  });

  // Copy link button
  root.querySelector('#copy-link-btn')?.addEventListener('click', async () => {
    const ok = await copyToClipboard(inviteLink);
    flashFeedback(root, ok ? 'Invitation link copied to clipboard' : 'Could not copy — please copy manually from the address bar.');
  });

  // WhatsApp button — opens wa.me to couple's number with summary
  const wa = root.querySelector('#wa-send-btn');
  if (wa) {
    const text = buildSummaryText(payload, events) + `\nInvite link: ${inviteLink}`;
    // TODO: replace +27000000000 with Theo's actual WhatsApp number
    wa.href = buildWhatsAppUrl('+27000000000', text);
  }
}
