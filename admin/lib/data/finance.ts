/**
 * Finance data layer
 * ------------------------------------------------------------------
 * Mock resolvers for the Accounting section:
 *  - Customer Invoices (Odoo `account.move` move_type=out_invoice)
 *  - Vendor Bills      (account.move move_type=in_invoice)
 *  - Payments          (`account.payment`)
 *
 * Move state machine mirrors Odoo: draft -> posted -> (paid) / cancel.
 * Invoices are generated from confirmed sales orders; bills from vendor
 * purchase receipts (3-way match). Swap resolvers for real queries.
 */

export type MoveState = "Draft" | "Posted" | "Paid" | "Cancelled";

export interface InvoiceRow {
  id: string;
  number: string;
  /** Origin sales order reference. */
  reference: string;
  partner: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  state: MoveState;
}

export interface BillRow {
  id: string;
  number: string;
  /** Vendor bill / purchase reference. */
  reference: string;
  vendor: string;
  billDate: string;
  dueDate: string;
  amountTotal: number;
  amountPaid: number;
  state: MoveState;
}

export type PaymentDirection = "Inbound" | "Outbound";

export interface PaymentRow {
  id: string;
  date: string;
  partner: string;
  direction: PaymentDirection;
  method: string;
  reference: string;
  amount: number;
  status: "Reconciled" | "Pending" | "Failed";
}

export const MOVE_STATE_OPTIONS = [
  { value: "all", label: "All States" },
  { value: "Draft", label: "Draft" },
  { value: "Posted", label: "Posted" },
  { value: "Paid", label: "Paid" },
  { value: "Cancelled", label: "Cancelled" },
];

const INVOICES: InvoiceRow[] = [
  { id: "INV-3001", number: "INV/2026/0031", reference: "ORD-7389", partner: "Noah Wilson", date: "Sep 28, 2026", dueDate: "Oct 28, 2026", subtotal: 354.55, tax: 74.45, total: 429, state: "Paid" },
  { id: "INV-3002", number: "INV/2026/0030", reference: "ORD-7385", partner: "Mia Clark", date: "Sep 26, 2026", dueDate: "Oct 26, 2026", subtotal: 2644.63, tax: 554.37, total: 3199, state: "Posted" },
  { id: "INV-3003", number: "INV/2026/0029", reference: "ORD-7388", partner: "James Davis", date: "Sep 27, 2026", dueDate: "Oct 27, 2026", subtotal: 11745.45, tax: 2464.55, total: 14210, state: "Draft" },
  { id: "INV-3004", number: "INV/2026/0028", reference: "ORD-7390", partner: "Emma Brown", date: "Sep 28, 2026", dueDate: "Oct 28, 2026", subtotal: 1521.49, tax: 318.51, total: 1840, state: "Paid" },
  { id: "INV-3005", number: "INV/2026/0027", reference: "ORD-7386", partner: "Lucas White", date: "Sep 26, 2026", dueDate: "Oct 26, 2026", subtotal: 66.11, tax: 13.88, total: 79.99, state: "Cancelled" },
];

const BILLS: BillRow[] = [
  { id: "BILL-2001", number: "BILL/2026/0014", reference: "PO-8801", vendor: "TechDist GmbH", billDate: "Sep 20, 2026", dueDate: "Oct 20, 2026", amountTotal: 18400, amountPaid: 18400, state: "Paid" },
  { id: "BILL-2002", number: "BILL/2026/0015", reference: "PO-8803", vendor: "Shenzhen Mobile Supply", billDate: "Sep 24, 2026", dueDate: "Oct 24, 2026", amountTotal: 42500, amountPaid: 0, state: "Posted" },
  { id: "BILL-2003", number: "BILL/2026/0016", reference: "PO-8805", vendor: "AudioWorks Inc", billDate: "Sep 26, 2026", dueDate: "Oct 26, 2026", amountTotal: 7800, amountPaid: 3000, state: "Posted" },
  { id: "BILL-2004", number: "BILL/2026/0017", reference: "PO-8806", vendor: "Logitech Distribution", billDate: "Sep 28, 2026", dueDate: "Oct 28, 2026", amountTotal: 5200, amountPaid: 0, state: "Draft" },
];

const PAYMENTS: PaymentRow[] = [
  { id: "PAY-5001", date: "Sep 28, 2026", partner: "Noah Wilson", direction: "Inbound", method: "Stripe", reference: "INV/2026/0031", amount: 429, status: "Reconciled" },
  { id: "PAY-5002", date: "Sep 28, 2026", partner: "Emma Brown", direction: "Inbound", method: "Bank Transfer", reference: "INV/2026/0028", amount: 1840, status: "Reconciled" },
  { id: "PAY-5003", date: "Sep 26, 2026", partner: "TechDist GmbH", direction: "Outbound", method: "Bank Transfer", reference: "BILL/2026/0014", amount: 18400, status: "Reconciled" },
  { id: "PAY-5004", date: "Sep 29, 2026", partner: "Olivia Martin", direction: "Inbound", method: "PayPal", reference: "ORD-7392", amount: 1878.99, status: "Pending" },
  { id: "PAY-5005", date: "Sep 27, 2026", partner: "Lucas White", direction: "Inbound", method: "Stripe", reference: "INV/2026/0027", amount: 79.99, status: "Failed" },
];

export async function getInvoices(): Promise<InvoiceRow[]> {
  return INVOICES;
}

export async function getBills(): Promise<BillRow[]> {
  return BILLS;
}

export async function getPayments(): Promise<PaymentRow[]> {
  return PAYMENTS;
}

export function invoiceStats(rows: InvoiceRow[]) {
  const total = rows.length;
  const outstanding = rows.filter((r) => r.state === "Posted").reduce((s, r) => s + r.total, 0);
  const paid = rows.filter((r) => r.state === "Paid").reduce((s, r) => s + r.total, 0);
  const draft = rows.filter((r) => r.state === "Draft").length;
  return { total, outstanding, paid, draft };
}

export function billStats(rows: BillRow[]) {
  const total = rows.length;
  const owed = rows.reduce((s, r) => s + (r.amountTotal - r.amountPaid), 0);
  const paid = rows.reduce((s, r) => s + r.amountPaid, 0);
  const draft = rows.filter((r) => r.state === "Draft").length;
  return { total, owed, paid, draft };
}

export function paymentStats(rows: PaymentRow[]) {
  const inbound = rows.filter((r) => r.direction === "Inbound").reduce((s, r) => s + r.amount, 0);
  const outbound = rows.filter((r) => r.direction === "Outbound").reduce((s, r) => s + r.amount, 0);
  const pending = rows.filter((r) => r.status === "Pending").length;
  const failed = rows.filter((r) => r.status === "Failed").length;
  return { total: rows.length, inbound, outbound, pending, failed };
}
