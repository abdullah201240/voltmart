/**
 * Orders data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolver for the Orders (Sales) section.
 *
 * Status lifecycle mirrors Odoo `sale.order` (draft -> sale -> done)
 * combined with fulfillment (stock.picking) and invoicing (account.move)
 * progress, and maps to a Saleor order (`status`, `isPaid`,
 * `isFullyFulfilled`). Drop-in swappable: replace `getOrders()` /
 * `getOrderById()` with real queries and keep the return contracts.
 */

import { withOverlay, listAdded } from "./ops";

/** Order lifecycle — the business-process states an order moves through. */
export type OrderStatus =
  | "Quotation"
  | "Confirmed"
  | "Fulfilled"
  | "Invoiced"
  | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Unpaid";
export type FulfillmentStatus = "Unfulfilled" | "Partially" | "Fulfilled";

/** A line item on the order (Saleor `OrderLine` / Odoo `sale.order.line`). */
export interface OrderLine {
  id: string;
  productName: string;
  sku: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/** Order list row. */
export interface OrderRow {
  id: string;
  customer: string;
  email: string;
  channel: string;
  channelKey: string;
  date: string;
  /** Numeric total for sorting / math. */
  totalValue: number;
  /** Display total incl. currency symbol. */
  total: string;
  itemCount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
}

/** Full order with lines + addresses (order detail). */
export interface OrderDetail extends OrderRow {
  shippingAddress: string;
  billingAddress: string;
  carrier: string;
  trackingUrl?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  lines: OrderLine[];
}

export const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Quotation", label: "Quotation" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Fulfilled", label: "Fulfilled" },
  { value: "Invoiced", label: "Invoiced" },
  { value: "Cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "Any Payment" },
  { value: "Paid", label: "Paid" },
  { value: "Pending", label: "Pending" },
  { value: "Unpaid", label: "Unpaid" },
  { value: "Refunded", label: "Refunded" },
];

/** Ordered lifecycle used by the detail status stepper. */
export const ORDER_FLOW: OrderStatus[] = [
  "Quotation",
  "Confirmed",
  "Fulfilled",
  "Invoiced",
];

