"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownLeft,
  Boxes,
  Truck,
  RotateCcw,
  Banknote,
  Barcode,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatBDT, type DashboardSnapshot } from "@/lib/data/dashboard";
import { getReplenishRules } from "@/lib/data/inventory";

interface ReturnStatsView {
  total: number;
  pending: number;
  inspecting: number;
  approved: number;
  rejected: number;
  open: number;
  valueAtRisk: number;
}

interface SerialStatsView {
  total: number;
  inStock: number;
  reserved: number;
  delivered: number;
  returned: number;
  inRepair: number;
  pendingAudit: number;
}

export interface WarehouseTilesProps {
  snapshot: DashboardSnapshot;
  returnStats: ReturnStatsView;
  serialStats: SerialStatsView;
  onDrillDown?: (filter: { status?: string; payment?: string; tab?: string }) => void;
  onRequestRestock?: (productName: string) => void;
}

export function WarehouseTiles({ snapshot, returnStats, serialStats, onDrillDown, onRequestRestock }: WarehouseTilesProps) {
  const q = snapshot.queues;
  // Real reorder pressure derived from the on-hand table.
  const triggered = useMemo(
    () => getReplenishRules().filter((r) => r.shortage && r.need > 0).slice(0, 4),
    []
  );

  return (
    <div className="w-full space-y-6">
      {/* Header bar for Operational Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Warehouse & Fulfillment Operations
            </span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary bg-primary/5">
              Live Pipeline
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Action tiles read live transfer, order, after-sales and stock records — click a badge to drill the order table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
              Full Inventory
            </Button>
          </Link>
          <Link href="/shipping/methods">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              Shipping Methods
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Kanban Tiles in a Responsive Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {/* TILE 1: Inbound Receipts */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inbound Receipts</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{q.inboundToProcess + q.inboundWaiting} Transfers</div>
                <div className="text-xs text-muted-foreground">Supplier purchase receipts awaiting the dock</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted/50 text-foreground border border-border/70">
                {q.inboundToProcess} Ready
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {q.inboundWaiting} Waiting
              </span>
              {q.inboundLate > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {q.inboundLate} Late
                </span>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Receipts board</span>
            <Link href="/inventory/receipts">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Receive Stock <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 2: Order Packing Queue */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Packing Queue</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{snapshot.ordersToFulfill} Orders to Fulfill</div>
                <div className="text-xs text-muted-foreground">Outgoing deliveries ready or awaiting pick</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ status: "Confirmed" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-[0.98] transition-all"
              >
                {q.packingReady} Ready to Ship
              </button>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {q.dispatchReady} Awaiting Reservation
              </span>
              {snapshot.ordersOverdue > 0 && (
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {snapshot.ordersOverdue} Overdue
                </span>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Delivery operations</span>
            <Link href="/inventory/deliveries">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Open Deliveries <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 3: Courier Dispatch */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Courier Dispatch</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{q.dispatchInTransit} Validated</div>
                <div className="text-xs text-muted-foreground">Outgoing transfers handed to the courier</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ status: "Fulfilled" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 active:scale-[0.98] transition-all"
              >
                {q.dispatchInTransit} Shipped
              </button>
              {q.dispatchLate > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  {q.dispatchLate} Past Scheduled
                </span>
              )}
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted/40 text-muted-foreground border border-border/60">
                {q.internalOpen} Internal Open
              </span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Transfers & internal moves</span>
            <Link href="/inventory/transfers">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Transfers <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 4: Customer Returns & RMA */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Returns & RMA Triage</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{returnStats.open} Open Claims</div>
                <div className="text-xs text-muted-foreground">Customer returns, replacements & diagnostics</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {returnStats.inspecting} In Inspection
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {returnStats.approved} Approved
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted/40 text-muted-foreground border border-border/60">
                {returnStats.rejected} Rejected
              </span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{formatBDT(returnStats.valueAtRisk)} at risk</span>
            <Link href="/returns">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Open RMA Desk <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 5: COD Cash Remittance */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COD Cash Remittance</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{formatBDT(snapshot.codFloat)}</div>
                <div className="text-xs text-muted-foreground">Cash collected via COD pending bank deposit</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Banknote className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ tab: "finance" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-[0.98] transition-all"
              >
                {formatBDT(snapshot.paymentsToSettle)} Outstanding
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ payment: "Pending" })}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 active:scale-[0.98] transition-all"
              >
                {snapshot.paymentsPendingCount} Pending
              </button>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Payment reconciliation</span>
            <Link href="/accounting/reconciliation">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Reconcile <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 6: Serial Number & IMEI Registry */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serial & IMEI Registry</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">{serialStats.pendingAudit} Units At Lab</div>
                <div className="text-xs text-muted-foreground">Returned / repaired devices needing validation</div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Barcode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {serialStats.total} Tracked Units
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {serialStats.inStock} In Stock
              </span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Warranty & RMA lookup</span>
            <Link href="/inventory/serials">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Serials <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Safety Stock Alerts Tray — driven by the live reorder rules */}
      <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-foreground">Critical Reorder Thresholds</h3>
            <p className="text-xs text-muted-foreground">
              SKUs at or below their reorder point, computed from current on-hand stock.
            </p>
          </div>
          <Link href="/inventory/replenishment">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all">
              View All Replenishments
            </Button>
          </Link>
        </div>

        {triggered.length === 0 ? (
          <div className="rounded-lg border border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            All SKUs are above their reorder point right now.
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2">
            {triggered.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border/80 p-4 bg-muted/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.product}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {r.onHand} on hand · reorder at {r.min} · order {r.need}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all shrink-0"
                  onClick={() => onRequestRestock?.(r.product)}
                >
                  Restock
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
