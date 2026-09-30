"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { PaymentRow } from "@/lib/data/finance";
import { cn } from "@/lib/utils";

export default function NewPaymentPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState("");
  const [direction, setDirection] = useState<"Inbound" | "Outbound">("Inbound");
  const [method, setMethod] = useState("Bank Transfer");
  const [amount, setAmount] = useState<number | "">("");
  const [reference, setReference] = useState("");
  const [bankName, setBankName] = useState("BRAC Bank Limited");
  const [accountNumber, setAccountNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [autoReconcile, setAutoReconcile] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner.trim()) {
      appToast.error("Validation error", "Partner (Customer or Vendor) is required.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      appToast.error("Validation error", "Please enter a valid payment amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `PAY-${Date.now().toString(36).toUpperCase()}`;
      const newPayment: PaymentRow = {
        id: generatedId,
        date: "Today",
        partner: partner.trim(),
        direction,
        method,
        reference: reference.trim() || (trxId ? `TRX-${trxId}` : "—"),
        amount: Number(amount) || 0,
        status: autoReconcile ? "Reconciled" : "Pending",
      };

      addRecord("account.payment", newPayment as unknown as Record<string, unknown>);
      appToast.success("Payment registered", `Payment ${newPayment.id} for ৳${newPayment.amount.toLocaleString("en-BD")} has been recorded.`);
      router.push("/payments");
    } catch {
      appToast.error("Failed to register", "Could not record payment entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Payments
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Register Payment</h1>
            <Badge variant="outline" className="text-xs font-mono uppercase bg-primary/10 text-primary border-primary/20">
              Financial Voucher
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Record an incoming customer settlement or outgoing vendor disbursement against invoices or bills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/payments")}
            className="h-11 px-5 cursor-pointer"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-6 font-semibold cursor-pointer active:scale-[0.98] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Registering..." : "Record Payment"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Direction & Partner */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Payment Flow & Entity</h2>
            </div>

            <div className="space-y-4">
              {/* Direction Tabs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Direction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection("Inbound")}
                    className={cn(
                      "p-4 rounded-lg border text-left cursor-pointer transition-all flex items-center gap-3",
                      direction === "Inbound"
                        ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500"
                        : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Inbound (Money In)</p>
                      <p className="text-xs text-muted-foreground">Received from customer settlement</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirection("Outbound")}
                    className={cn(
                      "p-4 rounded-lg border text-left cursor-pointer transition-all flex items-center gap-3",
                      direction === "Outbound"
                        ? "border-rose-500 bg-rose-500/10 text-foreground ring-1 ring-rose-500"
                        : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Outbound (Money Out)</p>
                      <p className="text-xs text-muted-foreground">Vendor disbursement or expense</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    {direction === "Inbound" ? "Customer / Payer Name" : "Vendor / Payee Name"} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={direction === "Inbound" ? "e.g. Rahim Ahmed / Apex Logistics" : "e.g. Sony Electronics Bangladesh Ltd"}
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Amount (BDT) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-sm text-muted-foreground">৳</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      placeholder="50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : "")}
                      className="w-full h-11 pl-8 pr-3.5 rounded-md border border-input bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Payment Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method & Bank Credentials */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Channel & Clearing Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Bank Transfer">Bank Transfer (EFT / RTGS)</option>
                  <option value="bKash">bKash Merchant Pay</option>
                  <option value="Nagad">Nagad Enterprise</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cheque">Bank Cheque / Pay Order</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Linked Invoice / Bill Ref</label>
                <input
                  type="text"
                  placeholder="e.g. INV/2026/0007 or BILL-8821"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {(method === "Bank Transfer" || method === "Card" || method === "Cheque") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. BRAC Bank Limited"
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Account / Routing Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 15012034980001"
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </>
              )}

              {(method === "bKash" || method === "Nagad") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Wallet Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Gateway TrxID</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. 9B28XK1940"
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Notes / Internal Voucher Memo</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context, cheque clearing numbers, or special instructions."
                  className="w-full p-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary (1 col) */}
        <div className="space-y-6">
          {/* Voucher Summary Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Payment Voucher</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Total Amount</span>
                <p className="text-2xl font-black text-foreground mt-1">
                  ৳{(Number(amount) || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={direction === "Inbound" ? "default" : "outline"} className={direction === "Inbound" ? "bg-emerald-500 text-white" : "border-rose-500 text-rose-500"}>
                    {direction}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{method}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between items-center">
                  <span>Ledger Post</span>
                  <span className="font-semibold text-foreground">
                    {direction === "Inbound" ? "Dr. Bank / Cr. Accounts Rec." : "Dr. Accounts Pay. / Cr. Bank"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Clearing Cycle</span>
                  <span className="text-foreground">T+0 Realtime</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReconcile}
                  onChange={(e) => setAutoReconcile(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Immediately Mark as Reconciled</span>
              </label>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              All payments are audited with double-entry journal postings adhering to standard accounting practices.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
