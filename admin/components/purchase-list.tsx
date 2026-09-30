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
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { GraphView } from "@/components/ui/graph-view";
import { useAdminLayout } from "@/components/admin-shell";
import {
  FileText,
  Send,
  Banknote,
  PackageCheck,
  Plus,
  RotateCcw,
  Check,
  Lock,
  XCircle,
  AlertTriangle,
  List,
  LayoutGrid,
  BarChart3,
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
import { useOps } from "@/lib/data/ops";
import { applyPoAction, type PoAction } from "@/lib/data/workflows";

const STATE_CLASS: Record<PoState, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "to approve": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  purchase: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancel: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Full purchase.order pipeline for the Kanban / Graph views. */
const STATE_KEYS: PoState[] = ["draft", "sent", "to approve", "purchase", "done", "cancel"];
const STATE_ACCENT: Record<PoState, string> = {
  draft: "bg-slate-500",
  sent: "bg-blue-500",
  "to approve": "bg-violet-500",
  purchase: "bg-amber-500",
  done: "bg-emerald-500",
  cancel: "bg-rose-500",
};

interface PurchaseListProps {
  /** true = Requests for Quotation (draft/sent/to approve); false = confirmed POs. */
  rfq: boolean;
}

/** Shared purchase order list used by the RFQs and Purchase Orders pages. */
export function PurchaseList({ rfq }: PurchaseListProps) {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const [rows, setRows] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [view, setView] = useState<"list" | "kanban" | "graph">("list");

  const heading = rfq ? "Requests for Quotation" : "Purchase Orders";
  const shortTitle = rfq ? "RFQs" : "Orders";

  useEffect(() => {
    let alive = true;
    getPurchaseOrders().then((d) => {
      if (alive) {
        setRows(d.filter((r) => (rfq ? isRfq(r.state) : !isRfq(r.state))));
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [rfq, version]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(t);
  }, [feedback]);

  const act = (p: PurchaseOrderRow, action: PoAction) => {
    setFeedback(applyPoAction(p.id, p.vendor, action, { state: p.state, received: p.received }));
  };

  const bulkAction = (selected: PurchaseOrderRow[], action: PoAction, clear: () => void) => {
    let done = 0;
    let failed = 0;
    for (const p of selected) {
      const res = applyPoAction(p.id, p.vendor, action, { state: p.state, received: p.received });
      if (res.ok) done += 1;
      else failed += 1;
    }
    setFeedback({
      ok: done > 0,
      message: `${done} order(s) ${action === "confirm" ? "confirmed" : "received"}${failed ? ` · ${failed} skipped` : ""}.`,
    });
    clear();
  };

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

  // Drag a Kanban card into a new stage -> run the matching workflow transition.
  const moveStage = (row: PurchaseOrderRow, toKey: string) => {
    const action: PoAction | null =
      toKey === "sent" ? "send"
        : toKey === "purchase" ? "confirm"
        : toKey === "done" ? "receive"
        : toKey === "cancel" ? "cancel"
        : null;
    if (!action) {
      setFeedback({ ok: false, message: `No direct transition to "${PO_STATE_LABEL[toKey as PoState] ?? toKey}".` });
      return;
    }
    setFeedback(applyPoAction(row.id, row.vendor, action, { state: row.state, received: row.received }));
  };

  // Purchase value by state for the Graph view.
  const graphData = STATE_KEYS.map((s) => ({
    label: PO_STATE_LABEL[s],
    value: filteredRows.filter((r) => r.state === s).reduce((sum, r) => sum + r.totalValue, 0),
    color: STATE_ACCENT[s] + "/70",
  }));

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
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "230px",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.state === "draft" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "send")}>
              <Send className="h-3.5 w-3.5" /> Send by Email
            </Button>
          )}
          {row.state === "to approve" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "approve")}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
          {(row.state === "sent" || row.state === "draft") && (
            <Button className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "confirm")}>
              <Check className="h-3.5 w-3.5" /> Confirm
            </Button>
          )}
          {row.state === "purchase" && !row.received && (
            <Button className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "receive")}>
              <PackageCheck className="h-3.5 w-3.5" /> Receive
            </Button>
          )}
          {row.state === "purchase" && row.received && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "lock")}>
              <Lock className="h-3.5 w-3.5" /> Lock
            </Button>
          )}
          {row.state !== "cancel" && row.state !== "done" && (
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-xs font-semibold cursor-pointer text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => act(row, "cancel")}>
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
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
        <KpiCard title="Awaiting Receipt" value={String(stats.awaitingReceipt)} icon={PackageCheck} tone="amber" tooltip="Confirmed POs not yet received" />
        <KpiCard title="Committed Spend" value={money(stats.committed)} icon={Banknote} tone="emerald" tooltip="Confirmed + locked purchase value" />
        <KpiCard title={`Total ${shortTitle}`} value={String(stats.total)} icon={FileText} tone="violet" />
      </KpiGrid>

      {/* View switcher */}
      <ViewSwitcher
        active={view}
        onChange={(k) => setView(k as typeof view)}
        meta={`${filteredRows.length} of ${rows.length} ${shortTitle.toLowerCase()}`}
        tabs={[
          { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
          { key: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
          { key: "graph", label: "Graph", icon: <BarChart3 className="h-4 w-4" /> },
        ]}
      />

      {/* Status filter also drives Kanban / Graph */}
      {view !== "list" && (
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
      )}

      {view === "list" && (
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
        selectedActions={(selectedRows, clearSelection) =>
          rfq ? (
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
              onClick={() => bulkAction(selectedRows, "confirm", clearSelection)}
            >
              <Check className="h-3.5 w-3.5" /> Confirm Orders
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
              onClick={() => bulkAction(selectedRows, "receive", clearSelection)}
            >
              <PackageCheck className="h-3.5 w-3.5" /> Receive Products
            </Button>
          )
        }
        emptyAction={
          (selectedState !== "all" || effectiveQuery.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )
        }
      />
      )}

      {view === "kanban" && (
        <KanbanBoard
          data={filteredRows}
          loading={loading}
          idOf={(p) => p.id}
          stageOf={(p) => p.state}
          onMove={moveStage}
          stages={STATE_KEYS.map((s) => ({ key: s, label: PO_STATE_LABEL[s], accent: STATE_ACCENT[s] }))}
          renderCard={(p) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.date}</span>
              </div>
              <p className="truncate text-sm font-semibold text-foreground">{p.vendor}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-[10px] font-semibold">{p.lines} lines</Badge>
                <span className="font-mono text-sm font-bold text-foreground">{p.total}</span>
              </div>
            </div>
          )}
        />
      )}

      {view === "graph" && (
        <GraphView data={graphData} formatValue={money} onSelect={() => setView("list")} />
      )}

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
