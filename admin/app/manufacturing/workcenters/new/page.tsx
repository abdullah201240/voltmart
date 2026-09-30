"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Cog,
  Gauge,
  Clock,
  Zap,
  Activity,
  DollarSign,
  Building,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { WorkCenterRow } from "@/lib/data/manufacturing";

export default function NewWorkcenterPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [efficiency, setEfficiency] = useState(95);
  const [cycleTime, setCycleTime] = useState(25);
  const [targetMove, setTargetMove] = useState(5);
  const [costPerHour, setCostPerHour] = useState(1500);
  const [workshopBay, setWorkshopBay] = useState("Floor 1 - Bay A (Electronics)");
  const [operators, setOperators] = useState(2);
  const [status, setStatus] = useState<"active" | "maintenance" | "standby">("active");

  // Computed metrics
  const effectiveCapacityUnitsPerDay = Math.round((8 * 60 / Math.max(1, cycleTime)) * (efficiency / 100) * capacity);
  const effectiveCostPerUnit = cycleTime > 0 ? Math.round((costPerHour / 60) * cycleTime) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Work center name is required");
      return;
    }
    if (!code.trim()) {
      appToast.error("Validation error", "Work center code is required");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `WC-${Date.now().toString(36).toUpperCase()}`;
      const newWorkCenter: WorkCenterRow = {
        id: generatedId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        capacity: Number(capacity) || 1,
        efficiency: Number(efficiency) || 100,
        cycleTime: Number(cycleTime) || 0,
        targetMove: Number(targetMove) || 0,
      };

      addRecord("mrp.workcenter", newWorkCenter as unknown as Record<string, unknown>);
      appToast.success("Work center created", `${newWorkCenter.name} (${newWorkCenter.code}) registered successfully.`);
      router.push("/manufacturing/workcenters");
    } catch {
      appToast.error("Failed to save", "Could not register work center.");
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
            href="/manufacturing/workcenters"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Work Centres
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Work Centre</h1>
            <Badge variant="outline" className="text-xs font-mono uppercase bg-primary/10 text-primary border-primary/20">
              MRP Station
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure manufacturing machinery, production lines, cycle runtimes and labor costing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/manufacturing/workcenters")}
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
            {saving ? "Registering..." : "Save Work Centre"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Configuration (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Cog className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Station & Machine Identity</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Work Centre Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMT Line 3 High-Speed Pick & Place"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Internal Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMT-03"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Unique machine tag used on routing sheets.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Workshop Floor / Location</label>
                <input
                  type="text"
                  value={workshopBay}
                  onChange={(e) => setWorkshopBay(e.target.value)}
                  placeholder="e.g. Floor 2 - Cleanroom B"
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Production Dynamics */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Gauge className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Capacity & Routing Dynamics</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Parallel MO Capacity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">jobs</span>
                </div>
                <p className="text-xs text-muted-foreground">Number of orders running simultaneously.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Efficiency Rating (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={efficiency}
                    onChange={(e) => setEfficiency(Math.max(1, parseInt(e.target.value) || 100))}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Factor applied to standard operation cycle times.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Standard Cycle Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={cycleTime}
                    onChange={(e) => setCycleTime(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">minutes/unit</span>
                </div>
                <p className="text-xs text-muted-foreground">Base processing duration per finished unit.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Target Move Time
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={targetMove}
                    onChange={(e) => setTargetMove(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">minutes</span>
                </div>
                <p className="text-xs text-muted-foreground">Buffer time required to transfer to next work center.</p>
              </div>
            </div>
          </div>

          {/* Operational Costing */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Cost Center & Manning</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Hourly Operating Cost (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={costPerHour}
                    onChange={(e) => setCostPerHour(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full h-11 pl-8 pr-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Includes depreciation, electricity and tooling wear.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dedicated Operator Count</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={operators}
                    onChange={(e) => setOperators(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">operators</span>
                </div>
                <p className="text-xs text-muted-foreground">Direct labor allocation required per shift.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary (1 col) */}
        <div className="space-y-6">
          {/* Status & Availability */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Machine Status</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operational State</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "maintenance" | "standby")}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="active">Active & Online</option>
                <option value="standby">Standby (Cold Reserve)</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>

            <div className="pt-3 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Preventive Maintenance</span>
                <span className="font-medium text-foreground">Every 90 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Telemetry Protocol</span>
                <span className="font-mono text-foreground">OPC-UA / MQTT</span>
              </div>
            </div>
          </div>

          {/* Performance Simulation Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold tracking-tight">Throughput Projection</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Est. 8h Shift Output</p>
                  <p className="text-xl font-extrabold text-foreground">{effectiveCapacityUnitsPerDay} units</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Machine Cost per Unit</p>
                  <p className="text-xl font-extrabold text-primary">৳{effectiveCostPerUnit.toLocaleString("en-BD")}</p>
                </div>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Standard OEE factor calculated automatically based on scheduled downtime and work center capacity.
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
