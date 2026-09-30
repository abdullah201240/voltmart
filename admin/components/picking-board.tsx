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
  ClipboardList,
  Clock,
  CheckCircle2,
  CircleCheck,
  RotateCcw,
  Check,
  Boxes,
  Truck,
  XCircle,
  AlertTriangle,
  List,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import {
  getPickings,
  pickingStats,
  PICKING_STATE_LABEL,
  PICKING_STATE_OPTIONS,
  type PickingRow,
  type PickingKind,
  type PickingState,
} from "@/lib/data/inventory";
import { useOps } from "@/lib/data/ops";
import { applyPickingAction, type PickingAction } from "@/lib/data/workflows";

const STATE_CLASS: Record<PickingState, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  assigned: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancel: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

/** stock.picking pipeline for Kanban / Graph views. */
const STATE_KEYS: PickingState[] = ["draft", "confirmed", "assigned", "done", "cancel"];
const STATE_ACCENT: Record<PickingState, string> = {
  draft: "bg-slate-500",
  confirmed: "bg-blue-500",
  assigned: "bg-amber-500",
  done: "bg-emerald-500",
  cancel: "bg-rose-500",
};

interface PickingBoardProps {
  kind: PickingKind;
  title: string;
  heading: string;
  description: string;
  partnerLabel: string;
  validateLabel: string;
}

/**
 * Reusable board for a picking operation list (receipts / deliveries /
 * transfers). Renders operation KPIs + a filterable CentralTable, driven
 * entirely by `kind`. This is the pick -> pack -> ship / receive surface.
 */
