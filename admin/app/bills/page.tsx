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
import { useAdminLayout } from "@/components/admin-shell";
import { Receipt, Banknote, AlertTriangle, FileClock, RotateCcw, Plus } from "lucide-react";
import { getBills, billStats, MOVE_STATE_OPTIONS, type BillRow, type MoveState } from "@/lib/data/finance";

const STATE_CLASS: Record<MoveState, "default" | "secondary" | "outline"> = {
  Draft: "secondary",
  Posted: "default",
  Paid: "default",
  Cancelled: "outline",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BILL_COLUMNS: CentralTableColumn<BillRow>[] = [
  {
    accessorKey: "number",
    header: "Bill",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
          <Receipt className="h-4 w-4 text-muted-foreground" /> {row.number}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">from {row.reference}</div>
      </div>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    sortable: true,
    cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
  },
  {
    accessorKey: "billDate",
    header: "Bill Date",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "amountTotal",
    header: "Amount",
    sortable: true,
    align: "right",
    cell: ({ row }) => (
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono font-bold text-sm text-foreground">{money(row.amountTotal)}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">paid {money(row.amountPaid)}</span>
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: "State",
    sortable: true,
    cell: ({ value }) => <Badge variant={STATE_CLASS[value as MoveState]} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
  },
];

export default function BillsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  useEffect(() => {
    let alive = true;
    getBills().then((d) => {
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
  const stats = useMemo(() => billStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((b) => {
      const matchesState = selectedState === "all" || b.state === selectedState;
      const matchesQuery =
        !effectiveQuery ||
        b.number.toLowerCase().includes(effectiveQuery) ||
        b.vendor.toLowerCase().includes(effectiveQuery) ||
        b.reference.toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, selectedState, effectiveQuery]);

  const clearFilters = () => {
    setSelectedState("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount = selectedState !== "all" ? 1 : 0;
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Vendor Bills</h1>
          <p className="text-sm text-muted-foreground">
            Bills from purchase receipts — three-way matched against orders and deliveries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/bills/new">
              <Plus className="mr-2 h-4 w-4" />
              Record Bill
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Bills" value={String(stats.total)} icon={Receipt} tone="blue" />
        <KpiCard title="Owed" value={money(stats.owed)} icon={AlertTriangle} tone="rose" tooltip="Unpaid vendor balance" />
        <KpiCard title="Paid" value={money(stats.paid)} icon={Banknote} tone="emerald" />
        <KpiCard title="In Draft" value={String(stats.draft)} icon={FileClock} tone="amber" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={BILL_COLUMNS}
        loading={loading}
        loadingRows={6}
        selectable
        searchable
        searchPlaceholder="Search number, vendor or reference..."
        title="Bills"
        description={`${filteredRows.length} of ${rows.length} bills`}
        filters={
          <div className="grid gap-5 sm:grid-cols-1 w-full sm:max-w-xs">
            <SearchableDropbox
              label="State"
              options={MOVE_STATE_OPTIONS as DropboxOption[]}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="All states..."
              searchPlaceholder="Search state..."
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
