/**
 * Gift cards data layer
 * ------------------------------------------------------------------
 * Mock resolvers for stored-value gift cards — a first-class commerce
 * feature (Saleor `giftCards`) useful for a BD consumer-electronics store.
 * Cards are issued with an initial balance and spent down over time; the
 * activations / current balance / state are the figures the list surfaces.
 *
 * Self-contained demo data. New cards created in the UI persist through the
 * `ops.ts` overlay (`gift.card`) like every other record.
 */

import { withOverlay, listAdded } from "@/lib/data/ops";

export type GiftCardState = "Active" | "Pending" | "Disabled" | "Expired";

export interface GiftCardRow {
  id: string;
  /** Redeem code shown to the holder (masked tail). */
  code: string;
  state: GiftCardState;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  issued: string;
  expiry: string;
  /** Optional product the card is tied to (kept generic here). */
  product?: string;
}

export const GIFT_CARD_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending (unactivated)" },
  { value: "Disabled", label: "Disabled" },
  { value: "Expired", label: "Expired" },
];

export const GIFT_CARD_STATE_LABEL_META: Record<GiftCardState, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Disabled: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Expired: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const GIFT_CARDS: GiftCardRow[] = [
  { id: "GC-1001", code: "VMRT-4820-••••-9913", state: "Active", initialBalance: 10000, currentBalance: 3420, currency: "BDT", issued: "Aug 12, 2026", expiry: "Aug 12, 2027" },
  { id: "GC-1002", code: "VMRT-7731-••••-2204", state: "Active", initialBalance: 50000, currentBalance: 50000, currency: "BDT", issued: "Sep 02, 2026", expiry: "Sep 02, 2027", product: "MacBook Pro 14 M3 Pro" },
  { id: "GC-1003", code: "VMRT-1190-••••-5567", state: "Pending", initialBalance: 5000, currentBalance: 5000, currency: "BDT", issued: "Sep 25, 2026", expiry: "Sep 25, 2027" },
  { id: "GC-1004", code: "VMRT-6642-••••-8081", state: "Expired", initialBalance: 20000, currentBalance: 0, currency: "BDT", issued: "Jul 01, 2025", expiry: "Jul 01, 2026" },
  { id: "GC-1005", code: "VMRT-3319-••••-4402", state: "Disabled", initialBalance: 15000, currentBalance: 15000, currency: "BDT", issued: "Jun 18, 2026", expiry: "Jun 18, 2027" },
  { id: "GC-1006", code: "VMRT-9027-••••-1176", state: "Active", initialBalance: 25000, currentBalance: 12750, currency: "BDT", issued: "May 30, 2026", expiry: "May 30, 2027", product: "Galaxy S24 Ultra 512GB" },
];

export async function getGiftCards(): Promise<GiftCardRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("gift.card") : []) as unknown as GiftCardRow[];
  const base = GIFT_CARDS.map((g) => withOverlay("gift.card", g.id, g));
  return [...added, ...base];
}

export function giftCardStats(rows: GiftCardRow[]) {
  const active = rows.filter((r) => r.state === "Active").length;
  const pending = rows.filter((r) => r.state === "Pending").length;
  const outstanding = rows
    .filter((r) => r.state === "Active" || r.state === "Pending")
    .reduce((s, r) => s + r.currentBalance, 0);
  const totalIssued = rows.reduce((s, r) => s + r.initialBalance, 0);
  const redeemed = rows.reduce((s, r) => s + (r.initialBalance - r.currentBalance), 0);
  return { total: rows.length, active, pending, outstanding, totalIssued, redeemed };
}
