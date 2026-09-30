"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Truck,
  Globe2,
  Coins,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { ShippingRateRow } from "@/lib/data/shipping";

const CARRIERS = [
  "Pathao Express Courier",
  "Steadfast Logistics",
  "Paperfly Go Delivery",
  "RedX Nationwide",
  "VoltMart In-House Dhaka Fleet",
  "DHL Worldwide Express",
];

const ZONES = [
  "Inside Dhaka Metro",
  "Dhaka Suburbs (Gazipur, Savar, Narayanganj)",
  "Chittagong Division",
  "All Other Districts (Nationwide)",
  "Cross-Border International",
];

export default function NewShippingRatePage() {
  const router = useRouter();
  const appToast = useToast();

  const [carrier, setCarrier] = useState(CARRIERS[0]);
  const [zone, setZone] = useState(ZONES[0]);
  const [basis, setBasis] = useState("Flat Rate per Order");
  const [rateAmount, setRateAmount] = useState(60);
  const [freeAbove, setFreeAbove] = useState(2500);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    const rateId = `RATE-${Date.now().toString(36).toUpperCase()}`;

    const newRate: ShippingRateRow = {
      id: rateId,
      carrier,
      zone,
      basis,
      price: `৳${rateAmount.toLocaleString("en-IN")}`,
      freeAbove: freeAbove > 0 ? freeAbove : null,
    };

    addRecord("shipping.rate", {
      ...newRate,
      rateAmount,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Shipping rate saved",
      `${carrier} rate for "${zone}" set to ৳${rateAmount}.`
    );

    setTimeout(() => {
      router.push("/shipping/rates");
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
            <Link href="/shipping/rates">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/shipping/rates"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Shipping Rates
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Shipping Rate Rule
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/shipping/rates">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Rate Rule
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Carrier & Zone Mapping */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Coins className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Tariff Configuration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Logistics Courier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Destination Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pricing Basis</label>
                <select
                  value={basis}
                  onChange={(e) => setBasis(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Flat Rate per Order">Flat Rate per Order</option>
                  <option value="Per Kg Weight">Per Kg Weight</option>
                  <option value="Volumetric Dimensional">Volumetric Dimensional Weight</option>
                  <option value="Order Subtotal %">Order Subtotal %</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Rate Price (৳ BDT)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={rateAmount}
                  onChange={(e) => setRateAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Free Delivery Over Subtotal (৳ BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={freeAbove}
                  onChange={(e) => setFreeAbove(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Shoppers whose cart subtotal exceeds this amount will receive free delivery on
                  this carrier.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Remarks */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Contractual Notes</h2>
            <textarea
              rows={4}
              placeholder="Fuel surcharge adjustment frequency, COD handling fee waiver..."
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
