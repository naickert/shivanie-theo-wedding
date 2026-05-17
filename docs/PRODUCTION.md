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
2. Create **three tabs** (rename `Sheet1` and add two more):

### Tab 1 — `Submissions` (raw inbox; append-only)

| Column | Header | Example |
|---|---|---|
| A | `submitted_at` | `2026-11-02T18:44:12+02:00` |
| B | `invite_code` | `K7M2QH` |
| C | `party_name` | `Naidoo family` |
| D | `submitted_by` | `Priya Naidoo` |
| E | `mehendi_yes` | `2` |
| F | `nalangu_yes` | `3` |
| G | `ceremony_yes` | `3` |
| H | `dietary_summary` | `Priya: no nuts; Anjali: vegetarian` |
| I | `message_to_couple` | `Can't wait!` |
| J | `song_request` | `Why This Kolaveri Di` |
| K | `payload_json` | `{...full JSON for audit trail...}` |
| L | `user_agent` | `Mozilla/5.0 ...` |

### Tab 2 — `Parties` (the master guest list, mirrored from `data/guests.json`)

| Column | Header | Example |
|---|---|---|
| A | `invite_code` | `K7M2QH` |
| B | `party_name` | `Naidoo family` |
| C | `household` | `Naidoo` |
| D | `headcount` | `3` |
| E | `events_invited` | `mehendi,nalangu,ceremony` |
| F | `plus_one_allowed` | `FALSE` |
| G | `phone` | `+27 82 555 0123` |
| H | `notes_internal` | `Theo's first cousin` |

You can paste this in by hand or generate it from `data/guests.json` using a simple `node` one-liner. Apps Script validates against column A on submit.

### Tab 3 — `Live` (formula-driven roll-up; what `/admin/` reads)

This is a *computed* view. Suggested formulas (row 2 of each column, fill down):

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
3. Paste the full `Code.gs` below.
4. Click **Deploy** → **New deployment** → cog → **Web app**.
5. Description: `RSVP receiver v1`.
6. Execute as: **Me (your-email@gmail.com)**.
7. Who has access: **Anyone**.
8. Click **Deploy**. Authorise the script when prompted. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).

### `Code.gs` — full source

```javascript
// Shivanie & Theo wedding — RSVP receiver
// Receives RSVP POSTs from the website, appends to "Submissions" tab,
// serves the "Live" tab as JSON for the admin dashboard.

const SHEET_SUBMISSIONS = 'Submissions';
const SHEET_PARTIES     = 'Parties';
const SHEET_LIVE        = 'Live';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    if (!payload.invite_code) return _json({ ok: false, error: 'missing invite_code' });

    // Validate code is in the master Parties list
    const ss = SpreadsheetApp.getActive();
    const parties = ss.getSheetByName(SHEET_PARTIES);
    const codes = parties.getRange(2, 1, parties.getLastRow() - 1, 1).getValues().flat();
    if (!codes.includes(payload.invite_code)) {
      return _json({ ok: false, error: 'unknown invite_code' });
    }

    // Compute per-event yes counts
    const responses = Array.isArray(payload.responses) ? payload.responses : [];
    const yes = (eventId) => responses.filter(r => r.attending && r.attending[eventId]).length;
    const dietary = responses
      .filter(r => r.dietary && String(r.dietary).trim())
      .map(r => `${r.first_name}: ${String(r.dietary).trim()}`)
      .join('; ');

    const submissions = ss.getSheetByName(SHEET_SUBMISSIONS);
    submissions.appendRow([
      payload._submitted_at || new Date().toISOString(),
      payload.invite_code,
      payload.party_name || '',
      payload.submitted_by || '',
      yes('mehendi'),
      yes('nalangu'),
      yes('ceremony'),
      dietary,
      payload.message_to_couple || '',
      payload.song_request || '',
      JSON.stringify(payload),
      payload._client || ''
    ]);

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  // Serves the Live tab as JSON (used by /admin/).
  // No auth — passphrase gating is client-side in /admin/.
  // Optional: require a shared secret in ?key=... and compare against PropertiesService.
  const ss = SpreadsheetApp.getActive();
  const live = ss.getSheetByName(SHEET_LIVE);
  if (!live) return _json({ ok: false, error: 'no Live tab' });
  const values = live.getDataRange().getValues();
  const [headers, ...rows] = values;
  const out = rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  return _json({ ok: true, rows: out, generated_at: new Date().toISOString() });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

> **Note on the `Content-Type`.** The client in `js/persist.js` posts as `text/plain;charset=utf-8` to avoid the CORS preflight that Apps Script doesn't handle. `e.postData.contents` still contains the full JSON string — we just parse it ourselves. Don't change the client content-type.

---

## 3. Wire the front-end to the backend

Open `js/persist.js` and set:

```javascript
const BACKEND_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

