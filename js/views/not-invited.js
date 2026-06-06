/* Private-site landing — shown to anyone without a valid invite code */

import { isPlausibleCode, findParty } from '../guests.js';

export async function render(root) {
  root.innerHTML = `
    <section class="hero hero--gate">
      <div class="hero__watermark" aria-hidden="true"></div>
      <div class="container">
        <div class="hero__motif-top" aria-hidden="true"></div>
        <span class="hero__eyebrow">A private invitation</span>
        <h1 class="hero__title">
          <span class="name">Shivanie</span>
          <span class="name-ornament" aria-hidden="true">&amp;</span>
          <span class="name">Theo</span>
        </h1>
        <p class="hero__date">19 December 2026 &middot; Durban</p>
        <p class="hero__location" style="margin-bottom:var(--sp-7)">By invitation only</p>
      </div>
    </section>

    <div class="motif-strip" aria-hidden="true"></div>

    <section class="section gate">
      <div class="container container--text">
        <div class="card card--ornate" style="text-align:center">
          <h2 style="color:var(--c-red);margin-top:0">Please use your personalised invitation link</h2>
          <p>This site is for our wedding guests. Your invitation link &mdash; sent to you by Shivanie or Theo on WhatsApp &mdash; will look something like:</p>
          <p style="margin:var(--sp-5) 0">
            <code style="background:var(--c-cream-warm);padding:.6em 1em;border-radius:.5em;font-size:1.05em;letter-spacing:.05em">shivanieandtheo.co.za/?i=K7M2QH</code>
          </p>
          <p>If you have your invite link, please open it directly. If you have only the 6-character code, you can enter it below.</p>

          <form id="code-entry" style="display:flex;gap:var(--sp-3);justify-content:center;flex-wrap:wrap;margin-top:var(--sp-5);max-width:420px;margin-left:auto;margin-right:auto">
            <label for="invite-code-input" class="visually-hidden">Invite code</label>
            <input
              id="invite-code-input"
              class="input"
              type="text"
              inputmode="text"
              autocapitalize="characters"
              spellcheck="false"
              autocomplete="off"
              maxlength="6"
              placeholder="e.g. K7M2QH"
              style="text-transform:uppercase;letter-spacing:.15em;text-align:center;font-family:var(--ff-serif);flex:1 1 100%;width:100%"
              aria-describedby="code-help"
            />
            <button type="submit" class="btn btn--block">Open invite</button>
          </form>
          <p id="code-help" class="field__hint" style="margin-top:var(--sp-3)">6 letters and numbers, no spaces.</p>
          <p id="code-error" class="field__error" style="margin-top:var(--sp-3);min-height:1.5em" aria-live="polite"></p>
        </div>

        <div style="margin-top:var(--sp-7);text-align:center;color:var(--c-ink-soft)">
          <p>Believe you should have received an invitation? Please reach out to Shivanie or Theo directly on WhatsApp.</p>
        </div>
      </div>
    </section>
  `;

  // Wire up the code-entry form
  const form = root.querySelector('#code-entry');
  const input = root.querySelector('#invite-code-input');
  const errEl = root.querySelector('#code-error');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    const raw = (input.value || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!raw) { errEl.textContent = 'Please enter your invite code.'; input.focus(); return; }
    if (!isPlausibleCode(raw)) {
      errEl.textContent = 'That doesn’t look right — check for typos (no I, L, O or U).';
      input.focus();
      return;
    }
    try {
      const party = await findParty(raw);
      if (!party) {
        errEl.textContent = 'We couldn’t match that code. Please double-check the message you received.';
        input.focus();
        return;
      }
      // Reload with the code in the URL so app.js can hydrate it cleanly
      location.href = `${location.pathname}?i=${encodeURIComponent(raw)}#/`;
    } catch (err) {
      errEl.textContent = 'Something went wrong checking your code. Please try again.';
      console.error(err);
    }
  });

  // Auto-uppercase as the user types
  input?.addEventListener('input', () => {
    const start = input.selectionStart;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, start);
  });
}
