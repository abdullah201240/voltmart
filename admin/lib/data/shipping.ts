/**
 * Shipping & Delivery data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the delivery section:
 *  - Carriers / methods (Odoo `delivery.carrier`)
 *  - Zones               (country groups a carrier serves)
 *  - Rate rules          (weight / price based pricing)
 *
 * Mirrors Odoo delivery + Saleor shipping channels (name, method type,
 * margins). Swap resolvers for real queries later.
 */

export type CarrierProvider = "DHL Express" | "UPS" | "FedEx" | "PostNL" | "Local Courier";

export interface CarrierRow {
  id: string;
  name: string;
  provider: CarrierProvider;
  /** How the price is computed. */
  method: "Fixed Price" | "Weight Based" | "Based on Order" | "Free";
  countries: number;
  /** Margin % added on top of the carrier tariff. */
  margin: number;
  active: boolean;
}

export interface ShippingZoneRow {
  id: string;
  name: string;
  countries: string[];
  carriers: number;
  /** Typical delivery window for the zone. */
  deliveryDays: string;
}

export interface ShippingRateRow {
  id: string;
  carrier: string;
  zone: string;
  /** Pricing model label. */
  basis: string;
  /** Human price, e.g. "৳1,440" / "+ ৳240 / kg". */
  price: string;
  freeAbove: number | null;
}

export const CARRIER_PROVIDER_OPTIONS = [
  { value: "all", label: "All Providers" },
  { value: "DHL Express", label: "DHL Express" },
  { value: "UPS", label: "UPS" },
  { value: "FedEx", label: "FedEx" },
  { value: "PostNL", label: "PostNL" },
  { value: "Local Courier", label: "Local Courier" },
];

const CARRIERS: CarrierRow[] = [
  { id: "CAR-01", name: "DHL International", provider: "DHL Express", method: "Weight Based", countries: 42, margin: 8, active: true },
  { id: "CAR-02", name: "UPS Standard", provider: "UPS", method: "Weight Based", countries: 30, margin: 5, active: true },
  { id: "CAR-03", name: "FedEx Priority", provider: "FedEx", method: "Fixed Price", countries: 25, margin: 10, active: true },
  { id: "CAR-04", name: "PostNL Europe", provider: "PostNL", method: "Based on Order", countries: 18, margin: 3, active: false },
  { id: "CAR-05", name: "City Same-Day", provider: "Local Courier", method: "Fixed Price", countries: 1, margin: 0, active: true },
];

const ZONES: ShippingZoneRow[] = [
  { id: "ZN-01", name: "Inside Dhaka City", countries: ["Dhaka"], carriers: 3, deliveryDays: "Same day – 1 day" },
  { id: "ZN-02", name: "Dhaka Division", countries: ["Dhaka", "Narayanganj", "Gazipur", "Tangail"], carriers: 4, deliveryDays: "1–2 days" },
  { id: "ZN-03", name: "Chattogram & North-East", countries: ["Chattogram", "Sylhet", "Cox's Bazar", "Cumilla"], carriers: 3, deliveryDays: "2–3 days" },
  { id: "ZN-04", name: "Rest of Bangladesh", countries: ["Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"], carriers: 2, deliveryDays: "3–5 days" },
];

const RATES: ShippingRateRow[] = [
  { id: "RT-01", carrier: "DHL International", zone: "Rest of Bangladesh", basis: "First 1kg", price: "৳2,160", freeAbove: 24000 },
  { id: "RT-02", carrier: "DHL International", zone: "Chattogram & North-East", basis: "First 1kg", price: "৳4,080", freeAbove: null },
  { id: "RT-03", carrier: "UPS Standard", zone: "Dhaka Division", basis: "Flat", price: "৳1,140", freeAbove: 12000 },
  { id: "RT-04", carrier: "FedEx Priority", zone: "Inside Dhaka City", basis: "Flat", price: "৳2,640", freeAbove: null },
  { id: "RT-05", carrier: "City Same-Day", zone: "Inside Dhaka City", basis: "Flat", price: "৳1,440", freeAbove: 18000 },
  { id: "RT-06", carrier: "PostNL Europe", basis: "Order value", zone: "Rest of Bangladesh", price: "5% of order", freeAbove: 30000 },
];

export async function getCarriers(): Promise<CarrierRow[]> {
  return CARRIERS;
}

export async function getShippingZones(): Promise<ShippingZoneRow[]> {
  return ZONES;
}

export async function getShippingRates(): Promise<ShippingRateRow[]> {
  return RATES;
}

export function carrierStats(rows: CarrierRow[]) {
  const active = rows.filter((r) => r.active).length;
  const countries = rows.reduce((s, r) => s + r.countries, 0);
  return { total: rows.length, active, countries };
}
