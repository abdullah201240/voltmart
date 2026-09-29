/**
 * Inventory / Warehouse data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolvers for the Warehouse (Stock) section.
 *
 * Mirrors Odoo `stock.quant` (on-hand per product/location),
 * `stock.picking` (incoming receipts / outgoing deliveries / internal
 * transfers with the draft -> confirmed -> assigned -> done lifecycle),
 * `stock.lot` and `stock.warehouse.orderpoint`. Swap the resolvers for
 * a real API (Saleor stocks/warehouses, or Odoo) without touching pages.
 */

/** Picking lifecycle — Odoo `stock.picking.state`. */
export type PickingState = "draft" | "confirmed" | "assigned" | "done" | "cancel";
/** Picking direction — Odoo `picking_type_code`. */
export type PickingKind = "incoming" | "outgoing" | "internal";

/** On-hand stock line (product x location). */
export interface StockRow {
  id: string;
  product: string;
  sku: string;
  location: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  unit: string;
  /** Valuation at cost, for the "stock value" KPI. */
  costValue: number;
  reorderPoint: number;
}

/** A transfer document (receipt / delivery / internal move). */
export interface PickingRow {
  id: string;
  name: string;
  kind: PickingKind;
  partner: string;
  origin: string;
  state: PickingState;
  scheduledDate: string;
  lines: number;
  carrier?: string;
  tracking?: string;
}

export const WAREHOUSE_OPTIONS = [
  { value: "all", label: "All Warehouses" },
  { value: "wh-main", label: "Main Warehouse (WH)" },
  { value: "wh-ctg", label: "Chattogram Hub" },
];

export const PICKING_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Waiting" },
  { value: "assigned", label: "Ready" },
  { value: "done", label: "Done" },
];

/** Human labels for the Odoo picking states. */
export const PICKING_STATE_LABEL: Record<PickingState, string> = {
  draft: "Draft",
  confirmed: "Waiting",
  assigned: "Ready",
  done: "Done",
  cancel: "Cancelled",
};

/** Ordered picking lifecycle for a stepper. */
export const PICKING_FLOW: PickingState[] = ["draft", "confirmed", "assigned", "done"];

const STOCK: StockRow[] = [
  { id: "S1", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", location: "WH/Stock", warehouse: "Main Warehouse (WH)", onHand: 42, reserved: 6, unit: "Units", costValue: 1260000, reorderPoint: 10 },
  { id: "S2", product: "iPhone 15 Pro 256GB", sku: "MOB-IP15P-256", location: "WH/Stock", warehouse: "Main Warehouse (WH)", onHand: 8, reserved: 4, unit: "Units", costValue: 864000, reorderPoint: 10 },
  { id: "S3", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", location: "WH/Stock", warehouse: "Main Warehouse (WH)", onHand: 0, reserved: 0, unit: "Units", costValue: 0, reorderPoint: 5 },
  { id: "S4", product: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", location: "WH/Stock", warehouse: "Main Warehouse (WH)", onHand: 3, reserved: 2, unit: "Units", costValue: 90000, reorderPoint: 8 },
  { id: "S5", product: "PlayStation 5 Slim Console", sku: "GAM-PS5-SLIM", location: "WH/Stock", warehouse: "Chattogram Hub", onHand: 27, reserved: 9, unit: "Units", costValue: 972000, reorderPoint: 10 },
  { id: "S6", product: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", location: "WH/Stock", warehouse: "Main Warehouse (WH)", onHand: 5, reserved: 12, unit: "Units", costValue: 18000, reorderPoint: 15 },
  { id: "S7", product: "Apple Watch Series 9 45mm", sku: "WEAR-AW9-45", location: "WH/Stock", warehouse: "Chattogram Hub", onHand: 15, reserved: 1, unit: "Units", costValue: 540000, reorderPoint: 6 },
];

const PICKINGS: PickingRow[] = [
  // Incoming receipts (from purchase orders)
  { id: "WH/IN/00012", name: "WH/IN/00012", kind: "incoming", partner: "Ready Mat", origin: "P00012", state: "assigned", scheduledDate: "Sep 30, 2026", lines: 2 },
  { id: "WH/IN/00011", name: "WH/IN/00011", kind: "incoming", partner: "Wood Corner", origin: "P00011", state: "confirmed", scheduledDate: "Oct 02, 2026", lines: 5 },
  { id: "WH/IN/00010", name: "WH/IN/00010", kind: "incoming", partner: "Deco Addict", origin: "P00010", state: "done", scheduledDate: "Sep 24, 2026", lines: 1 },
  { id: "WH/IN/00009", name: "WH/IN/00009", kind: "incoming", partner: "Ready Mat", origin: "P00009", state: "draft", scheduledDate: "Oct 05, 2026", lines: 3 },
  // Outgoing deliveries (from sale orders)
  { id: "WH/OUT/00048", name: "WH/OUT/00048", kind: "outgoing", partner: "Olivia Martin", origin: "S00048", state: "assigned", scheduledDate: "Sep 29, 2026", lines: 3, carrier: "DHL Express", tracking: "DHL778123" },
  { id: "WH/OUT/00047", name: "WH/OUT/00047", kind: "outgoing", partner: "Liam Anderson", origin: "S00047", state: "confirmed", scheduledDate: "Sep 29, 2026", lines: 1 },
  { id: "WH/OUT/00046", name: "WH/OUT/00046", kind: "outgoing", partner: "Emma Brown", origin: "S00046", state: "done", scheduledDate: "Sep 27, 2026", lines: 2, carrier: "UPS", tracking: "1Z999AA10" },
  { id: "WH/OUT/00045", name: "WH/OUT/00045", kind: "outgoing", partner: "James Davis", origin: "S00045", state: "draft", scheduledDate: "Sep 30, 2026", lines: 8 },
  // Internal transfers
  { id: "WH/INT/00007", name: "WH/INT/00007", kind: "internal", partner: "Main → Chattogram", origin: "Replenishment", state: "assigned", scheduledDate: "Sep 29, 2026", lines: 4 },
  { id: "WH/INT/00006", name: "WH/INT/00006", kind: "internal", partner: "Stock → Quality Control", origin: "QC check", state: "done", scheduledDate: "Sep 25, 2026", lines: 1 },
];

export async function getStock(): Promise<StockRow[]> {
  return STOCK;
}

export async function getPickings(kind: PickingKind): Promise<PickingRow[]> {
  return PICKINGS.filter((p) => p.kind === kind);
}

export function stockStats(rows: StockRow[]) {
  const totalUnits = rows.reduce((s, r) => s + r.onHand, 0);
  const value = rows.reduce((s, r) => s + r.costValue, 0);
  const low = rows.filter((r) => r.onHand > 0 && r.onHand <= r.reorderPoint).length;
  const out = rows.filter((r) => r.onHand <= 0).length;
  return { skus: rows.length, totalUnits, value, low, out };
}

export function pickingStats(rows: PickingRow[]) {
  const ready = rows.filter((r) => r.state === "assigned").length;
  const waiting = rows.filter((r) => r.state === "confirmed" || r.state === "draft").length;
  const done = rows.filter((r) => r.state === "done").length;
  return { total: rows.length, ready, waiting, done };
}
