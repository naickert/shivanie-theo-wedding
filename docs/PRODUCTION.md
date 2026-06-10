# Going Live — Production Walkthrough

This guide takes the prototype from "running on my laptop" to "live at https://shivanieandtheo.co.za". Total time: ~90 minutes.

---

## 0. Backend choice — why Google Apps Script + Sheet

We chose a Google Sheet (with an Apps Script `doPost` handler) as the RSVP backend over the alternatives. Here is the trade-off table.

| Option | Cost | Setup | Owner-controlled? | CSV export | Notes |
|---|---|---|---|---|---|
| **Google Apps Script + Sheet** | Free | 20 min | Yes | Trivial (built into Sheets) | Chosen |
| Airtable | Free tier, then $20/mo | 15 min | Yes | Yes | Free tier limits get tight near the wedding |
| Supabase | Free tier | 60 min | Yes | Yes | Overkill for ~200 rows; needs schema migrations |
| Firebase | Free tier | 60 min | Yes | Awkward | Anti-pattern for a flat list |
| Cloudflare D1 + Worker | Free tier | 90 min | Yes | Yes | Adds a Worker we'd otherwise not need |
| Formspree / Tally | Free tier | 5 min | No (data on their server) | Yes | Vendor lock-in; harder to mutate later |
| Email-only | Free | 0 min | Yes | Manual transcribe | Inevitable mistakes at scale |

Apps Script wins because: it's owned by us, it's free for our volume, the Sheet *is* the CSV (no export step needed), and the couple can hand the Sheet to a planner without granting any developer access.

---

## 1. Create the Google Sheet

1. Go to **sheets.google.com** → New blank sheet → name it `Shivanie & Theo RSVPs`.
2. You don't need to create any columns by hand. The **`Submissions`** tab and its header row are **created automatically on the first RSVP** by the script. The `Parties` and `Live` tabs below are **optional**.

### Tab 1 — `Submissions` (auto-created; append-only history)

For reference, the script writes these columns (one row per submit, append-only — the **latest row per code is the current answer**):

| # | Header | Example |
|---|---|---|
| A | `submitted_at` | `2026-11-02T18:44:12.000Z` |
| B | `invite_code` | `K7M2QHX3PV` |
| C | `party_name` | `The Naidoo Family` |
| D | `invited_count` | `4` |
| E | `mehendi_status` | `no` |
| F | `mehendi_count` | `0` |
| G | `nalangu_status` | `yes` |
| H | `nalangu_count` | `3` |
| I | `ceremony_status` | `yes` |
| J | `ceremony_count` | `4` |
| K | `peak_headcount` | `4` |
| L | `dietary_summary` | `nalangu: vegetarian` |
| M | `song_requests` | `Why This Kolaveri Di` |
| N | `notes` | `ceremony: wheelchair ramp at the lawn` |
| O | `payload_json` | `{...full JSON audit trail...}` |
| P | `user_agent` | `Mozilla/5.0 ...` |

### Tab 2 — `Parties` — STRONGLY RECOMMENDED (junk rejection)

Populate this tab so the backend **rejects submissions from codes not on your guest list**. The `/exec` endpoint is necessarily public (the static site must POST to it), so without this list anyone who discovers the URL can write junk rows. If the tab exists and has rows, the script checks the posted `invite_code` against **column A** and rejects unknown ones; if the tab is absent or empty, all submissions are accepted. Mirror it from `data/guests.json`:

| Column | Header | Example |
|---|---|---|
| A | `invite_code` | `K7M2QHX3PV` |
| B | `party_name` | `Naidoo family` |
| C | `household` | `Naidoo` |
| D | `headcount` | `3` |
| E | `events_invited` | `mehendi,nalangu,ceremony` |
| F | `plus_one_allowed` | `FALSE` |
| G | `phone` | `+27 82 555 0123` |
| H | `notes_internal` | `Theo's first cousin` |

