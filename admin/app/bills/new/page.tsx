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
  Receipt,
  Building2,
  Calendar,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { BillRow, MoveState } from "@/lib/data/finance";

interface BillLineItem {
  id: string;
  description: string;
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
  "Shenzhen Smart Tech Co., Ltd.",
];

export default function NewBillPage() {
  const router = useRouter();
  const appToast = useToast();

  const [vendor, setVendor] = useState(DEFAULT_VENDORS[0]);
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState("");
  const [poReference, setPoReference] = useState("P00012");
  const [billDate, setBillDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lines, setLines] = useState<BillLineItem[]>([
    {
      id: "bill-1",
      description: "Inventory Inbound: Audio Drivers & Bluetooth Chipsets",
      quantity: 100,
      unitCost: 4500,
      vatRate: 15,
    },
  ]);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `bill-${Date.now()}`,
        description: "Customs Clearance & Port Transit Handling",
        quantity: 1,
        unitCost: 18500,
        vatRate: 15,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      appToast.error("Required Line", "A bill must contain at least one line item.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof BillLineItem, value: any) => {
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
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

  const handleSubmit = (targetState: MoveState) => {
    if (!vendor.trim()) {
      appToast.error("Missing Vendor", "Please specify the supplier/vendor name.");
      return;
    }

    if (lines.length === 0 || subtotal <= 0) {
      appToast.error("Missing Items", "Please specify line items with positive amounts.");
      return;
    }

    setIsSubmitting(true);
    const billNumber = `BILL/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill: BillRow = {
      id: billNumber,
      number: billNumber,
      vendor: vendor.trim(),
      reference: vendorInvoiceNo.trim() || poReference || "Direct Bill",
      billDate: new Date(billDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dueDate: new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amountTotal: totalAmount,
      amountPaid: 0,
      state: targetState,
    };

    addRecord("account.move", {
      ...newBill,
      poReference,
      paymentTerms,
      subtotal,
      vatAmount,
      notes: notes.trim() || undefined,
      lines,
    });

    appToast.success(
      "Vendor Bill recorded",
      `${billNumber} for ${vendor.trim()} recorded as ${targetState}.`
    );

    setTimeout(() => {
      router.push("/bills");
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
            <Link href="/bills">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/bills"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Vendor Bills
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              Record New Vendor Bill
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/bills">Discard</Link>
          </Button>
          <Button
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => handleSubmit("Draft")}
            className="h-11 px-5 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => handleSubmit("Posted")}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Post Bill
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Vendor Info & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Details */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Supplier & Purchase Matching</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Vendor / Supplier <span className="text-rose-500">*</span>
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
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Supplier Invoice / Bill # <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-SZ-2026-99"
                  value={vendorInvoiceNo}
                  onChange={(e) => setVendorInvoiceNo(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Linked PO (Purchase Order) Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. P00012"
                  value={poReference}
                  onChange={(e) => setPoReference(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Immediate">Immediate / Advance Cash</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days (Standard Corporate)</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bill Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Payment Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bill Lines Table */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Bill Line Items & Expenses</h2>
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
                    <th className="py-2.5 px-3">Description / Accounting Line</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Cost (৳)</th>
                    <th className="py-2.5 px-3 w-24 text-center">Input VAT</th>
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
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => handleLineChange(line.id, "description", e.target.value)}
                            className="w-full h-9 px-2 text-xs rounded border border-input bg-background text-foreground"
                          />
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
        </div>

        {/* Right 1 Col: Summary & Payable */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Payable Summary</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Expense Subtotal</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  15% Input Tax Credit
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                    Rebatable
                  </Badge>
                </span>
                <span className="font-mono font-medium text-foreground">
                  ৳{vatAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total Payable</span>
                <span className="text-2xl font-extrabold font-mono text-primary">
                  ৳{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  3-Way Reconciliation
                </div>
                <p>
                  Upon posting, this bill matches against the warehouse inbound receipt for PO{" "}
                  <strong>{poReference}</strong> to prevent duplicate vendor payments.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Bill Notes & Settlement Info</h2>
            <textarea
              rows={4}
              placeholder="Payment instructions, bank RTGS routing info, advance payment adjustment..."
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
