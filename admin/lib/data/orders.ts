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
  { id: "ORD-7392", customer: "Olivia Martin", email: "olivia@example.com", channel: "Default Channel (USD)", channelKey: "default-channel", date: "Sep 29, 2026", totalValue: 1878.99, total: "$1,878.99", itemCount: 3, status: "Quotation", paymentStatus: "Pending", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7391", customer: "Liam Anderson", email: "liam@example.com", channel: "Eurozone Store (EUR)", channelKey: "channel-eur", date: "Sep 29, 2026", totalValue: 2199, total: "€2,199.00", itemCount: 1, status: "Confirmed", paymentStatus: "Paid", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7390", customer: "Emma Brown", email: "emma@example.com", channel: "Poland Channel (PLN)", channelKey: "channel-pln", date: "Sep 28, 2026", totalValue: 1840, total: "1,840.00 PLN", itemCount: 2, status: "Fulfilled", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
  { id: "ORD-7389", customer: "Noah Wilson", email: "noah@example.com", channel: "Default Channel (USD)", channelKey: "default-channel", date: "Sep 28, 2026", totalValue: 429, total: "$429.00", itemCount: 1, status: "Invoiced", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
  { id: "ORD-7388", customer: "James Davis", email: "james@example.com", channel: "B2B Wholesale (USD)", channelKey: "b2b-wholesale", date: "Sep 27, 2026", totalValue: 14200, total: "$14,200.00", itemCount: 8, status: "Confirmed", paymentStatus: "Pending", fulfillmentStatus: "Partially" },
  { id: "ORD-7387", customer: "Sophia Taylor", email: "sophia@example.com", channel: "Eurozone Store (EUR)", channelKey: "channel-eur", date: "Sep 27, 2026", totalValue: 430, total: "€430.00", itemCount: 2, status: "Fulfilled", paymentStatus: "Paid", fulfillmentStatus: "Partially" },
  { id: "ORD-7386", customer: "Lucas White", email: "lucas@example.com", channel: "Default Channel (USD)", channelKey: "default-channel", date: "Sep 26, 2026", totalValue: 79.99, total: "$79.99", itemCount: 1, status: "Cancelled", paymentStatus: "Refunded", fulfillmentStatus: "Unfulfilled" },
  { id: "ORD-7385", customer: "Mia Clark", email: "mia@example.com", channel: "Poland Channel (PLN)", channelKey: "channel-pln", date: "Sep 26, 2026", totalValue: 3199, total: "3,199.00 PLN", itemCount: 2, status: "Invoiced", paymentStatus: "Paid", fulfillmentStatus: "Fulfilled" },
];

export async function getOrders(): Promise<OrderRow[]> {
  return ORDERS;
}

/**
 * Fetch a single order with lines. The lines are synthesized from the
 * catalog-shaped product data; in a real resolver this is one query.
 */
export async function getOrderById(id: string): Promise<OrderDetail | undefined> {
  const row = ORDERS.find((o) => o.id === id);
  if (!row) return undefined;
  const lines = SAMPLE_LINES[row.itemCount % SAMPLE_LINES_POOL.length];
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const shipping = row.channelKey === "b2b-wholesale" ? 0 : 14.5;
  const tax = Math.round(subtotal * 0.21 * 100) / 100;
  return {
    ...row,
    lines,
    subtotal,
    shipping,
    tax,
    shippingAddress: "221B Baker Street, London, NW1 6XE, United Kingdom",
    billingAddress: "221B Baker Street, London, NW1 6XE, United Kingdom",
    carrier: row.fulfillmentStatus === "Unfulfilled" ? "Not assigned" : "DHL Express",
    trackingUrl: row.fulfillmentStatus !== "Unfulfilled" ? "https://tracking.example.com/" + row.id : undefined,
  };
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
    { id: "L1", productName: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", variant: "Space Grey", quantity: 1, unitPrice: 59, total: 59 },
    { id: "L2", productName: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", variant: "Titanium Black / 512GB", quantity: 1, unitPrice: 1419, total: 1419 },
    { id: "L3", productName: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", variant: "Midnight / Sport Band", quantity: 1, unitPrice: 429, total: 429 },
  ],
  [
    { id: "L1", productName: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", variant: "Space Black / 18GB", quantity: 1, unitPrice: 2199, total: 2199 },
  ],
];
const SAMPLE_LINES_POOL = SAMPLE_LINES;