You can paste this in by hand or generate it from `data/guests.json` using a simple `node` one-liner. Apps Script validates against column A on submit.

### Tab 3 — `Live` — OPTIONAL (not required)

Build this tab if you'd like a formula-driven latest-per-code view inside the Sheet itself. (The script deliberately has **no `doGet`** — a public read endpoint would let anyone dump guest RSVP data — so the Sheet is where you review responses.) Suggested formulas (row 2 of each column, fill down):

- A: `=Parties!A2` (invite_code)
- B: `=Parties!B2` (party_name)
- C: `=IFERROR(MAX(FILTER(Submissions!A:A, Submissions!B:B=A2)), "")` — latest submitted_at
- D: `=IFERROR(VLOOKUP(A2, SORT(Submissions!B:G, 1, FALSE), 4, FALSE), 0)` — mehendi_yes from latest
- E, F, G: similar for nalangu / ceremony / overall yes
- H: `=IF(C2="", "Pending", "Received")`

(Exact formulas depend on the Sheets locale — adjust separators if you're in a comma-locale.)

---

## 2. Deploy the Apps Script

1. In the Sheet → **Extensions** → **Apps Script**. A new tab opens.
2. Delete the placeholder `myFunction`.
3. Paste the **entire contents of [`tools/apps-script/Code.gs`](../tools/apps-script/Code.gs)** — that is the maintained, payload-correct source (it matches the `events`-map the site actually sends and auto-creates the `Submissions` tab + headers on first submit). The block reproduced below is kept only for reference.
4. Click **Deploy** → **New deployment** → cog → **Web app**.
5. Description: `RSVP receiver v1`.
6. Execute as: **Me (your-email@gmail.com)**.
7. Who has access: **Anyone**.
8. Click **Deploy**. Authorise the script when prompted. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).

### `Code.gs` — full source

