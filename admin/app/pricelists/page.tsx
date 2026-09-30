"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { ListChecks, Coins, Layers, Globe, RotateCcw } from "lucide-react";
import { getPricelists, pricelistStats, type PricelistRow } from "@/lib/data/discounts";
import { CreateFlow } from "@/components/ui/create-flow";

const PRICELIST_COLUMNS: CentralTableColumn<PricelistRow>[] = [
  {
    accessorKey: "name",
    header: "Pricelist",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
          {row.isBase && <Badge variant="default" className="text-[10px] font-semibold">BASE</Badge>}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{row.currency}</div>
      </div>
    ),
  },
  {
    accessorKey: "policy",
    header: "Compute Policy",
    sortable: true,
    cell: ({ value }) => <Badge variant="secondary" className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "items",
    header: "Items",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => <Badge variant={value === "Active" ? "default" : "outline"} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
  },
];

export default function PricelistsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<PricelistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getPricelists().then((d) => {
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
  const stats = useMemo(() => pricelistStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.policy.toLowerCase().includes(effectiveQuery) ||
        p.currency.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Pricelists</h1>
          <p className="text-sm text-muted-foreground">
            Channel and segment-based price rules — fixed, percentage, discount, markup or margin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateFlow<PricelistRow>
            model="product.pricelist"
            buttonLabel="Create Pricelist"
            drawerTitle="New Pricelist"
            drawerDescription="Add a pricing strategy for a customer segment or channel."
            submitLabel="Create Pricelist"
            fields={[
              { key: "name", label: "Pricelist Name", required: true, placeholder: "e.g. Wholesale B2B", colSpan: 2 },
              {
                key: "policy",
                label: "Compute Policy",
                type: "select",
                required: true,
                defaultValue: "Percentage",
                options: [
                  { value: "Fixed Price", label: "Fixed Price" },
                  { value: "Percentage", label: "Percentage" },
                  { value: "Discount", label: "Discount" },
                  { value: "Markup", label: "Markup" },
                  { value: "Margin", label: "Margin" },
                ],
              },
              {
                key: "currency",
                label: "Currency",
                type: "select",
                required: true,
                defaultValue: "BDT",
                options: [
                  { value: "BDT", label: "BDT (৳)" },
                  { value: "USD", label: "USD ($)" },
                ],
              },
              { key: "isBase", label: "Fallback Base Pricelist", type: "switch", helper: "Applied when no other list matches." },
            ]}
            validate={(v) => (rows.some((p) => p.name.toLowerCase() === v.name.trim().toLowerCase()) ? "That pricelist already exists." : null)}
            build={(v) => ({
              id: `PL-${Date.now().toString(36)}`,
              name: v.name.trim(),
              currency: v.currency,
              policy: v.policy as PricelistRow["policy"],
              isBase: v.isBase === "true",
              items: 0,
              status: "Active",
            })}
            onCreated={(row) => setRows((prev) => [row, ...prev])}
            successMessage="Pricelist created"
          />
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Pricelists" value={String(stats.total)} icon={ListChecks} tone="blue" />
        <KpiCard title="Active" value={String(stats.active)} icon={Layers} tone="emerald" badge="LIVE" />
        <KpiCard title="Price Rules" value={String(stats.items)} icon={Coins} tone="amber" tooltip="Total pricelist line items configured" />
        <KpiCard title="Currencies" value={String(stats.currencies)} icon={Globe} tone="violet" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={PRICELIST_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search pricelist, policy or currency..."
        title="Pricelists"
        description={`${filteredRows.length} of ${rows.length} pricelists`}
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