Commit, push. Cloudflare Pages will redeploy in ~60 seconds.

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

## 5. (Optional) Gate `/admin/` with Cloudflare Access

The `/admin/` page has a client-side passphrase gate, which is fine for "keep curious guests out" but not for "keep determined attackers out". If you want real auth (free, easy):

1. Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** → **Add application** → **Self-hosted**.
2. Application domain: `shivanieandtheo.co.za` · path: `/admin/*`.
3. Identity providers: **One-time PIN** (email).
4. Policy: allow `naickert@gmail.com` + Shivanie's email + (optionally) the planner.
5. Save. Now `/admin/*` requires a one-time PIN to access. The client-side passphrase becomes a belt-and-braces second factor.

Cost: free for up to 50 users on the Zero Trust free plan.

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
| 1 | Replace `[TODO: confirm with couple]` content in `js/views/story.js` | 20 min |
| 2 | Add real photos to `assets/photos/` and reference from home/story | 10 min |
| 3 | Build `data/guests.json` via `tools/generate-codes.html` and save | 20 min |
| 4 | Register `shivanieandtheo.co.za` on Cloudflare Registrar | 5 min |
| 5 | Push to private GitHub repo | 5 min |
| 6 | Create Google Sheet with 3 tabs (Submissions / Parties / Live) | 10 min |
| 7 | Paste guest list into `Parties` tab | 5 min |
| 8 | Paste `Code.gs` into Apps Script, deploy as Web app | 5 min |
| 9 | Paste deployment URL into `js/persist.js` `BACKEND_URL` | 1 min |
| 10 | Push, let Cloudflare Pages deploy | 2 min |
| 11 | Attach custom domain in Pages | 5 min |
| 12 | (Optional) wire Cloudflare Access for `/admin/*` | 10 min |

---

## 8. Smoke-test plan after going live

Run all of these against the *live* domain (not the `.pages.dev` URL) on a real phone:

- [ ] Open `https://shivanieandtheo.co.za/` with **no** invite code → welcome banner is hidden; RSVP button still visible; home page renders.
- [ ] Open `?i=<valid code, 3 events>` → welcome banner shows party name; all three event cards have "You're invited" badge.
- [ ] Open `?i=<valid code, ceremony only>` → only the ceremony card has the badge; Mehendi page does NOT show the bride's home address.
- [ ] Open `?i=ZZZZZZ` (bad code) → no welcome banner; RSVP page shows the "we don't recognise this link" notice.
- [ ] Submit an RSVP → land on `#/thanks` → check a row appears in the Sheet's `Submissions` tab within 2 seconds.
- [ ] Re-open `#/rsvp` with the same code → form is pre-filled with the previous submission.
- [ ] Edit the RSVP and re-submit → a *second* row appears in `Submissions` (we keep append-only history; `Live` tab shows the latest).
- [ ] Open `/admin/` → enter passphrase → totals tile shows the test submissions; CSV export works.
- [ ] Test on iOS Safari (real iPhone) and Chrome Android (real Android) — both should look correct, scroll smoothly, and submit successfully.
- [ ] Run a Lighthouse audit on home: Performance ≥ 90, Accessibility ≥ 95.
- [ ] Delete the test submissions from the Sheet before sending invites.

---

## 9. Maintenance during the RSVP window (Oct–Dec 2026)

- Keep the `Parties` tab in sync with `data/guests.json`. If you add a party post-launch: append a row in `Parties`, regenerate `data/guests.json` (or hand-edit), commit, push.
- Once a week, eyeball `Submissions` for any rows with `error` or weird payloads (shouldn't happen but worth checking).
- Two weeks out, freeze the `Parties` tab and stop accepting new parties (or you'll confuse the caterer).
- Day-of: keep your phone charged. `/admin/` works on mobile.
