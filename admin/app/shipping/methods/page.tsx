"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Truck, CheckCircle2, Globe, Plus, RotateCcw } from "lucide-react";
import { getCarriers, carrierStats, CARRIER_PROVIDER_OPTIONS, type CarrierRow } from "@/lib/data/shipping";

const CARRIER_COLUMNS: CentralTableColumn<CarrierRow>[] = [
  {
    accessorKey: "name",
    header: "Method",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{row.provider}</div>
      </div>
    ),
  },
  {
    accessorKey: "method",
    header: "Pricing",
    sortable: true,
    cell: ({ value }) => <Badge variant="secondary" className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "countries",
    header: "Countries",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "margin",
    header: "Margin",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value}%</span>,
  },
  {
    accessorKey: "active",
    header: "Status",
    sortable: true,
    align: "center",
    cell: ({ value }) =>
      value ? (
        <Badge variant="default" className="text-xs font-semibold gap-1">
          <CheckCircle2 className="h-3 w-3" /> Enabled
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground/60 italic">Disabled</span>
      ),
  },
];

export default function ShippingMethodsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<CarrierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");

  useEffect(() => {
    let alive = true;
    getCarriers().then((d) => {
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
  const stats = useMemo(() => carrierStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((c) => {
      const matchesProvider = selectedProvider === "all" || c.provider === selectedProvider;
      const matchesQuery =
        !effectiveQuery ||
        c.name.toLowerCase().includes(effectiveQuery) ||
        c.provider.toLowerCase().includes(effectiveQuery);
      return matchesProvider && matchesQuery;
    });
  }, [rows, selectedProvider, effectiveQuery]);

  const clearFilters = () => {
    setSelectedProvider("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount = selectedProvider !== "all" ? 1 : 0;
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shipping Methods</h1>
          <p className="text-sm text-muted-foreground">
            Delivery carriers — configure providers, pricing method and margins.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Add Carrier
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Carriers" value={String(stats.total)} icon={Truck} tone="blue" />
        <KpiCard title="Enabled" value={String(stats.active)} icon={CheckCircle2} tone="emerald" badge="LIVE" />
        <KpiCard title="Countries Served" value={String(stats.countries)} icon={Globe} tone="violet" tooltip="Aggregate country coverage" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={CARRIER_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search carrier or provider..."
        title="Carriers"
        description={`${filteredRows.length} of ${rows.length} carriers`}
        filters={
          <div className="grid gap-5 sm:grid-cols-1 w-full sm:max-w-xs">
            <SearchableDropbox
              label="Provider"
              options={CARRIER_PROVIDER_OPTIONS as DropboxOption[]}
              value={selectedProvider}
              onChange={setSelectedProvider}
              placeholder="All providers..."
              searchPlaceholder="Search provider..."
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
              <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
            </Button>
          )
        }
      />
    </>
  );
}
