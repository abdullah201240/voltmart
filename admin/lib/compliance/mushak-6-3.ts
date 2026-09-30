/**
 * Bangladesh National Board of Revenue (NBR) Mushak 6.3 Tax Invoice Engine
 * Formatted under Rule 40(1)(c) & 40(1)(f) of the VAT and Supplementary Duty Rules, 2016
 */

export interface MushakItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number; // excluding VAT
  vatRate: number; // standard 15% (0.15)
  totalPrice: number;
  vatAmount: number;
  grossTotal: number;
}

export interface MushakInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  issueDate: string;
  issueTime: string;
  companyName: string;
  companyBin: string;
  companyAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerBin?: string;
  items: MushakItem[];
  subtotal: number;
  totalVat: number;
  grandTotal: number;
  vehicleNumber?: string;
  destinationAddress?: string;
}

/**
 * Format currency in Bangladeshi Taka
 */
export function formatTaka(amount: number): string {
  return "৳" + amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Transform an internal order record into statutory Mushak 6.3 tax invoice structure
 */
export function generateMushakInvoice(order: any): MushakInvoiceData {
  const vatRate = 0.15; // 15% standard NBR VAT for electronics
  const items: MushakItem[] = (order.items || []).map((it: any, idx: number) => {
    const rawPrice = it.price || 0;
    // Base price excluding VAT
    const unitPrice = Math.round((rawPrice / (1 + vatRate)) * 100) / 100;
    const qty = it.qty || it.quantity || 1;
    const totalPrice = unitPrice * qty;
    const vatAmount = Math.round(totalPrice * vatRate * 100) / 100;
    const grossTotal = totalPrice + vatAmount;

    return {
      id: String(idx + 1),
      name: it.name || it.productName || "Electronics Item",
      quantity: qty,
      unitPrice,
      vatRate: 0.15,
      totalPrice,
      vatAmount,
      grossTotal,
    };
  });

  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalVat = items.reduce((acc, it) => acc + it.vatAmount, 0);
  const grandTotal = subtotal + totalVat;

  const now = new Date();

  return {
    invoiceNumber: `MSK-6.3-${order.number || order.id || Date.now()}`,
    orderNumber: order.number || order.id || "ORD-001",
    issueDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    issueTime: now.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: true }),
    companyName: "VoltMart Electronics Bangladesh Ltd.",
    companyBin: "004819283-0101", // Registered BIN under Dhaka South VAT Commissionerate
    companyAddress: "Level 8, Concord Tower, Gulshan-2, Dhaka-1212, Bangladesh",
    customerName: order.customer?.name || order.customer || "Walk-in Customer",
    customerPhone: order.customer?.phone || "N/A",
    customerAddress: order.shippingAddress?.fullAddress || order.shippingAddress || "Dhaka, Bangladesh",
    customerBin: order.customer?.bin || "N/A (Consumer)",
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    totalVat: Math.round(totalVat * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    destinationAddress: order.shippingAddress?.city || "Dhaka",
  };
}
