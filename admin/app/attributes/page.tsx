"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { SlidersHorizontal, Hash, Palette, RotateCcw, Plus } from "lucide-react";
import { getAttributes, type AttributeRow } from "@/lib/data/catalog";

const VARIANT_CREATION_CLASS: Record<AttributeRow["variantCreation"], "default" | "secondary" | "outline"> = {
  Instantly: "default",
  Dynamically: "secondary",
  Never: "outline",
};

const ATTRIBUTE_COLUMNS: CentralTableColumn<AttributeRow>[] = [
  {
    accessorKey: "name",
    header: "Attribute",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-2 min-w-0">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{value}</span>
      </div>
    ),
  },
  {
    accessorKey: "values",
    header: "Values",
    cell: ({ value }) => (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((v) => (
          <Badge key={v} variant="outline" className="text-xs font-medium">
            {v}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "variantCreation",
    header: "Variant Creation",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant={VARIANT_CREATION_CLASS[value as AttributeRow["variantCreation"]]} className="text-xs font-semibold">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "productTypes",
    header: "Product Types",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>,
  },
];

export default function AttributesPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<AttributeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getAttributes().then((d) => {
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
      values: rows.reduce((s, r) => s + r.values.length, 0),
      variantDrivers: rows.filter((r) => r.variantCreation !== "Never").length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (a) =>
        a.name.toLowerCase().includes(effectiveQuery) ||
        a.values.some((v) => v.toLowerCase().includes(effectiveQuery))
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
          <p className="text-sm text-muted-foreground">
            Attribute definitions and values that drive product variants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/attributes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Attribute
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Attributes" value={String(stats.total)} icon={SlidersHorizontal} tone="blue" />
        <KpiCard title="Total Values" value={String(stats.values)} icon={Hash} tone="emerald" tooltip="Distinct attribute values defined" />
        <KpiCard title="Variant Drivers" value={String(stats.variantDrivers)} icon={Palette} tone="violet" tooltip="Attributes that generate variants (Instantly/Dynamically)" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={ATTRIBUTE_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search attribute or value..."
        title="Attribute Matrix"
        description={`${filteredRows.length} of ${rows.length} attributes`}
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
