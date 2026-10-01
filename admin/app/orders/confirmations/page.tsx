"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  User,
  RotateCcw,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { getOrders, type OrderRow } from "@/lib/data/orders";

export default function OrderConfirmationsPage() {
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

  // Filter only pending / quotation orders that need phone verification
  const pendingOrders = useMemo(
    () => rows.filter((r) => r.status === "Quotation"),
    [rows]
  );

  const stats = useMemo(
    () => ({
      pendingCount: pendingOrders.length,
      pendingValue: pendingOrders.reduce((sum, r) => sum + r.totalValue, 0),
      confirmedCount: rows.filter((r) => r.status === "Confirmed").length,
    }),
    [pendingOrders, rows]
  );

  const columns: CentralTableColumn<OrderRow>[] = [
    {
      accessorKey: "id",
      header: "Order",
      sortable: true,
      width: "120px",
      cell: ({ row, value }) => (
        <Link
          href={`/orders/${row.id}/confirm`}
          className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors"
        >
          {value}
        </Link>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer & Contact",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.customer}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{row.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Order Date",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      align: "center",
      cell: ({ value }) => (
        <Badge variant="outline" className="text-xs font-semibold tabular-nums">
          {value} items
        </Badge>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "COD Amount",
      sortable: true,
      align: "right",
      cell: ({ row }) => <span className="font-mono font-bold text-sm text-primary">{row.total}</span>,
    },
    {
      id: "trust",
      header: "Courier Risk",
      align: "center",
      cell: () => (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
          98% Verified
        </Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      align: "right",
      cell: ({ row }) => (
        <Button
          asChild
          size="sm"
          className="h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-2xs"
        >
          <Link href={`/orders/${row.id}/confirm`}>
            <Phone className="h-3.5 w-3.5" /> Verify &amp; Confirm
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Order Phone Verification Queue</h1>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
              Stage 1: Pending Call
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Call customers to verify Cash on Delivery intent and address details before releasing items to warehouse picking.
          </p>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard
          title="Awaiting Phone Call"
          value={String(stats.pendingCount)}
          icon={PhoneCall}
          tone="amber"
          tooltip="New orders requiring customer confirmation"
        />
        <KpiCard
          title="Pending COD Value"
          value={`৳${stats.pendingValue.toLocaleString("en-IN")}`}
          icon={ShieldCheck}
          tone="blue"
          tooltip="Total potential revenue awaiting customer verification"
        />
        <KpiCard
          title="Confirmed & Ready to Pack"
          value={String(stats.confirmedCount)}
          icon={CheckCircle2}
          tone="emerald"
          tooltip="Orders confirmed and currently in warehouse packing"
        />
      </KpiGrid>

      <CentralTable
        data={pendingOrders}
        columns={columns}
        loading={loading}
        loadingRows={4}
        searchable
        searchPlaceholder="Search customer or order ID..."
        title="Pending Orders Awaiting Verification"
        description={`${pendingOrders.length} order(s) awaiting call verification`}
        pagination={false}
      />
    </div>
  );
}
