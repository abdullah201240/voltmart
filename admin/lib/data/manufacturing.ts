/**
 * Manufacturing (mrp) data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolvers for the Manufacturing app — the module
 * that was entirely missing from the admin.
 *
 * Mirrors Odoo `mrp.bom` (bill of materials: components + operations),
 * `mrp.workcenter` (capacity / efficiency / cycle time) and
 * `mrp.production` (manufacturing order lifecycle: planned -> confirmed
 * -> in progress -> to close -> done). Swap the resolvers for a real API
 * without touching the pages, exactly like the other data modules.
 */

import { withOverlay } from "./ops";

export type BomType = "normal" | "phantom" | "kit";

export interface BomComponent {
  id: string;
  product: string;
  sku: string;
  qty: number;
  uom: string;
}

export interface BomOperation {
  id: string;
  workCenter: string;
  name: string;
  duration: number; // minutes
}

export interface BomRow {
  id: string;
  product: string;
  sku: string;
  type: BomType;
  qty: number;
  uom: string;
  unitCost: number; // computed from components at cost
  components: BomComponent[];
  operations: BomOperation[];
}

export interface WorkCenterRow {
  id: string;
  name: string;
  code: string;
  capacity: number; // parallel MOs
  efficiency: number; // %
  cycleTime: number; // minutes per cycle
  targetMove: number; // minutes for inter-operation move
}

export type MoState =
  | "Planned"
  | "Confirmed"
  | "In Progress"
  | "To Close"
  | "Done"
  | "Cancelled";

export interface ManufacturingOrderRow {
  id: string;
  product: string;
  sku: string;
  bom: string;
  qty: number;
  qtyProduced: number;
  unit: string;
  state: MoState;
  origin: string; // sale order / forecast
  scheduledDate: string;
  responsible: string;
  /** Est. component + operation cost. */
  cost: number;
}

/** Ordered MO lifecycle for steppers / kanban columns. */
export const MO_FLOW: MoState[] = [
  "Planned",
  "Confirmed",
  "In Progress",
  "To Close",
  "Done",
];

export const MO_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "Planned", label: "Planned" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "In Progress", label: "In Progress" },
  { value: "To Close", label: "To Close" },
  { value: "Done", label: "Done" },
  { value: "Cancelled", label: "Cancelled" },
];

