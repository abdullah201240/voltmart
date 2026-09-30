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
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { GraphView, PivotView } from "@/components/ui/graph-view";
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
  List,
  LayoutGrid,
  BarChart3,
  Table2,
  Check,
  Archive,
  ArchiveRestore,
  AlertTriangle,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { applyProductAction, type ProductAction } from "@/lib/data/workflows";
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
  const version = useOps();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [view, setView] = useState<"list" | "kanban" | "graph" | "pivot">("list");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

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
  }, [version]);

  // Auto-dismiss workflow notices.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(t);
  }, [feedback]);

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

  // --- Workflow actions (persist through the ops overlay) ---------------
  const act = (p: ProductRow, action: ProductAction) => {
    setFeedback(applyProductAction(p.id, p.name, action, { status: p.status }));
  };

  const bulkAct = (selected: ProductRow[], action: ProductAction, clear: () => void) => {
    let done = 0;
    let skipped = 0;
    for (const p of selected) {
      const res = applyProductAction(p.id, p.name, action, { status: p.status });
      if (res.ok) done += 1;
      else skipped += 1;
    }
    setFeedback({
      ok: done > 0,
      message: `${done} product(s) ${action === "archive" ? "archived" : action === "publish" ? "published" : action === "unarchive" ? "restored" : "unpublished"}${skipped ? ` · ${skipped} skipped` : ""}.`,
    });
    clear();
  };

  // Kanban drag between publication states.
  const moveStage = (row: ProductRow, toKey: string) => {
    const action: ProductAction | null =
      toKey === "Active" ? "publish"
        : toKey === "Draft" ? (row.status === "Archived" ? "unarchive" : "unpublish")
        : toKey === "Archived" ? "archive"
        : null;
    if (!action) {
      setFeedback({ ok: false, message: `Already in "${toKey}".` });
      return;
    }
    act(row, action);
  };

  const money = (v: number) =>
    "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // On-hand stock value by category for the Graph view.
  const graphData = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const p of filteredRows) {
      buckets.set(p.category, (buckets.get(p.category) ?? 0) + p.priceValue * p.stock);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [filteredRows]);

  // Table columns = the static catalog columns + a contextual actions column
  // that drives the product.template workflow.
  const COLUMNS: CentralTableColumn<ProductRow>[] = [
    ...PRODUCT_COLUMNS,
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "200px",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === "Draft" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "publish")}>
              <Check className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
          {row.status === "Active" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "unpublish")}>
              <RotateCcw className="h-3.5 w-3.5" /> Unpublish
            </Button>
          )}
          {row.status === "Archived" ? (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "unarchive")}>
              <ArchiveRestore className="h-3.5 w-3.5" /> Restore
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-xs font-semibold cursor-pointer text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => act(row, "archive")}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

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
        />
        <KpiCard
          title="Published"
          value={String(stats.active)}
          icon={CheckCircle2}
          tone="emerald"
          tooltip="Active products visible to buyers"
        />
        <KpiCard
          title="Low Stock"
          value={String(stats.low)}
          icon={TriangleAlert}
          tone="amber"
          tooltip="At or below their reorder point"
        />
        <KpiCard
          title="Out of Stock"
          value={String(stats.out)}
          icon={CircleOff}
          tone="rose"
          tooltip="No units on hand across all locations"
        />
      </KpiGrid>

      {/* View switcher */}
      <ViewSwitcher
        active={view}
        onChange={(k) => setView(k as typeof view)}
        meta={`${filteredRows.length} of ${rows.length} products`}
        tabs={[
          { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
          { key: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
          { key: "graph", label: "Graph", icon: <BarChart3 className="h-4 w-4" /> },
          { key: "pivot", label: "Pivot", icon: <Table2 className="h-4 w-4" /> },
        ]}
      />

      {/* Filters tray also drives Kanban / Graph / Pivot */}
      {view !== "list" && (
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
      )}

      {view === "list" && (
      /* Products Table with integrated filters */
      <CentralTable
        data={filteredRows}
        columns={COLUMNS}
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
              className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
              onClick={() => bulkAct(selectedRows as ProductRow[], "publish", clearSelection)}
            >
              <Check className="h-3.5 w-3.5" /> Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
              onClick={() => bulkAct(selectedRows as ProductRow[], "unpublish", clearSelection)}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Unpublish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
              onClick={() => bulkAct(selectedRows as ProductRow[], "archive", clearSelection)}
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
              onClick={() => bulkAct(selectedRows as ProductRow[], "unarchive", clearSelection)}
            >
              <ArchiveRestore className="h-3.5 w-3.5" /> Restore
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
      )}

      {view === "kanban" && (
        <KanbanBoard
          data={filteredRows}
          loading={loading}
          idOf={(p) => p.id}
          stageOf={(p) => p.status}
          onMove={moveStage}
          stages={[
            { key: "Draft", label: "Draft", accent: "bg-slate-500" },
            { key: "Active", label: "Published", accent: "bg-emerald-500" },
            { key: "Archived", label: "Archived", accent: "bg-rose-500" },
          ]}
          renderCard={(p) => {
            const meta = AVAILABILITY_META[availabilityOf(p)];
            return (
              <div className="space-y-1.5">
                <Link href={`/products/${p.id}`} className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  {p.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground font-mono">{p.sku}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", meta.className)}>{meta.label}</span>
                  <span className="font-mono text-sm font-bold text-foreground">{p.price}</span>
                </div>
              </div>
            );
          }}
        />
      )}

      {view === "graph" && <GraphView data={graphData} formatValue={money} />}

      {view === "pivot" && (
        <PivotView
          rows={filteredRows}
          groupOf={(p) => p.category}
          title="Catalog by category"
          formatValue={money}
          columns={[
            { key: "count", label: "Products", measure: (g) => g.length, format: (v) => String(v) },
            { key: "qty", label: "On Hand", measure: (g) => g.reduce((s, p) => s + p.stock, 0), format: (v) => String(v) },
            { key: "value", label: "Stock Value", measure: (g) => g.reduce((s, p) => s + p.stock * p.priceValue, 0) },
          ]}
        />
      )}

      {/* Workflow feedback toast */}
      {feedback && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium border flex items-center gap-2",
            feedback.ok
              ? "bg-card text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-card text-rose-600 dark:text-rose-400 border-rose-500/30",
          )}
        >
          {feedback.ok ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {feedback.message}
        </div>
      )}

      <ProductFormDrawer
        open={isProductDrawerOpen}
        onOpenChange={setIsProductDrawerOpen}
      />
    </>
  );
}
