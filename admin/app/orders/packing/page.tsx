"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  PackageCheck,
  Barcode,
  Boxes,
  Clock,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { getOrders, type OrderRow } from "@/lib/data/orders";

export default function OrderPackingQueuePage() {
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

  // Filter orders that are confirmed and need warehouse packing
  const ordersToPack = useMemo(
    () =>
      rows.filter(
        (r) =>
          r.status === "Confirmed" &&
          (r.deliveryStage === "Confirmed" ||
            r.deliveryStage === "Packing" ||
            !r.deliveryStage)
      ),
    [rows]
  );

  const stats = useMemo(
    () => ({
      pendingPacking: ordersToPack.length,
      alreadyPacked: rows.filter((r) => r.deliveryStage === "Packed").length,
      inTransit: rows.filter(
        (r) =>
          r.deliveryStage === "Handed to Courier" ||
          r.deliveryStage === "In Transit" ||
          r.deliveryStage === "Out for Delivery"
      ).length,
    }),
    [ordersToPack, rows]
  );

  const columns: CentralTableColumn<OrderRow>[] = [
    {
      accessorKey: "id",
      header: "Order",
      sortable: true,
      width: "120px",
      cell: ({ row, value }) => (
        <Link
          href={`/orders/${row.id}/pack`}
          className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors"
        >
          {value}
        </Link>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer & Destination",
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-foreground">{row.customer}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>
              {row.deliveryZone === "dhaka-inside"
                ? "Inside Dhaka Metro (24h Express)"
                : "Outside Dhaka / Suburbs (48h Standard)"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "itemCount",
      header: "SKUs / Items",
      sortable: true,
      width: "140px",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-muted/80 flex items-center justify-center text-xs font-bold text-foreground">
            {row.lines?.reduce((s: number, l) => s + l.quantity, 0) || row.itemCount || 1}
          </div>
          <span className="text-xs text-muted-foreground">items to pack</span>
        </div>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Order Value",
      sortable: true,
      width: "130px",
      cell: ({ row }) => (
        <div className="font-mono font-bold text-sm text-foreground">
          ৳{row.totalValue.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "deliveryStage",
      header: "Fulfillment Stage",
      sortable: true,
      width: "160px",
      cell: ({ row }) => {
        const stage = row.deliveryStage || "Confirmed";
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium text-xs px-2.5 py-1"
          >
            <Clock className="w-3 h-3 mr-1 text-amber-500" />
            {stage === "Packing" ? "In Packing" : "Ready for Packing"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Station Action",
      width: "180px",
      cell: ({ row }) => (
        <Button
          size="sm"
          className="h-9 px-3 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 cursor-pointer"
          asChild
        >
          <Link href={`/orders/${row.id}/pack`}>
            <Barcode className="w-4 h-4" />
            <span>Open Pack Station</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </Button>
      ),
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
              Warehouse Step 2
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Boxes className="w-8 h-8 text-primary" />
            Packing & Barcode Scan Station
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active warehouse queue for verified orders. Scan product barcodes, verify items, record scale weights, and print 4x6&quot; courier labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 cursor-pointer" asChild>
            <Link href="/orders/confirmations">
              <Clock className="w-4 h-4 mr-1.5 text-muted-foreground" />
              Phone Queue ({stats.pendingPacking})
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="h-9 cursor-pointer" asChild>
            <Link href="/orders/dispatch">
              <PackageCheck className="w-4 h-4 mr-1.5 text-primary" />
              Courier Dispatch ({stats.alreadyPacked})
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiGrid columns={3}>
        <KpiCard
          title="Orders Awaiting Packing"
          value={stats.pendingPacking.toString()}
          icon={Boxes}
          tone="amber"
          trend="up"
          change="Ready in warehouse"
        />
        <KpiCard
          title="Packed & Ready for Courier"
          value={stats.alreadyPacked.toString()}
          icon={PackageCheck}
          tone="emerald"
          trend="up"
          change="Ready for 3PL handover"
        />
        <KpiCard
          title="In Transit / Courier"
          value={stats.inTransit.toString()}
          icon={Sparkles}
          tone="blue"
          trend="up"
          change="Active with Pathao / Steadfast"
        />
      </KpiGrid>

      {/* Operational Information Card */}
      <Card className="p-4 border border-border/80 bg-muted/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Barcode className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Warehouse Barcode Verification Active
            </div>
            <div className="text-xs text-muted-foreground">
              Select any order to launch its dedicated full-screen scanning terminal with audio beeps and thermal label printing.
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono bg-card px-3 py-1.5 rounded border border-border/80">
          Hardware: USB Barcode Scanner & Thermal 4x6&quot; Ready
        </div>
      </Card>

      {/* Orders Table */}
      <CentralTable<OrderRow>
        data={ordersToPack}
        columns={columns}
        loading={loading}
        title="Warehouse Packing Queue"
        searchable={true}
        searchPlaceholder="Filter by order number, customer name, destination..."
        emptyTitle="Packing Queue is Clear"
        emptyMessage="All confirmed customer orders have been successfully picked, scanned, and packed."
      />
    </div>
  );
}
