"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  Cog,
  Cpu,
  Layers,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { BomRow, BomType } from "@/lib/data/manufacturing";

interface BomComponent {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface BomOperation {
  id: string;
  name: string;
  workcenter: string;
  durationMinutes: number;
}

const PRESET_RAW_COMPONENTS = [
  { name: "Sony 40mm Bio-Cellulose Driver Unit", sku: "RAW-DRV-40MM", cost: 14500 },
  { name: "Active Noise-Cancelling Audio Chipset", sku: "RAW-ANC-SOC", cost: 9800 },
  { name: "500mAh Lithium Polymer Battery Cell", sku: "RAW-BAT-500", cost: 3200 },
  { name: "Matte Black Headband & Foam Cushion", sku: "RAW-HDB-BLK", cost: 2400 },
  { name: "USB-C Fast Charging Controller Board", sku: "RAW-USBC-PCB", cost: 1800 },
];

export default function NewBomPage() {
  const router = useRouter();
  const appToast = useToast();

  const [product, setProduct] = useState("");
  const [sku, setSku] = useState("");
  const [type, setType] = useState<BomType>("normal");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [components, setComponents] = useState<BomComponent[]>([
    {
      id: "comp-1",
      name: PRESET_RAW_COMPONENTS[0].name,
      sku: PRESET_RAW_COMPONENTS[0].sku,
      quantity: 2,
      unitCost: PRESET_RAW_COMPONENTS[0].cost,
    },
    {
      id: "comp-2",
      name: PRESET_RAW_COMPONENTS[1].name,
      sku: PRESET_RAW_COMPONENTS[1].sku,
      quantity: 1,
      unitCost: PRESET_RAW_COMPONENTS[1].cost,
    },
  ]);

  const [operations, setOperations] = useState<BomOperation[]>([
    {
      id: "op-1",
      name: "PCB Soldering & Acoustic Mounting",
      workcenter: "Tejgaon Assembly Line 01",
      durationMinutes: 25,
    },
    {
      id: "op-2",
      name: "Frequency Calibration & Quality Seal",
      workcenter: "Acoustic Testing Lab",
      durationMinutes: 15,
    },
  ]);

  const handleAddComponent = () => {
    const nextItem = PRESET_RAW_COMPONENTS[components.length % PRESET_RAW_COMPONENTS.length];
    setComponents((prev) => [
      ...prev,
      {
        id: `comp-${Date.now()}`,
        name: nextItem.name,
        sku: nextItem.sku,
        quantity: 1,
        unitCost: nextItem.cost,
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length === 1) {
      appToast.error("Required Field", "A BoM must have at least one component.");
      return;
    }
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleComponentChange = (id: string, field: keyof BomComponent, value: any) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return { ...c, [field]: value };
      })
    );
  };

  const handleAddOperation = () => {
    setOperations((prev) => [
      ...prev,
      {
        id: `op-${Date.now()}`,
        name: "Protective Packaging & Barcode Labeling",
        workcenter: "Packaging & QA Center",
        durationMinutes: 10,
      },
    ]);
  };

  const handleRemoveOperation = (id: string) => {
    setOperations((prev) => prev.filter((o) => o.id !== id));
  };

