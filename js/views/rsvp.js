/* RSVP view — multi-step form, one card per event the party is invited to.
   Count-based: party has a single invited_count; per event, guests choose
   how many of those will attend. No count selector for single-person invites.
   Auto-saves drafts to localStorage; restores submitted RSVPs as "update" mode. */

import { get as getState, set as setState } from '../state.js';
import { saveDraft, loadDraft, loadSubmission, submitRSVP } from '../persist.js';
import { navigate } from '../router.js';

// All three events are vegetarian — only veg-compatible options listed.
const DIETARY_OPTIONS = [
  ['none',        'No preference'],
  ['vegetarian',  'Vegetarian'],
  ['vegan',       'Vegan'],
  ['gluten-free', 'Gluten-free'],
  ['mixed',       'Mixed — see notes below'],
  ['other',       'Other — see notes below']
];

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

function peopleWord(n) { return n === 1 ? 'person' : 'people'; }

/* ---------- Render ---------- */

export async function render(root) {
  const { party } = getState();

  if (!party) {
    root.innerHTML = `
      <section class="section">
        <div class="page-header container container--text">
          <span class="page-header__eyebrow">RSVP</span>
          <h1 class="page-header__title">We can&rsquo;t wait to celebrate with you</h1>
        </div>
        <div class="container container--text">
          <div class="notice notice--warning" role="alert" aria-live="polite">
            <div>
              <strong>This link doesn&rsquo;t recognise a guest.</strong>
              <p style="margin:.5em 0 0">Please reopen the original message we sent you. Your link should look like <code>?i=K7M2QHX3PV</code> at the end of the address.</p>
            </div>
          </div>
          <p style="margin-top:var(--sp-6); text-align:center">
            <a href="#/not-invited" class="btn btn--outline">Enter invite code</a>
          </p>
        </div>
      </section>`;
    return;
  }

  let events;
  try { events = await loadEvents(); }
  catch (e) {
    root.innerHTML = `<div class="container section"><div class="notice notice--error">Could not load event details. Please reload.</div></div>`;
    return;
  }

  const eventsForParty = (party.events_invited || [])
    .map(id => events.find(e => e.id === id))
    .filter(Boolean);

  const invitedCount = Math.max(1, Number(party.invited_count) || 1);

  // Restore: prefer submitted RSVP, then draft
  const submission = loadSubmission(party.invite_code);
  const draft = loadDraft(party.invite_code);
  const initial = submission || draft || { events: {} };
  const isUpdate = !!submission;

  root.innerHTML = `
    <section class="section">
      <div class="page-header container container--text">
        <span class="page-header__eyebrow">RSVP</span>
        <h1 class="page-header__title">We can&rsquo;t wait to celebrate with you</h1>
        <p class="page-header__lead">
          Because each of our celebrations has a different feel &mdash; some intimate, some big and loud &mdash;
          please RSVP per event. You can update your responses any time before
          <strong>31 October 2026</strong> by returning to this same link.
        </p>
      </div>

      <div class="container container--narrow">
        ${isUpdate ? `
          <div class="notice notice--success" role="status" aria-live="polite">
            <div>
              <strong>Welcome back, ${escHtml(party.party_name)}.</strong>
              <p style="margin:.25em 0 0">We have your previous RSVP on file &mdash; feel free to update anything below.</p>
            </div>
          </div>
        ` : (draft ? `
          <div class="notice notice--info" role="status" aria-live="polite">
            <div>
              <strong>Welcome back.</strong>
              <p style="margin:.25em 0 0">Your draft has been restored. Pick up where you left off.</p>
            </div>
          </div>
        ` : `
          <div class="notice notice--info" role="status" aria-live="polite">
            <div>
              <strong>Vanakkam, ${escHtml(party.party_name)}.</strong>
              <p style="margin:.25em 0 0">
                Your invitation is for <strong>${invitedCount} ${peopleWord(invitedCount)}</strong>.
                ${invitedCount === 1 ? 'Please respond for each event below.' : 'You can adjust the count per event below.'}
              </p>
            </div>
          </div>
        `)}

        <form id="rsvp-form" novalidate aria-label="RSVP form" style="margin-top:var(--sp-6)">
          ${eventsForParty.map(ev => renderEventStep(ev, party, initial.events?.[ev.id] || {}, invitedCount)).join('')}

          <div id="rsvp-validation" class="notice notice--error" role="alert" aria-live="assertive" hidden></div>

          <div style="text-align:center; margin: var(--sp-6) 0;">
            <button type="button" id="rsvp-review-btn" class="btn btn--lg btn--outline">Review &amp; Submit &rsaquo;</button>
          </div>

          <div id="rsvp-summary-panel" class="rsvp-summary" hidden aria-live="polite">
            <h3>Your responses</h3>
            <div id="rsvp-summary-body"></div>
            <div style="display:flex; gap:var(--sp-3); flex-wrap:wrap; margin-top:var(--sp-5); justify-content:center;">
              <button type="submit" id="rsvp-submit-btn" class="btn btn--lg">${isUpdate ? 'Update RSVP' : 'Submit RSVP'}</button>
              <button type="button" id="rsvp-edit-btn" class="btn btn--ghost">Keep editing</button>
            </div>
            <p id="rsvp-saving" class="field__hint" style="text-align:center; margin-top:var(--sp-3);" aria-live="polite"></p>
          </div>
        </form>
      </div>
    </section>
  `;

  wireForm(root, party, eventsForParty, invitedCount);
}

