"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Percent,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { TAX, type TaxRow } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

export default function NewTaxPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Bangladesh");
  const [scope, setScope] = useState<"Sales" | "Purchases">("Sales");
  const [amount, setAmount] = useState<number | "">(15);
  const [nbrCategory, setNbrCategory] = useState("Standard Rate (15%)");
  const [chartOfAccount, setChartOfAccount] = useState("2100 - Output VAT Payable");
  const [active, setActive] = useState(true);

  // Sample simulation for preview
  const sampleGross = 10000;
  const rateNum = Number(amount) || 0;
  const sampleTaxVal = Math.round((sampleGross * rateNum) / 100);
  const sampleTotal = sampleGross + sampleTaxVal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Tax rule name is required.");
      return;
    }
    const num = Number(amount);
    if (isNaN(num) || num < 0 || num > 100) {
      appToast.error("Validation error", "Rate must be between 0% and 100%.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `TX-${Date.now().toString(36).toUpperCase()}`;
      const newTax: TaxRow = {
        id: generatedId,
        name: name.trim(),
        country: country.trim(),
        amount: num,
        scope,
        active,
      };

      addRecord(TAX, newTax as unknown as Record<string, unknown>);
      appToast.success("Tax created", `Tax rule "${newTax.name}" is now available on invoices.`);
      router.push("/settings/taxes");
    } catch {
      appToast.error("Failed to save", "Could not register tax rate.");
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
            href="/settings/taxes"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Taxes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Tax Rate</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              NBR Fiscal Policy
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure statutory Value Added Tax (VAT), withholding tax (AIT), and customs tariffs applied on transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/taxes")}
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
            {saving ? "Registering..." : "Save Tax Rate"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Configuration (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Scope */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Percent className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Tax Identity & Applicability</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Tax Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangladesh Standard VAT 15%"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tax Scope <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScope("Sales");
                        setChartOfAccount("2100 - Output VAT Payable");
                      }}
                      className={cn(
                        "p-3 rounded-md border text-xs font-semibold cursor-pointer transition-all",
                        scope === "Sales"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      Customer Invoices (Sales)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScope("Purchases");
                        setChartOfAccount("1300 - Input VAT Recoverable");
                      }}
                      className={cn(
                        "p-3 rounded-md border text-xs font-semibold cursor-pointer transition-all",
                        scope === "Purchases"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                      )}
                    >
                      Vendor Bills (Purchases)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Rate Percentage (%) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="15"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : "")}
                      className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <span className="absolute right-3.5 top-3 text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter 0% for zero-rated export items.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Country / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">General Ledger Posting Account</label>
                  <input
                    type="text"
                    value={chartOfAccount}
                    onChange={(e) => setChartOfAccount(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Classification */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <FileCheck2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">NBR VAT Act 2012 Schedule</h2>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Statutory Classification</label>
              <select
                value={nbrCategory}
                onChange={(e) => setNbrCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Standard Rate (15%)">Standard Rate (15%) - Full Input Tax Credit</option>
                <option value="Truncated 10%">Truncated Rate (10%) - Reduced Input Credit</option>
                <option value="Truncated 7.5%">Truncated Rate (7.5%)</option>
                <option value="Truncated 5%">Truncated Rate (5%) - Essential Electronics</option>
                <option value="Zero Rated 0%">Zero-Rated (0%) - Direct IT Export</option>
                <option value="Exempt">Exempted - Schedule 1 Commodities</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Governs Mushak 6.3 report generation and automated monthly 9.1 return filings.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Simulation (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Calculation Simulation</h3>
            <p className="text-xs text-muted-foreground">Sample simulation on a ৳10,000 transaction.</p>

            <div className="space-y-2.5 p-4 rounded-lg bg-muted/40 border border-border/60 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Taxable Amount</span>
                <span className="font-mono">৳{sampleGross.toLocaleString("en-BD")}</span>
              </div>
              <div className="flex justify-between items-center text-primary font-medium">
                <span>Tax Added ({rateNum}%)</span>
                <span className="font-mono">+৳{sampleTaxVal.toLocaleString("en-BD")}</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between items-center font-bold text-foreground">
                <span>Gross Total</span>
                <span className="font-mono">৳{sampleTotal.toLocaleString("en-BD")}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Active Tax Rule</span>
              </label>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Configured tax rules automatically recalculate cart lines during checkout and synchronize with the accounting VAT ledger.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
