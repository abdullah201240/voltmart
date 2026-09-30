"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  Boxes,
  Play,
  ShoppingCart,
  TriangleAlert,
  Check,
  XCircle,
  RotateCcw,
  ListChecks,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";
import {
  getReplenishRules,
  replenishStats,
  type ReplenishRule,
} from "@/lib/data/inventory";
import {
  orderpointState,
  scheduleOrderpoint,
  cancelOrderpoint,
} from "@/lib/data/workflows";

/** Effective lifecycle label for a reorder rule. */
function statusOf(rule: ReplenishRule): { key: "ordered" | "triggered" | "covered"; label: string; className: string } {
  const live = orderpointState(rule.id);
  if (live.status === "ordered") {
    return { key: "ordered", label: "In replenishment", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
  }
  if (rule.shortage) {
    return { key: "triggered", label: "Triggered", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  }
  return { key: "covered", label: "Covered", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
}

export default function ReplenishmentPage() {
  useOps(); // re-render whenever the ops overlay changes
  const appToast = useToast();

  // Rules + statuses are derived live from the on-hand table + overlay.
  const rules = getReplenishRules();
  const stats = replenishStats(rules, (id) => orderpointState(id).status);

  const order = (rule: ReplenishRule) => {
    const res = scheduleOrderpoint(rule.id, rule.product, rule.need, rule.vendor);
    if (res.ok) {
      appToast.success("Procurement ordered", res.message);
    } else {
      appToast.error("Failed to order", res.message);
    }
  };

  const cancel = (rule: ReplenishRule) => {
    const res = cancelOrderpoint(rule.id, rule.product);
    if (res.ok) {
      appToast.info("Replenishment cancelled", res.message);
    } else {
      appToast.error("Failed to cancel", res.message);
    }
  };

  // The scheduler = Odoo's "Run Scheduled Jobs": order every triggered rule.
  const runScheduler = () => {
    const targets = rules.filter((r) => r.shortage && orderpointState(r.id).status !== "ordered");
    if (targets.length === 0) {
      appToast.info("Scheduler complete", "Nothing to replenish at this time.");
      return;
    }
    let units = 0;
    for (const r of targets) {
      const res = scheduleOrderpoint(r.id, r.product, r.need, r.vendor);
      if (res.ok) units += r.need;
    }
    appToast.success("Scheduler executed", `Ordered ${targets.length} procurement(s) for a total of ${units} units.`);
  };

  const COLUMNS: CentralTableColumn<ReplenishRule>[] = [
    {
      accessorKey: "product",
      header: "Product",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.product}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: "Location",
      sortable: true,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.warehouse}
          <div className="text-xs font-mono text-muted-foreground/70">{row.location}</div>
        </div>
      ),
    },
    {
      id: "free",
      header: "Free / On hand",
      sortable: true,
      align: "right",
      accessorFn: (row) => row.free,
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
          <span className={cn("font-mono font-bold text-sm tabular-nums", row.shortage ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
            {row.free}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">of {row.onHand} on hand</span>
        </div>
      ),
    },
    {
      id: "rule",
      header: "Min / Max",
      align: "right",
      accessorFn: (row) => row.min,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.min} / {row.max}
        </span>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      id: "need",
      header: "To order",
      sortable: true,
      align: "right",
      accessorFn: (row) => row.need,
      cell: ({ row }) =>
        row.need > 0 ? (
          <span className="font-mono font-bold text-sm tabular-nums text-foreground">{row.need}</span>
        ) : (
          <span className="text-sm text-muted-foreground/60">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      accessorFn: (row) => statusOf(row).label,
      cell: ({ row }) => {
        const s = statusOf(row);
        const live = orderpointState(row.id);
        return (
          <div className="flex flex-col items-start gap-1">
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", s.className)}>{s.label}</span>
            {s.key === "ordered" && live.procurementRef && (
              <span className="text-[10px] font-mono text-muted-foreground">{live.procurementRef}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "170px",
      accessorFn: (row) => row.id,
      cell: ({ row }) => {
        const s = statusOf(row);
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {s.key === "ordered" ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 text-muted-foreground"
                onClick={() => cancel(row)}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Cancel
              </Button>
            ) : s.key === "triggered" ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all"
                onClick={() => order(row)}
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Order
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground/60 italic">Stock OK</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Replenishment</h1>
          <p className="text-sm text-muted-foreground">
            Min / max reorder rules. Run the scheduler to auto-generate procurements for anything short.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={runScheduler}>
            <Play className="mr-2 h-4 w-4" /> Run Scheduler
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <KpiGrid columns={4}>
        <KpiCard title="Reorder Rules" value={String(stats.rules)} icon={ListChecks} tone="blue" tooltip="Tracked min/max order points" />
        <KpiCard title="Triggered" value={String(stats.triggered)} icon={TriangleAlert} tone="amber" badge={stats.triggered > 0 ? "ACTION" : undefined} tooltip="Short stock with no procurement yet" />
        <KpiCard title="In Replenishment" value={String(stats.scheduled)} icon={ShoppingCart} tone="cyan" tooltip="Procurements generated by the scheduler" />
        <KpiCard title="Units To Order" value={String(stats.unitsToOrder)} icon={Boxes} tone="violet" tooltip="Total units still needed across rules" />
      </KpiGrid>

      <CentralTable
        data={rules}
        columns={COLUMNS}
        keyExtractor={(r) => r.id}
        searchable
        searchPlaceholder="Search product or SKU..."
        title="Order Points"
        description={`${rules.length} rules · ${stats.triggered} triggered`}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />
    </>
  );
}
