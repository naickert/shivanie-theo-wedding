/* Wedding & Reception — Day 3 detail */

import { get as getState } from '../state.js';

export async function render(root) {
  const { party } = getState();
  const invited = party && Array.isArray(party.events_invited) && party.events_invited.includes('ceremony');

  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Saturday &middot; 19 December</span>
          <h1 class="page-header__title">Wedding &amp; Reception <span lang="ta" style="font-size:.6em;color:var(--c-gold-dark);font-weight:400">திருமணம்</span></h1>
          <p class="page-header__lead">Saturday 19 December 2026</p>
          ${invited ? '<p style="margin-top:var(--sp-3)"><span class="badge badge--invited">You&rsquo;re invited</span></p>' : ''}
        </header>

        <p>The wedding itself is a one-hour Tamil ceremony beneath a flower-laden <em>mandap</em> (sacred canopy) in the Maroupi gardens. The rituals are spoken in Sanskrit and Tamil, with gentle English narration alongside so that every guest follows what is happening and why. The <em>muhurtham</em> (auspicious moment of marriage) lands at <strong>15:15</strong> &mdash; please be seated by 14:30.</p>

        <div class="notice notice--warning" style="margin:var(--sp-5) 0">
          <div>
            <strong>Weather note.</strong> The ceremony is outdoors in the gardens. December in KZN can deliver hot sun (28&ndash;32&deg;C) or short, intense afternoon thunderstorms. A fully covered marquee and an indoor pivot are on standby, so the ceremony will start on time, rain or shine.
          </div>
        </div>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>The Day</h2>
        <ul class="timeline">
          <li class="timeline__item">
            <span class="timeline__time">14:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Arrival drinks &amp; canap&eacute;s</h3>
              <p class="timeline__desc">Welcome refreshments in the gardens as guests arrive.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">14:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Guests seated</h3>
              <p class="timeline__desc">Please be in your seats &mdash; the ceremony will begin on time.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">15:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Ceremony begins</h3>
              <p class="timeline__desc"><em>Ganapathi Pooja</em> (opening prayer) and the lighting of the <em>havan</em> (sacred fire).</p>
            </div>
          </li>
          <li class="timeline__item timeline__item--peak">
            <span class="timeline__time">15:15</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Muhurtham &mdash; <em>thaali</em> tying</h3>
              <p class="timeline__desc">The auspicious moment. The groom ties the sacred <em>thaali</em> (marriage pendant) around the bride&rsquo;s neck.</p>
              <span class="timeline__tag">Peak moment</span>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">15:25</span>
            <div class="timeline__body">
              <h3 class="timeline__title"><em>Saptapadi</em> &mdash; seven steps</h3>
              <p class="timeline__desc">The couple take seven steps around the fire, each step a vow for their marriage.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">16:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Ceremony concludes</h3>
              <p class="timeline__desc">Group photographs and cocktails in the gardens.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">17:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Reception entrance (indoor)</h3>
              <p class="timeline__desc">Guests move inside as the couple make their reception entrance.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">18:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Cake cutting &amp; MC welcome</h3>
              <p class="timeline__desc">Speeches kept warm and short.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">18:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Vegetarian buffet dinner</h3>
              <p class="timeline__desc">A full vegetarian feast.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">19:30</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Special performances</h3>
              <p class="timeline__desc">Family pieces and surprises.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">20:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Open dance floor</h3>
              <p class="timeline__desc">The floor stays open until the send-off.</p>
            </div>
          </li>
          <li class="timeline__item">
            <span class="timeline__time">23:00</span>
            <div class="timeline__body">
              <h3 class="timeline__title">Send-off</h3>
              <p class="timeline__desc">A traditional farewell as the couple leave.</p>
            </div>
          </li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <div class="info-panel">
          <p class="info-panel__label">Dress code</p>
          <p class="info-panel__body">Formal Indian or formal Western. Shivanie will be in a traditional <em>Kanjivaram</em> (heavy South Indian silk) saree. Guests are warmly invited to wear silks, sarees, lehengas, sherwanis, suits or formal dresses. Jewel tones photograph beautifully under the venue lighting.</p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">Venue</p>
          <p class="info-panel__body">
            <strong>Maroupi Wedding Venue</strong><br>
            ~2 km outside Umhlali, KZN North Coast<br>
            <a href="https://maroupiweddingvenue.co.za" target="_blank" rel="noopener">maroupiweddingvenue.co.za</a> &middot;
            <a href="https://maps.google.com/?q=Maroupi+Wedding+Venue+Umhlali" target="_blank" rel="noopener">Open in Google Maps &rsaquo;</a>
          </p>
        </div>

        <div class="info-panel">
          <p class="info-panel__label">What to bring</p>
          <p class="info-panel__body">Sunscreen and a sun hat for the outdoor ceremony. Comfortable shoes for grass. A light layer for the evening sea breeze. Heels can wait for the reception entrance.</p>
        </div>

        <p style="margin-top:var(--sp-7); text-align:center">
          <a href="#/rsvp" class="btn">${party ? 'Update Your RSVP' : 'RSVP'}</a>
          <a href="#/culture" class="btn btn--outline" style="margin-left:var(--sp-3)">Cultural Guide</a>
        </p>
      </div>
    </section>
  `;
}
