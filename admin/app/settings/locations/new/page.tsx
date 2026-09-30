"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  MapPin,
  Warehouse,
  Layers,
  Barcode,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { getWarehouses, LOCATION, type LocationRow } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

const LOCATION_TYPES: { id: LocationRow["type"]; label: string; desc: string }[] = [
  { id: "Stock", label: "Internal Stock (Bin/Shelf)", desc: "Standard storage racks for picking and fulfillment" },
  { id: "Input", label: "Inbound Receiving (Dock)", desc: "Holding area for newly received purchase orders and QA" },
  { id: "Output", label: "Outbound Dispatch", desc: "Packed orders staged for courier handoff" },
  { id: "Transit", label: "Inter-Warehouse Transit", desc: "Goods in motion between different distribution centers" },
  { id: "Shipment", label: "Carrier Delivery Hub", desc: "Direct courier terminal location" },
];

export default function NewLocationPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [type, setType] = useState<LocationRow["type"]>("Stock");
  const [parent, setParent] = useState("WH/Stock");
  const [barcode, setBarcode] = useState("");
  const [aisle, setAisle] = useState("A");
  const [rack, setRack] = useState("01");
  const [shelf, setShelf] = useState("01");
  const [whOptions, setWhOptions] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    getWarehouses().then((whs) => {
      if (!alive) return;
      const names = whs.map((w) => w.name);
      setWhOptions(names);
      if (names.length > 0 && !warehouse) {
        setWarehouse(names[0]);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleTypeChange = (selectedType: LocationRow["type"]) => {
    setType(selectedType);
    if (selectedType === "Stock") setParent("WH/Stock");
    else if (selectedType === "Input") setParent("WH/Input");
    else if (selectedType === "Output") setParent("WH/Output");
    else if (selectedType === "Transit") setParent("Virtual/Transit");
    else if (selectedType === "Shipment") setParent("WH/Shipment");
  };

  const generateBinCode = () => {
    const code = `BIN-${aisle}-${rack}-${shelf}`;
    setName(code);
    setBarcode(code.replace(/-/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Location name is required.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `L-${Date.now().toString(36).toUpperCase()}`;
      const newLoc: LocationRow = {
        id: generatedId,
        name: name.trim(),
        warehouse: warehouse || (whOptions[0] ?? "Central Warehouse"),
        type,
        products: 0,
        parent: parent.trim() || "WH/Stock",
      };

      addRecord(LOCATION, newLoc as unknown as Record<string, unknown>);
      appToast.success("Location created", `Storage location "${newLoc.name}" added to ${newLoc.warehouse}.`);
      router.push("/settings/locations");
    } catch {
      appToast.error("Failed to save", "Could not register storage location.");
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
            href="/settings/locations"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Locations
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Storage Location</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Warehouse Tree
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Register aisles, pallet racks, picking bins, receiving docks and transit locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/locations")}
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
            {saving ? "Creating..." : "Save Location"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse & Type */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Warehouse className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Warehouse &amp; Functional Purpose</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Host Warehouse <span className="text-destructive">*</span>
                </label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {whOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  {whOptions.length === 0 && (
                    <option value="Central Warehouse">Central Distribution Warehouse (Dhaka)</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Location Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as LocationRow["type"])}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {LOCATION_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Identity & Hierarchy */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Location Details &amp; Path</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Location Name / Label <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rack A-12 Tier 3, Dock 1 Inbound Inspection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Parent Location Node <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">e.g. WH/Stock or WH/Output/Dock</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Scan Barcode / QR Tag</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="LOC-BINA1203"
                    className="w-full h-11 pl-9 pr-3.5 rounded-md border border-input bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Bin Coordinate Generator */}
          {type === "Stock" && (
            <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-semibold tracking-tight">Bin Coordinate Helper</h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateBinCode}
                  className="cursor-pointer text-xs"
                >
                  Generate &amp; Set Name
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Aisle</label>
                  <input
                    type="text"
                    value={aisle}
                    onChange={(e) => setAisle(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 rounded border border-input bg-background text-xs uppercase text-center font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Rack / Bay</label>
                  <input
                    type="text"
                    value={rack}
                    onChange={(e) => setRack(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-input bg-background text-xs text-center font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Shelf / Tier</label>
                  <input
                    type="text"
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="w-full h-9 px-3 rounded border border-input bg-background text-xs text-center font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Location Overview</h3>

            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Path</span>
                <span className="font-mono text-foreground">{parent}/{name || "..."}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Classification</span>
                <Badge variant="outline">{type}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Inventory Count</span>
                <span className="font-medium text-foreground">0 products</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Warehouse locations power barcode-guided wave picking and real-time replenishment triggers.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
