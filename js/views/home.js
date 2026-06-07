/* Home / landing view */

import { get as getState } from '../state.js';
import { loadSubmission } from '../persist.js';

const WEDDING = new Date('2026-12-19T15:00:00+02:00'); // Muhurtham, SAST

// The three celebrations, in order. A guest only sees the ones their party is
// invited to (events_invited); the site is gated, so a party is always present.
const EVENT_DEFS = [
  { id: 'mehendi',  day: 'Day 1 — Thursday',  title: 'Mehendi',               ta: 'மருதாணி', date: '17 December 2026', venue: "Bride's home, Durban", href: '#/events/mehendi',
    blurb: 'An intimate evening of laughter, song and the slow art of henna being drawn across the bride&rsquo;s hands and feet.' },
  { id: 'nalangu',  day: 'Day 2 — Friday',    title: 'Nalangu &amp; Sangeeth', ta: 'நலங்கு',  date: '18 December 2026', venue: 'Kendra Hall, Greyville', href: '#/events/nalangu',
    blurb: 'A night for both families to come together &mdash; first through playful games, then a music &amp; dance night that runs long.' },
  { id: 'ceremony', day: 'Day 3 — Saturday',  title: 'Wedding &amp; Reception', ta: 'திருமணம்', date: '19 December 2026', venue: 'Maroupi, Umhlali', href: '#/events/ceremony', feature: true,
    blurb: 'The wedding itself &mdash; a sacred one-hour Tamil ceremony beneath a flower-laden <em>mandap</em>, followed by feast and dance.' },
];

function daysUntil(d) {
  const ms = d.getTime() - Date.now();
  if (ms <= 0) return null;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return { days, hours, mins };
}

export async function render(root) {
  const { party } = getState();
  const cd = daysUntil(WEDDING);
  const hasInvite = !!party;
  const submission = party ? loadSubmission(party.invite_code) : null;

  // Show only the celebrations this party is invited to (fall back to all if unknown).
  const invitedIds = (party && Array.isArray(party.events_invited) && party.events_invited.length)
    ? party.events_invited
    : EVENT_DEFS.map(e => e.id);
  const cards = EVENT_DEFS.filter(e => invitedIds.includes(e.id));

  root.innerHTML = `
    <section class="hero">
      <div class="hero__watermark" aria-hidden="true"></div>
      <div class="gopuram-arch" aria-hidden="true"></div>
      <div class="toran" aria-hidden="true"></div>
      <div class="feather-wm" aria-hidden="true"></div>
      <div class="container">
        <div class="hero__motif-top" aria-hidden="true"></div>
        <span class="hero__eyebrow">Save the Date &mdash; 17–19 December 2026</span>
        <h1 class="hero__title">
          <span class="name">Shivanie</span>
          <span class="name-ornament" aria-hidden="true">&amp;</span>
          <span class="name">Theo</span>
        </h1>
        <p class="hero__date">
          Saturday, 19 December 2026
          <span class="hero__date-ta" lang="ta" style="font-family:var(--ff-tamil-serif)">டிசம்பர் 19, 2026 சனிக்கிழமை</span>
        </p>
        <p class="hero__location">Durban &middot; KZN North Coast &middot; South Africa</p>

        <div class="hero__cta-row">
          <a href="#/rsvp" class="btn btn--lg">${submission ? 'Update Your RSVP' : (hasInvite ? 'Open Your Invitation' : 'RSVP')}</a>
          <a href="#/celebration" class="btn btn--outline btn--lg">View the Celebration</a>
        </div>

        ${cd ? `
        <div class="countdown" aria-label="Countdown to the wedding">
          <div class="countdown__unit"><span class="countdown__num">${cd.days}</span><span class="countdown__label">Days</span></div>
          <div class="countdown__unit"><span class="countdown__num">${String(cd.hours).padStart(2,'0')}</span><span class="countdown__label">Hours</span></div>
          <div class="countdown__unit"><span class="countdown__num">${String(cd.mins).padStart(2,'0')}</span><span class="countdown__label">Mins</span></div>
        </div>` : `
        <div class="countdown"><strong style="color:var(--c-red);font-family:var(--ff-serif);font-size:var(--fs-500)">Today is the day. <span lang="ta">திருமணம் வாழ்க!</span></strong></div>
        `}
      </div>
    </section>

    <div class="motif-strip motif-strip--toran" aria-hidden="true"></div>

    <section class="three-day">
      <div class="container">
        <span class="section__eyebrow">Three Days. Three Venues. One Family.</span>
        <h2 class="section__title">The Celebration</h2>
        <p class="section__lead">After many seasons of finding our way to one another, we are joining our lives in the tradition that has shaped both our families for generations. Please join us for three days of ritual, music and joy.</p>

        <div class="grid grid--3" style="margin-top:var(--sp-7)">
          ${cards.map(eventCard).join('')}
        </div>
      </div>
    </section>

    <div class="divider" aria-hidden="true"><span class="divider__motif">&#10070;</span></div>

    <section class="section--sm section--band">
      <div class="container container--text center-text">
        <h2>For our guests joining a Tamil wedding for the first time</h2>
        <p>Welcome &mdash; here is a gentle map to what you&rsquo;ll experience. Tamil weddings are sacred, joyful, slightly chaotic in the best way, and built on the idea that a marriage joins not just two people but two families and the generations on either side.</p>
        <p><a href="#/culture" class="btn btn--on-dark">Read the Cultural Guide</a></p>
      </div>
    </section>
  `;

  // Live countdown tick
  if (cd) tickCountdown(root);
}

function eventCard({ day, title, ta, date, venue, blurb, href, feature }) {
  // Co-equal display Tamil: gold-dark is AA on cream (~4.6:1); on the maroon
  // feature card it flips to gold-light to stay AA (~7.4:1) against --grad-band.
  const taColor = feature ? 'var(--c-gold-light)' : 'var(--c-gold-dark)';
  return `
    <article class="event-card${feature ? ' event-card--feature' : ''}">
      <div class="event-card__motif" aria-hidden="true"></div>
      <p class="event-card__day">${day}</p>
      <h3 class="event-card__title">${title} <span lang="ta" style="font-family:var(--ff-tamil-serif);font-size:.85em;color:${taColor}">${ta}</span></h3>
      <p class="event-card__date">${date}</p>
      <p class="event-card__venue">${venue}</p>
      <p class="event-card__blurb">${blurb}</p>
      <a class="event-card__link" href="${href}">Read more &rsaquo;</a>
    </article>`;
}

let tickHandle = null;
function tickCountdown(root) {
  clearInterval(tickHandle);
  tickHandle = setInterval(() => {
    const cd = daysUntil(WEDDING);
    if (!cd) { clearInterval(tickHandle); return; }
    const nums = root.querySelectorAll('.countdown__num');
    if (nums.length < 3) { clearInterval(tickHandle); return; }
    nums[0].textContent = cd.days;
    nums[1].textContent = String(cd.hours).padStart(2,'0');
    nums[2].textContent = String(cd.mins).padStart(2,'0');
  }, 30000);  // every 30s is plenty
}
