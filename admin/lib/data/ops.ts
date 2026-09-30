/**
 * Record Operations Store (client-side, Odoo-parity behavioural layer)
 * ------------------------------------------------------------------
 * A single persistent, subscribable overlay keyed by `model:ref` that gives
 * the mock admin real, Odoo-like record behaviour without a backend:
 *
 *  - `fields`    : field patches (e.g. a sale.order status change) merged
 *                  back into the resolvers so the change shows everywhere.
 *  - `messages`  : chatter thread (public comments + internal notes).
 *  - `activities`: scheduled activities (To-Do / Phone / Meeting / Email /
 *                  Next Activity) with open/done state, Odoo-style.
 *  - `history`   : immutable system timeline (who changed what, when).
 *
 * Persisted to localStorage under a single blob; SSR-guarded so server
 * reads return the untouched base record. React components subscribe via
 * `useOps()` (useSyncExternalStore) and re-render on any mutation.
 *
 * Drop-in: when a real API arrives, replace reads/writes here with
 * `mail.thread` / `activity` endpoints and delete the localStorage layer.
 */

import { useCallback, useSyncExternalStore } from "react";

export type ChatterMessage = {
  id: string;
  author: string;
  body: string;
  /** "comment" = customer-visible message, "note" = internal note. */
  kind: "comment" | "note";
  ts: number;
};

export type ActivityType = "todo" | "phone" | "meeting" | "email" | "next_activity";

export type Activity = {
  id: string;
  type: ActivityType;
  summary: string;
  /** ISO date (yyyy-mm-dd) the activity is due. */
  due: string;
  assignee: string;
  state: "open" | "done";
  ts: number;
};

export type HistoryEvent = {
  id: string;
  /** Short label, e.g. "Status: Quotation → Confirmed". */
  action: string;
  detail?: string;
  actor: string;
  ts: number;
};

export type RecordState = {
  fields: Record<string, unknown>;
  messages: ChatterMessage[];
  activities: Activity[];
  history: HistoryEvent[];
};

/** Default actor for demo operations (no auth layer yet). */
export const OPS_ACTOR = "Admin · Alex";

const KEY = "vm_ops_v1";
const EMPTY: RecordState = { fields: {}, messages: [], activities: [], history: [] };

let blob: Record<string, RecordState> | null = null;
let version = 0;
const listeners = new Set<() => void>();

function load(): Record<string, RecordState> {
  if (blob !== null) return blob;
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    blob = raw ? (JSON.parse(raw) as Record<string, RecordState>) : {};
  } catch {
    blob = {};
  }
  return blob;
}

function save() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(blob ?? {}));
  } catch {
    /* ignore quota / private mode */
  }
}

function commit() {
  version += 1;
  save();
  listeners.forEach((l) => l());
}

const refKey = (model: string, ref: string) => `${model}:${ref}`;

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Read the persisted state for a record (or an empty default). */
export function getRecord(model: string, ref: string): RecordState {
  return load()[refKey(model, ref)] ?? EMPTY;
}

/** Merge overlay field patches onto a base record (typed passthrough). */
export function withOverlay<T extends object>(model: string, ref: string, base: T): T {
  const { fields } = getRecord(model, ref);
  return { ...base, ...fields };
}

/** Patch (merge) fields on a record and notify subscribers. */
export function patchFields(model: string, ref: string, patch: Record<string, unknown>) {
  const store = load();
  const k = refKey(model, ref);
  const cur = store[k] ?? { ...EMPTY };
  store[k] = { ...cur, fields: { ...cur.fields, ...patch } };
  commit();
}

/** Append a system history event (state changes, side-effects). */
export function addHistory(model: string, ref: string, action: string, detail?: string) {
  const store = load();
  const k = refKey(model, ref);
  const cur = store[k] ?? { ...EMPTY };
  const evt: HistoryEvent = { id: uid("h"), action, detail, actor: OPS_ACTOR, ts: Date.now() };
  store[k] = { ...cur, history: [evt, ...cur.history] };
  commit();
}

export function addMessage(model: string, ref: string, body: string, kind: "comment" | "note") {
  const store = load();
  const k = refKey(model, ref);
  const cur = store[k] ?? { ...EMPTY };
  const msg: ChatterMessage = { id: uid("m"), author: OPS_ACTOR, body, kind, ts: Date.now() };
  store[k] = { ...cur, messages: [msg, ...cur.messages] };
  commit();
}

export function scheduleActivity(
  model: string,
  ref: string,
  input: { type: ActivityType; summary: string; due: string; assignee: string },
) {
  const store = load();
  const k = refKey(model, ref);
  const cur = store[k] ?? { ...EMPTY };
  const act: Activity = { id: uid("a"), ...input, state: "open", ts: Date.now() };
  store[k] = { ...cur, activities: [act, ...cur.activities] };
  commit();
}

export function setActivityState(model: string, ref: string, activityId: string, state: "open" | "done") {
  const store = load();
  const k = refKey(model, ref);
  const cur = store[k] ?? { ...EMPTY };
  store[k] = {
    ...cur,
    activities: cur.activities.map((a) => (a.id === activityId ? { ...a, state } : a)),
  };
  commit();
}

/** Clear every operation for a record (dev / "reset demo" affordance). */
export function clearRecord(model: string, ref: string) {
  const store = load();
  delete store[refKey(model, ref)];
  commit();
}

/** Wipe the entire overlay (all records) — global "reset demo data". */
export function clearAllOps() {
  blob = {};
  commit();
}

/**
 * Inject a brand-new row for a model (the create-drawer flow). The mock
 * resolvers can only patch existing base rows, so UI-created records live
 * under a `new-…` ref convention and are appended by `listAdded`.
 */
export function addRecord(model: string, fields: Record<string, unknown>): string {
  const ref = `new-${uid("r")}`;
  patchFields(model, ref, fields);
  addHistory(model, ref, "Created via UI");
  return ref;
}

/** All UI-created rows for a model, oldest first (empty during SSR). */
export function listAdded(model: string): Record<string, unknown>[] {
  const store = load();
  const prefix = `${model}:new-`;
  return Object.entries(store)
    .filter(([k]) => k.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v.fields);
}

/** True if a record has any persisted operation (for badge/reset affordances). */
export function recordTouched(model: string, ref: string) {
  const r = getRecord(model, ref);
  return (
    Object.keys(r.fields).length > 0 ||
    r.messages.length > 0 ||
    r.activities.length > 0 ||
    r.history.length > 0
  );
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return version;
}

/**
 * React hook — returns the current store version and re-renders the caller
 * whenever any record is mutated. Pair with a `getRecord`/resolver read.
 */
export function useOps() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Convenience: an action callback that re-reads after mutation. */
export function useOpsRefresh() {
  const v = useOps();
  const bump = useCallback(() => {
    /* mutations already notify; this just keeps the version referenced */
  }, []);
  return { version: v, bump };
}
