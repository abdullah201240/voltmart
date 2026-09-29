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
import { Library, Layers, Globe, Eye, Plus, RotateCcw } from "lucide-react";
import { getCollections, type CollectionRow } from "@/lib/data/catalog";

const CHANNEL_FILTER: DropboxOption[] = [
  { value: "all", label: "All channels..." },
  { value: "Default Channel (USD)", label: "Default Channel (USD)" },
  { value: "Eurozone Store (EUR)", label: "Eurozone Store (EUR)" },
  { value: "Poland Channel (PLN)", label: "Poland Channel (PLN)" },
];

const TYPE_FILTER: DropboxOption[] = [
  { value: "all", label: "Any type..." },
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const COLLECTION_COLUMNS: CentralTableColumn<CollectionRow>[] = [
  {
    accessorKey: "name",
    header: "Collection",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Library className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{value}</span>
      </div>
    ),
  },
  {
    accessorKey: "channel",
    header: "Channel",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant={value === "Automatic" ? "secondary" : "outline"} className="text-xs font-semibold">
        {value}
      </Badge>
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
    accessorKey: "published",
    header: "Published",
    sortable: true,
    align: "center",
    cell: ({ value }) =>
      value ? (
        <Badge variant="default" className="text-xs font-semibold gap-1">
          <Eye className="h-3 w-3" /> Live
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground/60 italic">Draft</span>
      ),
  },
];

export default function CollectionsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    let alive = true;
    getCollections().then((d) => {
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
      published: rows.filter((r) => r.published).length,
      channels: new Set(rows.map((r) => r.channel)).size,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((c) => {
      const matchesChannel = selectedChannel === "all" || c.channel === selectedChannel;
      const matchesType = selectedType === "all" || c.type === selectedType;
      const matchesQuery =
        !effectiveQuery || c.name.toLowerCase().includes(effectiveQuery);
      return matchesChannel && matchesType && matchesQuery;
    });
  }, [rows, selectedChannel, selectedType, effectiveQuery]);

  const clearFilters = () => {
    setSelectedChannel("all");
    setSelectedType("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (selectedChannel !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground">
            Curated product groupings per sales channel — automatic or manually hand-picked.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Add Collection
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Collections" value={String(stats.total)} icon={Library} tone="blue" />
        <KpiCard title="Products Grouped" value={String(stats.products)} icon={Layers} tone="emerald" tooltip="Products across all collections" />
        <KpiCard title="Published" value={String(stats.published)} icon={Eye} tone="amber" tooltip="Live collections on the storefront" />
        <KpiCard title="Channels Used" value={String(stats.channels)} icon={Globe} tone="violet" tooltip="Distinct sales channels with collections" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={COLLECTION_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search collection..."
        title="Collections"
        description={`${filteredRows.length} of ${rows.length} collections`}
        filters={
          <div className="grid gap-5 sm:grid-cols-2 w-full">
            <SearchableDropbox
              label="Sales Channel"
              options={CHANNEL_FILTER}
              value={selectedChannel}
              onChange={setSelectedChannel}
              placeholder="All channels..."
              searchPlaceholder="Search channel..."
            />
            <SearchableDropbox
              label="Type"
              options={TYPE_FILTER}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Any type..."
              searchPlaceholder="Search type..."
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
