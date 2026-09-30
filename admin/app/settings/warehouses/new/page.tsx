"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Warehouse,
  MapPin,
  Route,
  Building,
  Truck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { WAREHOUSE, type WarehouseRow } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

const ROUTE_MODES = [
  {
    steps: 1,
    title: "1-Step (Direct Ship)",
    desc: "Single-step fulfillment: Goods are packed directly from shelves into carrier bags. Best for retail outlets & dark stores.",
  },
  {
    steps: 2,
    title: "2-Step (Pick + Ship)",
    desc: "Goods are gathered to an outbound staging area before courier scan handoff.",
  },
  {
    steps: 3,
    title: "3-Step (Pick / Pack / Ship)",
    desc: "Enterprise fulfillment: Wave picking -> Packing & barcode verification station -> Loading dock. Best for regional distribution centers.",
  },
];

export default function NewWarehousePage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [steps, setSteps] = useState(3);
  const [storageArea, setStorageArea] = useState(15000);
  const [dockCount, setDockCount] = useState(4);
  const [hasColdStorage, setHasColdStorage] = useState(false);
  const [active, setActive] = useState(true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code) {
      const generated = val
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 4);
      setCode(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Warehouse name is required.");
      return;
    }
    if (!code.trim()) {
      appToast.error("Validation error", "Warehouse short code is required.");
      return;
    }
    if (!location.trim()) {
      appToast.error("Validation error", "Physical location address is required.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `WH-${Date.now().toString(36).toUpperCase()}`;
      const newWh: WarehouseRow = {
        id: generatedId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: `${location.trim()}, ${district}`,
        steps,
        active,
      };

      addRecord(WAREHOUSE, newWh as unknown as Record<string, unknown>);
      appToast.success("Warehouse created", `Warehouse "${newWh.name}" (${newWh.code}) has been activated.`);
      router.push("/settings/warehouses");
    } catch {
      appToast.error("Failed to save", "Could not register warehouse facility.");
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
            href="/settings/warehouses"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Warehouses
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Warehouse</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Distribution Site
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Register distribution centers, regional hubs, and configure internal picking and shipping route steps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/warehouses")}
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
            {saving ? "Registering..." : "Save Warehouse"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Identity */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Warehouse className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Facility Identity &amp; Code</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Warehouse Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chittagong Port Distribution Center"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Short Code Prefix <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="CTG"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Used as the prefix for stock locations (e.g. {code || "WH"}/Stock).</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">District / Division</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Dhaka">Dhaka Division</option>
                  <option value="Chittagong">Chittagong Division</option>
                  <option value="Sylhet">Sylhet Division</option>
                  <option value="Rajshahi">Rajshahi Division</option>
                  <option value="Khulna">Khulna Division</option>
                  <option value="Barisal">Barisal Division</option>
                  <option value="Rangpur">Rangpur Division</option>
                  <option value="Mymensingh">Mymensingh Division</option>
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Street Address &amp; Landmarking <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot 18, Export Processing Zone (EPZ), Halishahar"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Fulfillment Routes & Step Dynamics */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Route className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Fulfillment Route Workflow</h2>
            </div>

            <div className="space-y-3">
              {ROUTE_MODES.map((mode) => {
                const isSelected = steps === mode.steps;
                return (
                  <button
                    key={mode.steps}
                    type="button"
                    onClick={() => setSteps(mode.steps)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-4",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/80 hover:bg-muted/40"
                    )}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {mode.steps}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">{mode.title}</span>
                        {isSelected && (
                          <Badge variant="default" className="text-[10px]">Active Rule</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity & Infrastructure */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Capacity &amp; Infrastructure</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Floor Area (Sq. Ft)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    value={storageArea}
                    onChange={(e) => setStorageArea(parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-muted-foreground">sq ft</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Loading Bay Doors</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={dockCount}
                    onChange={(e) => setDockCount(parseInt(e.target.value) || 1)}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-muted-foreground">bays</span>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasColdStorage}
                    onChange={(e) => setHasColdStorage(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  <div>
                    <span className="font-medium">Climate-Controlled / Cold Storage Zone</span>
                    <p className="text-xs text-muted-foreground">For perishables, medical kits or temperature-sensitive lithium battery arrays.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Facility State</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Active for Inbound &amp; Dispatch</span>
              </label>

              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between items-center">
                  <span>Auto-created Nodes</span>
                  <span className="font-mono text-foreground">{code || "WH"}/Stock, Input, Output</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Courier Manifest</span>
                  <span className="font-medium text-foreground">Steadfast, Pathao, eCourier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Once created, the warehouse location tree and default stock routes are auto-provisioned immediately in the database.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
