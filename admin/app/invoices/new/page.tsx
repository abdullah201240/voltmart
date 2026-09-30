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
  FileText,
  User,
  Calendar,
  Building,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { InvoiceRow, MoveState } from "@/lib/data/finance";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

const PRESET_INVOICE_ITEMS = [
  { description: "Sony WH-1000XM5 Wireless Headphones (Black)", price: 38500 },
  { description: "Anker Prime 20,000mAh Power Bank (200W)", price: 12900 },
  { description: "Apple 20W USB-C Power Adapter", price: 2800 },
  { description: "Baseus Blade 100W Ultra-Thin Laptop Power Bank", price: 8400 },
  { description: "Extended 2-Year Hardware Warranty & Service", price: 2500 },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const appToast = useToast();

  const [partner, setPartner] = useState("");
  const [customerBin, setCustomerBin] = useState("");
  const [reference, setReference] = useState("SO-2026-");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [bankJournal, setBankJournal] = useState("City Bank Corporate (Acct #2019)");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [lines, setLines] = useState<InvoiceLineItem[]>([
    {
      id: "inv-line-1",
      description: PRESET_INVOICE_ITEMS[0].description,
      quantity: 1,
      unitPrice: PRESET_INVOICE_ITEMS[0].price,
      vatRate: 15,
    },
  ]);

  const handleAddLine = () => {
    const nextItem = PRESET_INVOICE_ITEMS[lines.length % PRESET_INVOICE_ITEMS.length];
    setLines((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}`,
        description: nextItem.description,
        quantity: 1,
        unitPrice: nextItem.price,
        vatRate: 15,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      appToast.error("Required Line", "An invoice must contain at least one line item.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLines((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, [field]: value };
      })
    );
  };

  // Calculations
  const subtotal = lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const vatAmount = lines.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity * item.vatRate) / 100,
    0
  );
  const totalAmount = subtotal + vatAmount;

  const handleSubmit = (targetState: MoveState) => {
    if (!partner.trim()) {
      appToast.error("Missing Customer", "Please specify the customer or company name.");
      return;
    }
    if (lines.length === 0 || subtotal <= 0) {
      appToast.error("Missing Items", "Please add at least one line item with a positive amount.");
      return;
    }

    setIsSubmitting(true);
    const year = new Date().getFullYear();
    const invNumber = `INV/${year}/${Math.floor(1000 + Math.random() * 9000)}`;
    const mushakNumber = `MSHK-6.3-${Math.floor(100000 + Math.random() * 900000)}`;

    const newInvoice: InvoiceRow = {
      id: invNumber,
      number: invNumber,
      reference: reference.trim() || "—",
      partner: partner.trim(),
      date: new Date(invoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dueDate: new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      subtotal,
      tax: vatAmount,
      total: totalAmount,
      state: targetState,
    };

    addRecord("account.move", {
      ...newInvoice,
      mushakNumber,
      customerBin: customerBin.trim() || undefined,
      paymentTerms,
      bankJournal,
      notes: notes.trim() || undefined,
      lines,
    });

    appToast.success(
      "Customer Invoice created",
      `${invNumber} for ${partner.trim()} created with state "${targetState}". NBR Challan: ${mushakNumber}.`
    );

    setTimeout(() => {
      router.push("/invoices");
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
            <Link href="/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/invoices"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Invoices
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Customer Tax Invoice (Mushak 6.3)
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/invoices">Discard</Link>
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
            Post Invoice
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing & Tax Identification Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Customer & Tax Registration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Customer / Corporate Account <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Technologies Ltd."
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Customer BIN (Business Identification Number)
                </label>
                <input
                  type="text"
                  placeholder="002345678-0101 (13 digits)"
                  value={customerBin}
                  onChange={(e) => setCustomerBin(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Origin Sales Order Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-1042 / SO-2026-88"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
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
                  <option value="Immediate">Immediate / Cash upon Receipt</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days (Standard Corporate)</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Invoice Issue Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
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

          {/* Invoice Items Table */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Invoice Lines & VAT Rates</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-2.5 px-3">Description / Product</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Price (৳)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Mushak VAT</th>
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
                          <select
                            value={line.vatRate}
                            onChange={(e) =>
                              handleLineChange(line.id, "vatRate", parseFloat(e.target.value) || 0)
                            }
                            className="h-8 px-1.5 text-xs rounded border border-input bg-background font-semibold cursor-pointer"
                          >
                            <option value={15}>15% (Standard)</option>
                            <option value={7.5}>7.5% (Retail)</option>
                            <option value={5}>5% (Special)</option>
                            <option value={0}>0% (Exempt)</option>
                          </select>
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

        {/* Right 1 Col */}
        <div className="space-y-6">
          {/* Statutory Calculations Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Invoice Ledger Totals</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Taxable Amount</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  Total NBR VAT (Mushak 6.3)
                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                    Output Tax
                  </Badge>
                </span>
                <span className="font-mono font-medium text-foreground">
                  ৳{vatAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total Receivable</span>
                <span className="text-2xl font-extrabold font-mono text-primary">
                  ৳{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  NBR Mushak Form 9.1 Sync
                </div>
                <p>
                  Posting this invoice automatically credits Account 2110 (VAT Output Payable) and
                  updates current tax period returns.
                </p>
              </div>
            </div>
          </div>

          {/* Collection Bank Journal */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Receiving Bank Account</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Collection Journal</label>
              <select
                value={bankJournal}
                onChange={(e) => setBankJournal(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="City Bank Corporate (Acct #2019)">City Bank Corporate (Acct #2019)</option>
                <option value="Eastern Bank PLC (Acct #8841)">Eastern Bank PLC (Acct #8841)</option>
                <option value="BRAC Bank Corporate (Acct #9902)">BRAC Bank Corporate (Acct #9902)</option>
                <option value="bKash Merchant Settlement Acct">bKash Merchant Settlement Acct</option>
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Challan Terms & Payment Notes</h2>
            <textarea
              rows={4}
              placeholder="e.g. Cheque in favor of VoltMart Technologies Ltd. TDS / VDS exemption certificate required..."
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
