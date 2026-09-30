/**
 * Dashboard selector layer
 * ------------------------------------------------------------------
 * The homepage cockpit is derived ONLY from the operational mock resolvers
 * (orders, inventory, finance, analytics). No literal demo numbers live here —
 * every KPI, channel split, warehouse queue and tax figure is computed from the
 * same records the Orders / Inventory / Payments / Accounting pages show, so the
 * dashboard can never disagree with a detail page.
 *
 * The admin is fully self-contained: this is a pure read/compose layer over
 * `lib/data/*`, not an external integration.
 */

import type { OrderRow } from "@/lib/data/orders";
import type { StockRow, PickingRow } from "@/lib/data/inventory";
import type { PaymentRow, InvoiceRow, BillRow } from "@/lib/data/finance";

/* ---- filter context keys (must match the resolvers' real values) ---- */

/** Channel keys mirror `OrderRow.channelKey`. */
export type ChannelKey = "all" | "default-channel" | "channel-dhk" | "channel-ctg" | "b2b-wholesale";
/** Date ranges are anchored to the most recent order so the cockpit always reads live. */
export type DateRangeKey = "today" | "7d" | "mtd" | "ytd";

export interface ChannelSlice {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  share: number; // 0..100
}

export interface WarehouseQueues {
  inboundToProcess: number;
  inboundWaiting: number;
  inboundLate: number;
  packingReady: number;
  dispatchReady: number;
  dispatchInTransit: number;
  dispatchLate: number;
  internalOpen: number;
}

export interface DashboardSnapshot {
  revenue: number;
  revenueDeltaPct: number;
  orderCount: number;
  aov: number;
  ordersToFulfill: number;
  ordersOverdue: number;
  paymentsToSettle: number;
  paymentsPendingCount: number;
  paymentsFailedCount: number;
  codFloat: number;
  stockRiskSkus: number;
  stockOutSkus: number;
  stockValue: number;
  vatOutput: number;
  vatInput: number;
  vatNet: number;
  pendingMushak: number;
  channelSplit: ChannelSlice[];
  queues: WarehouseQueues;
}

/* ---- date helpers ---- */

