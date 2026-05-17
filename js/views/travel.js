/* Travel & Stay */

export async function render(root) {
  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Coming to Durban for the wedding</span>
          <h1 class="page-header__title">Travel &amp; Stay</h1>
          <p class="page-header__lead">A practical guide to getting to Durban, finding a bed, and planning around KZN weather.</p>
        </header>

        <h2>Getting Here</h2>
        <p>The closest airport is <strong>King Shaka International Airport (DUR)</strong>, just north of Durban. From the airport you&rsquo;re roughly 25 minutes from Umhlali and the Maroupi venue, and 35 minutes from central Durban.</p>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Where to Stay</h2>
        <p>Two natural choices, depending on which days you&rsquo;re attending:</p>
        <ul>
          <li><strong>North Coast</strong> (Umhlali, Ballito, Salt Rock) &mdash; closest to the Day 3 ceremony &amp; reception at Maroupi. Ideal if you&rsquo;re flying in mainly for the wedding day.</li>
          <li><strong>Central Durban</strong> (Berea, Morningside, Umhlanga) &mdash; closest to the Day 1 Mehendi and Day 2 Nalangu &amp; Sangeeth at Kendra Hall. Ideal if you&rsquo;re joining for all three days.</li>
        </ul>
        <p><em>December is peak season in KZN.</em> Please book your accommodation by August 2026 &mdash; the coast fills up fast.</p>

        <div class="info-panel">
          <p class="info-panel__label">Hotel recommendations</p>
          <p class="info-panel__body">[TODO: confirm hotel block &mdash; preferred rates to follow]</p>
        </div>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Distances &amp; Drive Times</h2>
        <table class="distance-table">
          <thead>
            <tr><th>Route</th><th>Approx. drive</th></tr>
          </thead>
          <tbody>
            <tr><td>King Shaka Airport &rarr; Umhlali / Maroupi</td><td>~25 min</td></tr>
            <tr><td>Central Durban &rarr; Kendra Hall, Greyville</td><td>~10 min</td></tr>
            <tr><td>Central Durban &rarr; Umhlali</td><td>~40 min</td></tr>
            <tr><td>Ballito &rarr; Maroupi</td><td>~15 min</td></tr>
          </tbody>
        </table>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Getting Around</h2>
        <ul>
          <li><strong>Uber</strong> works reliably across Durban and along the North Coast as far as Ballito. Wait times can stretch late in the evening &mdash; plan a 15-min buffer.</li>
          <li><strong>Car hire</strong> is available from all major brands at King Shaka. Recommended if you&rsquo;re planning beach days or staying on the coast.</li>
          <li><strong>Wedding-day shuttle</strong> &mdash; [TODO: confirm wedding shuttle from a central Durban hotel hub to Maroupi and back].</li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>December Weather</h2>
        <p>Durban summer is warm, humid and beautiful. Expect daytime temperatures of <strong>28&ndash;32&deg;C</strong>, high humidity, and short, intense afternoon thunderstorms that usually clear within an hour. Pack:</p>
        <ul>
          <li>Light cotton or linen for the days.</li>
          <li>Sunscreen and a hat for the outdoor ceremony.</li>
          <li>A small umbrella for the afternoon showers.</li>
          <li>A light layer for the evening sea breeze.</li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Load-Shedding</h2>
        <p>South Africa&rsquo;s rolling power cuts are a known quirk. Backup generators are confirmed at all three wedding venues, so the celebration itself is fully covered. If you&rsquo;re booking a self-catering apartment or guesthouse, check with your host that they have backup power for fridges, water and lighting.</p>

        <p style="margin-top:var(--sp-8); text-align:center">
          <a href="#/faq" class="btn">Read the FAQ</a>
          <a href="#/rsvp" class="btn btn--outline" style="margin-left:var(--sp-3)">RSVP</a>
        </p>
      </div>
    </section>
  `;
}
