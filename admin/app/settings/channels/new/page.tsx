"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  Store,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { getWarehouses, CHANNEL, type ChannelRow } from "@/lib/data/settings";

export default function NewChannelPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [warehouse, setWarehouse] = useState("");
  const [channelType, setChannelType] = useState<"storefront" | "pos" | "marketplace" | "b2b">("storefront");
  const [whOptions, setWhOptions] = useState<{ value: string; label: string }[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let alive = true;
    getWarehouses().then((warehouses) => {
      if (!alive) return;
      const activeWh = warehouses.filter((w) => w.active).map((w) => ({ value: w.name, label: w.name }));
      setWhOptions(activeWh);
      if (activeWh.length > 0 && !warehouse) {
        setWarehouse(activeWh[0].value);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Channel name is required.");
      return;
    }
    if (!slug.trim()) {
      appToast.error("Validation error", "Channel slug is required.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `CH-${Date.now().toString(36).toUpperCase()}`;
      const newChannel: ChannelRow = {
        id: generatedId,
        name: name.trim(),
        slug: slug.trim(),
        currency,
        warehouse: warehouse || (whOptions[0]?.value ?? "Central Warehouse"),
        publishedProducts: 0,
        active,
      };

      addRecord(CHANNEL, newChannel as unknown as Record<string, unknown>);
      appToast.success("Channel created", `Sales channel "${newChannel.name}" is now online.`);
      router.push("/settings/channels");
    } catch {
      appToast.error("Failed to save", "Could not create sales channel.");
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
            href="/settings/channels"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Channels
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Sales Channel</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Multichannel Storefront
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure storefronts, point-of-sale terminals, or marketplace connectors bound to specific fulfillment warehouses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/channels")}
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
            {saving ? "Creating..." : "Save Channel"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Channel Identity */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Channel Identity & Routing</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Channel Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VoltMart Online Storefront, Sylhet Flagship POS"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  URL Slug Identifier <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="voltmart-online"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Used in API headers and domain routing.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fulfillment & Inventory Binding */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Store className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Fulfillment & Warehouse Source</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Default Fulfillment Warehouse <span className="text-destructive">*</span>
                </label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {whOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {whOptions.length === 0 && (
                    <option value="Central Warehouse">Central Distribution Warehouse (Dhaka)</option>
                  )}
                </select>
                <p className="text-xs text-muted-foreground">Orders made on this channel deduct stock from this location.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                  <span className="font-semibold text-sm text-foreground">Allocation Policy</span>
                  <p className="text-xs text-muted-foreground">Automated stock reservation on checkout completion.</p>
                </div>
                <div className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                  <span className="font-semibold text-sm text-foreground">Cross-Warehouse Routing</span>
                  <p className="text-xs text-muted-foreground">Fallback enabled if primary warehouse lacks inventory.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Channel Status</h3>
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Publish Channel Live</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1.5 ml-6.5">
                When enabled, products and pricing are actively served through this channel.
              </p>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Each sales channel isolates catalogs, prices, and tax configuration while sharing the unified product database.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
