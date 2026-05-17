/* Central store — simple pub/sub. No framework. */

const listeners = new Set();

const state = {
  party: null,         // hydrated party object (or null for public view)
  rsvp_draft: null,    // unsaved draft
  rsvp_submitted: null,// last submitted snapshot
  route: '/',
  ui: { nav_open: false }
};

export function get(key) {
  return key ? state[key] : state;
}

export function set(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* helper: shallow path setter for nested ui */
export function setUi(patch) {
  state.ui = { ...state.ui, ...patch };
  for (const fn of listeners) fn(state);
}
