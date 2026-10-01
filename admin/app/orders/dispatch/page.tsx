"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  Truck,
  PackageCheck,
  Send,
  Printer,
  FileSpreadsheet,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Weight,
  ExternalLink,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { getOrders, type OrderRow } from "@/lib/data/orders";

export default function OrderDispatchQueuePage() {
  const version = useOps();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getOrders().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  // Filter orders that are packed or recently dispatched
  const dispatchRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.deliveryStage === "Packed" ||
          r.deliveryStage === "Handed to Courier" ||
          r.deliveryStage === "In Transit"
      ),
    [rows]
  );

  const readyForHandover = useMemo(
    () => rows.filter((r) => r.deliveryStage === "Packed"),
    [rows]
  );

  const stats = useMemo(
    () => ({
      readyCount: readyForHandover.length,
      totalWeight: readyForHandover.reduce((acc, r) => acc + (r.packageWeightKg || 0.6), 0),
      codToCollect: readyForHandover.reduce((acc, r) => acc + (r.codAmount ?? r.totalValue), 0),
      handedOverToday: rows.filter((r) => r.deliveryStage === "Handed to Courier").length,
    }),
    [readyForHandover, rows]
  );

  const columns: CentralTableColumn<OrderRow>[] = [
    {
      accessorKey: "id",
      header: "Order",
      sortable: true,
      width: "120px",
      cell: ({ row, value }) => (
        <Link
          href={`/orders/${row.id}/dispatch`}
          className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors"
        >
          {value}
        </Link>
      ),
    },
    {
      accessorKey: "customer",
      header: "Recipient & Area",
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-foreground">{row.customer}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>
              {row.deliveryZone === "dhaka-inside"
                ? "Dhaka Metro Hub"
                : "Outside Dhaka Division"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "courierPartner",
      header: "3PL Partner",
      sortable: true,
      width: "140px",
      cell: ({ row }) => {
        const courier = row.courierPartner || "Pathao Logistics";
        return (
          <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
            <Truck className="w-3.5 h-3.5 text-primary" />
            <span>{courier}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "packageWeightKg",
      header: "Weight & COD",
      sortable: true,
      width: "150px",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-mono font-semibold text-xs text-foreground flex items-center gap-1">
            <Weight className="w-3 h-3 text-muted-foreground" />
            <span>{row.packageWeightKg || 0.6} kg</span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            COD: ৳{(row.codAmount ?? row.totalValue).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "consignmentId",
      header: "Consignment ID",
      sortable: true,
      width: "160px",
      cell: ({ row }) =>
        row.consignmentId ? (
          <Badge
            variant="outline"
            className="font-mono text-xs bg-muted/60 text-foreground border-border"
          >
            {row.consignmentId}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">Ready to generate</span>
        ),
    },
    {
      accessorKey: "deliveryStage",
      header: "Status",
      sortable: true,
      width: "150px",
      cell: ({ row }) => {
        const stage = row.deliveryStage || "Packed";
        const isPacked = stage === "Packed";
        return (
          <Badge
            variant="outline"
            className={`font-medium text-xs px-2.5 py-1 ${
              isPacked
                ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isPacked ? "Awaiting Courier Pickup" : stage}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Dispatch Action",
      width: "190px",
      cell: ({ row }) => {
        const isPacked = row.deliveryStage === "Packed";
        return isPacked ? (
          <Button
            size="sm"
            className="h-9 px-3 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 cursor-pointer"
            asChild
          >
            <Link href={`/orders/${row.id}/dispatch`}>
              <Send className="w-3.5 h-3.5" />
              <span>Shift to Courier</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 cursor-pointer"
            asChild
          >
            <Link href={`/orders/${row.id}/delivery`}>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Track Live Delivery</span>
            </Link>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Order Fulfillment Hub
            </span>
            <span className="text-muted-foreground/40">•</span>
            <Badge variant="outline" className="text-xs bg-muted/60">
              Courier Handover Step 3
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" />
            3PL Courier Dispatch & Handover
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hand over packed parcels to Pathao, Steadfast, and RedX riders. Generate official courier manifest handover sheets and track consignment IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 cursor-pointer"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-1.5 text-muted-foreground" />
            Print Daily Dispatch Sheet
          </Button>
          <Button variant="outline" size="sm" className="h-9 cursor-pointer" asChild>
            <Link href="/orders/packing">
              <PackageCheck className="w-4 h-4 mr-1.5 text-amber-500" />
              Packing Station
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Parcels Ready for Pickup"
          value={stats.readyCount.toString()}
          icon={PackageCheck}
          tone="violet"
          trend="up"
          change="Awaiting rider arrival"
        />
        <KpiCard
          title="Total Weight to Handover"
          value={`${stats.totalWeight.toFixed(1)} kg`}
          icon={Weight}
          tone="cyan"
          trend="up"
          change="Gross parcel weight"
        />
        <KpiCard
          title="Pending COD to Collect"
          value={`৳${stats.codToCollect.toLocaleString()}`}
          icon={ShieldCheck}
          tone="amber"
          trend="up"
          change="Receivable upon delivery"
        />
        <KpiCard
          title="Handed to Riders Today"
          value={stats.handedOverToday.toString()}
          icon={Truck}
          tone="emerald"
          trend="up"
          change="Consignments active"
        />
      </KpiGrid>

      {/* Courier Integration Notice */}
      <Card className="p-4 border border-border/80 bg-muted/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Official 3PL Courier API Integration (Pathao & Steadfast)
            </div>
            <div className="text-xs text-muted-foreground">
              Click &quot;Shift to Courier&quot; on any packed order to book consignment, assign rider pickup, and generate the official handover signature manifest.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
            Pathao API Connected
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
            Steadfast API Connected
          </Badge>
        </div>
      </Card>

      {/* Orders Table */}
      <CentralTable<OrderRow>
        data={dispatchRows.length > 0 ? dispatchRows : rows}
        columns={columns}
        loading={loading}
        title="Courier Handover Queue"
        searchable={true}
        searchPlaceholder="Filter by order number, consignment ID, customer, courier..."
        emptyTitle="No Parcels Awaiting Handover"
        emptyMessage="All packed parcels have been handed over to courier riders."
      />
    </div>
  );
}