function parseDate(s: string): number {
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Anchor = latest order timestamp, so "today" always resolves to real rows. */
function anchorTime(rows: OrderRow[]): number {
  return rows.reduce((max, r) => Math.max(max, parseDate(r.date)), 0);
}

function withinRange(rowDate: string, range: DateRangeKey, anchor: number): boolean {
  if (range === "ytd") return true;
  const t = parseDate(rowDate);
  const a = new Date(anchor);
  if (range === "today") {
    const d = new Date(t);
    return d.getFullYear() === a.getFullYear() && d.getMonth() === a.getMonth() && d.getDate() === a.getDate();
  }
  if (range === "7d") {
    const days = (anchor - t) / 86_400_000;
    return days >= 0 && days < 7;
  }
  if (range === "mtd") {
    const d = new Date(t);
    return d.getFullYear() === a.getFullYear() && d.getMonth() === a.getMonth();
  }
  return true;
}

/** Apply channel + date-range context to the raw order rows. */
export function selectScopedOrders(orders: OrderRow[], channel: ChannelKey, range: DateRangeKey): OrderRow[] {
  const anchor = anchorTime(orders);
  return orders.filter((o) => {
    if (channel !== "all" && o.channelKey !== channel) return false;
    return withinRange(o.date, range, anchor);
  });
}

const CHANNEL_LABELS: Record<string, string> = {
  "default-channel": "Default Channel (BDT)",
  "channel-dhk": "Dhaka Store (BDT)",
  "channel-ctg": "Chattogram Store (BDT)",
  "b2b-wholesale": "B2B Wholesale (BDT)",
};

/** Prior-window equivalent revenue for a truthful delta (same-length look-back). */
function previousWindowRevenue(orders: OrderRow[], channel: ChannelKey, range: DateRangeKey): number {
  const anchor = anchorTime(orders);
  const spanDays = range === "7d" ? 7 : range === "today" ? 1 : 30;
  const startPrev = anchor - spanDays * 2 * 86_400_000;
  const endPrev = anchor - spanDays * 86_400_000;
  return orders
    .filter((o) => o.status !== "Cancelled")
    .filter((o) => (channel === "all" || o.channelKey === channel))
    .filter((o) => {
      const t = parseDate(o.date);
      return t >= startPrev && t < endPrev;
    })
    .reduce((s, o) => s + o.totalValue, 0);
}

/** Aggregate a full, self-consistent dashboard snapshot. */
export function buildDashboardSnapshot(input: {
  orders: OrderRow[];
  stock: StockRow[];
  pickings: PickingRow[];
  payments: PaymentRow[];
  invoices: InvoiceRow[];
  bills: BillRow[];
  channel: ChannelKey;
  range: DateRangeKey;
}): DashboardSnapshot {
  const { orders, stock, pickings, payments, invoices, bills, channel, range } = input;
  const scoped = selectScopedOrders(orders, channel, range);
  const live = scoped.filter((o) => o.status !== "Cancelled");

  const revenue = live.reduce((s, o) => s + o.totalValue, 0);
  const orderCount = live.length;
  const aov = orderCount ? Math.round((revenue / orderCount) * 100) / 100 : 0;

  const prevRevenue = previousWindowRevenue(orders, channel, range);
  const revenueDeltaPct = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 1000) / 10 : 0;

  const ordersToFulfill = scoped.filter(
    (o) => o.fulfillmentStatus !== "Fulfilled" && o.status !== "Cancelled",
  ).length;

  // Overdue proxy: confirmed/unfulfilled orders sitting longer than the "today" window.
  const anchor = anchorTime(orders);
  const ordersOverdue = scoped.filter(
    (o) =>
      o.status === "Confirmed" &&
      o.fulfillmentStatus !== "Fulfilled" &&
      (anchor - parseDate(o.date)) / 86_400_000 >= 2,
  ).length;

  const inboundPending = payments.filter((p) => p.direction === "Inbound" && p.status !== "Reconciled");
  const paymentsToSettle = inboundPending.reduce((s, p) => s + p.amount, 0);
  const paymentsPendingCount = payments.filter((p) => p.status === "Pending").length;
  const paymentsFailedCount = payments.filter((p) => p.status === "Failed").length;
  const codFloat = payments
    .filter((p) => p.direction === "Inbound" && p.status !== "Reconciled" && (p.method === "Cash on Delivery" || p.method === "Courier COD"))
    .reduce((s, p) => s + p.amount, 0);

  const stockRiskSkus = stock.filter((s) => s.onHand > 0 && s.onHand <= s.reorderPoint).length;
  const stockOutSkus = stock.filter((s) => s.onHand <= 0).length;
  const stockValue = stock.reduce((s, r) => s + r.costValue, 0);

  const openMoves = invoices.filter((i) => i.state === "Posted" || i.state === "Paid");
  const vatOutput = openMoves.reduce((s, i) => s + i.tax, 0);
  const vatInput = bills
    .filter((b) => b.state === "Posted" || b.state === "Paid")
    .reduce((s, b) => s + (b.amountTotal - b.amountTotal / 1.15), 0);
  const vatNet = Math.round((vatOutput - vatInput) * 100) / 100;
  const pendingMushak = invoices.filter((i) => i.state === "Draft").length;

  // Channel split from scoped, live orders (single source of truth with KPI strip).
  const byCh = new Map<string, { revenue: number; orders: number }>();
  for (const o of live) {
    const cur = byCh.get(o.channelKey) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.totalValue;
    cur.orders += 1;
    byCh.set(o.channelKey, cur);
  }
  const channelSplit: ChannelSlice[] = [...byCh.entries()]
    .map(([key, v]) => ({
      key,
      label: CHANNEL_LABELS[key] ?? o0(key),
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
      share: revenue > 0 ? Math.round((v.revenue / revenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Warehouse queues derived from stock.picking documents.
  const now = anchor || Date.now();
  const isLate = (p: PickingRow) => p.state !== "done" && p.state !== "cancel" && parseDate(p.scheduledDate) < now;
  const incoming = pickings.filter((p) => p.kind === "incoming");
  const outgoing = pickings.filter((p) => p.kind === "outgoing");
  const internal = pickings.filter((p) => p.kind === "internal");
  const open = (p: PickingRow) => p.state !== "done" && p.state !== "cancel";
  const queues: WarehouseQueues = {
    inboundToProcess: incoming.filter((p) => p.state === "assigned").length,
    inboundWaiting: incoming.filter((p) => p.state === "confirmed" || p.state === "draft").length,
    inboundLate: incoming.filter(isLate).length,
    packingReady: outgoing.filter((p) => p.state === "assigned").length,
    dispatchReady: outgoing.filter((p) => p.state === "confirmed").length,
    dispatchInTransit: outgoing.filter((p) => p.state === "done").length,
    dispatchLate: outgoing.filter(isLate).length,
    internalOpen: internal.filter(open).length,
  };

  return {
    revenue,
    revenueDeltaPct,
    orderCount,
    aov,
    ordersToFulfill,
    ordersOverdue,
    paymentsToSettle,
    paymentsPendingCount,
    paymentsFailedCount,
    codFloat,
    stockRiskSkus,
    stockOutSkus,
    stockValue,
    vatOutput: Math.round(vatOutput * 100) / 100,
    vatInput: Math.round(vatInput * 100) / 100,
    vatNet,
    pendingMushak,
    channelSplit,
    queues,
  };
}

// tiny fallback label so a missing channel key never renders blank
function o0(key: string): string {
  return key;
}

/** Shared BDT formatter (lakh grouping) reused across the cockpit. */
export function formatBDT(amount: number, opts: { decimals?: boolean } = {}): string {
  const decimals = opts.decimals ?? false;
  return (
    "৳" +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })
  );
}
