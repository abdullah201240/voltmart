"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Truck,
  CheckCircle2,
  Percent,
  Link2,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CarrierRow, CarrierProvider } from "@/lib/data/shipping";

const PROVIDERS = [
  "Pathao Courier API",
  "Steadfast Logistics API",
  "Paperfly Go",
  "RedX Logistics",
  "VoltMart In-House Dhaka Fleet",
  "DHL Express Worldwide",
];

export default function NewShippingMethodPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [method, setMethod] = useState("Fixed Price");
  const [basePrice, setBasePrice] = useState(60);
  const [margin, setMargin] = useState(0);
  const [active, setActive] = useState(true);
  const [trackingWebhookUrl, setTrackingWebhookUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Carrier method name is required.");
      return;
    }

    setIsSubmitting(true);
    const carrierId = `CAR-${Date.now().toString(36).toUpperCase()}`;

    const newCarrier: CarrierRow = {
      id: carrierId,
      name: name.trim(),
      provider: (provider.includes("DHL") ? "DHL Express" : "Local Courier") as CarrierProvider,
      method: method as CarrierRow["method"],
      countries: 1,
      margin,
      active,
    };

    addRecord("delivery.carrier", {
      ...newCarrier,
      basePrice,
      trackingWebhookUrl: trackingWebhookUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Shipping method saved",
      `"${name.trim()}" powered by ${provider} is now configured.`
    );

    setTimeout(() => {
      router.push("/shipping/methods");
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
            <Link href="/shipping/methods">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/shipping/methods"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Shipping Methods
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Delivery Carrier Method
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/shipping/methods">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Carrier
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Details & Provider */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Carrier Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Method Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pathao Express Next-Day Delivery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Logistics Provider API</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {PROVIDERS.map((pr) => (
                    <option key={pr} value={pr}>
                      {pr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pricing Policy</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Fixed Price">Fixed Flat Rate (per order)</option>
                  <option value="Weight Based">Weight-based Stepped Rates</option>
                  <option value="Real-time API">Real-time Third-Party Carrier API Quote</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Base Delivery Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tracking / Webhook Callback URL</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://api.voltmart.com/webhooks/pathao-tracking"
                    value={trackingWebhookUrl}
                    onChange={(e) => setTrackingWebhookUrl(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status & Margins */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Operational Status</h2>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">Enable at Checkout</span>
                <p className="text-xs text-muted-foreground">
                  Visible to shoppers during address and delivery selection.
                </p>
              </div>
            </label>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">
                Handling / Packaging Margin (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Courier Notes</h2>
            <textarea
              rows={4}
              placeholder="Merchant API credentials or hub manager contact..."
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
