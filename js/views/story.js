/* Our Story view */

export async function render(root) {
  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Shivanie &amp; Theo</span>
          <h1 class="page-header__title">Our Story</h1>
          <p class="page-header__lead">A long way around to the same Sunday lunch table.</p>
        </header>

        <article class="stack-lg">
          <section>
            <h2>How We Met</h2>
            <p>[TODO: confirm with couple] &mdash; a short, warm paragraph from Shivanie &amp; Theo about the first time their paths crossed, where it was, what year, and the small ordinary moment they both still remember.</p>
          </section>

          <div class="motif-strip" aria-hidden="true"></div>

          <section>
            <h2>The Proposal</h2>
            <p>[TODO: confirm with couple] &mdash; the proposal story in the couple&rsquo;s own voice. Where, when, who knew, who was hiding, and (importantly) what Shivanie was wearing.</p>
          </section>

          <div class="motif-strip" aria-hidden="true"></div>

          <section>
            <h2>Why a Tamil Wedding</h2>
            <p>Both of our families carry the Tamil tradition forward &mdash; through language, through prayer, through the food on our Sunday tables. Choosing a traditional Tamil wedding felt less like a decision and more like a homecoming. We want our marriage to begin the same way our parents&rsquo; and grandparents&rsquo; did: with the <em>mandap</em> (sacred wedding canopy), the <em>nadaswaram</em> (traditional South Indian wind instrument), and every aunty, uncle and cousin in the room.</p>
          </section>

          <div class="motif-strip" aria-hidden="true"></div>

          <section>
            <h2>What This Day Means to Us</h2>
            <p>This wedding is a thank-you. To our parents, who carried our cultures across oceans and kept them alive in Durban. To our families, who have loved us into the people we are today. And to each other &mdash; for choosing this, fully, together.</p>
          </section>
        </article>

        <p style="margin-top:var(--sp-8); text-align:center">
          <a href="#/celebration" class="btn">See the Celebration</a>
        </p>
      </div>
    </section>
  `;
}
