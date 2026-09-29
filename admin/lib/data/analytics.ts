/**
 * Analytics data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the reporting section (Odoo Sales→Reporting /
 * Website→Analytics, Saleor analytics). Feeds the `/analytics` charts.
 * Numbers are demo-shaped; swap for real aggregation queries later.
 */

export interface TrendPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface BreakdownSlice {
  name: string;
  value: number;
}

export interface TopProduct {
  name: string;
  sku: string;
  units: number;
  revenue: number;
}

export interface AnalyticsSummary {
  revenue: number;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  aov: number;
  aovDelta: number;
  conversion: number;
  conversionDelta: number;
}

const TREND: TrendPoint[] = [
  { label: "Apr", revenue: 22104000, orders: 1620 },
  { label: "May", revenue: 24174000, orders: 1780 },
  { label: "Jun", revenue: 23616000, orders: 1710 },
  { label: "Jul", revenue: 26988000, orders: 1940 },
  { label: "Aug", revenue: 28572000, orders: 2050 },
  { label: "Sep", revenue: 31356000, orders: 2230 },
];

const BY_CHANNEL: BreakdownSlice[] = [
  { name: "Default (BDT)", value: 15408000 },
  { name: "Dhaka (BDT)", value: 8904000 },
  { name: "Chattogram (BDT)", value: 4668000 },
  { name: "B2B Wholesale", value: 2376000 },
];

const BY_CATEGORY: BreakdownSlice[] = [
  { name: "Mobiles", value: 11544000 },
  { name: "Computing", value: 9408000 },
  { name: "Audio", value: 4956000 },
  { name: "Gaming", value: 3468000 },
  { name: "Wearables", value: 1980000 },
];

const TOP_PRODUCTS: TopProduct[] = [
  { name: "Galaxy S24 Ultra 512GB", sku: "MOB-S24U-512", units: 420, revenue: 71541600 },
  { name: "MacBook Pro 14 M3 Pro", sku: "LAP-MBP14-M3", units: 210, revenue: 55414800 },
  { name: "Sony WH-1000XM5", sku: "AUD-XM5", units: 380, revenue: 13634400 },
  { name: "Apple Watch Series 9", sku: "WEAR-AW9-45", units: 240, revenue: 12355200 },
];

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const revenue = TREND.reduce((s, t) => s + t.revenue, 0);
  const orders = TREND.reduce((s, t) => s + t.orders, 0);
  return {
    revenue,
    revenueDelta: 9.7,
    orders,
    ordersDelta: 8.8,
    aov: Math.round((revenue / orders) * 100) / 100,
    aovDelta: 1.2,
    conversion: 3.4,
    conversionDelta: 0.4,
  };
}

export async function getRevenueTrend(): Promise<TrendPoint[]> {
  return TREND;
}

export async function getSalesByChannel(): Promise<BreakdownSlice[]> {
  return BY_CHANNEL;
}

export async function getSalesByCategory(): Promise<BreakdownSlice[]> {
  return BY_CATEGORY;
}

export async function getTopProducts(): Promise<TopProduct[]> {
  return TOP_PRODUCTS;
}
