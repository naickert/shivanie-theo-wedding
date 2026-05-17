# Accessibility Audit Checklist

Target: **WCAG 2.1 AA**. Lighthouse Accessibility score ≥ **95** on home, RSVP, and event detail pages.

Use this document as a pre-launch audit. Each item is a checkbox — if you can't tick it, fix it before going live.

---

## 1. Colour contrast

All body text on the cream background (`--c-cream: #F5E6D3`) must meet contrast ratio ≥ 4.5:1 for body text (≥ 3:1 for large text ≥ 18.66px/24px+ or ≥ 14px/18.66px+ **and** bold).

Computed ratios for the palette pairs we actually use:

| Foreground | Background | Ratio | Use | Pass? |
|---|---|---|---|---|
| `--c-ink` #1A1A1A | `--c-cream` #F5E6D3 | **14.4:1** | Body text | Yes (AAA) |
| `--c-ink-soft` #4A4A4A | `--c-cream` #F5E6D3 | **8.0:1** | Secondary text | Yes (AAA) |
| `--c-ink-muted` #767676 | `--c-cream` #F5E6D3 | **4.4:1** | Captions (large only) | Borderline — only use ≥ 18.66px |
| `--c-red` #8B1538 | `--c-cream` #F5E6D3 | **7.5:1** | Headings, CTA buttons (white text on red), links | Yes |
| white #FFFFFF | `--c-red` #8B1538 | **8.9:1** | Button label on red CTA | Yes (AAA) |
| `--c-peacock` #1B4965 | `--c-cream` #F5E6D3 | **8.7:1** | Secondary links | Yes (AAA) |
| `--c-gold-dark` #9E821C | `--c-cream` #F5E6D3 | **3.5:1** | Focus ring, decorative captions ≥ 18.66px | Large/decorative only |
| `--c-gold` #D4AF37 | `--c-cream` #F5E6D3 | **2.1:1** | **DECORATIVE ONLY** — never use for text | Decorative only |
| `--c-error` #A12A2A | `--c-cream` #F5E6D3 | **6.6:1** | Error messages | Yes |
| `--c-success` #2D5016 | `--c-cream` #F5E6D3 | **9.6:1** | Success messages | Yes (AAA) |

**Rules of thumb:**

