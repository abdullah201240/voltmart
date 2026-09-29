"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import {
  FileText,
  Send,
  CircleDollarSign,
  PackageCheck,
  Plus,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  getPurchaseOrders,
  purchaseStats,
  isRfq,
  PO_STATE_LABEL,
  PO_STATE_OPTIONS,
  type PurchaseOrderRow,
  type PoState,
} from "@/lib/data/purchasing";

const STATE_CLASS: Record<PoState, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "to approve": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  purchase: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancel: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function money(v: number) {
  return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

interface PurchaseListProps {
  /** true = Requests for Quotation (draft/sent/to approve); false = confirmed POs. */
  rfq: boolean;
}

/** Shared purchase order list used by the RFQs and Purchase Orders pages. */
export function PurchaseList({ rfq }: PurchaseListProps) {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  const heading = rfq ? "Requests for Quotation" : "Purchase Orders";
  const shortTitle = rfq ? "RFQs" : "Orders";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPurchaseOrders().then((d) => {
      if (alive) {
        setRows(d.filter((r) => (rfq ? isRfq(r.state) : !isRfq(r.state))));
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [rfq]);

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => purchaseStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((p) => {
      const matchesState = selectedState === "all" || p.state === selectedState;
      const matchesQuery =
        !effectiveQuery ||
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.vendor.toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, selectedState, effectiveQuery]);

  const clearFilters = () => {
    setSelectedState("all");
    setSearchTableQuery("");
  };

  const COLUMNS: CentralTableColumn<PurchaseOrderRow>[] = [
    {
      accessorKey: "name",
      header: "Reference",
      sortable: true,
      width: "120px",
      cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{value}</span>,
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "date",
      header: "Order Date",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      accessorKey: "expectedDate",
      header: "Expected",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      accessorKey: "lines",
      header: "Lines",
      align: "center",
      cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
    },
    {
      accessorKey: "received",
      header: "Receipt",
      align: "center",
      cell: ({ value }) =>
        value ? (
          <Badge variant="default" className="text-xs font-semibold">Received</Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-semibold">Pending</Badge>
        ),
    },
    {
      accessorKey: "state",
      header: "Status",
      sortable: true,
      cell: ({ value }) => (
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", STATE_CLASS[value as PoState])}>
          {PO_STATE_LABEL[value as PoState]}
        </span>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Total",
      sortable: true,
      align: "right",
      cell: ({ row }) => <span className="font-mono font-bold text-sm text-foreground">{row.total}</span>,
    },
  ];

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground">
            {rfq
              ? "Draft and sent quotations — negotiate with vendors before confirming."
              : "Confirmed purchase orders — awaiting receipt into the warehouse."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> New Quotation
          </Button>
        </div>
      </div>

      {/* Purchase KPIs */}
      <KpiGrid columns={4}>
        <KpiCard title={rfq ? "Open RFQs" : "Active POs"} value={String(stats.open)} icon={rfq ? FileText : Send} tone="blue" />
        <KpiCard title="Awaiting Receipt" value={String(stats.awaitingReceipt)} icon={PackageCheck} tone="amber" badge="TODO" tooltip="Confirmed POs not yet received" />
        <KpiCard title="Committed Spend" value={money(stats.committed)} icon={CircleDollarSign} tone="emerald" tooltip="Confirmed + locked purchase value" />
        <KpiCard title={`Total ${shortTitle}`} value={String(stats.total)} icon={FileText} tone="violet" />
      </KpiGrid>

      {/* Table */}
      <CentralTable
        data={filteredRows}
        columns={COLUMNS}
        loading={loading}
        loadingRows={5}
        selectable
        searchable
        searchPlaceholder="Search reference or vendor..."
        title={heading}
        description={`${filteredRows.length} of ${rows.length} documents`}
        filters={
          <div className="grid gap-5 sm:grid-cols-3 w-full">
            <SearchableDropbox
              label="Status"
              options={PO_STATE_OPTIONS as DropboxOption[]}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="All statuses..."
              searchPlaceholder="Search status..."
            />
          </div>
        }
        activeFiltersCount={selectedState !== "all" ? 1 : 0}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        selectedActions={(selectedRows, clearSelection) => (
          <Button
            size="sm"
            className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
            onClick={() => {
              alert(`Confirming ${selectedRows.length} order(s)`);
              clearSelection();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Confirm
          </Button>
        )}
        emptyAction={
          (selectedState !== "all" || effectiveQuery.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )
        }
      />
    </>
  );
}
