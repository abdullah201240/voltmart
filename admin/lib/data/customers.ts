/**
 * Customers data layer
 * ------------------------------------------------------------------
 * Domain types + mock resolvers for the Customers (Contacts) section.
 *
 * Mirrors Odoo `res.partner` (customer directory, tags) and Saleor
 * `User`/`Customer` (orders count, lifetime spend, joined). The 360°
 * detail reuses the order lifecycle so a customer's history lines up
 * with `/orders`. Swap resolvers for real queries and keep contracts.
 */

import type { OrderStatus } from "./orders";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  orders: number;
  /** Lifetime revenue in base currency units for sorting/math. */
  totalSpent: number;
  joined: string;
  tags: string[];
  status: "Active" | "Archived";
}

/** Compact order reference shown on the customer 360° profile. */
export interface CustomerOrderRef {
  id: string;
  date: string;
  status: OrderStatus;
  total: string;
}

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  customers: number;
}

/** A customer's full profile with recent orders and addresses. */
export interface CustomerDetail extends CustomerRow {
  phone: string;
  company: string;
  shippingAddress: string;
  billingAddress: string;
  recentOrders: CustomerOrderRef[];
}

export const CUSTOMER_SEGMENT_OPTIONS = [
  { value: "all", label: "All Segments" },
  { value: "VIP", label: "VIP" },
  { value: "Wholesale", label: "Wholesale" },
  { value: "Repeat", label: "Repeat Buyer" },
  { value: "New", label: "New" },
];

export const COUNTRY_OPTIONS = [
  { value: "all", label: "All Countries" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Germany", label: "Germany" },
  { value: "Poland", label: "Poland" },
];

const CUSTOMERS: CustomerRow[] = [
  { id: "CUS-1001", name: "Olivia Martin", email: "olivia@example.com", country: "United States", city: "New York", orders: 14, totalSpent: 18240, joined: "Jan 12, 2024", tags: ["VIP", "Repeat"], status: "Active" },
  { id: "CUS-1002", name: "Liam Anderson", email: "liam@example.com", country: "United Kingdom", city: "London", orders: 6, totalSpent: 7390, joined: "Mar 03, 2025", tags: ["Repeat"], status: "Active" },
  { id: "CUS-1003", name: "Emma Brown", email: "emma@example.com", country: "Germany", city: "Berlin", orders: 2, totalSpent: 2180, joined: "Jul 21, 2026", tags: ["New"], status: "Active" },
  { id: "CUS-1004", name: "Noah Wilson", email: "noah@example.com", country: "United States", city: "Austin", orders: 21, totalSpent: 41250, joined: "Aug 30, 2022", tags: ["VIP", "Wholesale", "Repeat"], status: "Active" },
  { id: "CUS-1005", name: "James Davis", email: "james@example.com", country: "United States", city: "Chicago", orders: 9, totalSpent: 63400, joined: "Feb 14, 2023", tags: ["Wholesale"], status: "Active" },
  { id: "CUS-1006", name: "Sophia Taylor", email: "sophia@example.com", country: "United Kingdom", city: "Manchester", orders: 4, totalSpent: 3120, joined: "May 09, 2025", tags: ["Repeat"], status: "Active" },
  { id: "CUS-1007", name: "Lucas White", email: "lucas@example.com", country: "Poland", city: "Warsaw", orders: 1, totalSpent: 79.99, joined: "Sep 26, 2026", tags: ["New"], status: "Active" },
  { id: "CUS-1008", name: "Mia Clark", email: "mia@example.com", country: "Poland", city: "Krakow", orders: 11, totalSpent: 15980, joined: "Nov 02, 2023", tags: ["VIP", "Repeat"], status: "Archived" },
];

const TAGS: CustomerTag[] = [
  { id: "T1", name: "VIP", color: "bg-violet-500", customers: 3 },
  { id: "T2", name: "Wholesale", color: "bg-amber-500", customers: 2 },
  { id: "T3", name: "Repeat", color: "bg-emerald-500", customers: 5 },
  { id: "T4", name: "New", color: "bg-sky-500", customers: 2 },
];

export async function getCustomers(): Promise<CustomerRow[]> {
  return CUSTOMERS;
}

export async function getCustomerTags(): Promise<CustomerTag[]> {
  return TAGS;
}

export async function getCustomerById(id: string): Promise<CustomerDetail | undefined> {
  const row = CUSTOMERS.find((c) => c.id === id);
  if (!row) return undefined;
  const recentOrders: CustomerOrderRef[] = Array.from({ length: Math.min(row.orders, 4) }).map((_, i) => ({
    id: `ORD-${7390 - i}`,
    date: ["Sep 29, 2026", "Sep 21, 2026", "Sep 12, 2026", "Aug 30, 2026"][i],
    status: (["Invoiced", "Fulfilled", "Confirmed", "Quotation"] as OrderStatus[])[i],
    total: `$${(row.totalSpent / (row.orders || 1)).toFixed(2)}`,
  }));
  return {
    ...row,
    phone: "+1 (555) 010-0" + row.id.slice(-2),
    company: row.tags.includes("Wholesale") ? `${row.name.split(" ")[1]} Enterprises LLC` : "—",
    shippingAddress: `${row.city}, ${row.country}`,
    billingAddress: `${row.city}, ${row.country}`,
    recentOrders,
  };
}

/** Aggregate customer KPIs for the list header. */
export function customerStats(rows: CustomerRow[]) {
  const total = rows.length;
  const active = rows.filter((r) => r.status === "Active").length;
  const revenue = rows.reduce((s, r) => s + r.totalSpent, 0);
  const avgOrders = total ? Math.round((rows.reduce((s, r) => s + r.orders, 0) / total) * 10) / 10 : 0;
  return { total, active, revenue, avgOrders };
}
