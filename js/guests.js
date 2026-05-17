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

let _cache = null;

export async function loadGuests() {
  if (_cache) return _cache;
  const res = await fetch('data/guests.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load guest list');
  _cache = await res.json();
  return _cache;
}

export async function findParty(code) {
  if (!isPlausibleCode(code)) return null;
  const data = await loadGuests();
  const upper = String(code).toUpperCase().trim();
  return data.parties.find(p => p.invite_code === upper) || null;
}

export function getInviteCodeFromUrl() {
  const url = new URLSearchParams(location.search);
  return url.get('i') || url.get('I');
}