const ORDERS: OrderRow[] = [
  { id: "ORD-7392", customer: "Olivia Martin", email: "olivia@example.com", channel: "Default Channel (BDT)", channelKey: "default-channel", date: "Sep 29, 2026", totalValue: 225478.8, total: "৳2,25,478.80", itemCount: 3, status: "Quotation", paymentStatus: "Pending", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7391", customer: "Liam Anderson", email: "liam@example.com", channel: "Dhaka Store (BDT)", channelKey: "channel-dhk", date: "Sep 29, 2026", totalValue: 263880, total: "৳2,63,880.00", itemCount: 1, status: "Confirmed", paymentStatus: "Paid", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7390", customer: "Emma Brown", email: "emma@example.com", channel: "Chattogram Store (BDT)", channelKey: "channel-ctg", date: "Sep 28, 2026", totalValue: 220800, total: "৳2,20,800.00", itemCount: 2, status: "Fulfilled", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
  { id: "ORD-7389", customer: "Noah Wilson", email: "noah@example.com", channel: "Default Channel (BDT)", channelKey: "default-channel", date: "Sep 28, 2026", totalValue: 51480, total: "৳51,480.00", itemCount: 1, status: "Invoiced", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
  { id: "ORD-7388", customer: "James Davis", email: "james@example.com", channel: "B2B Wholesale (BDT)", channelKey: "b2b-wholesale", date: "Sep 27, 2026", totalValue: 1704000, total: "৳17,04,000.00", itemCount: 8, status: "Confirmed", paymentStatus: "Pending", fulfillmentStatus: "Partially" },
  { id: "ORD-7387", customer: "Sophia Taylor", email: "sophia@example.com", channel: "Dhaka Store (BDT)", channelKey: "channel-dhk", date: "Sep 27, 2026", totalValue: 51600, total: "৳51,600.00", itemCount: 2, status: "Fulfilled", paymentStatus: "Paid", fulfillmentStatus: "Partially" },
  { id: "ORD-7386", customer: "Lucas White", email: "lucas@example.com", channel: "Default Channel (BDT)", channelKey: "default-channel", date: "Sep 26, 2026", totalValue: 9598.8, total: "৳9,598.80", itemCount: 1, status: "Cancelled", paymentStatus: "Refunded", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7385", customer: "Mia Clark", email: "mia@example.com", channel: "Chattogram Store (BDT)", channelKey: "channel-ctg", date: "Sep 26, 2026", totalValue: 383880, total: "৳3,83,880.00", itemCount: 2, status: "Invoiced", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
];

export async function getOrders(): Promise<OrderRow[]> {
  // Merge newly added orders (from storefront checkout or admin creation) with base rows and overlays
  const added = (typeof window !== "undefined" ? listAdded("sale.order") : []) as unknown as OrderRow[];
  const base = ORDERS.map((o) => withOverlay("sale.order", o.id, o));
  return [...added, ...base];
}

/**
 * Fetch a single order with lines. The lines are synthesized from the
 * catalog-shaped product data; in a real resolver this is one query.
 */
export async function getOrderById(id: string): Promise<OrderDetail | undefined> {
  const dynamicOrders = (typeof window !== "undefined" ? listAdded("sale.order") : []) as unknown as OrderDetail[];
  const dynamicMatch = dynamicOrders.find((o) => o.id === id);
  if (dynamicMatch) {
    return withOverlay("sale.order", id, dynamicMatch);
  }

  const row = ORDERS.find((o) => o.id === id);
  if (!row) return undefined;
  const lines = SAMPLE_LINES[row.itemCount % SAMPLE_LINES_POOL.length];
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const shipping = row.channelKey === "b2b-wholesale" ? 0 : 1740;
  const tax = Math.round(subtotal * 0.15 * 100) / 100;
  const detail: OrderDetail = {
    ...row,
    lines,
    subtotal,
    shipping,
    tax,
    shippingAddress: "House 42, Road 11, Banani, Dhaka 1213, Bangladesh",
    billingAddress: "House 42, Road 11, Banani, Dhaka 1213, Bangladesh",
    carrier: row.fulfillmentStatus === "Unfulfilled" ? "Not assigned" : "DHL Express",
    trackingUrl: row.fulfillmentStatus !== "Unfulfilled" ? "https://tracking.example.com/" + row.id : undefined,
  };
  // Reflect workflow transitions (status/fulfillment/payment/carrier) onto detail.
  return withOverlay("sale.order", id, detail);
}

/** Aggregate order KPIs for the list header. */
export function orderStats(rows: OrderRow[]) {
  const revenue = rows.filter((r) => r.status !== "Cancelled").reduce((s, r) => s + r.totalValue, 0);
  const pending = rows.filter((r) => r.status === "Quotation" || r.status === "Confirmed").length;
  const unfulfilled = rows.filter((r) => r.fulfillmentStatus !== "Fulfilled" && r.status !== "Cancelled").length;
  const cancelled = rows.filter((r) => r.status === "Cancelled").length;
  return { total: rows.length, revenue, pending, unfulfilled, cancelled };
}

// --- sample line pools keyed by itemCount bucket (demo realism) ---
const SAMPLE_LINES: OrderLine[][] = [
  [
    { id: "L1", productName: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", variant: "Space Grey", quantity: 1, unitPrice: 7080, total: 7080 },
    { id: "L2", productName: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", variant: "Titanium Black / 512GB", quantity: 1, unitPrice: 170280, total: 170280 },
    { id: "L3", productName: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", variant: "Midnight / Sport Band", quantity: 1, unitPrice: 51480, total: 51480 },
  ],
  [
    { id: "L1", productName: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", variant: "Space Black / 18GB", quantity: 1, unitPrice: 263880, total: 263880 },
  ],
];
const SAMPLE_LINES_POOL = SAMPLE_LINES;