```javascript
// Shivanie & Theo wedding — RSVP receiver (Google Apps Script Web App)
// Matches the REAL client payload (events MAP) from js/views/rsvp.js -> js/persist.js.
// Authoritative copy: tools/apps-script/Code.gs — paste THAT, not anything older.

const SHEET_SUBMISSIONS = 'Submissions';
const SHEET_PARTIES     = 'Parties';   // optional master code list (column A = invite_code)
const EVENTS            = ['mehendi', 'nalangu', 'ceremony'];

const HEADERS = [
  'submitted_at', 'invite_code', 'party_name', 'invited_count',
  'mehendi_status', 'mehendi_count',
  'nalangu_status', 'nalangu_count',
  'ceremony_status', 'ceremony_count',
  'peak_headcount', 'dietary_summary', 'song_requests', 'notes',
  'payload_json', 'user_agent'
];

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const code = String(payload.invite_code || '').toUpperCase().trim();
    if (!code) return _json({ ok: false, error: 'missing invite_code' });

    const ss = SpreadsheetApp.getActive();

    // Optional junk rejection: if a populated Parties tab exists, the code must be on it.
    const parties = ss.getSheetByName(SHEET_PARTIES);
    if (parties && parties.getLastRow() > 1) {
      const known = parties.getRange(2, 1, parties.getLastRow() - 1, 1)
        .getValues().flat().map(c => String(c).toUpperCase().trim());
      if (known.indexOf(code) === -1) return _json({ ok: false, error: 'unknown invite_code' });
    }

    const ev = payload.events || {};
    const statusOf = id => (ev[id] ? (ev[id].status || 'pending') : '-');
    const countOf  = id => (ev[id] && ev[id].status === 'yes' ? (Number(ev[id].attending_count) || 0) : 0);
    const peak     = EVENTS.reduce((m, id) => Math.max(m, countOf(id)), 0);

    const dietary = EVENTS
      .filter(id => ev[id] && ev[id].status === 'yes' && ev[id].dietary && ev[id].dietary !== 'none')
      .map(id => id + ': ' + ev[id].dietary).join('; ');
    const songs = EVENTS
      .filter(id => ev[id] && String(ev[id].song_request || '').trim())
      .map(id => String(ev[id].song_request).trim()).join(' | ');
    const notes = EVENTS
      .filter(id => ev[id] && String(ev[id].special_notes || '').trim())
      .map(id => id + ': ' + String(ev[id].special_notes).trim()).join(' | ');

    _sheetWithHeaders(ss, SHEET_SUBMISSIONS).appendRow([
      payload._submitted_at || payload.submitted_at || new Date().toISOString(),
      code, payload.party_name || '', Number(payload.invited_count) || '',
      statusOf('mehendi'),  countOf('mehendi'),
      statusOf('nalangu'),  countOf('nalangu'),
      statusOf('ceremony'), countOf('ceremony'),
      peak, dietary, songs, notes,
      JSON.stringify(payload), payload._client || ''
    ]);

    return _json({ ok: true, received: code });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// NOTE: deliberately no doGet(). The deployment must allow "Anyone" so the
// static site can POST, which means any GET handler would be a public,
// unauthenticated read of guest RSVP data. Review responses in the Sheet.

function _sheetWithHeaders(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) { sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
  return sheet;
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

> **Note on the `Content-Type`.** The client in `js/persist.js` posts as `text/plain;charset=utf-8` to avoid the CORS preflight that Apps Script doesn't handle. `e.postData.contents` still contains the full JSON string — we just parse it ourselves. Don't change the client content-type.

---

## 3. Wire the front-end to the backend

Open `data/config.json` and paste the deployed URL — **no code change needed**:

```json
{ "rsvp_backend_url": "https://script.google.com/macros/s/AKfy.../exec" }
```

Commit, push. The site redeploys automatically (~30–60 s). Leave it as `""` to stay in local-only mode (drafts and submissions still persist in the browser; nothing is sent anywhere).

Test by submitting an RSVP from the live site. A new row should appear in the `Submissions` tab within a second.

---

## 4. Host on Cloudflare Pages

### 4.1 Register the domain

1. **dash.cloudflare.com** → Registrar → search `shivanieandtheo.co.za` → register. ~R200 / year (priced in USD, converts to roughly R200 at current rates).
2. DNS is auto-configured for Cloudflare.

### 4.2 Create the Pages project

1. Workers & Pages → **Create application** → **Pages** → **Connect to Git**.
2. Authorise GitHub, pick the wedding repo.
3. **Framework preset:** None.
4. **Build command:** *(leave blank)*.
5. **Build output directory:** `06-Website`.
6. **Root directory:** *(leave blank — defaults to repo root)*.
7. **Save and Deploy**.

First deploy takes ~30 seconds. You'll get a `<project>.pages.dev` URL.

### 4.3 Attach the custom domain

Pages project → **Custom domains** → **Set up a custom domain** → enter `shivanieandtheo.co.za`. Repeat for `www.shivanieandtheo.co.za` (set as a redirect to the apex). Certificates are issued automatically. Live in ~5 minutes.

### 4.4 Recommended Pages settings

- **Always Use HTTPS:** On (default).
- **Auto Minify:** Off (we don't need it; the bundles are small and minify can break inline scripts).
- **Browser Cache TTL:** Respect headers.
- **Page Rules:** none needed.

---

## 5. The `/admin/` dashboard is local-only — never deployed

`admin/` (and `tools/generate-codes.html`, `tools/preview-link.html`) are **gitignored and never ship to the public site**. The client-side passphrase gate is convenience, not security — anyone can read client JS — so these pages only run on the couple's own machine via the local dev server (`npx serve` or similar), next to the private `data/guests.json`.

If you ever decide to deploy an online admin view, put it behind real auth first (e.g. Cloudflare Access one-time PIN on `/admin/*`, allowing only `naickert@gmail.com` + Shivanie's email). Until then: review RSVPs in the Google Sheet, which is already protected by your Google login.

---

## 6. Cost summary

| Item | Cost |
|---|---|
| Domain (`shivanieandtheo.co.za`, 1 year) | ~R200 |
| Cloudflare Pages hosting | R0 |
| Google Apps Script + Sheet | R0 |
| (Optional) Cloudflare Access | R0 |
| **Total, year 1** | **~R200** |

For a wedding that costs five-to-six figures, the website costs less than dinner for two.

---

## 7. Migration from prototype to production — checklist

Estimated time: **90 minutes**. Work top to bottom.

| # | Step | Time |
|---|---|---|
| 1 | Write the real "How We Met" / "Proposal" stories in `js/views/story.js` (live site currently shows graceful "coming soon" notes) | 20 min |
| 2 | Add real photos to `assets/photos/` and reference from home/story | 10 min |
| 3 | Build `data/guests.json` via `tools/generate-codes.html` and save | 20 min |
| 4 | Register `shivanieandtheo.co.za` on Cloudflare Registrar | 5 min |
| 5 | Push to private GitHub repo | 5 min |
| 6 | Create Google Sheet with 3 tabs (Submissions / Parties / Live) | 10 min |
| 7 | Paste guest list into `Parties` tab | 5 min |
| 8 | Paste `Code.gs` into Apps Script, deploy as Web app | 5 min |
| 9 | Paste deployment URL into `data/config.json` (`rsvp_backend_url`) | 1 min |
| 10 | Push, let Cloudflare Pages deploy | 2 min |
| 11 | Attach custom domain in Pages | 5 min |
| 12 | ~~(Optional) wire Cloudflare Access for `/admin/*`~~ — `/admin/` is local-only now (see §5) | — |

---

## 8. Smoke-test plan after going live

Run all of these against the *live* domain (not the `.pages.dev` URL) on a real phone:

- [ ] Open `https://shivanieandtheo.co.za/` with **no** invite code → welcome banner is hidden; RSVP button still visible; home page renders.
- [ ] Open `?i=<valid code, 3 events>` → welcome banner shows party name; all three event cards have "You're invited" badge.
- [ ] Open `?i=<valid code, ceremony only>` → only the ceremony card has the badge; Mehendi page does NOT show the bride's home address.
- [ ] Open `?i=ZZZZZZZZZZ` (bad code) → no welcome banner; RSVP page shows the "we don't recognise this link" notice.
- [ ] Submit an RSVP → land on `#/thanks` → check a row appears in the Sheet's `Submissions` tab within 2 seconds.
- [ ] Re-open `#/rsvp` with the same code → form is pre-filled with the previous submission.
- [ ] Edit the RSVP and re-submit → a *second* row appears in `Submissions` (we keep append-only history; `Live` tab shows the latest).
- [ ] Open `/admin/` on the **local dev server** (it does not deploy) → enter passphrase → totals tile shows any locally-imported test submissions; CSV export works. Live responses are reviewed in the Google Sheet.
- [ ] Test on iOS Safari (real iPhone) and Chrome Android (real Android) — both should look correct, scroll smoothly, and submit successfully.
- [ ] Run a Lighthouse audit on home: Performance ≥ 90, Accessibility ≥ 95.
- [ ] Delete the test submissions from the Sheet before sending invites.

---

## 9. Maintenance during the RSVP window (Oct–Dec 2026)

- Keep the `Parties` tab in sync with `data/guests.json`. If you add a party post-launch: append a row in `Parties`, regenerate `data/guests.json` (or hand-edit), commit, push.
- Once a week, eyeball `Submissions` for any rows with `error` or weird payloads (shouldn't happen but worth checking).
- Two weeks out, freeze the `Parties` tab and stop accepting new parties (or you'll confuse the caterer).
- Day-of: keep your phone charged. The Google Sheet works on mobile for checking responses.
