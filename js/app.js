/* App bootstrap — wires router, hydrates party from invite code, sets up nav. */

import * as router from './router.js';
import { get as getState, set as setState, subscribe } from './state.js';
import { getInviteCodeFromUrl, findParty } from './guests.js';
import { drainPendingSyncs } from './persist.js';

import { render as renderHome } from './views/home.js';
import { render as renderStory } from './views/story.js';
import { render as renderCelebration } from './views/celebration.js';
import { render as renderEventMehendi } from './views/event-mehendi.js';
import { render as renderEventNalangu } from './views/event-nalangu.js';
import { render as renderEventCeremony } from './views/event-ceremony.js';
import { render as renderCulture } from './views/cultural-guide.js';
import { render as renderTravel } from './views/travel.js';
import { render as renderFaq } from './views/faq.js';
import { render as renderRegistry } from './views/registry.js';
import { render as renderRsvp } from './views/rsvp.js';
import { render as renderThanks } from './views/thanks.js';
import { render as renderNotInvited } from './views/not-invited.js';

const view = () => document.getElementById('view');

async function bootstrap() {
  // Hydrate party from ?i=CODE
  const code = getInviteCodeFromUrl();
  if (code) {
    try {
      const party = await findParty(code);
      if (party) {
        setState({ party });
        showWelcomeBanner(party);
      } else {
        // bad code: stash for not-invited view, don't hydrate
        setState({ party: null });
      }
    } catch (e) {
      console.warn('Could not load guest list', e);
    }
  }

  // Routes
  router.register('/',                  () => renderHome(view()));
  router.register('/story',             () => renderStory(view()));
  router.register('/celebration',       () => renderCelebration(view()));
  router.register('/events/mehendi',    () => renderEventMehendi(view()));
  router.register('/events/nalangu',    () => renderEventNalangu(view()));
  router.register('/events/ceremony',   () => renderEventCeremony(view()));
  router.register('/culture',           () => renderCulture(view()));
  router.register('/travel',            () => renderTravel(view()));
  router.register('/faq',               () => renderFaq(view()));
  router.register('/registry',          () => renderRegistry(view()));
  router.register('/rsvp',              () => renderRsvp(view()));
  router.register('/thanks',            () => renderThanks(view()));
  router.register('/not-invited',       () => renderNotInvited(view()));
  router.setNotFound(() => renderNotFound());

  // Private-site guard: without a hydrated party, force the not-invited landing
  router.beforeEach(async (path) => {
    const { party } = getState();
    if (!party && path !== '/not-invited') {
      router.navigate('/not-invited');
      // throw to abort the original handler
      throw new Error('redirect');
    }
  });

  // Hide nav links when the user is not a recognised guest
  if (!getState().party) {
    document.querySelector('.site-nav')?.setAttribute('hidden', '');
    document.querySelector('.site-header__nav-toggle')?.setAttribute('hidden', '');
  }

  // Mobile nav toggle
  wireMobileNav();

  // Drain any pending RSVP submits (production only — no-op in prototype)
  drainPendingSyncs().catch(() => {});

  router.start();
}

function showWelcomeBanner(party) {
  const banner = document.getElementById('welcome-banner');
  if (!banner) return;
  banner.hidden = false;
  const nameEl = banner.querySelector('[data-bind="party_name"]');
  if (nameEl) nameEl.textContent = party.party_name;
}

function renderNotFound() {
  view().innerHTML = `
    <div class="container container--text section center-text">
      <p class="page-header__eyebrow">404</p>
      <h1 class="page-header__title">Lost in the gardens</h1>
      <p>That page didn&rsquo;t exist. <a href="#/">Return home &rsaquo;</a></p>
    </div>`;
}

function wireMobileNav() {
  const btn = document.querySelector('.site-header__nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.setAttribute('data-open', String(!open));
  });
  // Close on link click (mobile)
  nav.addEventListener('click', e => {
    if (e.target.matches('a') && window.matchMedia('(max-width: 820px)').matches) {
      btn.setAttribute('aria-expanded', 'false');
      nav.setAttribute('data-open', 'false');
    }
  });
}

bootstrap().catch(err => {
  console.error('Bootstrap failed', err);
  view().innerHTML = `<div class="container section"><div class="notice notice--error">Could not start the site. Please reload. (${err.message})</div></div>`;
});