export function PickingBoard({ kind, title, heading, description, partnerLabel, validateLabel }: PickingBoardProps) {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const [rows, setRows] = useState<PickingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [view, setView] = useState<"list" | "kanban" | "graph">("list");

  useEffect(() => {
    let alive = true;
    getPickings(kind).then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [kind, version]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(t);
  }, [feedback]);

  const act = (p: PickingRow, action: PickingAction) => {
    setFeedback(applyPickingAction(p.id, kind, p.partner, p.origin, action, { state: p.state }));
  };

  const bulkValidate = (selected: PickingRow[], clear: () => void) => {
    let done = 0;
    let skipped = 0;
    for (const p of selected) {
      const res = applyPickingAction(p.id, kind, p.partner, p.origin, "transfer", { state: p.state });
      if (res.ok) done += 1;
      else skipped += 1;
    }
    setFeedback({
      ok: done > 0,
      message: `${done} operation(s) validated${skipped ? ` · ${skipped} skipped (confirm & reserve first)` : ""}.`,
    });
    clear();
  };

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => pickingStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((p) => {
      const matchesState = selectedState === "all" || p.state === selectedState;
      const matchesQuery =
        !effectiveQuery ||
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.partner.toLowerCase().includes(effectiveQuery) ||
        p.origin.toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, selectedState, effectiveQuery]);

  const clearFilters = () => {
    setSelectedState("all");
    setSearchTableQuery("");
  };

  // Drag a Kanban card into a new stage -> run the matching picking transition.
  const moveStage = (row: PickingRow, toKey: string) => {
    const action: PickingAction | null =
      toKey === "confirmed" ? "confirm"
        : toKey === "assigned" ? "reserve"
        : toKey === "done" ? "transfer"
        : toKey === "cancel" ? "cancel"
        : null;
    if (!action) {
      setFeedback({ ok: false, message: `No direct transition to "${PICKING_STATE_LABEL[toKey as PickingState] ?? toKey}".` });
      return;
    }
    setFeedback(applyPickingAction(row.id, kind, row.partner, row.origin, action, { state: row.state }));
  };

  // Operation count by state for the Graph view.
  const graphData = STATE_KEYS.map((s) => ({
    label: PICKING_STATE_LABEL[s],
    value: filteredRows.filter((r) => r.state === s).length,
    color: STATE_ACCENT[s] + "/70",
  }));

  const COLUMNS: CentralTableColumn<PickingRow>[] = [
    {
      accessorKey: "name",
      header: "Reference",
      sortable: true,
      width: "160px",
      cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{value}</span>,
    },
    {
      accessorKey: "partner",
      header: partnerLabel,
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "origin",
      header: "Source Doc",
      cell: ({ value }) => <span className="text-sm text-muted-foreground font-mono">{value}</span>,
    },
    {
      accessorKey: "scheduledDate",
      header: "Scheduled",
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
      accessorKey: "tracking",
      header: "Carrier / Tracking",
      cell: ({ row }) =>
        row.carrier ? (
          <div className="text-sm">
            <div className="font-medium text-foreground">{row.carrier}</div>
            {row.tracking && <div className="text-xs text-muted-foreground font-mono">{row.tracking}</div>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">—</span>
        ),
    },
    {
      accessorKey: "state",
      header: "Status",
      sortable: true,
      cell: ({ value }) => (
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", STATE_CLASS[value as PickingState])}>
          {PICKING_STATE_LABEL[value as PickingState]}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "240px",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.state === "draft" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "confirm")}>
              <Check className="h-3.5 w-3.5" /> Confirm
            </Button>
          )}
          {row.state === "confirmed" && (
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "reserve")}>
              <Boxes className="h-3.5 w-3.5" /> Reserve
            </Button>
          )}
          {(row.state === "assigned" || row.state === "confirmed") && (
            <Button className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200" onClick={() => act(row, "transfer")}>
              <Truck className="h-3.5 w-3.5" /> {validateLabel}
            </Button>
          )}
          {row.state !== "done" && row.state !== "cancel" && (
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
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">＋ New {title}</Button>
        </div>
      </div>

      {/* Operation KPIs */}
      <KpiGrid columns={4}>
        <KpiCard title={`Total ${title}`} value={String(stats.total)} icon={ClipboardList} tone="blue" />
        <KpiCard title="Ready" value={String(stats.ready)} icon={CircleCheck} tone="amber" tooltip="Reserved / ready to validate" />
        <KpiCard title="Waiting" value={String(stats.waiting)} icon={Clock} tone="violet" tooltip="Draft or awaiting availability" />
        <KpiCard title="Completed" value={String(stats.done)} icon={CheckCircle2} tone="emerald" tooltip="Validated / done" />
      </KpiGrid>

      {/* View switcher */}
      <ViewSwitcher
        active={view}
        onChange={(k) => setView(k as typeof view)}
        meta={`${filteredRows.length} of ${rows.length} operations`}
        tabs={[
          { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
          { key: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
          { key: "graph", label: "Graph", icon: <BarChart3 className="h-4 w-4" /> },
        ]}
      />

      {/* State filter also drives Kanban / Graph */}
      {view !== "list" && (
        <div className="grid gap-5 sm:grid-cols-3 w-full">
          <SearchableDropbox
            label="State"
            options={PICKING_STATE_OPTIONS as DropboxOption[]}
            value={selectedState}
            onChange={setSelectedState}
            placeholder="All states..."
            searchPlaceholder="Search state..."
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
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        title={`${title} Pipeline`}
        description={`${filteredRows.length} of ${rows.length} operations`}
        filters={
          <div className="grid gap-5 sm:grid-cols-3 w-full">
            <SearchableDropbox
              label="State"
              options={PICKING_STATE_OPTIONS as DropboxOption[]}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="All states..."
              searchPlaceholder="Search state..."
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
            className="h-9 px-4 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
            onClick={() => bulkValidate(selectedRows, clearSelection)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> {validateLabel} Selected
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
      )}

      {view === "kanban" && (
        <KanbanBoard
          data={filteredRows}
          loading={loading}
          idOf={(p) => p.id}
          stageOf={(p) => p.state}
          onMove={moveStage}
          stages={STATE_KEYS.map((s) => ({ key: s, label: PICKING_STATE_LABEL[s], accent: STATE_ACCENT[s] }))}
          renderCard={(p) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.scheduledDate}</span>
              </div>
              <p className="truncate text-sm font-semibold text-foreground">{p.partner}</p>
              <p className="truncate text-xs text-muted-foreground font-mono">{p.origin}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-[10px] font-semibold">{p.lines} lines</Badge>
                {p.carrier && <span className="truncate text-[10px] text-muted-foreground">{p.carrier}</span>}
              </div>
            </div>
          )}
        />
      )}

      {view === "graph" && (
        <GraphView data={graphData} formatValue={(v) => `${v}`} onSelect={() => setView("list")} />
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
          {feedback.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {feedback.message}
        </div>
      )}
    </>
  );
}
