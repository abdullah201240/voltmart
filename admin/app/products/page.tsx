"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { ProductFormDrawer } from "@/components/product-form-drawer";
import { useAdminLayout } from "@/components/admin-shell";
import {
  Boxes,
  CheckCircle2,
  TriangleAlert,
  CircleOff,
  Plus,
  Download,
  RotateCcw,
  Barcode,
} from "lucide-react";
import {
  getProducts,
  catalogStats,
  availabilityOf,
  CHANNEL_OPTIONS,
  CATEGORY_OPTIONS,
  AVAILABILITY_OPTIONS,
  type ProductRow,
  type Availability,
} from "@/lib/data/products";

/** Availability -> badge label + styling (shared by KPI + table cell). */
const AVAILABILITY_META: Record<
  Availability,
  { label: string; className: string }
> = {
  in_stock: { label: "In Stock", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  low_stock: { label: "Low Stock", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  out_of_stock: { label: "Out of Stock", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
};

const STATUS_META: Record<ProductRow["status"], "default" | "secondary" | "outline"> = {
  Active: "default",
  Draft: "secondary",
  Archived: "outline",
};

const PRODUCT_COLUMNS: CentralTableColumn<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          href={`/products/${row.id}`}
          className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors block"
        >
          {row.name}
        </Link>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.sku}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    sortable: true,
    cell: ({ value }) => (
      <span className="text-sm text-muted-foreground font-medium">{value}</span>
    ),
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ value }) =>
      value ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Barcode className="h-3.5 w-3.5" />
          {value}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground/60 italic">Not set</span>
      ),
  },
  {
    accessorKey: "variants",
    header: "Variants",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant="outline" className="text-xs font-semibold tabular-nums">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "priceValue",
    header: "Price",
    sortable: true,
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-sm text-foreground">{row.price}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    sortable: true,
    align: "right",
    cell: ({ row }) => {
      const meta = AVAILABILITY_META[availabilityOf(row)];
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono font-bold text-sm text-foreground tabular-nums">
            {row.stock}
          </span>
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", meta.className)}>
            {meta.label}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={STATUS_META[value as ProductRow["status"]]} className="text-xs font-semibold px-3 py-1">
        {value}
      </Badge>
    ),
  },
];

export default function ProductsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getProducts().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const stats = useMemo(() => catalogStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((p) => {
      const matchesChannel = selectedChannel === "all" || p.channelKey === selectedChannel;
      const matchesCategory = selectedCategory === "all" || p.categoryKey === selectedCategory;
      const matchesAvail =
        selectedAvailability === "all" || availabilityOf(p) === selectedAvailability;
      const matchesQuery =
        !effectiveQuery ||
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.sku.toLowerCase().includes(effectiveQuery) ||
        p.barcode.toLowerCase().includes(effectiveQuery);
      return matchesChannel && matchesCategory && matchesAvail && matchesQuery;
    });
  }, [rows, selectedChannel, selectedCategory, selectedAvailability, effectiveQuery]);

  const clearFilters = () => {
    setSelectedChannel("all");
    setSelectedCategory("all");
    setSelectedAvailability("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (selectedChannel !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedAvailability !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your catalog — variants, SKUs, barcodes, pricing and stock across channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-5 text-sm font-medium">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setIsProductDrawerOpen(true)}
            className="h-11 px-5 text-sm font-medium cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Catalog KPIs */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Total Products"
          value={String(stats.total)}
          icon={Boxes}
          tone="blue"
          tooltip="Product templates in the catalog"
          footer={`${stats.variants} total variants across all products`}
        />
        <KpiCard
          title="Published"
          value={String(stats.active)}
          icon={CheckCircle2}
          tone="emerald"
          badge="LIVE"
          tooltip="Active products visible to buyers"
          footer={`${stats.total - stats.active} in draft or archived`}
        />
        <KpiCard
          title="Low Stock"
          value={String(stats.low)}
          icon={TriangleAlert}
          tone="amber"
          badge="ALERT"
          tooltip="At or below their reorder point"
          footer="Replenish soon to avoid stockouts"
        />
        <KpiCard
          title="Out of Stock"
          value={String(stats.out)}
          icon={CircleOff}
          tone="rose"
          tooltip="No units on hand across all locations"
          footer={`${stats.noBarcode} product(s) missing a barcode`}
        />
      </KpiGrid>

      {/* Products Table with integrated filters */}
      <CentralTable
        data={filteredRows}
        columns={PRODUCT_COLUMNS}
        loading={loading}
        loadingRows={6}
        selectable
        searchable
        searchPlaceholder="Search name, SKU or barcode..."
        title="Catalog"
        description={`${filteredRows.length} of ${rows.length} products`}
        filters={
          <div className="grid gap-5 sm:grid-cols-3 w-full">
            <SearchableDropbox
              label="Sales Channel"
              options={CHANNEL_OPTIONS as DropboxOption[]}
              value={selectedChannel}
              onChange={setSelectedChannel}
              placeholder="All channels..."
              searchPlaceholder="Search channel..."
            />
            <SearchableDropbox
              label="Category"
              options={CATEGORY_OPTIONS as DropboxOption[]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All categories..."
              searchPlaceholder="Search category..."
            />
            <SearchableDropbox
              label="Availability"
              options={AVAILABILITY_OPTIONS as DropboxOption[]}
              value={selectedAvailability}
              onChange={setSelectedAvailability}
              placeholder="Any availability..."
              searchPlaceholder="Search availability..."
            />
          </div>
        }
        activeFiltersCount={activeFiltersCount}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        selectedActions={(selectedRows, clearSelection) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold cursor-pointer"
              onClick={() => {
                alert(`Updating ${selectedRows.length} product(s)`);
                clearSelection();
              }}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold cursor-pointer"
              onClick={() => {
                alert(`Archiving ${selectedRows.length} product(s)`);
                clearSelection();
              }}
            >
              Archive
            </Button>
          </div>
        )}
        emptyAction={
          hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="cursor-pointer text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Filters
            </Button>
          )
        }
      />

      <ProductFormDrawer
        open={isProductDrawerOpen}
        onOpenChange={setIsProductDrawerOpen}
      />
    </>
  );
}
