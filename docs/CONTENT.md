# Content Copy Deck

A plain-language record of every page's user-facing copy. Use this for non-technical edits — change here, then update the matching `js/views/*.js` file.

When in doubt, this document is the *intended* copy; the code is the *implemented* copy. If they disagree, the code wins for the user — but the intent here should drive the fix.

> **House style.** South African English. Tamil/Sanskrit terms italicised on first use with a brief English gloss in brackets — e.g. *mandap* (sacred wedding canopy). Bilingual chrome (Tamil script alongside English) on key labels and the hero. Warm, personal, never corporate.

---

## Site chrome

### Header
- Brand monogram: `T & S` (gold ampersand)
- Nav links: Home · Our Story · Celebration · Culture · Travel · FAQ · *RSVP* (button)

### Welcome banner (only when invite code resolves)
- Greeting: `Vanakkam,` *(Tamil greeting — "welcome / hello")*
- Party name: `{{party_name}}`
- CTA: `Open your invitation ›`

### Footer
- Monogram + tagline: *Made with love — அன்புடன்*
- Hashtag: `#ShivanieAndTheo2026`
- Date line: `Saturday, 19 December 2026 · Durban, South Africa`

---

## Home (`#/`)

### Hero
- Eyebrow: `Save the Date — 17–19 December 2026`
- Title: `Shivanie & Theo` (with ornamental ampersand)
- Date line: `Saturday, 19 December 2026` + Tamil `டிசம்பர் 19, 2026 சனிக்கிழமை`
- Location line: `Durban · KZN North Coast · South Africa`
- CTAs: *Open Your Invitation* / *RSVP* (state-dependent) + *View the Celebration*
- Countdown: days / hours / mins until 15:00 SAST on 19 Dec 2026

### Three-day overview (cards)
1. **Day 1 — Thursday · Mehendi** (மருதாணி) · 17 December 2026 · Bride's home, Durban
   > "An intimate evening of laughter, song and the slow art of henna being drawn across the bride's hands and feet."
2. **Day 2 — Friday · Nalangu & Sangeeth** (நலங்கு) · 18 December 2026 · Kendra Hall, Greyville
   > "A night for both families to come together — first through playful games, then a music & dance night that runs long."
3. **Day 3 — Saturday · Wedding & Reception** (திருமணம்) · 19 December 2026 · Maroupi, Umhlali
   > "The wedding itself — a sacred one-hour Tamil ceremony beneath a flower-laden *mandap*, followed by feast and dance."

### Closing block
- "For our guests joining a Tamil wedding for the first time"
- "Welcome — here is a gentle map to what you'll experience. Tamil weddings are sacred, joyful, slightly chaotic in the best way, and built on the idea that a marriage joins not just two people but two families and the generations on either side."
- CTA: *Read the Cultural Guide*

---

## Our Story (`#/story`)

### Page header
- Eyebrow: `Shivanie & Theo`
- Title: `Our Story`
- Lead: *A long way around to the same Sunday lunch table.*

### Sections (with TODOs)
1. **How We Met** — `[TODO: confirm with couple]` short, warm paragraph: first time their paths crossed, where, what year, the small ordinary moment they both remember.
2. **The Proposal** — `[TODO: confirm with couple]` proposal story in the couple's voice: where, when, who knew, who was hiding, what Shivanie was wearing.
3. **Why a Tamil Wedding** — written. "Both of our families carry the Tamil tradition forward — through language, through prayer, through the food on our Sunday tables. Choosing a three-day Tamil wedding felt less like a decision and more like a homecoming…"
4. **What This Day Means to Us** — written. "This wedding is a thank-you…"

CTA at bottom: *See the three days* → `#/celebration`

---

## Celebration (`#/celebration`)

### Page header
- Eyebrow: `Three Days. Three Venues. One Family.`
- Title: `The Celebration`
- Lead: "A Tamil wedding is not a single afternoon — it is a slow gathering of family across several days, each with its own rituals, its own dress code, and its own kind of joy. Here is the shape of ours."

### Three event cards (deeper than home page)

1. **Mehendi** — "An intimate, female-centred afternoon of song, sweets and the slow art of *mehendi* (henna) being drawn across the bride's hands and feet. The deeper the colour, the longer the love — or so the aunties insist."
2. **Nalangu & Sangeeth** — "First, *nalangu* (family games) — rolling coconuts, hiding rings in turmeric water, two families teasing each other into one. Then *sangeeth* — choreography, surprise performances and a dance floor that doesn't close until very late."
3. **Wedding & Reception** — "The wedding itself — a one-hour Tamil ceremony beneath a flower-laden *mandap* (sacred canopy) in the Maroupi gardens, with the *muhurtham* (auspicious moment) at 15:15. Followed by a vegetarian feast and dancing indoors."

