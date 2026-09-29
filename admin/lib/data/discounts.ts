/**
 * Discounts & Pricelists data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the promotions section:
 *  - Vouchers/coupons  (Saleor `Voucher`)
 *  - Pricelists        (Odoo `product.pricelist` + compute policy)
 *  - Promotions        (Saleor `Promotion` — rule-based automatic discounts)
 *
 * Pricelist compute policies mirror Odoo: fixed price, percentage,
 * discount, markup, margin. Swap resolvers for real queries later.
 */

export type VoucherType = "Fixed" | "Percentage" | "Shipping";

export interface VoucherRow {
  id: string;
  code: string;
  type: VoucherType;
  /** Discount magnitude — amount or percent depending on `type`. */
  value: number;
  /** Human display, e.g. "$50 off" / "10% off". */
  discount: string;
  usageLimit: number;
  used: number;
  startsAt: string;
  expiresAt: string;
  status: "Active" | "Scheduled" | "Expired";
}

export type PricelistPolicy = "Fixed Price" | "Percentage" | "Discount" | "Markup" | "Margin";

export interface PricelistRow {
  id: string;
  name: string;
  currency: string;
  policy: PricelistPolicy;
  /** Whether this is the fallback list applied when nothing matches. */
  isBase: boolean;
  items: number;
  status: "Active" | "Archived";
}

export interface PromotionRow {
  id: string;
  name: string;
  /** Short description of the trigger → reward rule. */
  rule: string;
  channel: string;
  discount: string;
  status: "Active" | "Scheduled" | "Expired";
}

export const VOUCHER_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Expired", label: "Expired" },
];

export const VOUCHER_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "Fixed", label: "Fixed Amount" },
  { value: "Percentage", label: "Percentage" },
  { value: "Shipping", label: "Free Shipping" },
];

const VOUCHERS: VoucherRow[] = [
  { id: "V-01", code: "WELCOME10", type: "Percentage", value: 10, discount: "10% off", usageLimit: 0, used: 342, startsAt: "Jan 01, 2026", expiresAt: "Dec 31, 2026", status: "Active" },
  { id: "V-02", code: "FREESHIP", type: "Shipping", value: 0, discount: "Free shipping", usageLimit: 1000, used: 618, startsAt: "Aug 01, 2026", expiresAt: "Oct 31, 2026", status: "Active" },
  { id: "V-03", code: "SAVE50", type: "Fixed", value: 6000, discount: "৳6,000 off", usageLimit: 500, used: 500, startsAt: "Jun 01, 2026", expiresAt: "Aug 31, 2026", status: "Expired" },
  { id: "V-04", code: "BFCM25", type: "Percentage", value: 25, discount: "25% off", usageLimit: 2000, used: 0, startsAt: "Nov 25, 2026", expiresAt: "Dec 01, 2026", status: "Scheduled" },
];

const PRICELISTS: PricelistRow[] = [
  { id: "PL-01", name: "Public Pricelist", currency: "BDT", policy: "Fixed Price", isBase: true, items: 0, status: "Active" },
  { id: "PL-02", name: "VIP Members", currency: "BDT", policy: "Percentage", isBase: false, items: 46, status: "Active" },
  { id: "PL-03", name: "B2B Wholesale", currency: "BDT", policy: "Discount", isBase: false, items: 120, status: "Active" },
  { id: "PL-04", name: "Dhaka Retail", currency: "BDT", policy: "Fixed Price", isBase: false, items: 88, status: "Active" },
  { id: "PL-05", name: "Clearance Markup", currency: "BDT", policy: "Markup", isBase: false, items: 12, status: "Archived" },
];

const PROMOTIONS: PromotionRow[] = [
  { id: "PR-01", name: "Buy 2 Get 10% Off", rule: "Cart has 2+ of same product", channel: "Default Channel (BDT)", discount: "10% off", status: "Active" },
  { id: "PR-02", name: "Spend ৳20,000, Free Shipping", rule: "Order subtotal >= ৳20,000", channel: "Default Channel (BDT)", discount: "Free shipping", status: "Active" },
  { id: "PR-03", name: "Laptop +Accessory Bundle", rule: "Laptop + any accessory", channel: "Dhaka Store (BDT)", discount: "৳3,600 off", status: "Scheduled" },
  { id: "PR-04", name: "Weekend Flash Sale", rule: "All items, Sat–Sun", channel: "Chattogram Store (BDT)", discount: "15% off", status: "Expired" },
];

export async function getVouchers(): Promise<VoucherRow[]> {
  return VOUCHERS;
}

export async function getPricelists(): Promise<PricelistRow[]> {
  return PRICELISTS;
}

export async function getPromotions(): Promise<PromotionRow[]> {
  return PROMOTIONS;
}

export function voucherStats(rows: VoucherRow[]) {
  const active = rows.filter((r) => r.status === "Active").length;
  const redeemed = rows.reduce((s, r) => s + r.used, 0);
  const expired = rows.filter((r) => r.status === "Expired").length;
  return { total: rows.length, active, redeemed, expired };
}

export function pricelistStats(rows: PricelistRow[]) {
  const active = rows.filter((r) => r.status === "Active").length;
  const items = rows.reduce((s, r) => s + r.items, 0);
  const currencies = new Set(rows.map((r) => r.currency)).size;
  return { total: rows.length, active, items, currencies };
}

export function promotionStats(rows: PromotionRow[]) {
  const active = rows.filter((r) => r.status === "Active").length;
  const scheduled = rows.filter((r) => r.status === "Scheduled").length;
  return { total: rows.length, active, scheduled };
}
