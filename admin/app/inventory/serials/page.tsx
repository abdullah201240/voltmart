"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { CreateFlow } from "@/components/ui/create-flow";
import { useAdminLayout } from "@/components/admin-shell";
import { useOps } from "@/lib/data/ops";
import { Barcode, Boxes, Truck, Wrench } from "lucide-react";
import {
  getSerials,
  serialStats,
  SERIAL_STATE_OPTIONS,
  SERIAL_STATE_LABEL_META,
  type SerialRow,
  type SerialState,
} from "@/lib/data/serials";

const KIND_OPTIONS: DropboxOption[] = [
  { value: "IMEI", label: "IMEI" },
  { value: "Serial", label: "Serial" },
];

const COLUMNS: CentralTableColumn<SerialRow>[] = [
  {
    accessorKey: "id",
    header: "Unit ID",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-mono font-bold text-sm text-foreground truncate">{row.id}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{row.kind}</div>
      </div>
    ),
  },
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
    accessorKey: "state",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", SERIAL_STATE_LABEL_META[value as SerialState])}>
        {value}
      </span>
    ),
  },
  {
    accessorKey: "holder",
    header: "Holder / Location",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "orderRef",
    header: "Order",
    cell: ({ row }) =>
      row.orderRef ? (
        <Link href={`/orders/${row.orderRef}`} className="font-mono text-sm text-primary hover:underline">
          {row.orderRef}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground/60">—</span>
      ),
  },
  {
    accessorKey: "warrantyEnd",
    header: "Warranty Ends",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
];

export default function SerialsPage() {
  const { searchQuery } = useAdminLayout();
  useOps();

  const [rows, setRows] = useState<SerialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getSerials().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => serialStats(rows), [rows]);
  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      const matchesState = stateFilter === "all" || s.state === stateFilter;
      const matchesQuery =
        !effectiveQuery ||
        s.id.toLowerCase().includes(effectiveQuery) ||
        s.product.toLowerCase().includes(effectiveQuery) ||
        s.sku.toLowerCase().includes(effectiveQuery) ||
        (s.orderRef ?? "").toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, stateFilter, effectiveQuery]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Serial &amp; IMEI Registry</h1>
          <p className="text-sm text-muted-foreground">
            Every high-value unit tracked by its physical serial / IMEI for warranty and RMA lookup.
          </p>
        </div>
        <CreateFlow<SerialRow>
          model="stock.serial"
          buttonLabel="Register Unit"
          drawerTitle="Register a serial / IMEI"
          drawerDescription="Capture a physical unit into the registry at pack time."
          fields={[
            { key: "id", label: "Serial / IMEI", required: true, placeholder: "IMEI-…", colSpan: 2 },
            { key: "kind", label: "Identifier Type", type: "select", options: KIND_OPTIONS, required: true },
            { key: "product", label: "Product", required: true, placeholder: "Galaxy S24 Ultra 512GB" },
            { key: "sku", label: "SKU", placeholder: "MOB-S24U-512" },
            { key: "holder", label: "Location / Holder", required: true, placeholder: "WH/Stock" },
            { key: "orderRef", label: "Order (optional)", placeholder: "ORD-7390" },
            { key: "warrantyEnd", label: "Warranty Ends", placeholder: "Sep 29, 2027" },
          ]}
          validate={(v) => {
            if (!v.id?.trim()) return "Serial / IMEI is required.";
            if (!v.product?.trim()) return "Product is required.";
            if (!v.holder?.trim()) return "Location / holder is required.";
            return null;
          }}
          build={(v) => ({
            id: v.id.trim(),
            kind: (v.kind as SerialRow["kind"]) || "Serial",
            product: v.product.trim(),
            sku: v.sku?.trim() || "—",
            state: "In Stock",
            holder: v.holder.trim(),
            orderRef: v.orderRef?.trim() || undefined,
            warrantyEnd: v.warrantyEnd?.trim() || "—",
            registered: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          })}
          onCreated={(row) => setRows((prev) => [row, ...prev])}
          successMessage="Unit registered"
        />
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Tracked Units" value={String(stats.total)} icon={Barcode} tone="indigo" tooltip="Total serial / IMEI records in the registry." />
        <KpiCard title="In Stock" value={String(stats.inStock)} icon={Boxes} tone="emerald" tooltip="Units physically available in a warehouse." />
        <KpiCard title="Delivered" value={String(stats.delivered)} icon={Truck} tone="violet" tooltip="Units shipped to customers." />
        <KpiCard title="Awaiting Audit" value={String(stats.pendingAudit)} icon={Wrench} tone="amber" badge={stats.pendingAudit > 0 ? "AT LAB" : undefined} tooltip="Returned or repaired units needing physical validation." />
      </KpiGrid>

      <CentralTable
        data={filtered}
        columns={COLUMNS}
        loading={loading}
        loadingRows={5}
        keyExtractor={(s) => s.id}
        searchable
        searchPlaceholder="Search serial / IMEI, product, SKU or order..."
        title="Registered Units"
        description={`${filtered.length} of ${rows.length} units · ${stats.inStock} in stock`}
        filters={
          <div className="w-full sm:max-w-xs">
            <SearchableDropbox
              label="Status"
              options={SERIAL_STATE_OPTIONS as DropboxOption[]}
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
