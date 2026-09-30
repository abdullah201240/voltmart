/**
 * Units of Measure (UoM) Data Layer
 * ------------------------------------------------------------------
 * Supports Odoo ERP (`uom.uom`, `uom.category`) and Saleor/Shopify measurement standards.
 * Categories: Unit/Count, Weight, Volume/Liquid, Length/Dimension, Time.
 */

export type UomCategory = "count" | "weight" | "volume" | "length" | "time";

export interface UnitOfMeasure {
  id: string;
  code: string; // e.g. "pcs", "kg", "g", "L", "m", "box"
  name: string; // e.g. "Pieces", "Kilograms", "Grams"
  category: UomCategory;
  categoryLabel: string;
  /** Whether this is the base reference unit for its category (e.g. kg for weight, pcs for count, m for length) */
  isBase: boolean;
  /** Conversion ratio to the base unit in this category (e.g. 1 kg = 1000 g, ratio = 1000 for g) */
  ratio: number;
  /** Rounding precision (e.g. 0 for pcs, 0.001 for kg) */
  rounding: number;
  status: "Active" | "Archived";
  description?: string;
}

export const UOM_CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "count", label: "Count / Units (pcs, box, pack)", badge: "COUNT" },
  { value: "weight", label: "Weight & Mass (kg, g, lb)", badge: "WEIGHT" },
  { value: "volume", label: "Volume & Liquid (L, mL)", badge: "VOLUME" },
  { value: "length", label: "Length & Dimensions (m, cm, in)", badge: "LENGTH" },
  { value: "time", label: "Time & Service (hr, day)", badge: "TIME" },
];

export const INITIAL_UOMS: UnitOfMeasure[] = [
  // Count / Discrete Units
  {
    id: "UOM-001",
    code: "pcs",
    name: "Pieces",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: true,
    ratio: 1,
    rounding: 1,
    status: "Active",
    description: "Standard piece count for electronics, apparel, and general merchandise",
  },
  {
    id: "UOM-002",
    code: "unit",
    name: "Units",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 1,
    rounding: 1,
    status: "Active",
    description: "Discrete inventory and manufacturing component units",
  },
  {
    id: "UOM-003",
    code: "box",
    name: "Box (Pack of 10)",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 10,
    rounding: 1,
    status: "Active",
    description: "Multipack wholesale packaging box",
  },
  {
    id: "UOM-004",
    code: "pk",
    name: "Pack",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 1,
    rounding: 1,
    status: "Active",
    description: "Retail blister pack or accessory bundle",
  },
  {
    id: "UOM-005",
    code: "pair",
    name: "Pair",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 2,
    rounding: 1,
    status: "Active",
    description: "Pairs (earphones, shoes, audio drivers)",
  },
  {
    id: "UOM-006",
    code: "set",
    name: "Set",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 1,
    rounding: 1,
    status: "Active",
    description: "Multi-item bundled kits (keyboard + mouse set, screwdriver kit)",
  },
  {
    id: "UOM-007",
    code: "dz",
    name: "Dozen (12 pcs)",
    category: "count",
    categoryLabel: "Count / Units",
    isBase: false,
    ratio: 12,
    rounding: 1,
    status: "Active",
    description: "12 pieces commercial bundle",
  },

  // Weight / Mass Units
  {
    id: "UOM-010",
    code: "kg",
    name: "Kilograms",
    category: "weight",
    categoryLabel: "Weight & Mass",
    isBase: true,
    ratio: 1,
    rounding: 0.01,
    status: "Active",
    description: "SI base unit of mass; standard for bulk hardware and courier freight",
  },
  {
    id: "UOM-011",
    code: "g",
    name: "Grams",
    category: "weight",
    categoryLabel: "Weight & Mass",
    isBase: false,
    ratio: 0.001,
    rounding: 0.1,
    status: "Active",
    description: "Gram measurement for micro-components, semiconductors, and jewelry",
  },
  {
    id: "UOM-012",
    code: "lb",
    name: "Pounds",
    category: "weight",
    categoryLabel: "Weight & Mass",
    isBase: false,
    ratio: 0.453592,
    rounding: 0.01,
    status: "Active",
    description: "Imperial weight unit for cross-border freight",
  },

  // Volume / Liquid Units
  {
    id: "UOM-020",
    code: "L",
    name: "Liters",
    category: "volume",
    categoryLabel: "Volume & Liquid",
    isBase: true,
    ratio: 1,
    rounding: 0.01,
    status: "Active",
    description: "Liquid measure for thermal paste, cleaning alcohol, and chemicals",
  },
  {
    id: "UOM-021",
    code: "mL",
    name: "Milliliters",
    category: "volume",
    categoryLabel: "Volume & Liquid",
    isBase: false,
    ratio: 0.001,
    rounding: 1,
    status: "Active",
    description: "Precise liquid dispenser volume (e.g. 50mL contact cleaner)",
  },

  // Length / Dimension Units
  {
    id: "UOM-030",
    code: "m",
    name: "Meters",
    category: "length",
    categoryLabel: "Length & Dimensions",
    isBase: true,
    ratio: 1,
    rounding: 0.01,
    status: "Active",
    description: "Linear length for network patch cables, power cords, and LED strips",
  },
  {
    id: "UOM-031",
    code: "cm",
    name: "Centimeters",
    category: "length",
    categoryLabel: "Length & Dimensions",
    isBase: false,
    ratio: 0.01,
    rounding: 0.1,
    status: "Active",
    description: "Package physical shipping dimensions",
  },
  {
    id: "UOM-032",
    code: "roll",
    name: "Roll (100m)",
    category: "length",
    categoryLabel: "Length & Dimensions",
    isBase: false,
    ratio: 100,
    rounding: 1,
    status: "Active",
    description: "100-meter bulk wire spool / roll",
  },
];

/**
 * Dropdown options for product creation forms
 */
export const PRODUCT_UOM_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)", badge: "Count" },
  { value: "unit", label: "Units (unit)", badge: "Count" },
  { value: "kg", label: "Kilograms (kg)", badge: "Weight" },
  { value: "g", label: "Grams (g)", badge: "Weight" },
  { value: "box", label: "Box (box)", badge: "Pack" },
  { value: "pk", label: "Pack (pk)", badge: "Pack" },
  { value: "set", label: "Set (set)", badge: "Bundle" },
  { value: "pair", label: "Pair (pair)", badge: "Count" },
  { value: "dz", label: "Dozen (dz)", badge: "Count" },
  { value: "L", label: "Liters (L)", badge: "Volume" },
  { value: "mL", label: "Milliliters (mL)", badge: "Volume" },
  { value: "m", label: "Meters (m)", badge: "Length" },
  { value: "roll", label: "Roll (roll)", badge: "Length" },
];

export async function getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
  return INITIAL_UOMS;
}

export function uomStats(rows: UnitOfMeasure[]) {
  const active = rows.filter((r) => r.status === "Active").length;
  const countUoms = rows.filter((r) => r.category === "count").length;
  const weightUoms = rows.filter((r) => r.category === "weight").length;
  const volumeUoms = rows.filter((r) => r.category === "volume").length;
  const lengthUoms = rows.filter((r) => r.category === "length").length;
  return {
    total: rows.length,
    active,
    countUoms,
    weightUoms,
    volumeUoms,
    lengthUoms,
  };
}

/** Format quantity with UoM code (e.g. "42 pcs", "1.5 kg") */
export function formatQtyWithUom(qty: number, uomCode = "pcs"): string {
  const safeQty = Number(qty) || 0;
  return `${safeQty.toLocaleString("en-IN")} ${uomCode}`;
}
