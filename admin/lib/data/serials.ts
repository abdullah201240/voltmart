/**
 * Serial / IMEI registry data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the physical-unit (serial / IMEI) ledger a consumer-
 * electronics store needs for warranty + RMA lookup. Every high-value device
 * sold carries a unique unit id captured at pack time; this registry tracks
 * where each unit is (in stock, delivered, returned, in repair) and when its
 * warranty expires.
 *
 * Self-contained demo data — no BTRC / carrier / manufacturer API is called.
 */

import { withOverlay, listAdded } from "@/lib/data/ops";

export type SerialState = "In Stock" | "Reserved" | "Delivered" | "Returned" | "In Repair";

export interface SerialRow {
  /** The physical unit identifier (IMEI or serial number). */
  id: string;
  kind: "IMEI" | "Serial";
  product: string;
  sku: string;
  state: SerialState;
  /** Current holder: a warehouse location, or an order ref once delivered. */
  holder: string;
  orderRef?: string;
  /** ISO-ish display date the unit's warranty cover ends. */
  warrantyEnd: string;
  registered: string;
}

export const SERIAL_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "In Stock", label: "In Stock" },
  { value: "Reserved", label: "Reserved" },
  { value: "Delivered", label: "Delivered" },
  { value: "Returned", label: "Returned" },
  { value: "In Repair", label: "In Repair" },
];

export const SERIAL_STATE_LABEL_META: Record<SerialState, string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Reserved: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Delivered: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Returned: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "In Repair": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const SERIALS: SerialRow[] = [
  { id: "IMEI-928374650011", kind: "IMEI", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", state: "Returned", holder: "Service Lab", orderRef: "ORD-7388", warrantyEnd: "Sep 27, 2027", registered: "Sep 27, 2026" },
  { id: "IMEI-928374650022", kind: "IMEI", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", state: "Delivered", holder: "Main Warehouse (WH)", orderRef: "ORD-7388", warrantyEnd: "Sep 27, 2027", registered: "Sep 27, 2026" },
  { id: "SN-MBP3-77120", kind: "Serial", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", state: "In Repair", holder: "Service Lab", orderRef: "ORD-7385", warrantyEnd: "Sep 26, 2027", registered: "Sep 26, 2026" },
  { id: "SN-MBP3-77121", kind: "Serial", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", state: "In Stock", holder: "WH/Stock", warrantyEnd: "Sep 24, 2027", registered: "Sep 24, 2026" },
  { id: "IMEI-928374651022", kind: "IMEI", product: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", state: "Returned", holder: "Service Lab", orderRef: "ORD-7390", warrantyEnd: "Sep 28, 2027", registered: "Sep 28, 2026" },
  { id: "SN-AW9-44231", kind: "Serial", product: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", state: "Reserved", holder: "WH/Stock", orderRef: "ORD-7387", warrantyEnd: "Sep 27, 2027", registered: "Sep 27, 2026" },
  { id: "SN-IP15P-55091", kind: "Serial", product: "iPhone 15 Pro 256GB", sku: "MOB-IP15P-256", state: "Delivered", holder: "Dhaka Store", orderRef: "ORD-7391", warrantyEnd: "Sep 29, 2027", registered: "Sep 29, 2026" },
  { id: "SN-PS5-33120", kind: "Serial", product: "PlayStation 5 Slim Console", sku: "GAM-PS5-SLIM", state: "In Stock", holder: "Chattogram Hub", warrantyEnd: "Sep 22, 2027", registered: "Sep 22, 2026" },
  { id: "SN-PS5-33121", kind: "Serial", product: "PlayStation 5 Slim Console", sku: "GAM-PS5-SLIM", state: "In Stock", holder: "Chattogram Hub", warrantyEnd: "Sep 22, 2027", registered: "Sep 22, 2026" },
];

export async function getSerials(): Promise<SerialRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("stock.serial") : []) as unknown as SerialRow[];
  const base = SERIALS.map((s) => withOverlay("stock.serial", s.id, s));
  return [...added, ...base];
}

export async function getSerialById(id: string): Promise<SerialRow | undefined> {
  const added = (typeof window !== "undefined" ? listAdded("stock.serial") : []) as unknown as SerialRow[];
  const row = [...added, ...SERIALS].find((s) => s.id === id);
  return row ? withOverlay("stock.serial", id, row) : undefined;
}

export function serialStats(rows: SerialRow[]) {
  const inStock = rows.filter((r) => r.state === "In Stock").length;
  const reserved = rows.filter((r) => r.state === "Reserved").length;
  const delivered = rows.filter((r) => r.state === "Delivered").length;
  const returned = rows.filter((r) => r.state === "Returned").length;
  const inRepair = rows.filter((r) => r.state === "In Repair").length;
  // Units sitting at the service lab awaiting physical validation.
  const pendingAudit = returned + inRepair;
  return { total: rows.length, inStock, reserved, delivered, returned, inRepair, pendingAudit };
}
