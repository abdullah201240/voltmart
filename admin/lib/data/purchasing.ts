/**
 * Purchasing data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolvers for the Purchasing section.
 *
 * Mirrors Odoo `purchase.order` (draft RFQ -> sent -> to approve ->
 * purchase -> done) and `res.partner`/`product.supplierinfo` (vendors
 * with their products, vendor price and lead time). Replacing the
 * resolvers with a real API changes nothing in the pages.
 */

/** Purchase order lifecycle — Odoo `purchase.order.state`. */
export type PoState = "draft" | "sent" | "to approve" | "purchase" | "done" | "cancel";

export interface PurchaseOrderRow {
  id: string;
  name: string;
  vendor: string;
  date: string;
  expectedDate: string;
  total: string;
  totalValue: number;
  currency: string;
  lines: number;
  state: PoState;
  /** Whether the linked receipt has been validated (stock already in). */
  received: boolean;
}

export interface VendorRow {
  id: string;
  name: string;
  email: string;
  country: string;
  products: number;
  /** Average purchase lead time in days. */
  leadTime: number;
  /** On-time delivery rate (%). */
  onTimeRate: number;
  /** Total value purchased this year. */
  totalPurchased: number;
}

export const PO_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "draft", label: "RFQ" },
  { value: "sent", label: "RFQ Sent" },
  { value: "to approve", label: "To Approve" },
  { value: "purchase", label: "Purchase Order" },
  { value: "done", label: "Locked" },
];

/** Human labels for purchase order states. */
export const PO_STATE_LABEL: Record<PoState, string> = {
  draft: "RFQ",
  sent: "RFQ Sent",
  "to approve": "To Approve",
  purchase: "Purchase Order",
  done: "Locked",
  cancel: "Cancelled",
};

/** Ordered purchase lifecycle for a stepper. */
export const PO_FLOW: PoState[] = ["draft", "sent", "purchase", "done"];

const PURCHASE_ORDERS: PurchaseOrderRow[] = [
  { id: "P00012", name: "P00012", vendor: "Ready Mat", date: "Sep 28, 2026", expectedDate: "Sep 30, 2026", total: "৳10,14,000.00", totalValue: 1014000, currency: "BDT", lines: 2, state: "purchase", received: false },
  { id: "P00011", name: "P00011", vendor: "Wood Corner", date: "Sep 26, 2026", expectedDate: "Oct 02, 2026", total: "৳15,48,000.00", totalValue: 1548000, currency: "BDT", lines: 5, state: "to approve", received: false },
  { id: "P00010", name: "P00010", vendor: "Deco Addict", date: "Sep 22, 2026", expectedDate: "Sep 24, 2026", total: "৳3,84,000.00", totalValue: 384000, currency: "BDT", lines: 1, state: "done", received: true },
  { id: "P00009", name: "P00009", vendor: "Ready Mat", date: "Sep 20, 2026", expectedDate: "Oct 05, 2026", total: "৳6,72,000.00", totalValue: 672000, currency: "BDT", lines: 3, state: "draft", received: false },
  { id: "P00008", name: "P00008", vendor: "Audio Group", date: "Sep 18, 2026", expectedDate: "Sep 21, 2026", total: "৳11,70,000.00", totalValue: 1170000, currency: "BDT", lines: 4, state: "sent", received: false },
  { id: "P00007", name: "P00007", vendor: "Gaming Depot", date: "Sep 15, 2026", expectedDate: "Sep 19, 2026", total: "৳26,88,000.00", totalValue: 2688000, currency: "BDT", lines: 6, state: "purchase", received: true },
];

const VENDORS: VendorRow[] = [
  { id: "V1", name: "Ready Mat", email: "sales@readymat.example", country: "United States", products: 34, leadTime: 5, onTimeRate: 96, totalPurchased: 22140000 },
  { id: "V2", name: "Wood Corner", email: "orders@woodcorner.example", country: "United States", products: 12, leadTime: 12, onTimeRate: 88, totalPurchased: 11544000 },
  { id: "V3", name: "Deco Addict", email: "contact@decoaddict.example", country: "Belgium", products: 21, leadTime: 8, onTimeRate: 92, totalPurchased: 8808000 },
  { id: "V4", name: "Audio Group", email: "b2b@audiogroup.example", country: "Germany", products: 9, leadTime: 6, onTimeRate: 99, totalPurchased: 18120000 },
  { id: "V5", name: "Gaming Depot", email: "wholesale@gamingdepot.example", country: "United Kingdom", products: 17, leadTime: 4, onTimeRate: 94, totalPurchased: 25050000 },
];

import { withOverlay } from "@/lib/data/ops";
import { PURCHASE_ORDER } from "@/lib/data/workflows";

export async function getPurchaseOrders(): Promise<PurchaseOrderRow[]> {
  return PURCHASE_ORDERS.map((p) => withOverlay(PURCHASE_ORDER, p.id, p));
}

/** RFQs = draft / sent / to-approve; confirmed POs = purchase / done. */
export function isRfq(state: PoState) {
  return state === "draft" || state === "sent" || state === "to approve";
}

export async function getVendors(): Promise<VendorRow[]> {
  return VENDORS;
}

export function purchaseStats(rows: PurchaseOrderRow[]) {
  const open = rows.filter((r) => r.state !== "done" && r.state !== "cancel").length;
  const awaitingReceipt = rows.filter((r) => r.state === "purchase" && !r.received).length;
  const committed = rows.filter((r) => r.state === "purchase" || r.state === "done").reduce((s, r) => s + r.totalValue, 0);
  return { total: rows.length, open, awaitingReceipt, committed };
}

export function vendorStats(rows: VendorRow[]) {
  const spend = rows.reduce((s, r) => s + r.totalPurchased, 0);
  const avgLead = Math.round(rows.reduce((s, r) => s + r.leadTime, 0) / (rows.length || 1));
  const avgOnTime = Math.round(rows.reduce((s, r) => s + r.onTimeRate, 0) / (rows.length || 1));
  return { total: rows.length, spend, avgLead, avgOnTime };
}
