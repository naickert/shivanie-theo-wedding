/* FAQ */

export async function render(root) {
  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">Everything you might be wondering</span>
          <h1 class="page-header__title">Frequently Asked Questions</h1>
          <p class="page-header__lead">If your question isn&rsquo;t here, please reach out &mdash; we&rsquo;d much rather you ask than guess.</p>
        </header>

        <details class="faq-item">
          <summary>What should I wear to each event?</summary>
          <div class="faq-item__body">
            <p><strong>Day 1 (Mehendi):</strong> light cottons in festive colours; avoid white and anything you&rsquo;d hate to stain with henna. Flat shoes for floor seating.</p>
            <p><strong>Day 2 (Nalangu &amp; Sangeeth):</strong> traditional or semi-formal Indian &mdash; sarees, lehengas, kurtas, sherwanis. A formal suit or smart cocktail dress works too. Colour, not black or white.</p>
            <p><strong>Day 3 (Wedding &amp; Reception):</strong> formal Indian or formal Western. Silks, sarees, sherwanis, suits, formal dresses. Jewel tones photograph beautifully.</p>
          </div>
        </details>

        <details class="faq-item">
          <summary>Can I bring a plus-one?</summary>
          <div class="faq-item__body">Please check your personalised invitation link &mdash; it will show the exact number of seats reserved in your name. We&rsquo;ve had to set a 200-guest hard cap for the wedding day, so we&rsquo;re sadly unable to extend plus-ones beyond what&rsquo;s listed.</div>
        </details>

        <details class="faq-item">
          <summary>Are children welcome?</summary>
          <div class="faq-item__body">Yes &mdash; children are warmly welcome. Please include them in your RSVP so we can plan for kid-friendly meals and seating.</div>
        </details>

        <details class="faq-item">
          <summary>I have a dietary requirement &mdash; will I be okay?</summary>
          <div class="faq-item__body">The reception is fully vegetarian, which covers most diets by default. Please flag allergies, vegan, Jain, gluten-free or any other requirements in your RSVP and we&rsquo;ll arrange with the kitchen.</div>
        </details>

        <details class="faq-item">
          <summary>What language is the ceremony in?</summary>
          <div class="faq-item__body">The rituals themselves are conducted in Sanskrit and Tamil, as tradition requires. A friendly English narration runs alongside so every guest knows exactly what&rsquo;s happening at each stage &mdash; no prior knowledge needed.</div>
        </details>

        <details class="faq-item">
          <summary>How do I RSVP?</summary>
          <div class="faq-item__body">Click the personalised invitation link we sent you (or open the original message and tap the link). It opens an RSVP form pre-filled with your party&rsquo;s names. If you can&rsquo;t find the link, please get in touch and we&rsquo;ll resend.</div>
        </details>

        <details class="faq-item">
          <summary>When is the RSVP deadline?</summary>
          <div class="faq-item__body"><strong>31 October 2026.</strong> Final headcounts go to the caterers shortly after.</div>
        </details>

        <details class="faq-item">
          <summary>Can I update my RSVP later?</summary>
          <div class="faq-item__body">Yes &mdash; just return to the same personalised invitation link and submit again. Your most recent submission wins.</div>
        </details>

        <details class="faq-item">
          <summary>What&rsquo;s your gift policy?</summary>
          <div class="faq-item__body">Honestly, your presence is the gift. If you&rsquo;d still like to mark the day, cards and envelopes are warmly received. Please no fresh flowers &mdash; the families will have plenty already. See the <a href="#/registry">registry page</a> for our honeymoon fund.</div>
        </details>

        <details class="faq-item">
          <summary>Will there be photos to share afterwards?</summary>
          <div class="faq-item__body">Yes &mdash; a private gallery link will be shared with all confirmed guests after the wedding.</div>
        </details>

        <details class="faq-item">
          <summary>What about parking?</summary>
          <div class="faq-item__body"><strong>Kendra Hall</strong> has on-site and street parking; arrive a touch early on a Friday evening. <strong>Maroupi</strong> has ample on-site parking with a guided arrival lane. For the Day 1 Mehendi at the bride&rsquo;s home, please carpool where possible.</div>
        </details>

        <details class="faq-item">
          <summary>What&rsquo;s the wet-weather plan?</summary>
          <div class="faq-item__body">Day 3&rsquo;s ceremony is outdoors in the Maroupi gardens, but a fully covered marquee and an indoor pivot are on standby. The ceremony starts on time, rain or shine. The reception is always indoors.</div>
        </details>

        <details class="faq-item">
          <summary>Will there be an open bar?</summary>
          <div class="faq-item__body">Yes &mdash; open bar at Day 2 (Nalangu &amp; Sangeeth) and Day 3 (Wedding &amp; Reception). Day 1 (Mehendi) is a softer, family afternoon with soft drinks, tea and refreshments.</div>
        </details>

        <details class="faq-item">
          <summary>Who do I contact if I have a question?</summary>
          <div class="faq-item__body">Please reach out to our wedding planner: [TODO: confirm planner contact &mdash; name, WhatsApp number, email]. For anything urgent or personal, feel free to message Shivanie or Theo directly.</div>
        </details>

        <p style="margin-top:var(--sp-8); text-align:center">
          <a href="#/rsvp" class="btn">RSVP</a>
          <a href="#/travel" class="btn btn--outline" style="margin-left:var(--sp-3)">Travel &amp; Stay</a>
        </p>
      </div>
    </section>
  `;
}