/* ---------- Per-event card ---------- */

function renderEventStep(ev, party, prior, invitedCount) {
  const status = prior.status || 'pending';
  const priorCount = (prior.attending_count != null && prior.attending_count >= 0)
    ? Math.min(invitedCount, Math.max(1, Number(prior.attending_count)))
    : invitedCount; // default to the full party
  const dietary = prior.dietary || 'none';
  const accessibilityPrefill = ev.id === 'ceremony'
    ? (prior.special_notes ?? party.accessibility?.notes ?? '')
    : (prior.special_notes ?? '');
  const songPrefill = ev.id === 'nalangu' ? (prior.song_request || '') : '';

  return `
    <article class="rsvp-step" data-event="${ev.id}">
      <div class="rsvp-step__heading">
        <h2 class="rsvp-step__title">
          ${escHtml(ev.label_en)}
          <span lang="ta" style="font-size:.7em;color:var(--c-gold-dark);font-weight:400;margin-left:.4em">${escHtml(ev.label_ta || '')}</span>
        </h2>
        <span class="rsvp-step__meta">${escHtml(formatDate(ev.date))}</span>
      </div>

      <fieldset style="border:0; padding:0; margin:0;">
        <legend class="field__label" style="margin-bottom:var(--sp-3);">Will you join us?</legend>
        <div class="rsvp-toggle" role="radiogroup" aria-label="Response for ${escHtml(ev.label_en)}">
          ${['yes','no','maybe'].map(v => `
            <label class="rsvp-toggle__option" data-value="${v}">
              <input type="radio" name="status:${ev.id}" value="${v}" ${status === v ? 'checked' : ''}>
              <span>${v === 'yes' ? 'Yes, we’ll be there' : v === 'no' ? 'Sadly, no' : 'Maybe'}</span>
            </label>
          `).join('')}
        </div>
      </fieldset>

      <div class="rsvp-step__detail" data-detail-for="${ev.id}" ${status === 'yes' ? '' : 'hidden'}>

        ${invitedCount > 1 ? `
          <div class="field">
            <label class="field__label" for="count-${ev.id}">How many of you will attend?</label>
            <select id="count-${ev.id}" class="select" name="count:${ev.id}" style="max-width:200px">
              ${Array.from({ length: invitedCount }, (_, i) => i + 1).map(n =>
                `<option value="${n}" ${n === priorCount ? 'selected' : ''}>${n} ${peopleWord(n)}</option>`
              ).join('')}
            </select>
            <span class="field__hint">Your invitation is for up to ${invitedCount} ${peopleWord(invitedCount)}. Pick the number who will be joining us for this event.</span>
          </div>
        ` : `
          <input type="hidden" name="count:${ev.id}" value="1">
        `}

        <div class="field">
          <label class="field__label" for="diet-${ev.id}">Dietary preferences</label>
          <select id="diet-${ev.id}" class="select" name="dietary:${ev.id}">
            ${DIETARY_OPTIONS.map(([v,l]) => `<option value="${v}" ${dietary === v ? 'selected' : ''}>${escHtml(l)}</option>`).join('')}
          </select>
          ${invitedCount > 1
            ? `<span class="field__hint">Heads-up: all our wedding meals are vegetarian (you won&rsquo;t miss a thing, promise!). Pick the option that fits most of your party &mdash; if individuals have stricter needs, please note them below.</span>`
            : `<span class="field__hint">Heads-up: all our wedding meals are vegetarian (you won&rsquo;t miss a thing, promise!).</span>`}
        </div>

        ${ev.id === 'nalangu' ? `
          <div class="field">
            <label class="field__label" for="song-${ev.id}">A song you&rsquo;d love the DJ to play?</label>
            <textarea id="song-${ev.id}" class="textarea" name="song:${ev.id}" rows="2" placeholder="Song name and artist...">${escHtml(songPrefill)}</textarea>
          </div>
        ` : ''}

        ${ev.id === 'ceremony' ? `
          <div class="field">
            <label class="field__label" for="notes-${ev.id}">Accessibility or anything we should know?</label>
            <textarea id="notes-${ev.id}" class="textarea" name="notes:${ev.id}" rows="3" placeholder="Mobility, dietary allergies, seating preference, late arrival...">${escHtml(accessibilityPrefill)}</textarea>
          </div>
        ` : `
          <div class="field">
            <label class="field__label" for="notes-${ev.id}">Anything we should know?</label>
            <textarea id="notes-${ev.id}" class="textarea" name="notes:${ev.id}" rows="2" placeholder="Optional — allergies, arrival timing, anything else...">${escHtml(prior.special_notes || '')}</textarea>
          </div>
        `}
      </div>
    </article>
  `;
}

