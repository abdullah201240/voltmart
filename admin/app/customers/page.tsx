"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { GraphView, PivotView } from "@/components/ui/graph-view";
import { useAdminLayout } from "@/components/admin-shell";
import { Users, UserCheck, Banknote, ShoppingCart, RotateCcw, List, BarChart3, Table2, Plus } from "lucide-react";
import {
  getCustomers,
  customerStats,
  CUSTOMER_SEGMENT_OPTIONS,
  COUNTRY_OPTIONS,
  type CustomerRow,
} from "@/lib/data/customers";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const TAG_CLASS: Record<string, string> = {
  VIP: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Wholesale: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Repeat: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  New: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

const CUSTOMER_COLUMNS: CentralTableColumn<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          href={`/customers/${row.id}`}
          className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors block"
        >
          {row.name}
        </Link>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.city}, {row.country}</span>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ value }) => (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((t) => (
          <span key={t} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TAG_CLASS[t] ?? "border-border text-muted-foreground"}`}>
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "totalSpent",
    header: "Lifetime Spent",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value)}</span>,
  },
  {
    accessorKey: "joined",
    header: "Joined",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
];

export default function CustomersPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [view, setView] = useState<"list" | "graph" | "pivot">("list");

  useEffect(() => {
    let alive = true;
    getCustomers().then((d) => {
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
  const stats = useMemo(() => customerStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((c) => {
      const matchesSegment = selectedSegment === "all" || c.tags.includes(selectedSegment);
      const matchesCountry = selectedCountry === "all" || c.country === selectedCountry;
      const matchesQuery =
        !effectiveQuery ||
        c.name.toLowerCase().includes(effectiveQuery) ||
        c.email.toLowerCase().includes(effectiveQuery) ||
        c.city.toLowerCase().includes(effectiveQuery);
      return matchesSegment && matchesCountry && matchesQuery;
    });
  }, [rows, selectedSegment, selectedCountry, effectiveQuery]);

  const clearFilters = () => {
    setSelectedSegment("all");
    setSelectedCountry("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (selectedSegment !== "all" ? 1 : 0) + (selectedCountry !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  // Lifetime spend by segment tag for the Graph view (a customer counts under
  // each of its tags). Falls back to "Unclassified".
  const graphData = useMemo(() => {
    const buckets = new Map<string, number>();
    for (const c of filteredRows) {
      const keys = c.tags.length ? c.tags : ["Unclassified"];
      for (const t of keys) buckets.set(t, (buckets.get(t) ?? 0) + c.totalSpent);
    }
    return [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [filteredRows]);

  const segmentOf = (c: CustomerRow) => c.tags[0] ?? "Unclassified";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Your buyer directory — order counts, lifetime spend, segments and tags.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Customers" value={String(stats.total)} icon={Users} tone="blue" />
        <KpiCard title="Active" value={String(stats.active)} icon={UserCheck} tone="emerald" badge="LIVE" />
        <KpiCard title="Lifetime Revenue" value={money(stats.revenue)} icon={Banknote} tone="violet" tooltip="Total spend across all customers" />
        <KpiCard title="Avg Orders / Customer" value={String(stats.avgOrders)} icon={ShoppingCart} tone="amber" />
      </KpiGrid>

      <ViewSwitcher
        active={view}
        onChange={(k) => setView(k as typeof view)}
        meta={`${filteredRows.length} of ${rows.length} customers`}
        tabs={[
          { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
          { key: "graph", label: "Graph", icon: <BarChart3 className="h-4 w-4" /> },
          { key: "pivot", label: "Pivot", icon: <Table2 className="h-4 w-4" /> },
        ]}
      />

      {/* Filters also drive Graph / Pivot */}
      {view !== "list" && (
        <div className="grid gap-5 sm:grid-cols-2 w-full">
          <SearchableDropbox
            label="Segment"
            options={CUSTOMER_SEGMENT_OPTIONS as DropboxOption[]}
            value={selectedSegment}
            onChange={setSelectedSegment}
            placeholder="All segments..."
            searchPlaceholder="Search segment..."
          />
          <SearchableDropbox
            label="Country"
            options={COUNTRY_OPTIONS as DropboxOption[]}
            value={selectedCountry}
            onChange={setSelectedCountry}
            placeholder="All countries..."
            searchPlaceholder="Search country..."
          />
        </div>
      )}

      {view === "list" && (
      <CentralTable
        data={filteredRows}
        columns={CUSTOMER_COLUMNS}
        loading={loading}
        loadingRows={6}
        selectable
        searchable
        searchPlaceholder="Search name, email or city..."
        title="Customer Directory"
        description={`${filteredRows.length} of ${rows.length} customers`}
        filters={
          <div className="grid gap-5 sm:grid-cols-2 w-full">
            <SearchableDropbox
              label="Segment"
              options={CUSTOMER_SEGMENT_OPTIONS as DropboxOption[]}
              value={selectedSegment}
              onChange={setSelectedSegment}
              placeholder="All segments..."
              searchPlaceholder="Search segment..."
            />
            <SearchableDropbox
              label="Country"
              options={COUNTRY_OPTIONS as DropboxOption[]}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="All countries..."
              searchPlaceholder="Search country..."
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
      )}

      {view === "graph" && <GraphView data={graphData} formatValue={money} />}

      {view === "pivot" && (
        <PivotView
          rows={filteredRows}
          groupOf={segmentOf}
          title="Customers by segment"
          formatValue={money}
          columns={[
            { key: "count", label: "Customers", measure: (g) => g.length, format: (v) => String(v) },
            { key: "orders", label: "Orders", measure: (g) => g.reduce((s, c) => s + c.orders, 0), format: (v) => String(v) },
            { key: "spent", label: "Lifetime Spent", measure: (g) => g.reduce((s, c) => s + c.totalSpent, 0) },
          ]}
        />
      )}
    </>
  );
}
