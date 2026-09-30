/**
 * Settings data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the configuration section, mirroring Odoo/Stock/
 * Account settings + Saleor channels and staff:
 *  - Sales channels   (Saleor `Channel` / Odoo website)
 *  - Warehouses       (`stock.warehouse` + routes)
 *  - Locations        (`stock.location` tree)
 *  - Taxes            (`account.tax` rates)
 *  - Payment providers (payment acquirers / Saleor plugins)
 *  - Staff / roles    (`res.users` + groups)
 *
 * General store info is a plain config object. Swap all for real reads.
 */

export interface GeneralSettings {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  weightUnit: "kg" | "lb";
  lengthUnit: "cm" | "in";
}

export interface ChannelRow {
  id: string;
  name: string;
  slug: string;
  currency: string;
  warehouse: string;
  publishedProducts: number;
  active: boolean;
}

export interface WarehouseRow {
  id: string;
  name: string;
  code: string;
  location: string;
  /** Number of internal steps: 1 = simple, 3 = pick/pack/ship. */
  steps: number;
  active: boolean;
}

export interface LocationRow {
  id: string;
  name: string;
  warehouse: string;
  type: "Input" | "Stock" | "Output" | "Transit" | "Shipment";
  products: number;
  parent: string;
}

export interface TaxRow {
  id: string;
  name: string;
  country: string;
  amount: number;
  /** Sale (on customer invoices) or purchase (on vendor bills). */
  scope: "Sales" | "Purchases";
  active: boolean;
}

export interface PaymentProviderRow {
  id: string;
  name: string;
  kind: "Card" | "Wallet" | "Bank" | "COD";
  channels: string[];
  captured: number;
  active: boolean;
}

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Manager" | "Staff" | "Merchant";
  channels: number;
  active: boolean;
  lastActive: string;
}

export async function getGeneralSettings(): Promise<GeneralSettings> {
  return {
    storeName: "VoltMart",
    email: "ops@voltmart.example",
    phone: "+880 1700-010203",
    address: "House 42, Road 11, Banani, Dhaka 1213, Bangladesh",
    currency: "BDT",
    timezone: "Asia/Dhaka (BST)",
    weightUnit: "kg",
    lengthUnit: "cm",
  };
}

export async function getChannels(): Promise<ChannelRow[]> {
  return [
    { id: "CH1", name: "Default Channel", slug: "default-channel", currency: "BDT", warehouse: "Main Warehouse", publishedProducts: 210, active: true },
    { id: "CH2", name: "Dhaka Store", slug: "channel-dhk", currency: "BDT", warehouse: "Main Warehouse", publishedProducts: 188, active: true },
    { id: "CH3", name: "Chattogram Store", slug: "channel-ctg", currency: "BDT", warehouse: "Chattogram Hub", publishedProducts: 142, active: true },
    { id: "CH4", name: "B2B Wholesale", slug: "b2b-wholesale", currency: "BDT", warehouse: "Main Warehouse", publishedProducts: 96, active: false },
  ];
}

export async function getWarehouses(): Promise<WarehouseRow[]> {
  return [
    { id: "WH1", name: "Main Warehouse", code: "WH", location: "Dhaka, Bangladesh", steps: 3, active: true },
    { id: "WH2", name: "Chattogram Hub", code: "CTG", location: "Chattogram, Bangladesh", steps: 1, active: true },
    { id: "WH3", name: "Sylhet Returns", code: "SYL", location: "Sylhet, Bangladesh", steps: 1, active: true },
  ];
}

export async function getLocations(): Promise<LocationRow[]> {
  return [
    { id: "L1", name: "Input", warehouse: "Main Warehouse", type: "Input", products: 0, parent: "WH" },
    { id: "L2", name: "Stock", warehouse: "Main Warehouse", type: "Stock", products: 210, parent: "WH" },
    { id: "L3", name: "Shelf A1", warehouse: "Main Warehouse", type: "Stock", products: 48, parent: "Stock" },
    { id: "L4", name: "Shelf A2", warehouse: "Main Warehouse", type: "Stock", products: 62, parent: "Stock" },
    { id: "L5", name: "Output", warehouse: "Main Warehouse", type: "Output", products: 12, parent: "WH" },
    { id: "L6", name: "Packers", warehouse: "Main Warehouse", type: "Transit", products: 5, parent: "WH" },
    { id: "L7", name: "Chattogram Stock", warehouse: "Chattogram Hub", type: "Stock", products: 88, parent: "CTG" },
  ];
}

export async function getTaxes(): Promise<TaxRow[]> {
  return [
    { id: "TX1", name: "VAT 15%", country: "Bangladesh", amount: 15, scope: "Sales", active: true },
    { id: "TX2", name: "VAT 10% (Reduced)", country: "Bangladesh", amount: 10, scope: "Sales", active: true },
    { id: "TX3", name: "Supplementary Duty 5%", country: "Bangladesh", amount: 5, scope: "Sales", active: true },
    { id: "TX4", name: "Purchase VAT 15%", country: "Bangladesh", amount: 15, scope: "Purchases", active: true },
    { id: "TX5", name: "CIS 2.5%", country: "Bangladesh", amount: 2.5, scope: "Purchases", active: true },
  ];
}

export async function getPaymentProviders(): Promise<PaymentProviderRow[]> {
  return [
    { id: "PP1", name: "bKash", kind: "Wallet", channels: ["Default Channel", "Dhaka Store"], captured: 22104000, active: true },
    { id: "PP2", name: "Nagad", kind: "Wallet", channels: ["Default Channel"], captured: 7488000, active: true },
    { id: "PP3", name: "SSLCommerz Cards", kind: "Card", channels: ["Default Channel", "Dhaka Store", "Chattogram Store"], captured: 14850000, active: true },
    { id: "PP4", name: "Bank Transfer", kind: "Bank", channels: ["B2B Wholesale"], captured: 5016000, active: true },
    { id: "PP5", name: "Cash on Delivery", kind: "COD", channels: ["Chattogram Store"], captured: 1104000, active: false },
  ];
}

export async function getStaff(): Promise<StaffRow[]> {
  return [
    { id: "U1", name: "Aisha Rahman", email: "aisha@voltmart.example", role: "Owner", channels: 4, active: true, lastActive: "2 minutes ago" },
    { id: "U2", name: "Marcus Lee", email: "marcus@voltmart.example", role: "Admin", channels: 4, active: true, lastActive: "1 hour ago" },
    { id: "U3", name: "Petra Novak", email: "petra@voltmart.example", role: "Manager", channels: 2, active: true, lastActive: "Yesterday" },
    { id: "U4", name: "Diego Santos", email: "diego@voltmart.example", role: "Staff", channels: 1, active: true, lastActive: "3 days ago" },
    { id: "U5", name: "Former User", email: "ex@voltmart.example", role: "Merchant", channels: 0, active: false, lastActive: "6 months ago" },
  ];
}