/* ---------- Wire form ---------- */

function wireForm(root, party, eventsForParty, invitedCount) {
  const form = root.querySelector('#rsvp-form');
  if (!form) return;

  // Yes/No/Maybe toggle reveals or hides the detail panel
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t && t.name && t.name.startsWith('status:')) {
      const evId = t.name.split(':')[1];
      const panel = form.querySelector(`[data-detail-for="${evId}"]`);
      if (panel) panel.hidden = t.value !== 'yes';
    }
    scheduleSave();
  });

  form.addEventListener('input', scheduleSave);

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    const indicator = form.querySelector('#rsvp-saving');
    if (indicator) indicator.textContent = '';
    saveTimer = setTimeout(() => {
      const payload = collect(form, party, invitedCount);
      saveDraft(party.invite_code, payload);
      if (indicator) {
        indicator.textContent = 'Draft saved';
        setTimeout(() => { if (indicator) indicator.textContent = ''; }, 1800);
      }
    }, 400);
  }

  const reviewBtn  = form.querySelector('#rsvp-review-btn');
  const summary    = form.querySelector('#rsvp-summary-panel');
  const summaryEl  = form.querySelector('#rsvp-summary-body');
  const editBtn    = form.querySelector('#rsvp-edit-btn');
  const validBox   = form.querySelector('#rsvp-validation');

  reviewBtn?.addEventListener('click', () => {
    const payload = collect(form, party, invitedCount);
    const err = validate(payload, eventsForParty);
    if (err) {
      validBox.hidden = false;
      validBox.textContent = err;
      validBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    validBox.hidden = true;
    validBox.textContent = '';
    summaryEl.innerHTML = buildSummaryHtml(payload, eventsForParty);
    summary.hidden = false;
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  editBtn?.addEventListener('click', () => {
    summary.hidden = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = collect(form, party, invitedCount);
    const err = validate(payload, eventsForParty);
    if (err) {
      validBox.hidden = false;
      validBox.textContent = err;
      validBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const submitBtn = form.querySelector('#rsvp-submit-btn');
    submitBtn?.setAttribute('disabled', 'disabled');
    try {
      const result = await submitRSVP(payload);
      const finalPayload = loadSubmission(party.invite_code) || payload;
      // Carry the send outcome so the thanks page can be honest about whether
      // the RSVP reached us or is still queued on this device.
      setState({ rsvp_submitted: finalPayload, rsvp_send_result: result });
      navigate('#/thanks');
    } catch (err2) {
      console.error('submit failed', err2);
      validBox.hidden = false;
      validBox.textContent = 'Something went wrong submitting. Your draft has been saved locally — please try again.';
      submitBtn?.removeAttribute('disabled');
    }
  });
}

/* ---------- Collect form into payload ---------- */

function collect(form, party, invitedCount) {
  const events = {};

  for (const input of form.querySelectorAll('[name^="status:"]')) {
    if (!input.checked) continue;
    const evId = input.name.split(':')[1];
    const status = input.value;

    let attending_count = 0;
    if (status === 'yes') {
      const rawCount = form.querySelector(`[name="count:${evId}"]`)?.value;
      const parsed = parseInt(rawCount, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        attending_count = Math.min(invitedCount, parsed);
      } else {
        attending_count = invitedCount;
      }
    }

    const dietary = form.querySelector(`[name="dietary:${evId}"]`)?.value || 'none';
    const songEl  = form.querySelector(`[name="song:${evId}"]`);
    const notesEl = form.querySelector(`[name="notes:${evId}"]`);

    events[evId] = {
      status,
      attending_count,
      dietary,
      song_request: songEl?.value?.trim() || '',
      special_notes: notesEl?.value?.trim() || ''
    };
  }

  // Ensure all invited events appear even when unanswered
  for (const evId of party.events_invited || []) {
    if (!events[evId]) {
      events[evId] = {
        status: 'pending',
        attending_count: 0,
        dietary: 'none',
        song_request: '',
        special_notes: ''
      };
    }
  }

  return {
    invite_code: party.invite_code,
    party_name: party.party_name,
    invited_count: invitedCount,
    submitted_at: new Date().toISOString(),
    events
  };
}

/* ---------- Validate ---------- */

function validate(payload, eventsForParty) {
  const answered = eventsForParty.some(ev => {
    const s = payload.events?.[ev.id]?.status;
    return s === 'yes' || s === 'no' || s === 'maybe';
  });
  if (!answered) {
    return 'Please respond Yes, No or Maybe for at least one event before submitting.';
  }
  for (const ev of eventsForParty) {
    const r = payload.events?.[ev.id];
    if (r?.status === 'yes' && !(r.attending_count > 0)) {
      return `Please choose how many of you will attend the ${ev.label_en}.`;
    }
  }
  return null;
}

/* ---------- Summary HTML for review panel ---------- */

function buildSummaryHtml(payload, eventsForParty) {
  return eventsForParty.map(ev => {
    const r = payload.events?.[ev.id] || { status: 'pending' };
    const status = r.status || 'pending';
    const statusLabel = status === 'yes' ? 'Attending'
                      : status === 'no'  ? 'Not attending'
                      : status === 'maybe' ? 'Maybe'
                      : 'No response yet';
    const dietLabel = r.dietary && r.dietary !== 'none'
      ? (DIETARY_OPTIONS.find(([v]) => v === r.dietary)?.[1] || r.dietary)
      : '';
    const songLine = r.song_request
      ? `<div class="rsvp-summary__line"><span>Song request</span><span>${escHtml(r.song_request)}</span></div>` : '';
    const notesLine = r.special_notes
      ? `<div class="rsvp-summary__line"><span>Notes</span><span>${escHtml(r.special_notes)}</span></div>` : '';

    return `
      <div style="margin-bottom:var(--sp-5)">
        <h4 style="margin:0 0 var(--sp-2); font-family:var(--ff-serif); color:var(--c-red);">${escHtml(ev.label_en)}</h4>
        <div class="rsvp-summary__line"><span>Status</span><strong>${escHtml(statusLabel)}</strong></div>
        ${status === 'yes' ? `<div class="rsvp-summary__line"><span>Attending</span><strong>${r.attending_count} ${peopleWord(r.attending_count)}</strong></div>` : ''}
        ${status === 'yes' && dietLabel ? `<div class="rsvp-summary__line"><span>Dietary</span><span>${escHtml(dietLabel)}</span></div>` : ''}
        ${songLine}
        ${notesLine}
      </div>
    `;
  }).join('');
}
