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
import { FileText, Banknote, Wallet, FileClock, Plus, RotateCcw, Check, XCircle, ArrowDownLeft, AlertTriangle } from "lucide-react";
import { getInvoices, invoiceStats, MOVE_STATE_OPTIONS, type InvoiceRow, type MoveState } from "@/lib/data/finance";
import { useOps } from "@/lib/data/ops";
import { applyMoveAction } from "@/lib/data/workflows";
import { createCreditNote } from "@/lib/data/accounting";

const STATE_CLASS: Record<MoveState, "default" | "secondary" | "outline"> = {
  Draft: "secondary",
  Posted: "default",
  Paid: "default",
  Cancelled: "outline",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoicesPage() {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    getInvoices().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(t);
  }, [feedback]);

  const act = (inv: InvoiceRow, action: "post" | "cancel") => {
    setFeedback(applyMoveAction(inv.id, action, { state: inv.state }, true));
  };

  const credit = (inv: InvoiceRow) => {
    const note = createCreditNote(inv.number, inv.partner, inv.total);
    setFeedback(
      note
        ? { ok: true, message: `Credit note ${note.number} created — post it in Credit Notes.` }
        : { ok: false, message: `A credit note already exists for ${inv.number}.` },
    );
  };

  const bulkPost = (selected: InvoiceRow[], clear: () => void) => {
    let posted = 0;
    for (const inv of selected) {
      const res = applyMoveAction(inv.id, "post", { state: inv.state }, true);
      if (res.ok) posted += 1;
    }
    setFeedback({
      ok: posted > 0,
      message: posted ? `${posted} invoice${posted === 1 ? "" : "s"} posted to the ledger.` : "Nothing to post — selected invoices are not drafts.",
    });
    clear();
  };

  const COLUMNS: CentralTableColumn<InvoiceRow>[] = [
    {
      accessorKey: "number",
      header: "Invoice",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" /> {row.number}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">from {row.reference}</div>
        </div>
      ),
    },
    {
      accessorKey: "partner",
      header: "Customer",
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "date",
      header: "Issued",
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
      accessorKey: "total",
      header: "Total",
      sortable: true,
      align: "right",
      cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value)}</span>,
    },
    {
      accessorKey: "state",
      header: "State",
      sortable: true,
      cell: ({ value }) => <Badge variant={STATE_CLASS[value as MoveState]} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "220px",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.state === "Draft" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "post")}>
              <Check className="h-3.5 w-3.5" /> Post
            </Button>
          )}
          {(row.state === "Posted" || row.state === "Paid") && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => credit(row)}>
              <ArrowDownLeft className="h-3.5 w-3.5" /> Credit Note
            </Button>
          )}
          {row.state !== "Cancelled" && row.state !== "Paid" && (
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-xs font-semibold cursor-pointer text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => act(row, "cancel")}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => invoiceStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((inv) => {
      const matchesState = selectedState === "all" || inv.state === selectedState;
      const matchesQuery =
        !effectiveQuery ||
        inv.number.toLowerCase().includes(effectiveQuery) ||
        inv.partner.toLowerCase().includes(effectiveQuery) ||
        inv.reference.toLowerCase().includes(effectiveQuery);
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
          <h1 className="text-3xl font-bold tracking-tight">Customer Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Invoices raised from confirmed sales orders — draft, posted and paid.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Invoices" value={String(stats.total)} icon={FileText} tone="blue" />
        <KpiCard title="Collected" value={money(stats.paid)} icon={Banknote} tone="emerald" tooltip="Invoices fully paid" />
        <KpiCard title="Outstanding" value={money(stats.outstanding)} icon={Wallet} tone="amber" tooltip="Posted, awaiting payment" />
        <KpiCard title="In Draft" value={String(stats.draft)} icon={FileClock} tone="violet" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={COLUMNS}
        loading={loading}
        loadingRows={6}
        selectable
        searchable
        searchPlaceholder="Search number, customer or reference..."
        title="Invoices"
        description={`${filteredRows.length} of ${rows.length} invoices`}
        selectedActions={(selectedRows, clear) => (
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
            onClick={() => bulkPost(selectedRows, clear)}
          >
            <Check className="h-3.5 w-3.5" /> Post Selected
          </Button>
        )}
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

      {/* Action toast */}
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
    </>
  );
}
