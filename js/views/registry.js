/* Registry */

export async function render(root) {
  root.innerHTML = `
    <section class="section">
      <div class="container">
        <header class="page-header">
          <span class="page-header__eyebrow">Gifts</span>
          <h1 class="page-header__title">Registry &amp; Honeymoon</h1>
          <p class="page-header__lead">Truly, just being there is enough &mdash; but if you&rsquo;d like to mark the day, here are two gentle options.</p>
        </header>

        <div class="grid grid--2" style="margin-top:var(--sp-6)">
          <article class="card card--ornate">
            <h2 style="color:var(--c-red); margin-top:0">Your presence is the gift</h2>
            <p>Many of you are travelling some distance to share these celebrations with us &mdash; from across Durban, across South Africa, and from much further afield. That, on its own, is the most generous thing anyone could do.</p>
            <p>We mean it sincerely: no obligation, no expectation. Just bring yourselves.</p>
          </article>

          <article class="card card--ornate">
            <h2 style="color:var(--c-red); margin-top:0">Honeymoon Fund</h2>
            <p>If you&rsquo;d still like to mark the day with something practical, we&rsquo;re putting together a small honeymoon after the celebrations settle. A contribution toward that &mdash; a meal, a sunset, a long-awaited rest &mdash; would be lovingly received.</p>
            <p style="margin-top:var(--sp-5)">
              <a href="#" class="btn">[TODO: confirm honeymoon fund link]</a>
            </p>
          </article>
        </div>

        <div class="motif-strip" aria-hidden="true" style="margin:var(--sp-8) 0"></div>

        <div class="container container--text center-text">
          <p style="font-style:italic; color:var(--c-ink-soft)">A small request: please no fresh flowers &mdash; the families will have plenty already.</p>
          <p style="margin-top:var(--sp-6)">
            <a href="#/rsvp" class="btn btn--outline">RSVP</a>
          </p>
        </div>
      </div>
    </section>
  `;
}
