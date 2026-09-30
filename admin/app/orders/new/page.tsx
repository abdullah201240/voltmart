"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ShoppingCart,
  Truck,
  CreditCard,
  User,
  FileText,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CHANNEL_OPTIONS } from "@/lib/data/products";
import { OrderRow } from "@/lib/data/orders";

interface OrderLineItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // e.g. 15%
}

const PRESET_PRODUCTS = [
  { name: "Sony WH-1000XM5 Wireless Headphones", sku: "SNY-WH1000-BLK", price: 38500 },
  { name: "Anker Prime 20,000mAh Power Bank (200W)", sku: "ANK-PRIME-20K", price: 12900 },
  { name: "Apple 20W USB-C Power Adapter", sku: "APL-20W-ADPT", price: 2800 },
  { name: "Baseus Blade 100W Ultra-Thin Power Bank", sku: "BAS-BLADE-100W", price: 8400 },
  { name: "Samsung Galaxy Buds2 Pro - Graphite", sku: "SAM-BUDS2-PRO", price: 16500 },
  { name: "Logitech MX Master 3S Wireless Mouse", sku: "LOG-MX3S-GRY", price: 11500 },
  { name: "UGREEN Nexode 65W GaN Charger 3-Port", sku: "UGR-NEX65-GAN", price: 4200 },
];

