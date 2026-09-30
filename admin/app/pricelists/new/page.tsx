"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  ListChecks,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { PricelistRow } from "@/lib/data/discounts";

export default function NewPricelistPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [policy, setPolicy] = useState<PricelistRow["policy"]>("Percentage");
  const [discountPercent, setDiscountPercent] = useState(12);
  const [targetSegment, setTargetSegment] = useState("Wholesale");
  const [isBase, setIsBase] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Please specify a pricelist name.");
      return;
    }

    setIsSubmitting(true);
    const plId = `PL-${Date.now().toString(36).toUpperCase()}`;

    const newPricelist: PricelistRow = {
      id: plId,
      name: name.trim(),
      currency,
      policy,
      isBase,
      items: 0,
      status: "Active",
    };

    addRecord("product.pricelist", {
      ...newPricelist,
      discountPercent,
      targetSegment,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Pricelist created",
      `"${name.trim()}" (${policy}) saved and active.`
    );

    setTimeout(() => {
      router.push("/pricelists");
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
            <Link href="/pricelists">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/pricelists"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Pricelists
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Customer Pricelist
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/pricelists">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Pricelist
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Details & Policy */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <ListChecks className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Pricelist Strategy</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Pricelist Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B2B Wholesale Tier 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Settlement Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="BDT">BDT (৳ Bangladeshi Taka)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Computation Policy</label>
                <select
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Percentage">Percentage Discount off Public Price</option>
                  <option value="Fixed Price">Fixed Manual Price Matrix</option>
                  <option value="Markup">Markup over Landed Cost</option>
                  <option value="Margin">Target Gross Profit Margin %</option>
                  <option value="Discount">Formula-based Progressive Discount</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Default Rate Adjustment (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Segment Targeting Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Customer Segment Eligibility</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Applied Customer Tier</label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Wholesale">Wholesale & Distributors</option>
                  <option value="Corporate">Corporate Accounts (Invoiced Net-30)</option>
                  <option value="VIP">VIP Retail Members</option>
                  <option value="Staff">Internal Staff & Affiliates</option>
                </select>
              </div>

              <div className="space-y-3 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBase}
                    onChange={(e) => setIsBase(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Fallback Base List</span>
                    <p className="text-xs text-muted-foreground">
                      Applied when no other pricelist matches the buyer.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Notes */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Commercial Notes</h2>
            <textarea
              rows={4}
              placeholder="Contractual minimum order value requirements, renegotiation timeline..."
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
