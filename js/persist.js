/* RSVP persistence — localStorage now, backend webhook later */

const BACKEND_URL = '';  // production: paste Google Apps Script web-app URL here

const KEY_PREFIX = 'rsvp:';
const DRAFT_PREFIX = 'rsvp-draft:';
const PENDING_KEY = 'rsvp-pending-syncs';

export function saveDraft(invite_code, draft) {
  if (!invite_code) return;
  try {
    localStorage.setItem(DRAFT_PREFIX + invite_code, JSON.stringify({
      ...draft,
      _saved_at: new Date().toISOString()
    }));
  } catch (e) { console.warn('saveDraft failed', e); }
}

export function loadDraft(invite_code) {
  if (!invite_code) return null;
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + invite_code);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft(invite_code) {
  if (!invite_code) return;
  localStorage.removeItem(DRAFT_PREFIX + invite_code);
}

export function loadSubmission(invite_code) {
  if (!invite_code) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + invite_code);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function submitRSVP(payload) {
  // Always write local first (single source of truth for prototype + offline resilience for prod)
  payload._submitted_at = new Date().toISOString();
  payload._client = navigator.userAgent.slice(0, 120);
  try {
    localStorage.setItem(KEY_PREFIX + payload.invite_code, JSON.stringify(payload));
    clearDraft(payload.invite_code);
  } catch (e) { console.warn('local save failed', e); }

  if (!BACKEND_URL) {
    return { ok: true, mode: 'local-only' };
  }

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, ...json, mode: 'live' };
  } catch (err) {
    queuePendingSync(payload);
    return { ok: false, mode: 'queued', error: err.message };
  }
}

function queuePendingSync(payload) {
  try {
    const q = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    q.push(payload);
    localStorage.setItem(PENDING_KEY, JSON.stringify(q.slice(-20)));
  } catch {}
}

export async function drainPendingSyncs() {
  if (!BACKEND_URL) return { drained: 0 };
  let q = [];
  try { q = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch {}
  if (!q.length) return { drained: 0 };
  let drained = 0;
  const remaining = [];
  for (const payload of q) {
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (res.ok) drained++; else remaining.push(payload);
    } catch { remaining.push(payload); }
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  return { drained, remaining: remaining.length };
}

/* Admin: list all RSVP submissions stored in this browser */
export function listLocalSubmissions() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) continue;
    try { out.push(JSON.parse(localStorage.getItem(key))); } catch {}
  }
  return out;
}

/* Admin: import a JSON payload pasted from a guest */
export function importSubmission(json) {
  if (!json || !json.invite_code) throw new Error('Missing invite_code');
  localStorage.setItem(KEY_PREFIX + json.invite_code, JSON.stringify(json));
  return json;
}