  // Calculations
  const materialsCost = components.reduce((sum, c) => sum + c.quantity * c.unitCost, 0);
  const totalDurationMinutes = operations.reduce((sum, o) => sum + o.durationMinutes, 0);
  // Assume labor/machine rate of ৳600/hr (৳10/min)
  const laborMachineCost = totalDurationMinutes * 10;
  const unitCostTotal = materialsCost + laborMachineCost;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!product.trim()) {
      appToast.error("Missing Product", "Please specify the finished product name.");
      return;
    }

    if (!sku.trim()) {
      appToast.error("Missing SKU", "Please provide a SKU code for this manufactured item.");
      return;
    }

    setIsSubmitting(true);
    const bomId = `BOM-${Math.floor(100 + Math.random() * 900)}`;

    const newBom: BomRow = {
      id: bomId,
      product: product.trim(),
      sku: sku.trim().toUpperCase(),
      type,
      qty: 1,
      uom: "Units",
      components: components.map((c) => ({
        id: c.sku,
        product: c.name,
        sku: c.sku,
        qty: c.quantity,
        uom: "Units",
      })),
      operations: operations.map((o) => ({
        id: o.id,
        name: o.name,
        workCenter: o.workcenter,
        duration: o.durationMinutes,
      })),
      unitCost: unitCostTotal,
    };

    addRecord("mrp.bom", {
      ...newBom,
      materialsCost,
      laborMachineCost,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Bill of Materials saved",
      `${bomId} for ${product.trim()} recorded with total unit cost of ৳${unitCostTotal.toLocaleString("en-IN")}.`
    );

    setTimeout(() => {
      router.push("/manufacturing/bom");
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
            <Link href="/manufacturing/bom">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/manufacturing/bom"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Bills of Materials
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Bill of Materials (BoM)
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/manufacturing/bom">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save BoM Recipe
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Finished Good & Component Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Finished Product Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Cpu className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Manufactured Product Output</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Finished Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. VoltPulse Pro Wireless ANC Headset"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Product SKU <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VLT-ANC-PRO"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">BoM Recipe Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="normal">Normal (Manufacture & Track Inventory)</option>
                  <option value="kit">Sales Kit (Bundled at Checkout)</option>
                  <option value="phantom">Phantom (Sub-Assembly)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Raw Material Components Table */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Component Parts & Raw Materials</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddComponent}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Component
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-2.5 px-3">Component / Raw Material</th>
                    <th className="py-2.5 px-3 w-28">Part SKU</th>
                    <th className="py-2.5 px-3 w-24 text-center">Qty / Unit</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Cost (৳)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {components.map((comp) => {
                    const lineSubtotal = comp.quantity * comp.unitCost;
                    return (
                      <tr key={comp.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={comp.name}
                            onChange={(e) => handleComponentChange(comp.id, "name", e.target.value)}
                            className="w-full h-9 px-2 text-xs rounded border border-input bg-background text-foreground"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={comp.sku}
                            onChange={(e) => handleComponentChange(comp.id, "sku", e.target.value)}
                            className="w-full h-9 px-2 text-xs font-mono rounded border border-input bg-background text-foreground"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={comp.quantity}
                            onChange={(e) =>
                              handleComponentChange(
                                comp.id,
                                "quantity",
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-16 h-8 text-center text-xs font-semibold rounded border border-input bg-background"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={comp.unitCost}
                            onChange={(e) =>
                              handleComponentChange(
                                comp.id,
                                "unitCost",
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="w-24 h-8 text-right px-2 text-xs font-mono font-semibold rounded border border-input bg-background"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                          ৳{lineSubtotal.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(comp.id)}
                            className="text-muted-foreground hover:text-rose-500 cursor-pointer p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Routing Operations Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Cog className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Workcenter Operations</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOperation}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Step
              </Button>
            </div>

            <div className="space-y-3">
              {operations.map((op, index) => (
                <div
                  key={op.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30"
                >
                  <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Operation title"
                    value={op.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOperations((prev) =>
                        prev.map((o) => (o.id === op.id ? { ...o, name: val } : o))
                      );
                    }}
                    className="flex-1 h-9 px-3 text-xs rounded border border-input bg-background text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Workcenter name"
                    value={op.workcenter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOperations((prev) =>
                        prev.map((o) => (o.id === op.id ? { ...o, workcenter: val } : o))
                      );
                    }}
                    className="w-48 h-9 px-3 text-xs rounded border border-input bg-background text-foreground"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={op.durationMinutes}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        setOperations((prev) =>
                          prev.map((o) => (o.id === op.id ? { ...o, durationMinutes: val } : o))
                        );
                      }}
                      className="w-16 h-9 px-2 text-center text-xs font-mono font-semibold rounded border border-input bg-background text-foreground"
                    />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOperation(op.id)}
                    className="text-muted-foreground hover:text-rose-500 cursor-pointer p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cost Rollup */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Unit Cost Breakdown</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Raw Materials Cost</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{materialsCost.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Routing Labor ({totalDurationMinutes} mins)</span>
                <span className="font-mono font-medium text-foreground">
                  ৳{laborMachineCost.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t border-border/80 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Rollup Unit Cost</span>
                <span className="text-2xl font-extrabold font-mono text-primary">
                  ৳{unitCostTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="rounded-md bg-violet-500/10 border border-violet-500/20 p-3 text-xs text-violet-700 dark:text-violet-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  MRP Production Order Ready
                </div>
                <p>
                  Triggering a Manufacturing Order (MO) for this BoM automatically reserves raw
                  materials and dispatches job cards to the routing workcenters.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Engineering Notes</h2>
            <textarea
              rows={4}
              placeholder="Soldering temperature specs, ESD safety precautions, packaging box dimensions..."
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
