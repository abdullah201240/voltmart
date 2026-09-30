"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";

export interface WarehouseTilesProps {
  onDrillDown?: (filter: { status?: string; query?: string; tab?: string }) => void;
  onRequestRestock?: (productName: string) => void;
}

export function WarehouseTiles({ onDrillDown, onRequestRestock }: WarehouseTilesProps) {
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
            Interactive action tiles for inbound receipts, packing queues, courier dispatch, and COD float.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
              Full Inventory
            </Button>
          </Link>
          <Link href="/shipping/rates">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Truck className="h-3.5 w-3.5 text-muted-foreground" />
              Courier SLA
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Odoo-Style Operational Kanban Tiles in a Responsive Panoramic Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {/* TILE 1: Inbound Receipts */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Inbound Receipts
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  18 Shipments
                </div>
                <div className="text-xs text-muted-foreground">
                  Supplier purchase orders & dock arrivals
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "receipt" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-foreground border border-border/70 active:scale-[0.98] transition-all"
              >
                12 On Schedule
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "customs" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 active:scale-[0.98] transition-all"
              >
                4 In Customs
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "late" })}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 active:scale-[0.98] transition-all animate-pulse"
              >
                <AlertTriangle className="h-3 w-3" />
                2 LATE
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Supplier dock bay 3</span>
            <Link href="/purchases/orders">
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
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Packing Queue
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  34 Orders Ready
                </div>
                <div className="text-xs text-muted-foreground">
                  Picked items at warehouse packaging bench
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ status: "Confirmed" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-[0.98] transition-all"
              >
                26 Standard Pack
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "express" })}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 active:scale-[0.98] transition-all flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                8 Express Dhaka
              </button>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted/40 text-muted-foreground border border-border/60">
                0 Backorders
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Packing station 1 & 2</span>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Print Labels <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 3: Courier Dispatch */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Courier Dispatch
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  68 Parcels Handled
                </div>
                <div className="text-xs text-muted-foreground">
                  Pathao, Steadfast & RedX courier network
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ status: "Fulfilled" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 active:scale-[0.98] transition-all"
              >
                42 In Transit
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "delivery" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-foreground border border-border/70 active:scale-[0.98] transition-all"
              >
                18 Out for Delivery
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "pickup" })}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 active:scale-[0.98] transition-all"
              >
                8 Pickup Pending
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Rider pickup at 4:30 PM</span>
            <Link href="/shipping/methods">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Track Manifests <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 4: Customer Returns & RMA */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Returns & RMA Triage
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  6 Return Requests
                </div>
                <div className="text-xs text-muted-foreground">
                  Customer returns, replacements & diagnostics
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "testing" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 active:scale-[0.98] transition-all"
              >
                3 In Lab Testing
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "approved" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-[0.98] transition-all"
              >
                2 Approved Refund
              </button>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted/40 text-muted-foreground border border-border/60">
                1 Rejected
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Service Lab Dhanmondi</span>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Inspect Items <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 5: COD Cash Remittance */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  COD Cash Remittance
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  ৳4,38,500 Float
                </div>
                <div className="text-xs text-muted-foreground">
                  Cash collected by riders pending bank deposit
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Banknote className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "reconciled" })}
                className="cursor-pointer text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:scale-[0.98] transition-all"
              >
                ৳3,12,000 Reconciled
              </button>
              <button
                type="button"
                onClick={() => onDrillDown?.({ query: "overdue" })}
                className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 active:scale-[0.98] transition-all"
              >
                ৳1,26,500 Overdue
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Pathao: ৳84k | Steadfast: ৳42k</span>
            <Link href="/accounting/reconciliation">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Reconcile <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* TILE 6: Serial Number & IMEI Audit */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Serial & IMEI Compliance
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  12 Scans Pending
                </div>
                <div className="text-xs text-muted-foreground">
                  Smart devices requiring physical barcode validation
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Barcode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            {/* Operational Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                12 High-Value Items
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                0 Discrepancies
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                BTRC Approved
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Barcode engine ready</span>
            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Scan Serial <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Safety Stock Alerts Tray */}
      <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-foreground">Critical Reorder Thresholds</h3>
            <p className="text-xs text-muted-foreground">
              SKUs reaching safety stock limits requiring supplier purchase replenishment.
            </p>
          </div>
          <Link href="/inventory/replenishment">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all">
              View All Replenishments
            </Button>
          </Link>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border/80 p-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Wireless Active ANC Headphones Pro</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                  3 units left · Reorder threshold: 10
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all shrink-0"
              onClick={() => onRequestRestock?.("Wireless Active ANC Headphones Pro")}
            >
              Restock
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/80 p-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">USB-C GaN Fast Charger 100W Hub</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                  5 units left · Reorder threshold: 15
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all shrink-0"
              onClick={() => onRequestRestock?.("USB-C GaN Fast Charger 100W Hub")}
            >
              Restock
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
