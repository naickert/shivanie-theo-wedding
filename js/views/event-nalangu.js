/* Nalangu + Sangeeth — Day 2 detail */

import { get as getState } from '../state.js';

export async function render(root) {
  const { party } = getState();
  const invited = party && Array.isArray(party.events_invited) && party.events_invited.includes('nalangu');

  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Day 2 &middot; Friday</span>
          <h1 class="page-header__title">Nalangu &amp; Sangeeth <span lang="ta" style="font-size:.6em;color:var(--c-gold-dark);font-weight:400">நலங்கு</span></h1>
          <p class="page-header__lead">Friday 18 December 2026</p>
          ${invited ? '<p style="margin-top:var(--sp-3)"><span class="badge badge--invited">You&rsquo;re invited</span></p>' : ''}
        </header>

        <h2>What is Nalangu?</h2>
        <p><em>Nalangu</em> (family games) is the moment two families stop being two families. The bride and groom &mdash; and crucially, both sets of parents &mdash; play together: rolling coconuts back and forth, hunting for hidden rings in bowls of turmeric water, feeding each other sweets, sometimes a tug-of-war or two. It is loud, silly, often slightly competitive, and entirely the point. By the end of it, no one is a stranger.</p>

        <div class="info-panel">
          <p class="info-panel__label">A small cultural note</p>
          <p class="info-panel__body">In Tamil Nadu, <em>nalangu</em> traditionally happens <em>after</em> the wedding ceremony. In South African Indian tradition, it&rsquo;s lovingly adapted to the eve before &mdash; partly for practicality, partly because it sets exactly the right tone for the wedding day to come.</p>
        </div>

        <h2 style="margin-top:var(--sp-7)">What is Sangeeth?</h2>
        <p><em>Sangeeth</em> (music and dance night) is the celebration that follows &mdash; family choreography rehearsed for months in living rooms, surprise performances, and almost always a piece danced by the bride and groom together. Expect a long, joyful night. The dance floor stays open.</p>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>The Evening</h2>
        <ul class="timeline">
          <li class="timeline__item">
            <span class="timeline__time">17:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Arrival &amp; welcome drinks</h3>
              <p class="timeline__desc">Mingle as the hall fills.</p>
            </div>
          </li>
          <li class="timeline__item timeline__item--peak">
            <span class="timeline__time">18:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Nalangu &mdash; family games</h3>
              <p class="timeline__desc">Both families gather around the couple for the traditional games. Bring your voice &mdash; cheering is part of the ritual.</p>
              <span class="timeline__tag">Peak moment</span>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">20:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Dinner buffet</h3>
              <p class="timeline__desc">A full vegetarian buffet.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">21:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Sangeeth begins</h3>
              <p class="timeline__desc">Family choreography, surprise performances, and then the floor opens to everyone.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">01:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Soft close</h3>
              <p class="timeline__desc">The bride and groom rest &mdash; the wedding is tomorrow.</p>
            </div>
          </li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <div class="info-panel">
          <p class="info-panel__label">Dress code</p>
          <p class="info-panel__body">Traditional or semi-formal Indian. Sarees, lehengas, anarkalis, kurtas, sherwanis. If Indian wear isn&rsquo;t accessible, a formal suit or smart cocktail dress works. Colour is the brief &mdash; not the night for black or white.</p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">Venue</p>
          <p class="info-panel__body">
            <strong>Kendra Hall</strong><br>
            5 John Zikhali Road, Greyville, Berea 4001<br>
            Tel <a href="tel:+27313091824">031 309 1824</a> &middot;
            <a href="https://maps.google.com/?q=Kendra+Hall+5+John+Zikhali+Road+Greyville+Durban" target="_blank" rel="noopener">Open in Google Maps &rsaquo;</a>
          </p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">Parking &amp; access</p>
          <p class="info-panel__body">On-site and street parking &mdash; arrive a little early on a Friday evening in Durban. The hall is wheelchair-accessible with a lift to the main floor. Please let us know any access needs in your RSVP.</p>
        </div>

        <p style="margin-top:var(--sp-7); text-align:center">
          <a href="#/rsvp" class="btn">${party ? 'Update Your RSVP' : 'RSVP'}</a>
          <a href="#/events/ceremony" class="btn btn--outline" style="margin-left:var(--sp-3)">Day 3 &rsaquo;</a>
        </p>
      </div>
    </section>
  `;
}