- Gold (`--c-gold` #D4AF37) is for **motifs, borders, ornamental dividers, decorative numerals**. Never use it for text that a user must read to use the site.
- Focus rings use `--c-gold-dark` #9E821C at ≥ 2px, which renders sufficiently visible on cream.
- If you find yourself wanting "gold text on cream" for emphasis, use red instead.

- [ ] Run an automated contrast check (axe DevTools / Lighthouse) — zero contrast violations.
- [ ] Manually inspect any view where text overlays a photo — add a tint or text-shadow if contrast fails.

---

## 2. Tap targets

All interactive elements (buttons, links, form controls, nav items) must be ≥ **44 × 44 px** on touch screens.

- [ ] Header nav links — verify with DevTools device emulation (iPhone SE viewport).
- [ ] Mobile nav toggle button — confirm at least 48 × 48 px hit area.
- [ ] RSVP form Yes/No toggles per guest per event — segmented controls ≥ 44 px tall.
- [ ] Submit button — ≥ 48 px tall.
- [ ] Footer links — spacing ≥ 8 px between adjacent links, height ≥ 44 px including padding.
- [ ] Welcome-banner CTA — ≥ 44 px tall.

---

## 3. Form input sizing

iOS Safari auto-zooms into form fields when the font-size is < 16px. To prevent this:

- [ ] All `<input>`, `<textarea>`, `<select>` have `font-size: 16px` minimum (CSS).
- [ ] Test on a real iPhone: tapping the RSVP message field must **not** auto-zoom.
- [ ] Labels are visibly associated with inputs (`<label for="...">` + matching id).
- [ ] Required fields marked with `aria-required="true"` and a visible asterisk.

---

## 4. Keyboard navigation

The whole site must be operable with the keyboard alone — no mouse.

- [ ] **Skip link** is the first focusable element and visible when focused. Activating it moves focus into `#main`.
- [ ] Tab order is logical: skip link → header brand → nav items → main content → footer.
- [ ] Mobile nav toggle is reachable by Tab and toggles with Enter/Space. `aria-expanded` flips correctly.
- [ ] **Esc** closes the mobile nav.
- [ ] All event cards, "Read more" links, and RSVP form controls reachable by Tab.
- [ ] RSVP form: Tab moves down the field order; Enter submits from the message field doesn't accidentally fire (use a real submit button).
- [ ] Admin dashboard passphrase field, totals tiles, and export buttons all reachable by keyboard.

---

## 5. Focus visibility

- [ ] Every focusable element has a **visible** focus ring (≥ 2px, `--c-gold-dark` colour, ≥ 2px offset).
- [ ] Focus ring is never removed without a replacement (no `outline: none` without a `box-shadow` substitute).
- [ ] Test in Safari (which has its own default focus ring) and Chrome (which uses our custom one).

---

## 6. Screen readers

Tested with **VoiceOver (macOS + iOS)** and **TalkBack (Android)**.

- [ ] All images have meaningful `alt` text, or `alt=""` if purely decorative.
- [ ] Decorative SVG motifs (`assets/motifs/*`) have `aria-hidden="true"`.
- [ ] The view container `<div id="view">` has `aria-live="polite"` so route changes are announced.
- [ ] Welcome banner uses semantic HTML and announces the party name when revealed.
- [ ] RSVP form has fieldset/legend per event (or `role="group"` + `aria-labelledby`).
- [ ] Validation errors announced via `aria-live="assertive"` and visually associated with the offending field.
- [ ] Submit success / failure notices use `role="status"` (polite) and `role="alert"` (assertive) appropriately.
- [ ] Tamil-script text marked `lang="ta"` so screen readers don't read it as garbled English.
- [ ] All buttons have a real label (visible text or `aria-label`) — no icon-only buttons without labels.

---

## 7. Semantic structure

- [ ] Single `<h1>` per view (the page title in the page-header).
- [ ] Heading levels in order: `<h1>` → `<h2>` → `<h3>` (no skips, no levels used for styling only).
- [ ] Real `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`, `<section>` elements (not generic `<div>`).
- [ ] Navigation has `aria-label="Primary"`.
- [ ] Active nav item has `aria-current="page"`.
- [ ] Lists are real `<ul>` / `<ol>` (not styled divs).

---

## 8. Motion

- [ ] `@media (prefers-reduced-motion: reduce)` rule in `tokens.css` disables CSS transitions/animations.
- [ ] The countdown ticker checks `matchMedia('(prefers-reduced-motion: reduce)')` — when set, the countdown updates **on page load only**, not on the 30-second interval.
- [ ] Any scroll-triggered or hover-triggered motion is opt-in only when reduced-motion is *not* set.

---

## 9. Mobile / responsive

- [ ] Site is usable at **320 px viewport width** (iPhone SE 1st gen).
- [ ] No horizontal scroll at any breakpoint.
- [ ] Text reflows; never overflows containers.
- [ ] Images use `max-width: 100%; height: auto`.
- [ ] Tested in real Safari iOS, Chrome Android, Safari macOS, Chrome desktop, Firefox desktop. (Edge desktop is Chromium — covered by Chrome desktop.)

---

## 10. Language & internationalisation

- [ ] `<html lang="en">` on the root.
- [ ] Tamil-script content has `lang="ta"`.
- [ ] Date formats are South African English: `19 December 2026`, `2026-12-19`, **never** `12/19/2026`.
- [ ] Currency in ZAR if shown.
- [ ] Phone numbers in international format (`+27 …`).

---

## 11. Privacy & robots

- [ ] `<meta name="robots" content="noindex, nofollow">` in `index.html`.
- [ ] `robots.txt` contains `Disallow: /`.
- [ ] No third-party trackers loaded (no Google Analytics, no Facebook Pixel).
- [ ] Fonts in production are self-hosted (no Google Fonts CDN call that leaks IPs).

---

## 12. Performance (overlaps with a11y for low-end devices)

- [ ] No render-blocking JS in the head.
- [ ] CSS files are split and load in priority order (tokens → base → layout → components → views).
- [ ] Hero image is `loading="eager"` and dimensioned; other images `loading="lazy"`.
- [ ] No CLS from late-loading custom fonts (use `font-display: swap`).
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO N/A (noindex).

---

## 13. Pre-launch sign-off

- [ ] All boxes above ticked.
- [ ] Lighthouse Accessibility ≥ 95 on home, RSVP, event-ceremony.
- [ ] axe DevTools: zero critical / serious issues.
- [ ] Manual VoiceOver pass on the home page and RSVP form (someone other than the developer).
- [ ] Submitted by a guest on a real iPhone and a real Android — no surprises.
