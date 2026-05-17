# Shivanie & Theo Wedding Website

The official site for Theo Naicker & Shivanie's three-day Tamil wedding — 17–19 December 2026, Durban + KZN North Coast. A hand-built, no-framework, ES-modules SPA designed around personalised invite links, per-event RSVPs, and a temple-inspired Tamil visual language. Hosts on Cloudflare Pages with a Google Sheet as the RSVP backend.

---

## Run locally

```bash
cd 06-Website
python3 -m http.server 8765
```

Then open **http://localhost:8765** in your browser.

(Any static file server works — `python3 -m http.server`, `npx serve`, `caddy file-server` — pick whichever you have.)

---

## Try a test invite

The prototype ships with a sample guest list. Try:

- **All three events** (the Naidoo family): http://localhost:8765/?i=K7M2QH
- The welcome banner should appear, and each event card on the home page should show a *You're invited* badge.

Other categories of invite (mehendi-only, ceremony-only, plus-one, bad code) live in `data/guests.json` — open the file to see codes and what they're invited to.

---

## Generate invite codes for the real guest list

```text
Open tools/generate-codes.html directly in your browser.
```

Paste the guest list (one party per row, with members and events-invited) into the textarea. Click **Generate**. Copy the resulting JSON into `data/guests.json` (back up the file first). Each party gets a unique 6-character Crockford-base32 code with a check character.

---

## View the admin dashboard

http://localhost:8765/admin/

Passphrase-gated client-side. Shows RSVP totals, party × event grid, and CSV / JSON export. In production, also pulls live data from the Google Sheet via the Apps Script `doGet` endpoint.

---

## File tree (brief)

```
06-Website/
├── index.html              SPA shell
├── css/                    Hand-authored design system (tokens → views)
├── js/
│   ├── app.js              Bootstrap + routes
│   ├── router.js           Hash router
│   ├── state.js            Pub/sub store
│   ├── guests.js           Invite-code system
│   ├── persist.js          localStorage + Apps Script POST
│   └── views/              One module per route
├── data/
│   ├── events.json         Three events
│   ├── venues.json         Three venues
│   └── guests.json         Parties + invite codes (kept private)
├── assets/                 Fonts, icons, motifs, photos
├── admin/                  Dashboard
├── tools/                  generate-codes.html
├── whatsapp-templates/     8 markdown templates for the couple
├── email-templates/        (out of scope v1 — see README inside)
└── docs/
    ├── SPEC.md             Master technical & functional spec
    ├── PRODUCTION.md       Going-live walkthrough + Apps Script source
    ├── CONTENT.md          Copy deck for every page
    └── ACCESSIBILITY.md    WCAG AA audit checklist
```

---

## Going live

Follow [`docs/PRODUCTION.md`](docs/PRODUCTION.md). End-to-end: ~90 minutes. Total cost: ~R200/year (Cloudflare-registered domain; everything else is free tier).

Short version:

1. Register `shivanieandtheo.co.za` via Cloudflare Registrar.
2. Push this repo to a private GitHub repo.
3. Create a Google Sheet with three tabs (Submissions / Parties / Live).
4. Paste the Apps Script `Code.gs` from `docs/PRODUCTION.md` and deploy as a Web app.
5. Paste the Web app URL into `js/persist.js` as `BACKEND_URL`.
6. Connect the GitHub repo to Cloudflare Pages (no build step; output dir `06-Website`).
7. Attach the custom domain in Pages.
8. Run the 5-category smoke test in `docs/SPEC.md` §13.
9. Send the Save the Date (`whatsapp-templates/01-save-the-date.md`).

---

## Documentation

- [`docs/SPEC.md`](docs/SPEC.md) — Architecture, data model, invite-code system, RSVP flow, go-live checklist.
- [`docs/PRODUCTION.md`](docs/PRODUCTION.md) — Step-by-step going-live walkthrough, including the full Apps Script source.
- [`docs/CONTENT.md`](docs/CONTENT.md) — Page-by-page copy deck for non-technical edits.
- [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) — WCAG AA audit checklist with computed contrast ratios.
- [`whatsapp-templates/`](whatsapp-templates/) — 8 copy-paste templates: Save the Date → Thank You.