### Footer block
- "Not sure which days you're invited to? Open your personalised invitation link — the events you're invited to will be marked."
- CTAs: *Open Your Invitation* / *RSVP* + *Cultural Guide*

---

## Event detail — Mehendi (`#/events/mehendi`)

Essentials to cover (when the stub is fleshed out):

- Thursday 17 December 2026, full day (family from 09:00; non-family lady guests from 14:00).
- Venue: bride's home, Durban. Address **only shown if the resolved party is invited**.
- Tone: female-led, joyful, lots of singing, music, sweets, henna.
- Dress code: festive Indian; light cottons; loose sleeves for henna.
- What happens: bride's hands and feet receive intricate *mehendi*; guests get smaller designs; food and song run all afternoon; ends as the sun goes down.
- Practical: street parking; carpool encouraged. Children welcome. Vegetarian food.

---

## Event detail — Nalangu & Sangeeth (`#/events/nalangu`)

Essentials to cover:

- Friday 18 December 2026, 17:00–01:00.
- Venue: Kendra Hall, 5 John Zikhali Road, Greyville, Durban (with maps link).
- Tone: family bonding games (*nalangu*) → music night (*sangeeth*) → dance floor till late.
- Dress code: semi-formal Indian; sarees, lehengas, kurtas, sherwanis. Dancing shoes.
- Run of show: 17:00 arrivals, 18:00 *nalangu* games (coconut rolling, turmeric ring hunt, teasing rituals), 19:30 *sangeeth* performances by family, 20:00 dinner, dance floor 21:00–late.
- Practical: on-site + street parking; bar open; vegetarian food; lift to main hall.

---

## Event detail — Wedding & Reception (`#/events/ceremony`)

Essentials to cover:

- Saturday 19 December 2026, 14:00 arrivals; **ceremony 15:00 sharp**; reception runs to 23:00.
- Venue: Maroupi Wedding Venue, ~2 km outside Umhlali, KZN North Coast (with maps link).
- Tone: sacred ceremony outdoors under a *mandap* → cocktails on the lawn → indoor feast → dance floor.
- Dress code: formal Indian (saree, lehenga, kurta, sherwani) or formal Western. Kanjivaram silks encouraged. Comfortable shoes (the ceremony is on grass).
- Weather: hot Durban summer, possibility of late-afternoon showers. Wet-weather backup plan in place. Sun cover and water at the lawn.
- Run of show: 14:00 arrivals & seating, 15:00 *muhurtham* and ceremony rituals (~60 min), 16:00 cocktails & photos, 18:30 reception dinner, 20:00 speeches & first dance, 21:00 dance floor open, 23:00 close.
- Practical: ample on-site parking with guided arrival lane; single-level indoor reception; vegetarian feast; open bar.

---

## Cultural Guide (`#/culture`)

Suggested structure (when the stub is fleshed out):

1. **A gentle welcome** — one paragraph for non-Tamil guests: what to expect at a Tamil wedding, how to participate, how not to worry.
2. **The three days at a glance** — a one-line summary per day in plain English.
3. **Glossary** — alphabetical list of terms guests will hear:
   - *Mandap* — the four-pillared sacred canopy where the ceremony takes place.
   - *Muhurtham* — the auspicious moment, calculated by the priest, when the central rite is performed.
   - *Mehendi* — henna; both the substance and the pre-wedding ceremony.
   - *Nadaswaram* — long South Indian double-reed wind instrument; the sound of a Tamil wedding.
   - *Nalangu* — pre-wedding family games that bond the two sides.
   - *Sangeeth* — the music-and-dance night.
   - *Thali* — the sacred necklace tied around the bride's neck (the moment that legally and ritually marries the couple in Tamil tradition).
   - *Kanjivaram* — South Indian silk saree, often the bridal choice.
   - *Vanakkam* — greeting; hello / welcome.
4. **What to do (and not do)** — when to stand, when to throw rice, when not to take flash photos, when to put your phone away entirely.
5. **Children** — yes, always. There will be space for them, food they can eat, and aunties who will absorb them.
6. **Food** — fully vegetarian across all three days, in keeping with Tamil tradition. Wide range — please tell us about allergies on the RSVP.
7. **Gifts** — see `#/registry`. Cash and cheques (in red envelopes for luck) are the most traditional Tamil gift.

