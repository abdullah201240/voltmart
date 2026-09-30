"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Warehouse,
  FileSpreadsheet,
  Calculator,
  Ship,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { PURCHASE_ORDER } from "@/lib/data/workflows";
import { PurchaseOrderRow, PoState } from "@/lib/data/purchasing";

interface PoLineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
  vatRate: number;
}

const DEFAULT_VENDORS = [
  "Ready Mat",
  "Wood Corner",
  "Deco Addict",
  "Audio Group",
  "Gaming Depot",
  "Shenzhen Electronics Hub Ltd",
  "Anker Innovations Bangladesh",
];

const PRESET_RAW_PRODUCTS = [
  { name: "Sony WH-1000XM5 Headset Drivers & PCB", sku: "RAW-SNY-XM5", cost: 28000 },
  { name: "Anker Prime 200W Lithium Polymer Battery Cells", sku: "RAW-ANK-200W", cost: 8500 },
  { name: "Apple 20W GaN Power Chips & Housing", sku: "RAW-APL-20W", cost: 1600 },
  { name: "Baseus 100W Heat Sink & High-Density Cells", sku: "RAW-BAS-100W", cost: 5200 },
  { name: "Samsung ANC Bluetooth 5.3 Audio SoC", sku: "RAW-SAM-ANC", cost: 9800 },
];

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const appToast = useToast();

  const [vendor, setVendor] = useState(DEFAULT_VENDORS[0]);
  const [customVendor, setCustomVendor] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [warehouse, setWarehouse] = useState("VoltMart Tejgaon Central WH-01");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [lcNumber, setLcNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lines, setLines] = useState<PoLineItem[]>([
    {
      id: "po-1",
      name: PRESET_RAW_PRODUCTS[0].name,
      sku: PRESET_RAW_PRODUCTS[0].sku,
      quantity: 50,
      unitCost: PRESET_RAW_PRODUCTS[0].cost,
      vatRate: 15,
    },
  ]);

  const handleAddLine = () => {
    const nextItem = PRESET_RAW_PRODUCTS[lines.length % PRESET_RAW_PRODUCTS.length];
    setLines((prev) => [
      ...prev,
      {
        id: `po-${Date.now()}`,
        name: nextItem.name,
        sku: nextItem.sku,
        quantity: 20,
        unitCost: nextItem.cost,
        vatRate: 15,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      appToast.error("Required Field", "A purchase order must have at least one line item.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof PoLineItem, value: any) => {
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const handleSelectPreset = (id: string, name: string) => {
    const found = PRESET_RAW_PRODUCTS.find((p) => p.name === name);
    if (!found) return;
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          name: found.name,
          sku: found.sku,
          unitCost: found.cost,
        };
      })
    );
  };

  // Calculations
  const subtotal = lines.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const vatAmount = lines.reduce(
    (sum, item) => sum + (item.unitCost * item.quantity * item.vatRate) / 100,
    0
  );
  const totalAmount = subtotal + vatAmount;

  const handleSubmit = (targetState: PoState) => {
    const effectiveVendor = vendor === "Other (Custom Vendor)" ? customVendor.trim() : vendor;
    if (!effectiveVendor) {
      appToast.error("Missing Vendor", "Please select or specify a supplier.");
      return;
    }

    if (lines.length === 0 || subtotal <= 0) {
      appToast.error("Missing Products", "Please specify products with quantities and unit costs.");
      return;
    }

    setIsSubmitting(true);
    const poNumber = `P${Math.floor(10000 + Math.random() * 90000)}`;

    const newPO: PurchaseOrderRow = {
      id: poNumber,
      name: poNumber,
      vendor: effectiveVendor,
      date: new Date(orderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expectedDate: new Date(expectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      total: "৳" + totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      totalValue: totalAmount,
      currency: "BDT",
      lines: lines.length,
      state: targetState,
      received: false,
    };

    addRecord(PURCHASE_ORDER, {
      ...newPO,
      warehouse,
      paymentTerms,
      lcNumber: lcNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      lineItems: lines,
    });

    appToast.success(
      "Purchase document saved",
      `${poNumber} for ${effectiveVendor} recorded with state "${targetState.toUpperCase()}".`
    );

    setTimeout(() => {
      router.push("/purchases/orders");
    }, 400);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 cursor-pointer hover:bg-muted"
          >
            <Link href="/purchases/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/purchases/orders"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Purchase Orders
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Request for Quotation / PO
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/purchases/orders">Discard</Link>
          </Button>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => handleSubmit("draft")}
            className="h-11 px-5 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save as RFQ
          </Button>
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSubmit("sent")}
            className="h-11 px-5 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Send className="mr-2 h-4 w-4" />
            Send by Email
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => handleSubmit("purchase")}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Order
          </Button>
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Vendor, Logistics & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Commercial Header */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Vendor & Terms</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {DEFAULT_VENDORS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="Other (Custom Vendor)">+ Other (Custom Vendor)...</option>
                </select>
              </div>

              {vendor === "Other (Custom Vendor)" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Custom Supplier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter company or factory name"
                    value={customVendor}
                    onChange={(e) => setCustomVendor(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Immediate Cash">Immediate Payment (Cash / Advance)</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days (Standard Corporate)</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                  <option value="Sight LC">Letter of Credit (Sight LC)</option>
                  <option value="Deferred LC">Deferred LC 90 Days</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Order Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Expected Dock Arrival Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Purchase Order Lines</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-2.5 px-3">Product / Raw Material</th>
                    <th className="py-2.5 px-3 w-28">SKU</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Cost (৳)</th>
                    <th className="py-2.5 px-3 w-24 text-center">VAT</th>
                    <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {lines.map((line) => {
                    const lineSubtotal = line.unitCost * line.quantity;
                    return (
                      <tr key={line.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3">
                          <select
                            value={line.name}
                            onChange={(e) => handleSelectPreset(line.id, e.target.value)}
                            className="w-full h-9 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-hidden cursor-pointer"
                          >
                            {PRESET_RAW_PRODUCTS.map((p) => (
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
                            value={line.unitCost}
                            onChange={(e) =>
                              handleLineChange(
                                line.id,
                                "unitCost",
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

          {/* Delivery Warehouse & Foreign Import LC */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Warehouse className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Receiving Warehouse & Import Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Receiving Warehouse Location
                </label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="VoltMart Tejgaon Central WH-01">VoltMart Tejgaon Central WH-01 (Dhaka)</option>
                  <option value="VoltMart Uttara Secondary WH-02">VoltMart Uttara Secondary WH-02 (Dhaka)</option>
                  <option value="VoltMart Chittagong Port Hub WH-03">VoltMart Chittagong Port Hub WH-03</option>
                  <option value="VoltMart Bogura Distribution Hub">VoltMart Bogura Distribution Hub WH-04</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Bank Letter of Credit (LC) / Commercial Inv. #
                </label>
                <div className="relative">
                  <Ship className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. LC-EBL-2026-9042"
                    value={lcNumber}
                    onChange={(e) => setLcNumber(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Summary & Notes */}
        <div className="space-y-6">
          {/* PO Spend Summary */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Committed Spend</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Items Cost Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  15% Input VAT (Mushak 6.3)
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                    Rebatable
                  </Badge>
                </span>
                <span className="font-mono font-medium text-foreground">
                  ৳{vatAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total PO Value</span>
                <span className="text-2xl font-extrabold font-mono text-primary">
                  ৳{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground space-y-1 border border-border/40">
                <p className="font-semibold text-foreground">Stock Receipt Automation</p>
                <p>
                  Upon confirming this Purchase Order, an inbound picking slip (stock.picking) is
                  automatically queued in the warehouse receiving dock.
                </p>
              </div>
            </div>
          </div>

          {/* Purchasing Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Requisition Terms & Notes</h2>
            <textarea
              rows={4}
              placeholder="Quality inspection requirements, moisture-proof carton specs, batch testing rules..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
