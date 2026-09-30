"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  Package,
  Layers,
  Ruler,
  Clock,
  Plus,
  RotateCcw,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  CentralFormDrawer,
  CentralFormSection,
  CentralFormField,
  CentralFormInput,
  CentralFormTextarea,
  CentralFormSwitch,
  CentralFormActions,
} from "@/components/ui/central-form";
import { useAdminLayout } from "@/components/admin-shell";
import { useToast, useConfirm } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import {
  getUnitsOfMeasure,
  uomStats,
  UOM_CATEGORY_OPTIONS,
  type UnitOfMeasure,
  type UomCategory,
} from "@/lib/data/uom";

const CATEGORY_BADGES: Record<UomCategory, { label: string; className: string }> = {
  count: { label: "Count / Units", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  weight: { label: "Weight & Mass", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  volume: { label: "Volume & Liquid", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  length: { label: "Length & Dimensions", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  time: { label: "Time & Service", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
};

const UOM_COLUMNS: CentralTableColumn<UnitOfMeasure>[] = [
  {
    accessorKey: "code",
    header: "Unit Symbol",
    sortable: true,
    width: "140px",
    cell: ({ row, value }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-sm text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/80">
          {value}
        </span>
        {row.isBase && (
          <Badge variant="default" className="text-[10px] font-bold px-1.5 py-0">
            BASE
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Unit Name",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
        {row.description && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.description}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Measurement Category",
    sortable: true,
    cell: ({ value }) => {
      const meta = CATEGORY_BADGES[value as UomCategory] || { label: value, className: "" };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.className}`}>
          {meta.label}
        </span>
      );
    },
  },
  {
    accessorKey: "ratio",
    header: "Ratio to Base",
    sortable: true,
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-foreground">
        {row.ratio === 1 ? "1.0 (Reference)" : `${row.ratio} × base`}
      </span>
    ),
  },
  {
    accessorKey: "rounding",
    header: "Rounding Precision",
    sortable: true,
    align: "right",
    cell: ({ value }) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{value}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant={value === "Active" ? "default" : "secondary"} className="text-xs font-semibold">
        {value}
      </Badge>
    ),
  },
];

export default function UnitsOfMeasurePage() {
  const { searchQuery } = useAdminLayout();
  const appToast = useToast();
  const [rows, setRows] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Drawer Create Unit State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<UomCategory>("count");
  const [ratio, setRatio] = useState("1");
  const [rounding, setRounding] = useState("1");
  const [isBase, setIsBase] = useState(false);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getUnitsOfMeasure().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => uomStats(rows), [rows]);
  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filteredRows = useMemo(() => {
    return rows.filter((u) => {
      const matchesCategory = selectedCategory === "all" || u.category === selectedCategory;
      const matchesQuery =
        !effectiveQuery ||
        u.code.toLowerCase().includes(effectiveQuery) ||
        u.name.toLowerCase().includes(effectiveQuery) ||
        (u.description && u.description.toLowerCase().includes(effectiveQuery));
      return matchesCategory && matchesQuery;
    });
  }, [rows, selectedCategory, effectiveQuery]);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchTableQuery("");
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanCode || !cleanName) {
      appToast.error("Missing Fields", "Please specify unit symbol and unit name.");
      return;
    }

    setIsSaving(true);
    const newUnit: UnitOfMeasure = {
      id: `UOM-${Date.now().toString(36).toUpperCase()}`,
      code: cleanCode,
      name: cleanName,
      category,
      categoryLabel: CATEGORY_BADGES[category]?.label || category,
      isBase,
      ratio: parseFloat(ratio) || 1,
      rounding: parseFloat(rounding) || 1,
      status: "Active",
      description: description.trim() || undefined,
    };

    addRecord("inventory.uom", newUnit as unknown as Record<string, unknown>);
    setRows((prev) => [newUnit, ...prev]);
    appToast.success("Unit Created", `Measurement unit ${cleanCode} (${cleanName}) is now available.`);

    setIsSaving(false);
    setIsDrawerOpen(false);
    setCode("");
    setName("");
    setDescription("");
    setRatio("1");
  };

  const activeFiltersCount = selectedCategory !== "all" ? 1 : 0;
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* Header & Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <Link href="/settings/general" className="hover:text-foreground">
              Settings
            </Link>
            <span>/</span>
            <span className="text-primary">Units of Measure</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Scale className="h-7 w-7 text-primary" /> Units of Measure (UoM)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define and manage measurement standards for products, inventory, and packaging: pieces, kg, grams, liters, meters, boxes, and packs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="h-11 px-5 text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Measurement Unit
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <KpiGrid columns={4}>
        <KpiCard title="Active Units" value={String(stats.active)} icon={CheckCircle2} tone="emerald" />
        <KpiCard title="Discrete Count (pcs/box)" value={`${stats.countUoms} Units`} icon={Package} tone="blue" />
        <KpiCard title="Weight & Mass (kg/g)" value={`${stats.weightUoms} Units`} icon={Scale} tone="violet" />
        <KpiCard title="Volume & Length (L/m)" value={`${stats.volumeUoms + stats.lengthUoms} Units`} icon={Ruler} tone="amber" />
      </KpiGrid>

      {/* CentralTable with Units List */}
      <CentralTable
        data={filteredRows}
        columns={UOM_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search unit by symbol, name, or description..."
        title="Measurement Standards"
        description={`${filteredRows.length} of ${rows.length} measurement units`}
        filters={
          <div className="w-full sm:w-72">
            <SearchableDropbox
              label="Measurement Category"
              options={UOM_CATEGORY_OPTIONS as DropboxOption[]}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="All categories..."
              searchPlaceholder="Filter category..."
            />
          </div>
        }
        activeFiltersCount={activeFiltersCount}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )
        }
      />

      {/* CentralFormDrawer for creating a new Unit */}
      <CentralFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title="Add Measurement Unit (UoM)"
        description="Configure a new counting or physical measurement unit for products, purchasing, or warehousing."
        width="wide"
      >
        <form onSubmit={handleCreateUnit} className="space-y-6 p-6">
          <CentralFormSection
            title="Unit Identifiers"
            description="The code is printed on invoices, packing slips, and order items."
            columns={2}
          >
            <CentralFormField label="Unit Symbol / Code" required helperText="e.g. pcs, kg, box, pk, m">
              <CentralFormInput
                placeholder="e.g. kg"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono font-bold"
                required
              />
            </CentralFormField>

            <CentralFormField label="Full Display Name" required helperText="e.g. Kilograms, Pieces, Pack of 10">
              <CentralFormInput
                placeholder="e.g. Kilograms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </CentralFormField>

            <CentralFormField label="Measurement Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UomCategory)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="count">Count / Discrete Units (pcs, units, box, pair, set)</option>
                <option value="weight">Weight & Mass (kg, grams, lb)</option>
                <option value="volume">Volume & Liquid (L, mL, gallon)</option>
                <option value="length">Length & Distance (m, cm, mm, in)</option>
                <option value="time">Time & Service (hr, day)</option>
              </select>
            </CentralFormField>

            <CentralFormField label="Conversion Ratio to Base" helperText="1.0 if base unit; or multiplier (e.g. 10 for box of 10 pcs)">
              <CentralFormInput
                type="number"
                step="any"
                min="0.000001"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                className="font-mono"
              />
            </CentralFormField>
          </CentralFormSection>

          <CentralFormSection title="Conversion & Precision" columns={1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CentralFormField label="Rounding Precision" helperText="Smallest decimal step (e.g. 1 for integer count, 0.01 for weight)">
                <CentralFormInput
                  type="number"
                  step="any"
                  value={rounding}
                  onChange={(e) => setRounding(e.target.value)}
                  className="font-mono"
                />
              </CentralFormField>

              <div className="pt-2">
                <CentralFormSwitch
                  checked={isBase}
                  onCheckedChange={setIsBase}
                  label="Category Reference Base Unit"
                  description="Mark if this is the fundamental reference unit for its category (e.g. kg for weight, pcs for count)."
                />
              </div>
            </div>

            <CentralFormField label="Description & Packaging Notes">
              <CentralFormTextarea
                rows={3}
                placeholder="e.g. Wholesale packaging format, standard bundle size..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </CentralFormField>
          </CentralFormSection>

          <CentralFormActions
            submitLabel="Create Unit"
            onCancel={() => setIsDrawerOpen(false)}
            loading={isSaving}
          />
        </form>
      </CentralFormDrawer>
    </div>
  );
}
