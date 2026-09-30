"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Percent,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { PromotionRow } from "@/lib/data/discounts";

const CHANNELS = [
  "Default Channel (BDT)",
  "Dhaka Store (BDT)",
  "Chattogram Store (BDT)",
  "Online Marketplace",
];

export default function NewPromotionPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [rewardType, setRewardType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(5000);
  const [minItems, setMinItems] = useState(1);
  const [categoryRule, setCategoryRule] = useState("Audio & Sound");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Please specify a promotion name.");
      return;
    }

    setIsSubmitting(true);
    const promoId = `PRO-${Date.now().toString(36).toUpperCase()}`;

    const discountLabel =
      rewardType === "percentage" ? `${discountValue}% off` : `৳${discountValue.toLocaleString("en-IN")} off`;

    const ruleText = `Min. order ৳${minSpend.toLocaleString("en-IN")} on ${categoryRule}`;

    const newPromo: PromotionRow = {
      id: promoId,
      name: name.trim(),
      rule: ruleText,
      channel,
      discount: discountLabel,
      status: "Active",
    };

    addRecord("promotion.program", {
      ...newPromo,
      rewardType,
      discountValue,
      minSpend,
      minItems,
      categoryRule,
      startDate,
      endDate,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Promotion activated",
      `"${name.trim()}" (${discountLabel}) is now active on ${channel}.`
    );

    setTimeout(() => {
      router.push("/promotions");
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
            <Link href="/promotions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/promotions"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Promotions
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Automated Cart Promotion
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/promotions">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Activate Promotion
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Promotion Rules & Reward */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Campaign Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Campaign Definition</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Promotion Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Audio Mania Flash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Sales Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Trigger Condition Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Automatic Checkout Trigger Rule</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Minimum Cart Subtotal (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Minimum Quantity of Items</label>
                <input
                  type="number"
                  min="1"
                  value={minItems}
                  onChange={(e) => setMinItems(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Qualifying Category</label>
                <select
                  value={categoryRule}
                  onChange={(e) => setCategoryRule(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="All Catalog">All Catalog Products</option>
                  <option value="Audio & Sound">Audio & Headphones</option>
                  <option value="Power & Charging">Power Banks & Fast Chargers</option>
                  <option value="Smart Wearables">Smartwatches & Bands</option>
                  <option value="Computing & Laptops">Laptops & Keyboards</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Percent className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Automatic Reward Granted</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Reward Mechanism</label>
                <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setRewardType("percentage")}
                    className={`flex-1 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
                      rewardType === "percentage"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Percentage Off (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRewardType("fixed")}
                    className={`flex-1 rounded-md py-1.5 font-medium transition-all cursor-pointer ${
                      rewardType === "fixed"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Fixed Cash Discount (৳)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rewardType === "percentage" ? "Discount Percentage (%)" : "Fixed Cash Rebate (৳)"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={rewardType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Schedule & Notes */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Campaign Duration</h2>
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
                <label className="text-xs font-semibold text-foreground">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Internal Notes</h2>
            <textarea
              rows={4}
              placeholder="Marketing campaign goals, projected cart size increase, co-op vendor funding..."
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
