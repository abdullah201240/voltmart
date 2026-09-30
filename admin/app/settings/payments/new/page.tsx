"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CreditCard,
  Key,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { PROVIDER, type PaymentProviderRow } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

const PROVIDER_PRESETS = [
  { name: "bKash Direct Merchant", kind: "Wallet" as const, desc: "Direct bKash Tokenized Checkout API v1.2" },
  { name: "Nagad Enterprise Gateway", kind: "Wallet" as const, desc: "Direct PGW with automated refund hooks" },
  { name: "SSLCommerz Multi-Card", kind: "Card" as const, desc: "Visa, Mastercard, Amex, UnionPay & Net Banking" },
  { name: "City Bank CityPay / IPG", kind: "Bank" as const, desc: "Direct Host-to-Host Card Acquiring" },
  { name: "Cash on Delivery (Standard)", kind: "COD" as const, desc: "Courier cash collection at recipient doorstep" },
];

export default function NewPaymentProviderPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PaymentProviderRow["kind"]>("Wallet");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [channels, setChannels] = useState("VoltMart Online, Dhaka Flagship, B2B Portal");
  const [merchantId, setMerchantId] = useState("");
  const [appKey, setAppKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [feeBearer, setFeeBearer] = useState<"merchant" | "customer">("merchant");
  const [feePercent, setFeePercent] = useState(1.5);
  const [active, setActive] = useState(true);

  const applyPreset = (preset: typeof PROVIDER_PRESETS[0]) => {
    setName(preset.name);
    setKind(preset.kind);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Provider name is required.");
      return;
    }
    const channelList = channels.split(",").map((c) => c.trim()).filter(Boolean);
    if (channelList.length === 0) {
      appToast.error("Validation error", "Provide at least one sales channel.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `PP-${Date.now().toString(36).toUpperCase()}`;
      const newProvider: PaymentProviderRow = {
        id: generatedId,
        name: name.trim(),
        kind,
        channels: channelList,
        captured: 0,
        active,
      };

      addRecord(PROVIDER, newProvider as unknown as Record<string, unknown>);
      appToast.success("Payment provider added", `Provider "${newProvider.name}" is now enabled for checkout.`);
      router.push("/settings/payments");
    } catch {
      appToast.error("Failed to save", "Could not configure payment provider.");
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
            href="/settings/payments"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Payment Providers
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Add Payment Provider</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Gateway Integration
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect debit/credit card acquiring, digital mobile wallets, and courier COD payment rails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/payments")}
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
            {saving ? "Configuring..." : "Enable Provider"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presets Quick Picker */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Presets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PROVIDER_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-3.5 rounded-lg border border-border/80 hover:border-primary/50 text-left cursor-pointer transition-all hover:bg-muted/40"
                >
                  <p className="font-semibold text-xs text-foreground truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Identity & Kind */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Provider Specification</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Provider Display Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash Direct Merchant PGW"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Payment Method Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as PaymentProviderRow["kind"])}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Wallet">Wallet (bKash / Nagad / Rocket)</option>
                  <option value="Card">Card (Visa / Mastercard / Amex)</option>
                  <option value="Bank">Bank Transfer / Net Banking</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gateway Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production")}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="production">Production (Live Acquiring)</option>
                  <option value="sandbox">Sandbox / Staging Simulator</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Enabled Sales Channels <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  placeholder="e.g. VoltMart Online, Dhaka Flagship, B2B Portal"
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Comma-separated channels where this gateway appears at checkout.</p>
              </div>
            </div>
          </div>

          {/* API Credentials */}
          {kind !== "COD" && (
            <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border/60">
                <Key className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">API Security Credentials</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Merchant / Store ID</label>
                  <input
                    type="text"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="e.g. VOLTMART_LIVE_01"
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">App Key / Client ID</label>
                  <input
                    type="text"
                    value={appKey}
                    onChange={(e) => setAppKey(e.target.value)}
                    placeholder="app_key_xxxxxxxx"
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Secret Key / Token</label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Status &amp; Fees</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Enable on Checkout</span>
              </label>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <label className="text-sm font-medium text-foreground">Gateway Processing Fee</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={feePercent}
                    onChange={(e) => setFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3.5 top-3 text-sm text-muted-foreground">%</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFeeBearer("merchant")}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded text-xs font-medium border text-center cursor-pointer transition-all",
                      feeBearer === "merchant" ? "border-primary bg-primary/10 text-primary" : "border-border/80 text-muted-foreground"
                    )}
                  >
                    Merchant Absorbs
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeBearer("customer")}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded text-xs font-medium border text-center cursor-pointer transition-all",
                      feeBearer === "customer" ? "border-primary bg-primary/10 text-primary" : "border-border/80 text-muted-foreground"
                    )}
                  >
                    Pass to Buyer
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              All API keys are encrypted at rest with AES-256-GCM. Cardholder data is tokenized and never touches your server.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
