#!/usr/bin/env node
/* Encrypt the private guest list for safe deployment on a PUBLIC static host.
 *
 * Why: the site is a static SPA on GitHub Pages, so any data file it fetches is
 * publicly readable. Shipping data/guests.json in plaintext would expose every
 * guest's name, phone number, internal notes and invite code to anyone with the
 * URL. Instead we ship ONLY guest-facing fields, AES-GCM-encrypted per party
 * under that party's invite code. Without a valid code the file is opaque
 * ciphertext; the browser decrypts only the matching party in js/guests.js.
 *
 * Internal-only fields (primary_contact / whatsapp, notes_internal, category,
 * language) are dropped entirely — they never leave your machine.
 *
 * Usage:
 *   node tools/encrypt-guests.mjs            # data/guests.json -> data/guests.enc.json
 *   node tools/encrypt-guests.mjs <in> <out>
 *
 * Re-run this whenever you edit data/guests.json. Keep guests.json PRIVATE
 * (it is gitignored); commit only data/guests.enc.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const subtle = globalThis.crypto.subtle;
const te = new TextEncoder();

const ITERATIONS = 250000;            // PBKDF2 work factor (also hard-coded client-side)
const SRC = process.argv[2] || fileURLToPath(new URL('../data/guests.json', import.meta.url));
const OUT = process.argv[3] || fileURLToPath(new URL('../data/guests.enc.json', import.meta.url));

// Only these fields are sent to the browser (all gated behind the party's own code).
function guestFacing(p) {
  const out = {
    invite_code: p.invite_code,
    party_name: p.party_name,
    events_invited: p.events_invited,
    invited_count: p.invited_count,
  };
  if (p.accessibility) out.accessibility = p.accessibility; // the party's own note (prefills their RSVP)
  return out;
}

const b64 = (bytes) => Buffer.from(bytes).toString('base64');

async function deriveKey(code, salt) {
  const base = await subtle.importKey('raw', te.encode(code), 'PBKDF2', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
}

const data = JSON.parse(readFileSync(SRC, 'utf8'));
if (!Array.isArray(data.parties)) throw new Error('Source has no "parties" array');

const salt = globalThis.crypto.getRandomValues(new Uint8Array(16)); // one global salt -> one PBKDF2 per lookup
const records = [];
for (const p of data.parties) {
  const code = String(p.invite_code).toUpperCase().trim();
  const key = await deriveKey(code, salt);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(guestFacing(p)))
  ));
  records.push({ iv: b64(iv), ct: b64(ct) });
}

// Shuffle so record order correlates with nothing (Fisher–Yates, CSPRNG).
for (let i = records.length - 1; i > 0; i--) {
  const j = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
  [records[i], records[j]] = [records[j], records[i]];
}

const out = {
  schema_version: 'enc-1',
  note: 'AES-GCM ciphertext of guest-facing party objects, keyed by PBKDF2(invite_code, salt). Decryptable only with a valid invite code. No plaintext names, codes, or contact details. Internal fields are not included.',
  cipher: 'AES-GCM',
  kdf: 'PBKDF2-SHA256',
  iterations: ITERATIONS,
  salt: b64(salt),
  events: data.events,
  count: records.length,
  records,
};
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`Encrypted ${records.length} parties -> ${OUT}`);
console.log(`(PBKDF2 ${ITERATIONS} iters; guest-facing fields only; internal contacts/notes dropped.)`);