---

## Travel (`#/travel`)

Essentials to cover (when the stub is fleshed out):

- **Getting to Durban** — King Shaka International (DUR) is the main airport. Direct flights from JNB (~1h), CPT (~2h), and most major international hubs via JNB.
- **Where to stay**
  - *Durban (for Mehendi + Nalangu):* recommendations near Berea / Morningside.
  - *Umhlali / Ballito (for the wedding):* recommendations within 10 min of Maroupi.
- **Transfers** — Uber and Bolt work well in Durban and Umhlali. Consider arranging a shared car from Durban → Umhlali on Saturday afternoon (carpool sheet TBC).
- **Weather** — hot, humid Durban summer. Daytime 28–32°C. Possibility of late-afternoon showers (we have a wet-weather plan). Bring sunscreen, water, a hat.
- **What to pack** — three outfits (one per event), comfortable shoes for grass, a light shawl for indoor air-con.
- **Power** — South African plug (Type M, 3-round-pin) and Type N. Bring an adapter.
- **Currency** — South African Rand (ZAR). Cards accepted almost everywhere; cash useful for tipping.

---

## FAQ (`#/faq`)

Suggested list (when the stub is fleshed out):

1. **Can I bring a plus-one?** Only if your invitation says so. Each party's invitation is tailored — please don't add guests without checking with us first.
2. **Are children invited?** Yes, always — every guest in your party is invited. If you'd like to bring extras, please ask.
3. **What if I can only attend one event?** Totally fine. Mark only the events you can attend on the RSVP — no explanation needed.
4. **What should I wear?** See each event page for the specific dress code. Short version: festive Indian (Thursday), semi-formal Indian (Friday), formal Indian or Western (Saturday).
5. **Is the ceremony indoors or outdoors?** Outdoors on grass. Wear comfortable shoes. We have a wet-weather plan.
6. **Is the food vegetarian?** Yes — all three days are fully vegetarian, in keeping with Tamil tradition. Wide variety; please tell us about allergies on your RSVP.
7. **Is there an open bar?** Yes, Friday and Saturday. Soft bar only on Thursday.
8. **Can I take photos?** Yes — but please put phones away during the ceremony itself (we have a professional photographer covering it). Tag posts with **#ShivanieAndTheo2026**.
9. **Where do I send a gift?** See the registry page. Cash gifts in red envelopes are the most traditional option for Tamil weddings.
10. **What time should I arrive?** Each day-of WhatsApp message will tell you. Short version: Saturday 14:00 sharp (ceremony 15:00).
11. **What if I have a dietary requirement?** Note it on the RSVP form — we'll pass it on to the caterer.
12. **What's the deadline to RSVP?** **Sunday 8 November 2026.**

---

## Registry (`#/registry`)

Essentials:

- "Your presence is the gift" — sincere line about the day not needing anything else.
- Cash / cheque gifts (red envelope tradition): preferred for Tamil weddings.
- (Optional) a single physical-gift target — e.g. a honeymoon fund link, or a specific cause the couple supports.
- Bank details: *not* displayed publicly — shared on request via WhatsApp.

---

## RSVP (`#/rsvp`)

The form itself is interactive — see `SPEC.md` §8 for the full UX. Copy elements:

- Title: `RSVP`
- Sub-line: `We need your reply by Sunday 8 November 2026.`
- Per-event section heading format: `{{Event name}} — {{Day, DD Month}}`
- Per-guest row: `{{First Name}}` + Yes/No toggle + dietary text input
- Message field label: `A message for Shivanie & Theo (optional)`
- Song request label: `A song to get you on the dance floor (optional)`
- Submit button: `Send our reply`
- Auto-save indicator: `Saved — you can close this tab and come back any time.`

---

## Thanks (`#/thanks`)

- Title: `Thank you!`
- Body: `We've received your reply and can't wait to celebrate with you. We'll send a final logistics message a week before the wedding.`
- CTAs: *Back to home* / *Read the Cultural Guide*

---

## Not invited (`#/not-invited`)

- Title: `We don't recognise this link`
- Body: "Sorry — we couldn't find an invitation matching that link. If you think this is a mistake, please WhatsApp Theo on `{{theo_number}}` and we'll sort it out."
- CTA: *Back to home*