export default function NewOrderPage() {
  const router = useRouter();
  const appToast = useToast();

  // Form State
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 1");
  const [channelKey, setChannelKey] = useState("default-channel");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [carrier, setCarrier] = useState("Pathao Courier");
  const [shippingAddress, setShippingAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [shippingFee, setShippingFee] = useState(60);
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Line items
  const [lines, setLines] = useState<OrderLineItem[]>([
    {
      id: "line-1",
      productName: PRESET_PRODUCTS[0].name,
      sku: PRESET_PRODUCTS[0].sku,
      quantity: 1,
      unitPrice: PRESET_PRODUCTS[0].price,
      vatRate: 15,
    },
  ]);

  const handleAddLine = () => {
    const nextProduct = PRESET_PRODUCTS[lines.length % PRESET_PRODUCTS.length];
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        productName: nextProduct.name,
        sku: nextProduct.sku,
        quantity: 1,
        unitPrice: nextProduct.price,
        vatRate: 15,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      appToast.error("Validation error", "An order must contain at least one line item.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof OrderLineItem, value: any) => {
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const handleSelectPreset = (id: string, productName: string) => {
    const found = PRESET_PRODUCTS.find((p) => p.name === productName);
    if (!found) return;
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          productName: found.name,
          sku: found.sku,
          unitPrice: found.price,
        };
      })
    );
  };

  // Calculations
  const subtotal = lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const vatAmount = lines.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.vatRate) / 100,
    0
  );
  const grandTotal = subtotal + vatAmount + Number(shippingFee || 0);

  const handleSubmit = (targetStatus: "Quotation" | "Confirmed") => {
    if (!customer.trim()) {
      appToast.error("Missing Field", "Please enter the customer name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      appToast.error("Invalid Email", "Please provide a valid customer email.");
      return;
    }
    if (lines.length === 0 || subtotal <= 0) {
      appToast.error("Invalid Line Items", "Order must contain at least one valid item.");
      return;
    }

    setIsSubmitting(true);
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const channelName =
      CHANNEL_OPTIONS.find((c) => c.value === channelKey)?.label || "Default Channel (BDT)";

    const newOrder: OrderRow = {
      id: orderId,
      customer: customer.trim(),
      email: email.trim().toLowerCase(),
      channel: channelName,
      channelKey,
      date: new Date().toISOString().slice(0, 10),
      totalValue: grandTotal,
      total: "৳" + grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      status: targetStatus,
      paymentStatus: paymentMethod === "COD" ? "Unpaid" : "Paid",
      fulfillmentStatus: "Unfulfilled",
    };

    addRecord("sale.order", {
      ...newOrder,
      phone,
      shippingAddress: shippingAddress.trim() || `${district}, Bangladesh`,
      carrier,
      paymentMethod,
      orderNotes,
      subtotal,
      vatAmount,
      shippingFee,
      lines,
    });

    appToast.success(
      "Order created successfully",
      `${orderId} recorded as ${targetStatus} with total ৳${grandTotal.toLocaleString("en-IN")}.`
    );

    setTimeout(() => {
      router.push("/orders");
    }, 400);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 cursor-pointer hover:bg-muted"
          >
            <Link href="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Orders
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Sales Order
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/orders">Discard</Link>
          </Button>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => handleSubmit("Quotation")}
            className="h-11 px-5 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Quotation
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => handleSubmit("Confirmed")}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Order
          </Button>
        </div>
      </div>

      {/* Main Grid: Left side details & line items, Right side summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Customer, Channel & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Customer & Sales Channel</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahim Chowdhury"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Customer Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="rahim@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number (+880)</label>
                <input
                  type="tel"
                  placeholder="+880 1711-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Sales Channel</label>
                <select
                  value={channelKey}
                  onChange={(e) => setChannelKey(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {CHANNEL_OPTIONS.filter((c) => c.value !== "all").map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Order Line Items</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Product
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 w-28">SKU</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Price (৳)</th>
                    <th className="py-2.5 px-3 w-24 text-center">VAT</th>
                    <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {lines.map((line) => {
                    const lineSubtotal = line.unitPrice * line.quantity;
                    return (
                      <tr key={line.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3">
                          <select
                            value={line.productName}
                            onChange={(e) => handleSelectPreset(line.id, e.target.value)}
                            className="w-full h-9 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-hidden cursor-pointer"
                          >
                            {PRESET_PRODUCTS.map((p) => (
                              <option key={p.sku} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {line.sku}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              handleLineChange(
                                line.id,
                                "quantity",
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-16 h-8 text-center text-xs font-semibold rounded border border-input bg-background"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) =>
                              handleLineChange(
                                line.id,
                                "unitPrice",
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="w-24 h-8 text-right px-2 text-xs font-mono font-semibold rounded border border-input bg-background"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant="outline" className="text-[11px] font-semibold">
                            {line.vatRate}%
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          ৳{lineSubtotal.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-muted-foreground hover:text-rose-500 cursor-pointer p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fulfillment & Courier Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Fulfillment & Logistics</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Shipping Courier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Pathao Courier">Pathao Courier (Express)</option>
                  <option value="Steadfast Logistics">Steadfast Logistics (Nationwide)</option>
                  <option value="Paperfly Go">Paperfly Go (Smart Drop)</option>
                  <option value="RedX Doorstep">RedX Doorstep Delivery</option>
                  <option value="In-house Fleet">VoltMart In-house Dhaka Fleet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Delivery District</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setShippingFee(e.target.value === "Dhaka" ? 60 : 120);
                  }}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Dhaka">Dhaka Division (৳60 delivery)</option>
                  <option value="Chittagong">Chittagong Division (৳120 delivery)</option>
                  <option value="Sylhet">Sylhet Division (৳120 delivery)</option>
                  <option value="Rajshahi">Rajshahi Division (৳120 delivery)</option>
                  <option value="Khulna">Khulna Division (৳120 delivery)</option>
                  <option value="Barisal">Barisal Division (৳120 delivery)</option>
                  <option value="Rangpur">Rangpur Division (৳120 delivery)</option>
                  <option value="Mymensingh">Mymensingh Division (৳120 delivery)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="bKash">bKash Merchant Payment</option>
                  <option value="Nagad">Nagad Direct Gateway</option>
                  <option value="SSLCOMMERZ">SSLCOMMERZ (Cards / NetBanking)</option>
                  <option value="Bank">Direct Corporate Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Detailed Delivery Address</label>
              <textarea
                rows={2}
                placeholder="House/Plot, Road/Street, Sector/Thana, Landmark..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Calculations */}
        <div className="space-y-6">
          {/* Order Financial Calculation Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Order Calculation</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  15% NBR Mushak VAT
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                    Statutory
                  </Badge>
                </span>
                <span className="font-mono font-medium text-foreground">
                  ৳{vatAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{Number(shippingFee || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Grand Total</span>
                <span className="text-2xl font-extrabold font-mono text-primary">
                  ৳{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1 border border-border/40">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Terms
                </div>
                <p>
                  Settlement mode: <strong className="text-foreground">{paymentMethod}</strong>.
                  {paymentMethod === "COD"
                    ? " Delivery agent will collect cash upon customer hand-off."
                    : " Automated digital payment reconciliation triggered on dispatch."}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Internal Notes</h2>
            </div>
            <textarea
              rows={4}
              placeholder="Add packing instructions, VIP client priority, or courier delivery notes..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
