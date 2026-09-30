"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Boxes, Layers, Banknote, TriangleAlert, ArrowDownToLine, RotateCcw } from "lucide-react";
import {
  getStock,
  stockStats,
  WAREHOUSE_OPTIONS,
  type StockRow,
} from "@/lib/data/inventory";

function availability(row: StockRow) {
  if (row.onHand <= 0) return { label: "Out of Stock", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
  if (row.onHand <= row.reorderPoint) return { label: "Low", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  return { label: "OK", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
}

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const STOCK_COLUMNS: CentralTableColumn<StockRow>[] = [
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
    accessorKey: "location",
    header: "Location",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground font-mono">{value}</span>,
  },
  {
    accessorKey: "warehouse",
    header: "Warehouse",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "onHand",
    header: "On Hand",
    sortable: true,
    align: "right",
    cell: ({ value, row }) => (
      <div className="flex flex-col items-end gap-1">
        <span className="font-mono font-bold text-sm text-foreground tabular-nums">
          {value} {row.unit}
        </span>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", availability(row).className)}>
          {availability(row).label}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "reserved",
    header: "Reserved",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "onHand",
    id: "available",
    header: "Available",
    align: "right",
    accessorFn: (row) => row.onHand - row.reserved,
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-foreground font-semibold">{row.onHand - row.reserved}</span>
    ),
  },
];

export default function InventoryPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getStock().then((d) => {
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
  const stats = useMemo(() => stockStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((s) => {
      const matchesWh =
        selectedWarehouse === "all" ||
        (selectedWarehouse === "wh-main" && s.warehouse.includes("Main")) ||
        (selectedWarehouse === "wh-ctg" && s.warehouse.includes("Chattogram"));
      const matchesQuery =
        !effectiveQuery ||
        s.product.toLowerCase().includes(effectiveQuery) ||
        s.sku.toLowerCase().includes(effectiveQuery);
      return matchesWh && matchesQuery;
    });
  }, [rows, selectedWarehouse, effectiveQuery]);

  const clearFilters = () => {
    setSelectedWarehouse("all");
    setSearchTableQuery("");
  };

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            On-hand quantities per product and location — the source of truth for stock.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/inventory/replenishment">
              <Boxes className="mr-2 h-4 w-4" />
              Replenishment
            </Link>
          </Button>
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/inventory/receipts">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Receive Stock
            </Link>
          </Button>
        </div>
      </div>

      {/* Stock KPIs */}
      <KpiGrid columns={4}>
        <KpiCard title="Tracked SKUs" value={String(stats.skus)} icon={Boxes} tone="blue" tooltip="Product/location stock lines" />
        <KpiCard title="Total Units" value={String(stats.totalUnits)} icon={Layers} tone="indigo" tooltip="Sum of on-hand units" />
        <KpiCard title="Stock Value" value={money(stats.value)} icon={Banknote} tone="emerald" tooltip="Inventory valuation at cost" />
        <KpiCard title="Low / Out of Stock" value={`${stats.low} / ${stats.out}`} icon={TriangleAlert} tone="amber" badge="ALERT" tooltip="At/below reorder point / zero on hand" />
      </KpiGrid>

      {/* Stock table */}
      <CentralTable
        data={filteredRows}
        columns={STOCK_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search product or SKU..."
        title="Stock on Hand"
        description={`${filteredRows.length} of ${rows.length} locations`}
        filters={
          <div className="grid gap-5 sm:grid-cols-3 w-full">
            <SearchableDropbox
              label="Warehouse"
              options={WAREHOUSE_OPTIONS as DropboxOption[]}
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              placeholder="All warehouses..."
              searchPlaceholder="Search warehouse..."
            />
          </div>
        }
        activeFiltersCount={selectedWarehouse !== "all" ? 1 : 0}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          (selectedWarehouse !== "all" || effectiveQuery.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )
        }
      />
    </>
  );
}