export const MO_STATE_ACCENT: Record<MoState, string> = {
  Planned: "bg-slate-500",
  Confirmed: "bg-blue-500",
  "In Progress": "bg-cyan-500",
  "To Close": "bg-amber-500",
  Done: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

const WORK_CENTERS: WorkCenterRow[] = [
  { id: "WC1", name: "Assembly Line A", code: "ASM-A", capacity: 3, efficiency: 100, cycleTime: 15, targetMove: 1 },
  { id: "WC2", name: "Soldering Station", code: "SLD", capacity: 2, efficiency: 90, cycleTime: 20, targetMove: 2 },
  { id: "WC3", name: "Quality Control", code: "QC", capacity: 4, efficiency: 100, cycleTime: 8, targetMove: 0 },
  { id: "WC4", name: "Packaging", code: "PKG", capacity: 5, efficiency: 110, cycleTime: 5, targetMove: 1 },
  { id: "WC5", name: "CNC Machining", code: "CNC", capacity: 1, efficiency: 85, cycleTime: 45, targetMove: 3 },
];

const BOMS: BomRow[] = [
  {
    id: "BOM001", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", type: "normal", qty: 1, uom: "Units", unitCost: 220000,
    components: [
      { id: "C1", product: "M3 Pro SoC", sku: "PART-M3PRO", qty: 1, uom: "Units" },
      { id: "C2", product: "18GB Unified RAM", sku: "PART-RAM18", qty: 1, uom: "Units" },
      { id: "C3", product: "14-inch Liquid XDR Panel", sku: "PART-PANEL14", qty: 1, uom: "Units" },
      { id: "C4", product: "Aluminium Chassis", sku: "PART-CHASSIS", qty: 1, uom: "Units" },
    ],
    operations: [
      { id: "O1", workCenter: "CNC Machining", name: "Chassis milling", duration: 45 },
      { id: "O2", workCenter: "Soldering Station", name: "Logic board solder", duration: 20 },
      { id: "O3", workCenter: "Assembly Line A", name: "Final assembly", duration: 15 },
      { id: "O4", workCenter: "Quality Control", name: "Functional test", duration: 8 },
    ],
  },
  {
    id: "BOM002", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", type: "normal", qty: 1, uom: "Units", unitCost: 120000,
    components: [
      { id: "C1", product: "Snapdragon 8 Gen 3", sku: "PART-SD8G3", qty: 1, uom: "Units" },
      { id: "C2", product: "512GB UFS Storage", sku: "PART-UFS512", qty: 1, uom: "Units" },
      { id: "C3", product: "6.8-inch AMOLED", sku: "PART-AMOLED68", qty: 1, uom: "Units" },
    ],
    operations: [
      { id: "O1", workCenter: "Assembly Line A", name: "Board + display assembly", duration: 15 },
      { id: "O2", workCenter: "Quality Control", name: "Camera calibration", duration: 8 },
      { id: "O3", workCenter: "Packaging", name: "Box + accessories", duration: 5 },
    ],
  },
  {
    id: "BOM003", product: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", type: "kit", qty: 1, uom: "Units", unitCost: 5200,
    components: [
      { id: "C1", product: "GaN Charger 100W", sku: "PART-GAN100", qty: 1, uom: "Units" },
      { id: "C2", product: "Braided USB-C Cable 2m", sku: "PART-CABLE2M", qty: 2, uom: "Units" },
    ],
    operations: [],
  },
  {
    id: "BOM004", product: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", type: "normal", qty: 1, uom: "Units", unitCost: 21000,
    components: [
      { id: "C1", product: "40mm Driver Pair", sku: "PART-DRIVER40", qty: 1, uom: "Units" },
      { id: "C2", product: "ANC Processor Board", sku: "PART-ANC", qty: 1, uom: "Units" },
      { id: "C3", product: "Li-ion 800mAh Cell", sku: "PART-BATT800", qty: 1, uom: "Units" },
    ],
    operations: [
      { id: "O1", workCenter: "Soldering Station", name: "Board assembly", duration: 20 },
      { id: "O2", workCenter: "Assembly Line A", name: "Cup + headband fit", duration: 15 },
      { id: "O3", workCenter: "Quality Control", name: "Audio + ANC test", duration: 8 },
    ],
  },
];

const MANUFACTURING_ORDERS: ManufacturingOrderRow[] = [
  { id: "MO/00042", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", bom: "BOM001", qty: 25, qtyProduced: 0, unit: "Units", state: "Planned", origin: "Replenishment", scheduledDate: "Oct 02, 2026", responsible: "Operator Wil", cost: 5500000 },
  { id: "MO/00041", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", bom: "BOM002", qty: 60, qtyProduced: 22, unit: "Units", state: "In Progress", origin: "S00045 (ORD-7388)", scheduledDate: "Sep 30, 2026", responsible: "Operator Wil", cost: 7200000 },
  { id: "MO/00040", product: "Sony WH-1000XM5 Headphones", sku: "AUD-XM5-BLK", bom: "BOM004", qty: 40, qtyProduced: 40, unit: "Units", state: "To Close", origin: "Replenishment", scheduledDate: "Sep 29, 2026", responsible: "Joel Holden", cost: 840000 },
  { id: "MO/00039", product: "USB-C Fast Charging Hub 100W", sku: "ACC-HUB-100W", bom: "BOM003", qty: 120, qtyProduced: 120, unit: "Units", state: "Done", origin: "Replenishment", scheduledDate: "Sep 26, 2026", responsible: "Lukas", cost: 624000 },
  { id: "MO/00038", product: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", bom: "BOM002", qty: 30, qtyProduced: 0, unit: "Units", state: "Confirmed", origin: "S00047 (ORD-7391)", scheduledDate: "Oct 01, 2026", responsible: "Joel Holden", cost: 3600000 },
  { id: "MO/00037", product: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", bom: "BOM001", qty: 15, qtyProduced: 15, unit: "Units", state: "Done", origin: "Replenishment", scheduledDate: "Sep 24, 2026", responsible: "Operator Wil", cost: 3300000 },
];

export async function getWorkCenters(): Promise<WorkCenterRow[]> {
  return WORK_CENTERS;
}

export async function getBoms(): Promise<BomRow[]> {
  return BOMS;
}

export async function getManufacturingOrders(): Promise<ManufacturingOrderRow[]> {
  // Merge workflow overlay so MO transitions persist across pages.
  return MANUFACTURING_ORDERS.map((m) => withOverlay("mrp.production", m.id, m));
}

export function moStats(rows: ManufacturingOrderRow[]) {
  const open = rows.filter((r) => r.state !== "Done" && r.state !== "Cancelled").length;
  const inProgress = rows.filter((r) => r.state === "In Progress" || r.state === "To Close").length;
  const done = rows.filter((r) => r.state === "Done").length;
  const plannedUnits = rows.filter((r) => r.state !== "Done" && r.state !== "Cancelled").reduce((s, r) => s + (r.qty - r.qtyProduced), 0);
  return { total: rows.length, open, inProgress, done, plannedUnits };
}
