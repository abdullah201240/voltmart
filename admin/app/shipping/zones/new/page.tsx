"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe2,
  MapPin,
  Truck,
  Timer,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { ShippingZoneRow } from "@/lib/data/shipping";

export default function NewShippingZonePage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [countriesText, setCountriesText] = useState("Bangladesh (Dhaka Division)");
  const [deliveryDays, setDeliveryDays] = useState("24–48 hours");
  const [carriersCount, setCarriersCount] = useState(3);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Shipping zone name is required.");
      return;
    }

    const countryList = countriesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (countryList.length === 0) {
      appToast.error("Missing Coverage", "Add at least one covered region or country.");
      return;
    }

    setIsSubmitting(true);
    const zoneId = `ZONE-${Date.now().toString(36).toUpperCase()}`;

    const newZone: ShippingZoneRow = {
      id: zoneId,
      name: name.trim(),
      countries: countryList,
      carriers: carriersCount,
      deliveryDays: deliveryDays.trim() || "1–3 days",
    };

    addRecord("stock.location.zone", {
      ...newZone,
      freeShippingThreshold,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Shipping zone saved",
      `"${name.trim()}" created with delivery window of ${deliveryDays}.`
    );

    setTimeout(() => {
      router.push("/shipping/zones");
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
            <Link href="/shipping/zones">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/shipping/zones"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Shipping Zones
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Shipping Zone
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/shipping/zones">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Zone
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Zone Details & Geography */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Globe2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Zone Configuration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Zone Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka Metro & Suburbs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Expected Delivery Window <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Timer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. 24–48 hours"
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Covered Regions / Countries (Comma-separated) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dhaka North, Dhaka South, Gazipur, Narayanganj"
                  value={countriesText}
                  onChange={(e) => setCountriesText(e.target.value)}
                  className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Carriers & Thresholds */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Carrier & Rates</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Assigned Active Couriers</label>
              <input
                type="number"
                min="1"
                value={carriersCount}
                onChange={(e) => setCarriersCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">
                Free Shipping Cart Threshold (৳)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Operational Remarks</h2>
            <textarea
              rows={4}
              placeholder="Fulfillment hub dispatch cut-off times, return processing rules..."
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
