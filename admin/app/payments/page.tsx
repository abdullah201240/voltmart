"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { ArrowDownLeft, ArrowUpRight, Landmark, Clock, RotateCcw, Plus } from "lucide-react";
import { getPayments, paymentStats, type PaymentRow } from "@/lib/data/finance";

const STATUS_CLASS: Record<PaymentRow["status"], "default" | "secondary" | "outline"> = {
  Reconciled: "default",
  Pending: "secondary",
  Failed: "outline",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PAYMENT_COLUMNS: CentralTableColumn<PaymentRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "partner",
    header: "Counterpart",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full shrink-0",
            row.direction === "Inbound" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          {row.direction === "Inbound" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
        </span>
        <span className="font-medium text-sm text-foreground truncate">{row.partner}</span>
      </div>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
    sortable: true,
    cell: ({ value }) => <Badge variant={value === "Inbound" ? "default" : "outline"} className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "method",
    header: "Method",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "reference",
    header: "Applied To",
    cell: ({ value }) => <span className="font-mono text-xs text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: ({ row }) => (
      <span className={cn("font-mono font-bold text-sm", row.direction === "Inbound" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
        {row.direction === "Inbound" ? "+" : "−"}
        {money(row.amount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => <Badge variant={STATUS_CLASS[value as PaymentRow["status"]]} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
  },
];

export default function PaymentsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getPayments().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => paymentStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (p) =>
        p.partner.toLowerCase().includes(effectiveQuery) ||
        p.reference.toLowerCase().includes(effectiveQuery) ||
        p.method.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Registered inbound and outbound payments reconciled against invoices and bills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/payments/new">
              <Plus className="mr-2 h-4 w-4" /> Register Payment
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Money In" value={money(stats.inbound)} icon={ArrowDownLeft} tone="emerald" tooltip="Total inbound payments" />
        <KpiCard title="Money Out" value={money(stats.outbound)} icon={ArrowUpRight} tone="rose" tooltip="Total outbound payments" />
        <KpiCard title="Pending" value={String(stats.pending)} icon={Clock} tone="amber" />
        <KpiCard title="Failed" value={String(stats.failed)} icon={Landmark} tone="violet" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={PAYMENT_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search partner, reference or method..."
        title="Payments"
        description={`${filteredRows.length} of ${rows.length} payments`}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          effectiveQuery.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSearchTableQuery("")} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Clear Search
            </Button>
          )
        }
      />
    </>
  );
}
