"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Tag,
  Sparkles,
  Users,
  Percent,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CustomerTag } from "@/lib/data/customers";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS = [
  { value: "bg-violet-500", label: "Violet", hex: "#8b5cf6", border: "border-violet-500/30" },
  { value: "bg-amber-500", label: "Amber", hex: "#f59e0b", border: "border-amber-500/30" },
  { value: "bg-emerald-500", label: "Emerald", hex: "#10b981", border: "border-emerald-500/30" },
  { value: "bg-sky-500", label: "Sky", hex: "#0ea5e9", border: "border-sky-500/30" },
  { value: "bg-rose-500", label: "Rose", hex: "#f43f5e", border: "border-rose-500/30" },
  { value: "bg-cyan-500", label: "Cyan", hex: "#06b6d4", border: "border-cyan-500/30" },
  { value: "bg-indigo-500", label: "Indigo", hex: "#6366f1", border: "border-indigo-500/30" },
  { value: "bg-fuchsia-500", label: "Fuchsia", hex: "#d946ef", border: "border-fuchsia-500/30" },
];

export default function NewCustomerTagPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-sky-500");
  const [assignmentMode, setAssignmentMode] = useState<"manual" | "spend" | "orders">("manual");
  const [thresholdAmount, setThresholdAmount] = useState(50000);
  const [thresholdOrders, setThresholdOrders] = useState(5);
  const [dedicatedPerk, setDedicatedPerk] = useState("Priority Dispatch & 5% Catalog Rebate");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Tag name is required.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `T-${Date.now().toString(36).toUpperCase()}`;
      const newTag: CustomerTag = {
        id: generatedId,
        name: name.trim(),
        color: selectedColor,
        customers: 0,
      };

      addRecord("customer.tag", newTag as unknown as Record<string, unknown>);
      appToast.success("Tag created", `Customer segment tag "${newTag.name}" has been created.`);
      router.push("/customers/tags");
    } catch {
      appToast.error("Failed to save", "Could not create customer tag.");
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
            href="/customers/tags"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Customer Tags
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Customer Tag</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Audience Segment
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Categorize and label buyers for targeted pricing campaigns, priority dispatch, and tiered perks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/customers/tags")}
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
            {saving ? "Saving..." : "Save Tag"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Tag Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tag Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP B2B Wholesaler, Govt / Defense, High LTV"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Internal Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly state who qualifies for this tag and what operational workflows it triggers."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Color Swatch Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-foreground">
                  Badge Color Swatch <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {COLOR_OPTIONS.map((opt) => {
                    const isSelected = selectedColor === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedColor(opt.value)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:bg-muted/50",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20 bg-muted/60"
                            : "border-border/80"
                        )}
                      >
                        <span className={cn("h-5 w-5 rounded-full mb-1.5 shadow-xs", opt.value)} />
                        <span className="text-[11px] truncate max-w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Automated Assignment Rules */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Assignment Criteria</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAssignmentMode("manual")}
                className={cn(
                  "p-4 rounded-lg border text-left cursor-pointer transition-all",
                  assignmentMode === "manual"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <p className="font-semibold text-sm text-foreground">Manual Only</p>
                <p className="text-xs mt-1">Staff assigns tag manually on customer profile.</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode("spend")}
                className={cn(
                  "p-4 rounded-lg border text-left cursor-pointer transition-all",
                  assignmentMode === "spend"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <p className="font-semibold text-sm text-foreground">Lifetime Spend</p>
                <p className="text-xs mt-1">Auto-assigned when total orders exceed threshold.</p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode("orders")}
                className={cn(
                  "p-4 rounded-lg border text-left cursor-pointer transition-all",
                  assignmentMode === "orders"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <p className="font-semibold text-sm text-foreground">Order Frequency</p>
                <p className="text-xs mt-1">Auto-assigned when completed order count met.</p>
              </button>
            </div>

            {assignmentMode === "spend" && (
              <div className="space-y-2 p-4 rounded-md bg-muted/30 border border-border/60">
                <label className="text-sm font-medium text-foreground">Minimum Lifetime Spend (BDT)</label>
                <div className="relative max-w-sm">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={thresholdAmount}
                    onChange={(e) => setThresholdAmount(parseInt(e.target.value) || 0)}
                    className="w-full h-11 pl-8 pr-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {assignmentMode === "orders" && (
              <div className="space-y-2 p-4 rounded-md bg-muted/30 border border-border/60">
                <label className="text-sm font-medium text-foreground">Minimum Completed Orders</label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    min="1"
                    value={thresholdOrders}
                    onChange={(e) => setThresholdOrders(parseInt(e.target.value) || 1)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Preview (1 col) */}
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Tag Badge Preview</h3>
            <p className="text-xs text-muted-foreground">This is how the tag will appear across customer lists, order headers, and CRM views.</p>

            <div className="p-6 rounded-lg bg-muted/40 border border-border/60 flex flex-col items-center justify-center gap-3 min-h-[120px]">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/80 bg-background shadow-xs">
                <span className={cn("h-3 w-3 rounded-full shrink-0", selectedColor)} />
                <span className="font-semibold text-sm text-foreground">
                  {name.trim() || "Untitled Tag"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">0 Customers tagged</span>
            </div>
          </div>

          {/* Associated Segment Perks */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Percent className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold tracking-tight">Attached Privileges</h3>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">VIP / SLA Policy</label>
              <input
                type="text"
                value={dedicatedPerk}
                onChange={(e) => setDedicatedPerk(e.target.value)}
                placeholder="e.g. Dedicated Account Manager + 4h Dispatch"
                className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>Audience Target Ready</span>
              </div>
              <p>Customers tagged with this label can be targeted in promotions and automated discounts.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
