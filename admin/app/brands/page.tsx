"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Award, Layers, CircleDollarSign, Building2, Plus, RotateCcw } from "lucide-react";
import { getBrands, type BrandRow } from "@/lib/data/catalog";

function money(v: number) {
  return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const BRAND_COLUMNS: CentralTableColumn<BrandRow>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Award className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">/{row.slug}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "revenue",
    header: "Catalog Value",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value)}</span>,
  },
];

export default function BrandsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getBrands().then((d) => {
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

  const stats = useMemo(
    () => ({
      total: rows.length,
      products: rows.reduce((s, r) => s + r.products, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (b) =>
        b.name.toLowerCase().includes(effectiveQuery) ||
        b.slug.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manufacturers and brands — assign products and track catalog value.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Brands" value={String(stats.total)} icon={Building2} tone="blue" />
        <KpiCard title="Products Branded" value={String(stats.products)} icon={Layers} tone="emerald" tooltip="Products attributed to a brand" />
        <KpiCard title="Catalog Value" value={money(stats.revenue)} icon={CircleDollarSign} tone="violet" tooltip="Total value across branded products" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={BRAND_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search brand or slug..."
        title="Brands"
        description={`${filteredRows.length} of ${rows.length} brands`}
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
