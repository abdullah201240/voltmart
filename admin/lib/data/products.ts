/**
 * Catalog data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolver for the Products (Catalog) section.
 *
 * The shapes mirror a commerce backend (Saleor `Product` / Odoo
 * `product.template`) so that replacing `getProducts()` with a real
 * GraphQL/REST call later is a drop-in change — the page only depends
 * on the `ProductRow` type and this module's exported functions.
 */

/** Backend-agnostic availability, derived from stock (Odoo `stock.quant`). */
export type Availability = "in_stock" | "low_stock" | "out_of_stock";

/** Publication state (Saleor `isPublished` / Odoo eCommerce visibility). */
export type ProductStatus = "Active" | "Draft" | "Archived";

/** A sellable product (template-level) as shown in the catalog table. */
export interface ProductRow {
  id: string;
  name: string;
  /** Internal reference / SKU of the default variant. */
  sku: string;
  /** EAN/UPC barcode of the default variant ("" if unset). */
  barcode: string;
  category: string;
  categoryKey: string;
  channel: string;
  channelKey: string;
  /** Display price string (already currency-formatted by the resolver). */
  price: string;
  /** Numeric price used for sorting / math. */
  priceValue: number;
  /** Total on-hand quantity across stock locations. */
  stock: number;
  /** Reserved qty currently attached to open orders. */
  onOrder: number;
  /** Number of variant records under this template. */
  variants: number;
  status: ProductStatus;
  /** Reorder threshold; stock at/under this = low. */
  reorderPoint: number;
}

/** Filter options reused by the toolbar dropdowns (SearchableDropbox). */
export const CHANNEL_OPTIONS = [
  { value: "all", label: "All Channels", badge: "GLOBAL" },
  { value: "default-channel", label: "Default Channel (BDT)", badge: "BDT" },
  { value: "channel-ctg", label: "Chattogram Store (BDT)", badge: "BDT" },
  { value: "channel-dhk", label: "Dhaka Store (BDT)", badge: "BDT" },
  { value: "b2b-wholesale", label: "B2B Wholesale (BDT)", badge: "TIERED" },
];

export const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "mobiles", label: "Mobiles & Tablets" },
  { value: "computing", label: "Computing" },
  { value: "audio", label: "Audio" },
  { value: "gaming", label: "Gaming" },
  { value: "wearables", label: "Wearables" },
  { value: "accessories", label: "Accessories" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "Any Availability" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

/**
 * Mock catalog. Swap the body of `getProducts()` for a real API call
 * (e.g. Saleor `products(first:…)` via the dashboard's GraphQL client)
 * and keep the `ProductRow[]` return contract.
 */
const PRODUCTS: ProductRow[] = [
  { id: "P-1001", name: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", barcode: "8806095309421", category: "Mobiles & Tablets", categoryKey: "mobiles", channel: "Default Channel (BDT)", channelKey: "default-channel", price: "৳1,70,280", priceValue: 170280, stock: 42, onOrder: 6, variants: 3, status: "Active", reorderPoint: 10 },
  { id: "P-1002", name: "iPhone 15 Pro 256GB", sku: "MOB-IP15P-256", barcode: "194253306721", category: "Mobiles & Tablets", categoryKey: "mobiles", channel: "Default Channel (BDT)", channelKey: "default-channel", price: "৳1,43,880", priceValue: 143880, stock: 8, onOrder: 4, variants: 4, status: "Active", reorderPoint: 10 },
  { id: "P-1003", name: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", barcode: "950575505109", category: "Computing", categoryKey: "computing", channel: "Dhaka Store (BDT)", channelKey: "channel-dhk", price: "৳2,63,880", priceValue: 263880, stock: 0, onOrder: 0, variants: 2, status: "Active", reorderPoint: 5 },
  { id: "P-1004", name: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", barcode: "4548736135063", category: "Audio", categoryKey: "audio", channel: "Default Channel (BDT)", channelKey: "default-channel", price: "৳41,999", priceValue: 41999, stock: 3, onOrder: 2, variants: 3, status: "Active", reorderPoint: 8 },
  { id: "P-1005", name: "PlayStation 5 Slim Console", sku: "GAM-PS5-SLIM", barcode: "071171957726", category: "Gaming", categoryKey: "gaming", channel: "Chattogram Store (BDT)", channelKey: "channel-ctg", price: "৳65,880", priceValue: 65880, stock: 27, onOrder: 9, variants: 2, status: "Active", reorderPoint: 10 },
  { id: "P-1006", name: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", barcode: "950575594332", category: "Wearables", categoryKey: "wearables", channel: "Default Channel (BDT)", channelKey: "default-channel", price: "৳51,480", priceValue: 51480, stock: 15, onOrder: 1, variants: 6, status: "Active", reorderPoint: 6 },
  { id: "P-1007", name: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", barcode: "", category: "Accessories", categoryKey: "accessories", channel: "B2B Wholesale (BDT)", channelKey: "b2b-wholesale", price: "৳7,080", priceValue: 7080, stock: 5, onOrder: 12, variants: 1, status: "Active", reorderPoint: 15 },
  { id: "P-1008", name: "LG OLED evo C4 65\"", sku: "TV-LGC4-65", barcode: "8806087156234", category: "Computing", categoryKey: "computing", channel: "Dhaka Store (BDT)", channelKey: "channel-dhk", price: "৳2,27,880", priceValue: 227880, stock: 11, onOrder: 0, variants: 3, status: "Draft", reorderPoint: 4 },
  { id: "P-1009", name: "Logitech G Pro X Superlight 2", sku: "GAM-GPX2-WHT", barcode: "5099206101047", category: "Gaming", categoryKey: "gaming", channel: "Default Channel (BDT)", channelKey: "default-channel", price: "৳19,199", priceValue: 19199, stock: 0, onOrder: 0, variants: 2, status: "Archived", reorderPoint: 8 },
  { id: "P-1010", name: "iPad Air 11\" M2 256GB", sku: "TAB-IPAIR-M2", barcode: "950575514826", category: "Mobiles & Tablets", categoryKey: "mobiles", channel: "Chattogram Store (BDT)", channelKey: "channel-ctg", price: "৳95,880", priceValue: 95880, stock: 19, onOrder: 3, variants: 4, status: "Active", reorderPoint: 6 },
];

/** Derive availability from on-hand stock vs the reorder point. */
export function availabilityOf(row: ProductRow): Availability {
  if (row.stock <= 0) return "out_of_stock";
  if (row.stock <= row.reorderPoint) return "low_stock";
  return "in_stock";
}

import { withOverlay } from "@/lib/data/ops";
import { PRODUCT_TEMPLATE } from "@/lib/data/workflows";

/**
 * Async resolver used by the page. Merges the ops overlay so publication
 * actions (publish / archive) made in the UI are reflected everywhere.
 * Replace with a fetch to a real backend later.
 */
export async function getProducts(): Promise<ProductRow[]> {
  return PRODUCTS.map((p) => withOverlay(PRODUCT_TEMPLATE, p.id, p));
}

/** Aggregate catalog KPIs (counts), matching the Odoo/Saleor catalog view. */
export function catalogStats(rows: ProductRow[]) {
  const active = rows.filter((r) => r.status === "Active").length;
  const variants = rows.reduce((sum, r) => sum + r.variants, 0);
  const low = rows.filter((r) => availabilityOf(r) === "low_stock").length;
  const out = rows.filter((r) => availabilityOf(r) === "out_of_stock").length;
  const noBarcode = rows.filter((r) => !r.barcode).length;
  return { total: rows.length, active, variants, low, out, noBarcode };
}
