"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { CreateFlow } from "@/components/ui/create-flow";
import { useAdminLayout } from "@/components/admin-shell";
import { useOps } from "@/lib/data/ops";
import { RotateCcw, Inbox, SearchCheck, BadgeCheck } from "lucide-react";
import {
  getReturns,
  returnStats,
  RETURN_STATE_OPTIONS,
  RETURN_STATE_LABEL_META,
  type ReturnRow,
  type ReturnState,
} from "@/lib/data/returns";

const REASON_OPTIONS: DropboxOption[] = [
  { value: "Dead on Arrival", label: "Dead on Arrival" },
  { value: "Not as Described", label: "Not as Described" },
  { value: "Physical Damage", label: "Physical Damage" },
  { value: "Change of Mind", label: "Change of Mind" },
  { value: "Warranty Claim", label: "Warranty Claim" },
];

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const COLUMNS: CentralTableColumn<ReturnRow>[] = [
  {
    accessorKey: "id",
    header: "RMA",
    sortable: true,
    width: "120px",
    cell: ({ row, value }) => (
      <Link href={`/returns/${row.id}`} className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
        {value}
      </Link>
    ),
  },
  {
    accessorKey: "orderRef",
    header: "Order",
    sortable: true,
    cell: ({ row }) => (
      <Link href={`/orders/${row.orderRef}`} className="font-mono text-sm text-primary hover:underline">
        {row.orderRef}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.customer}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.product}</div>
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "state",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", RETURN_STATE_LABEL_META[value as ReturnState])}>
        {value}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Value",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value as number)}</span>,
  },
];

export default function ReturnsPage() {
  const { searchQuery } = useAdminLayout();
  useOps(); // re-render when the overlay advances a claim

  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getReturns().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => returnStats(rows), [rows]);
  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesState = stateFilter === "all" || r.state === stateFilter;
      const matchesQuery =
        !effectiveQuery ||
        r.id.toLowerCase().includes(effectiveQuery) ||
        r.customer.toLowerCase().includes(effectiveQuery) ||
        r.orderRef.toLowerCase().includes(effectiveQuery) ||
        r.product.toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, stateFilter, effectiveQuery]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Returns &amp; RMA</h1>
          <p className="text-sm text-muted-foreground">
            After-sales claims triage: log a return, bench-test the unit, then refund, replace or reject.
          </p>
        </div>
        <CreateFlow<ReturnRow>
          model="rma.return"
          buttonLabel="New Return"
          drawerTitle="Log a return / RMA claim"
          drawerDescription="Creates a claim in the Requested state, ready for inspection."
          fields={[
            { key: "orderRef", label: "Order Reference", required: true, placeholder: "ORD-7390" },
            { key: "customer", label: "Customer", required: true, placeholder: "Emma Brown" },
            { key: "product", label: "Product", required: true, placeholder: "Sony WH-1000XM5 Headphones" },
            { key: "sku", label: "SKU", placeholder: "AUD-XM5-BLK" },
            { key: "serial", label: "Serial / IMEI", placeholder: "IMEI-…" },
            { key: "reason", label: "Reason", type: "select", options: REASON_OPTIONS, required: true },
            { key: "amount", label: "Value at Risk (BDT)", type: "number", required: true, placeholder: "41990" },
          ]}
          validate={(v) => {
            if (!v.orderRef?.trim()) return "Order reference is required.";
            if (!v.customer?.trim()) return "Customer is required.";
            if (!v.product?.trim()) return "Product is required.";
            if (!v.amount || Number.isNaN(Number(v.amount))) return "Enter a valid amount.";
            return null;
          }}
          build={(v) => ({
            id: `RMA-${Date.now().toString().slice(-5)}`,
            orderRef: v.orderRef.trim(),
            customer: v.customer.trim(),
            product: v.product.trim(),
            sku: v.sku?.trim() || "—",
            serial: v.serial?.trim() || "—",
            reason: (v.reason as ReturnRow["reason"]) || "Dead on Arrival",
            state: "Requested",
            opened: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            amount: Number(v.amount),
          })}
          onCreated={(row) => setRows((prev) => [row, ...prev])}
          successMessage="Return logged"
        />
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Open Claims" value={String(stats.open)} icon={Inbox} tone="blue" badge={stats.pending > 0 ? `${stats.pending} NEW` : undefined} tooltip="Requested + in-inspection claims awaiting action." />
        <KpiCard title="In Inspection" value={String(stats.inspecting)} icon={SearchCheck} tone="amber" tooltip="Units currently on the service-lab bench." />
        <KpiCard title="Approved" value={String(stats.approved)} icon={BadgeCheck} tone="emerald" tooltip="Refund or replacement approved." />
        <KpiCard title="Value at Risk" value={money(stats.valueAtRisk)} icon={RotateCcw} tone="violet" tooltip="Total amount behind still-open claims." />
      </KpiGrid>

      <CentralTable
        data={filtered}
        columns={COLUMNS}
        loading={loading}
        loadingRows={4}
        keyExtractor={(r) => r.id}
        searchable
        searchPlaceholder="Search RMA, customer, order or product..."
        title="Return Claims"
        description={`${filtered.length} of ${rows.length} claims · ${stats.rejected} rejected`}
        filters={
          <div className="w-full sm:max-w-xs">
            <SearchableDropbox
              label="Status"
              options={RETURN_STATE_OPTIONS as DropboxOption[]}
              value={stateFilter}
              onChange={setStateFilter}
              placeholder="All states..."
              searchPlaceholder="Search status..."
            />
          </div>
        }
        activeFiltersCount={stateFilter !== "all" ? 1 : 0}
        onClearFilters={() => setStateFilter("all")}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
