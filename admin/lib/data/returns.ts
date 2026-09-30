/**
 * Returns / RMA data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the after-sales Returns & RMA section. Mirrors a
 * warranty/return claim lifecycle for consumer electronics (a physical
 * unit identified by serial/IMEI comes back, is bench-tested, then is
 * refunded or replaced). Overlay-persisted through `ops.ts` like every
 * other document so workflow transitions show up across pages.
 *
 * Self-contained: this is in-app demo data, not an external RMA carrier.
 */

import { withOverlay, listAdded } from "@/lib/data/ops";

export type ReturnState =
  | "Requested"
  | "In Inspection"
  | "Approved Refund"
  | "Approved Replacement"
  | "Rejected";

export type ReturnReason =
  | "Dead on Arrival"
  | "Not as Described"
  | "Physical Damage"
  | "Change of Mind"
  | "Warranty Claim";

export interface ReturnRow {
  id: string;
  orderRef: string;
  customer: string;
  product: string;
  sku: string;
  /** Physical serial / IMEI captured at inspection, if present. */
  serial: string;
  reason: ReturnReason;
  state: ReturnState;
  opened: string;
  /** Amount at risk (refund value or replacement COGS). */
  amount: number;
}

export const RETURN_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "Requested", label: "Requested" },
  { value: "In Inspection", label: "In Inspection" },
  { value: "Approved Refund", label: "Approved Refund" },
  { value: "Approved Replacement", label: "Approved Replacement" },
  { value: "Rejected", label: "Rejected" },
];

export const RETURN_STATE_LABEL_META: Record<ReturnState, string> = {
  Requested: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  "In Inspection": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Approved Refund": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Approved Replacement": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const RETURNS: ReturnRow[] = [
  { id: "RMA-4101", orderRef: "ORD-7390", customer: "Emma Brown", product: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", serial: "IMEI-928374651022", reason: "Dead on Arrival", state: "In Inspection", opened: "Sep 29, 2026", amount: 41990 },
  { id: "RMA-4100", orderRef: "ORD-7385", customer: "Mia Clark", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", serial: "SN-MBP3-77120", reason: "Not as Described", state: "Requested", opened: "Sep 29, 2026", amount: 263880 },
  { id: "RMA-4099", orderRef: "ORD-7388", customer: "James Davis", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", serial: "IMEI-928374650011", reason: "Physical Damage", state: "Rejected", opened: "Sep 28, 2026", amount: 170280 },
  { id: "RMA-4098", orderRef: "ORD-7387", customer: "Sophia Taylor", product: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", serial: "SN-AW9-44231", reason: "Warranty Claim", state: "Approved Replacement", opened: "Sep 27, 2026", amount: 51480 },
  { id: "RMA-4097", orderRef: "ORD-7386", customer: "Lucas White", product: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", serial: "—", reason: "Change of Mind", state: "Approved Refund", opened: "Sep 26, 2026", amount: 7080 },
];

export async function getReturns(): Promise<ReturnRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("rma.return") : []) as unknown as ReturnRow[];
  const base = RETURNS.map((r) => withOverlay("rma.return", r.id, r));
  return [...added, ...base];
}

export async function getReturnById(id: string): Promise<ReturnRow | undefined> {
  const added = (typeof window !== "undefined" ? listAdded("rma.return") : []) as unknown as ReturnRow[];
  const row = [...added, ...RETURNS].find((r) => r.id === id);
  return row ? withOverlay("rma.return", id, row) : undefined;
}

export function returnStats(rows: ReturnRow[]) {
  const pending = rows.filter((r) => r.state === "Requested").length;
  const inspecting = rows.filter((r) => r.state === "In Inspection").length;
  const approved = rows.filter((r) => r.state === "Approved Refund" || r.state === "Approved Replacement").length;
  const rejected = rows.filter((r) => r.state === "Rejected").length;
  const open = rows.filter((r) => r.state === "Requested" || r.state === "In Inspection").length;
  const valueAtRisk = rows
    .filter((r) => r.state === "Requested" || r.state === "In Inspection")
    .reduce((s, r) => s + r.amount, 0);
  return { total: rows.length, pending, inspecting, approved, rejected, open, valueAtRisk };
}
