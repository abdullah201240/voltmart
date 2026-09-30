"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Ticket,
  Calendar,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { VoucherRow } from "@/lib/data/discounts";

export default function NewDiscountPage() {
  const router = useRouter();
  const appToast = useToast();

  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed" | "Shipping">("Percentage");
  const [value, setValue] = useState(15);
  const [minSpend, setMinSpend] = useState(1000);
  const [usageLimit, setUsageLimit] = useState(250);
  const [oncePerCustomer, setOncePerCustomer] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomCode = () => {
    const prefixes = ["EID", "FLASH", "VOLT", "SAVE", "DEAL"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      appToast.error("Missing Code", "Please specify a coupon promo code.");
      return;
    }

    if (type !== "Shipping" && (!value || value <= 0)) {
      appToast.error("Invalid Value", "Discount value must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    const voucherId = `VC-${Date.now().toString(36).toUpperCase()}`;

    const discountLabel =
      type === "Percentage"
        ? `${value}% off`
        : type === "Shipping"
        ? "Free shipping"
        : `৳${value.toLocaleString("en-IN")} off`;

    const newVoucher: VoucherRow = {
      id: voucherId,
      code: cleanCode,
      type,
      value: type === "Shipping" ? 0 : value,
      discount: discountLabel,
      usageLimit: Number(usageLimit) || 0,
      used: 0,
      startsAt: new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expiresAt: new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Active",
    };

    addRecord("discount.voucher", {
      ...newVoucher,
      minSpend,
      oncePerCustomer,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Voucher code created",
      `Coupon ${cleanCode} (${discountLabel}) is now active.`
    );

    setTimeout(() => {
      router.push("/discounts");
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
            <Link href="/discounts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/discounts"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Discounts & Vouchers
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Promotional Voucher
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/discounts">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Voucher
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Voucher Code, Type & Values */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coupon Code Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Voucher Code & Mechanism</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomCode}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Random Code
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Promo Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLASH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono font-bold tracking-wider uppercase focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Percentage">Percentage Discount (%)</option>
                  <option value="Fixed">Fixed Amount Discount (৳ BDT)</option>
                  <option value="Shipping">Free Delivery / Shipping</option>
                </select>
              </div>

              {type !== "Shipping" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {type === "Percentage" ? "Discount Percentage (%)" : "Fixed Discount Amount (৳)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={type === "Percentage" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Minimum Cart Subtotal (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Usage & Redemptions Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Usage Limits & Eligibility</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Total Redemption Limit (Global)
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Coupon automatically expires after this number of successful checkouts.
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oncePerCustomer}
                    onChange={(e) => setOncePerCustomer(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Limit 1 Per Customer</span>
                    <p className="text-xs text-muted-foreground">
                      Tracked by customer phone number and checkout email address.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Validity & Notes */}
        <div className="space-y-6">
          {/* Validity Period */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Active Validity Window</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Campaign Notes</h2>
            <textarea
              rows={4}
              placeholder="Marketing campaign source (e.g. Facebook Ads, Influencer affiliate code)..."
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
