/* Cultural Guide — Tamil ritual primer */

export async function render(root) {
  root.innerHTML = `
    <section class="section">
      <div class="container container--text">
        <header class="page-header">
          <span class="page-header__eyebrow">For our friends, colleagues and chosen family</span>
          <h1 class="page-header__title">A Tamil Wedding, Gently Explained</h1>
          <p class="page-header__lead">No prior knowledge required. Just show up, sit warmly, and let the day carry you.</p>
        </header>

        <h2>What is a Tamil Wedding?</h2>
        <p>A Tamil wedding is one of the oldest continuously practised wedding traditions in the world &mdash; brought to South Africa by indentured Tamil families arriving on the KZN coast from the 1860s onward. It is sacred, joyful, and slightly chaotic in the best way. The day is built on the idea that a marriage doesn&rsquo;t join just two people: it joins two families, and the generations on either side of them.</p>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>A small glossary</h2>
        <ul class="glossary">
          <li><dt>Mehendi</dt><dd>Ceremonial henna applied to the bride&rsquo;s hands and feet.</dd></li>
          <li><dt>Nalangu</dt><dd>Playful games between the bride, groom and both families.</dd></li>
          <li><dt>Sangeeth</dt><dd>The pre-wedding music and dance celebration.</dd></li>
          <li><dt>Mandap</dt><dd>The four-pillared sacred canopy under which the ceremony takes place.</dd></li>
          <li><dt>Havan</dt><dd>The sacred fire that witnesses the marriage vows.</dd></li>
          <li><dt>Muhurtham</dt><dd>The astrologically auspicious moment of the marriage.</dd></li>
          <li><dt>Thaali</dt><dd>The sacred pendant the groom ties around the bride&rsquo;s neck &mdash; equivalent to a wedding ring.</dd></li>
          <li><dt>Saptapadi</dt><dd>Seven steps the couple take around the fire, each one a vow.</dd></li>
          <li><dt>Kanyadaanam</dt><dd>The gifting of the bride by her father.</dd></li>
          <li><dt>Nadaswaram</dt><dd>Traditional South Indian wind instrument that accompanies key ritual moments.</dd></li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>The Ten Stages of the Ceremony</h2>
        <ol class="stack">
          <li><strong><em>Ganapathi Pooja</em></strong> &mdash; an opening prayer to Ganesha, who removes obstacles, so the ceremony begins clean.</li>
          <li><strong>Groom&rsquo;s arrival &amp; <em>Pada Pooja</em></strong> &mdash; the bride&rsquo;s family formally welcomes the groom, washing his feet as a mark of honour.</li>
          <li><strong><em>Maalai Maatral</em></strong> &mdash; the bride and groom exchange flower garlands three times, signalling mutual acceptance.</li>
          <li><strong><em>Muhurtham</em> &amp; <em>Thaali</em></strong> &mdash; at the precise auspicious moment, the groom ties the sacred <em>thaali</em> around the bride&rsquo;s neck. This is the marriage.</li>
          <li><strong><em>Kanyadaanam</em></strong> &mdash; the bride&rsquo;s father formally gives her hand in marriage.</li>
          <li><strong><em>Saptapadi</em></strong> &mdash; seven steps around the fire, each a vow: food, strength, prosperity, wisdom, family, health, lifelong friendship.</li>
          <li><strong><em>Ammi Midhithal</em></strong> &mdash; the groom guides the bride to step on a grinding stone, a symbol of steadfastness in the marriage.</li>
          <li><strong><em>Arundhati Nakshatram</em></strong> &mdash; the couple look together at the star Arundhati, an emblem of devotion.</li>
          <li><strong><em>Laja Homam</em></strong> &mdash; puffed rice is offered into the sacred fire by the bride and her brother for prosperity.</li>
          <li><strong><em>Ashirvadham</em></strong> &mdash; elders bless the couple, marking the end of the formal rituals.</li>
        </ol>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Etiquette tips</h2>
        <ul>
          <li><strong>Arrive on time.</strong> The <em>muhurtham</em> is set to an astrological minute &mdash; the ceremony will not wait.</li>
          <li><strong>Photography is welcome.</strong> Take all the photos you like, just please don&rsquo;t step in front of the official photographer or onto the <em>mandap</em>.</li>
          <li><strong>Dress respectfully for the ceremony.</strong> Shoulders covered for the ceremony itself. The reception is more relaxed.</li>
          <li><strong>The reception is vegetarian.</strong> Trust us &mdash; you won&rsquo;t miss the meat.</li>
          <li><strong>Gifts</strong> &mdash; cards and envelopes are warmly received. Please no fresh flowers; the families will have plenty already.</li>
        </ul>

        <div class="motif-strip" aria-hidden="true"></div>

        <h2>Common questions</h2>
        <details class="faq-item">
          <summary>Do I need to participate in the rituals?</summary>
          <div class="faq-item__body">Not at all. Sit, watch, take it in. There are moments where guests are invited to throw rice or rose petals &mdash; if so, the MC will guide you.</div>
        </details>
        <details class="faq-item">
          <summary>Can I take photos?</summary>
          <div class="faq-item__body">Yes, please do &mdash; from your seat. Just leave the <em>mandap</em> and the official photographer&rsquo;s sightlines clear during the ceremony itself.</div>
        </details>
        <details class="faq-item">
          <summary>Is alcohol served?</summary>
          <div class="faq-item__body">No alcohol during the ceremony itself, which is a sacred ritual. An open bar runs at the Friday Sangeeth and at the Saturday reception.</div>
        </details>
        <details class="faq-item">
          <summary>How long is the ceremony?</summary>
          <div class="faq-item__body">About one hour, from 15:00 to roughly 16:00. The <em>muhurtham</em> &mdash; the marriage moment itself &mdash; is at 15:15.</div>
        </details>

        <p style="margin-top:var(--sp-8); text-align:center">
          <a href="#/celebration" class="btn">Back to the three days</a>
          <a href="#/faq" class="btn btn--outline" style="margin-left:var(--sp-3)">All FAQs</a>
        </p>
      </div>
    </section>
  `;
}
