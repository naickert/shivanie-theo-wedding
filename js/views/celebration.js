/* Celebration view — three-day overview */

import { get as getState } from '../state.js';

// Only the celebrations a party is invited to are shown (the site is gated, so a party always exists).
const EVENT_DEFS = [
  { id: 'mehendi',  day: 'Day 1 — Thursday', title: 'Mehendi',               ta: 'மருதாணி', date: '17 December 2026', venue: "Bride's home, Durban", href: '#/events/mehendi',
    blurb: 'An intimate, female-centred afternoon of song, sweets and the slow art of <em>mehendi</em> (henna) being drawn across the bride&rsquo;s hands and feet. The deeper the colour, the longer the love &mdash; or so the aunties insist.' },
  { id: 'nalangu',  day: 'Day 2 — Friday',   title: 'Nalangu &amp; Sangeeth', ta: 'நலங்கு',  date: '18 December 2026', venue: 'Kendra Hall, Greyville', href: '#/events/nalangu',
    blurb: 'First, <em>nalangu</em> (family games) &mdash; rolling coconuts, hiding rings in turmeric water, two families teasing each other into one. Then <em>sangeeth</em> &mdash; choreography, surprise performances and a dance floor that doesn&rsquo;t close until very late.' },
  { id: 'ceremony', day: 'Day 3 — Saturday', title: 'Wedding &amp; Reception', ta: 'திருமணம்', date: '19 December 2026', venue: 'Maroupi, Umhlali', href: '#/events/ceremony',
    blurb: 'The wedding itself &mdash; a one-hour Tamil ceremony beneath a flower-laden <em>mandap</em> (sacred canopy) in the Maroupi gardens, with the <em>muhurtham</em> (auspicious moment) at 15:15. Followed by a vegetarian feast and dancing indoors.' },
];

export async function render(root) {
  const { party } = getState();

  const invitedIds = (party && Array.isArray(party.events_invited) && party.events_invited.length)
    ? party.events_invited
    : EVENT_DEFS.map(e => e.id);
  const cards = EVENT_DEFS.filter(e => invitedIds.includes(e.id));

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <header class="page-header">
          <span class="page-header__eyebrow">Three Days. Three Venues. One Family.</span>
          <h1 class="page-header__title">The Celebration</h1>
          <p class="page-header__lead">A Tamil wedding is not a single afternoon &mdash; it is a slow gathering of family across several days, each with its own rituals, its own dress code, and its own kind of joy. Here is the shape of ours.</p>
        </header>

        <div class="grid grid--3" style="margin-top:var(--sp-7)">
          ${cards.map(eventCard).join('')}
        </div>

        <div class="motif-strip" aria-hidden="true" style="margin:var(--sp-8) 0"></div>

        <div class="container container--text center-text">
          <p>These are the celebrations we&rsquo;d love you to share with us. Tap any day above for the timings, venue and dress code &mdash; then let us know you&rsquo;re coming.</p>
          <p style="margin-top:var(--sp-5)">
            <a href="#/rsvp" class="btn">${party ? 'Open Your Invitation' : 'RSVP'}</a>
            <a href="#/culture" class="btn btn--outline" style="margin-left:var(--sp-3)">Cultural Guide</a>
          </p>
        </div>
      </div>
    </section>
  `;
}

function eventCard({ day, title, ta, date, venue, blurb, href }) {
  return `
    <article class="event-card">
      <div class="event-card__motif" aria-hidden="true"></div>
      <p class="event-card__day">${day}</p>
      <h3 class="event-card__title">${title} <span lang="ta" style="font-family:var(--ff-tamil-serif);font-size:.85em;color:var(--c-gold-dark)">${ta}</span></h3>
      <p class="event-card__date">${date}</p>
      <p class="event-card__venue">${venue}</p>
      <p class="event-card__blurb">${blurb}</p>
      <a class="event-card__link" href="${href}">Read more &rsaquo;</a>
    </article>`;
}
