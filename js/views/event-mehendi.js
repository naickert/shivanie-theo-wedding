/* Mehendi — Day 1 detail */

import { get as getState } from '../state.js';

export async function render(root) {
  const { party } = getState();
  const invited = party && Array.isArray(party.events_invited) && party.events_invited.includes('mehendi');

  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Day 1 &middot; Thursday</span>
          <h1 class="page-header__title">Mehendi <span lang="ta" style="font-size:.6em;color:var(--c-gold-dark);font-weight:400">மருதாணி</span></h1>
          <p class="page-header__lead">Thursday 17 December 2026</p>
          ${invited ? '<p style="margin-top:var(--sp-3)"><span class="badge badge--invited">You&rsquo;re invited</span></p>' : ''}
        </header>

        <h2>What is Mehendi?</h2>
        <p><em>Mehendi</em> (henna ceremony) is the soft, joyful opening to a Tamil wedding. The bride&rsquo;s hands and feet are decorated with intricate henna patterns, while the women of both families gather around her with sweets, song and the kind of long, looping conversations that only happen when no one is in a rush. Tradition says the darker the henna stains, the deeper the love &mdash; and the more the new mother-in-law will adore her daughter-in-law.</p>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>The Day</h2>
        <ul class="timeline">
          <li class="timeline__item">
            <span class="timeline__time">09:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Ganapathi Pooja</h3>
              <p class="timeline__desc">A small opening prayer to <em>Ganesha</em> (the remover of obstacles) to bless the days ahead.</p>
            </div>
          </li>
          <li class="timeline__item timeline__item--peak">
            <span class="timeline__time">09:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Bridal Mehendi <em>(Marudhani)</em></h3>
              <p class="timeline__desc">The bride&rsquo;s henna is applied &mdash; a slow, careful 2&ndash;3 hour piece of art. Family gather, snack and sing.</p>
              <span class="timeline__tag">Peak moment</span>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">12:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Lunch</h3>
              <p class="timeline__desc">A light home-style vegetarian lunch.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">14:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Mehendi for the lady guests</h3>
              <p class="timeline__desc">Henna artists stay on through the afternoon for any guest who&rsquo;d like a design. Refreshments, music and conversation.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">18:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Soft close</h3>
              <p class="timeline__desc">An easy wind-down &mdash; the bride needs to rest her hands.</p>
            </div>
          </li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <div class="info-panel">
          <p class="info-panel__label">Dress code</p>
          <p class="info-panel__body">Light cottons in festive colours. If you have Indian wear, this is the day for it. Avoid white and anything you&rsquo;d be heartbroken to stain (henna travels). Flat shoes &mdash; you&rsquo;ll sit on the floor for parts of the evening.</p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">Venue</p>
          <p class="info-panel__body">${invited
            ? 'At the bride&rsquo;s home in Durban. The full address is in your personalised invitation link.'
            : 'At the bride&rsquo;s home in Durban. The exact address is shared in your personalised invitation link to keep things safe and small.'}</p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">What to bring</p>
          <p class="info-panel__body">An open heart, a charged phone, a light shawl. Patience &mdash; leave henna on at least 2 hours for deep colour.</p>
        </div>

        <p style="margin-top:var(--sp-7); text-align:center">
          <a href="#/rsvp" class="btn">${party ? 'Update Your RSVP' : 'RSVP'}</a>
          <a href="#/events/nalangu" class="btn btn--outline" style="margin-left:var(--sp-3)">Day 2 &rsaquo;</a>
        </p>
      </div>
    </section>
  `;
}
