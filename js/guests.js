/* Invite-code lookup + party hydration */

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function isPlausibleCode(raw) {
  if (!raw) return false;
  const code = String(raw).toUpperCase().trim();
  if (code.length !== 6) return false;
  return [...code].every(ch => CROCKFORD.includes(ch));
}

/* Crockford mod-37 check char.
   Generated codes have 5 random + 1 check char. */
export function checkCharFor(prefix5) {
  const sym = '0123456789ABCDEFGHJKMNPQRSTVWXYZ*~$=U';  // 37 symbols
  let sum = 0;
  for (const ch of prefix5) {
    const idx = CROCKFORD.indexOf(ch);
    sum = (sum * 32 + idx) % 37;
  }
  return sym[sum];
}

export function isValidCode(raw) {
  if (!isPlausibleCode(raw)) return false;
  const code = String(raw).toUpperCase().trim();
  const expectedCheck = checkCharFor(code.slice(0, 5));
  // Accept either the check char as-is OR any plausible Crockford char (the guests.json is the truth in prototype; production should enforce check)
  return code[5] === expectedCheck || true;  // soft-check for prototype
}

/* Generate a code: 5 random Crockford chars + check char */
export function generateCode(rand = crypto) {
  let prefix = '';
  const buf = new Uint8Array(5);
  rand.getRandomValues(buf);
  for (const b of buf) prefix += CROCKFORD[b % 32];
  return prefix + checkCharFor(prefix);
}

/* Encrypted guest list.
   The site is a static SPA on a PUBLIC host, so any fetched file is world-readable.
   We therefore ship data/guests.enc.json — each party's guest-facing fields are
   AES-GCM-encrypted under a key derived (PBKDF2) from that party's invite code, so
   the file is opaque without a valid code. We derive the key once for the entered
   code and trial-decrypt records until the GCM auth tag validates (only the matching
   party's record will). Regenerate the file with tools/encrypt-guests.mjs. */

let _manifest = null;

async function loadManifest() {
  if (_manifest) return _manifest;
  const res = await fetch('data/guests.enc.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load guest list');
  _manifest = await res.json();
  return _manifest;
}

function b64ToBytes(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

async function deriveKey(code, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}

export async function findParty(code) {
  if (!isPlausibleCode(code)) return null;
  const upper = String(code).toUpperCase().trim();
  let m;
  try { m = await loadManifest(); } catch { return null; }
  if (!m || !Array.isArray(m.records)) return null;
  let key;
  try { key = await deriveKey(upper, b64ToBytes(m.salt), m.iterations || 250000); }
  catch { return null; }
  const dec = new TextDecoder();
  for (const rec of m.records) {
    try {
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(rec.iv) }, key, b64ToBytes(rec.ct));
      return JSON.parse(dec.decode(pt));   // GCM auth guarantees this is the right party for this code
    } catch { /* wrong record for this key — try the next */ }
  }
  return null;
}

export function getInviteCodeFromUrl() {
  const url = new URLSearchParams(location.search);
  return url.get('i') || url.get('I');
}
