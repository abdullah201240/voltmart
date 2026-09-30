"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { GraphView } from "@/components/ui/graph-view";
import {
  Factory,
  ClipboardList,
  Play,
  CheckCircle2,
  RotateCcw,
  List,
  LayoutGrid,
  BarChart3,
  Hourglass,
  Boxes,
} from "lucide-react";
import { useOps } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";
import { applyMoAction, setMoState } from "@/lib/data/workflows";
import {
  getManufacturingOrders,
  moStats,
  MO_FLOW,
  MO_STATE_OPTIONS,
  MO_STATE_ACCENT,
  type ManufacturingOrderRow,
  type MoState,
} from "@/lib/data/manufacturing";

function fmtMoney(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const MO_STAGES = [...MO_FLOW, "Cancelled" as MoState];

const MO_STATE_BADGE: Record<MoState, string> = {
  Planned: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "In Progress": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  "To Close": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

/** The single contextual next-action an operator can take on an MO. */
function moNextAction(state: MoState): { action: "confirm" | "start" | "produce" | "close"; label: string } | null {
  if (state === "Planned") return { action: "confirm", label: "Confirm" };
  if (state === "Confirmed") return { action: "start", label: "Start" };
  if (state === "In Progress") return { action: "produce", label: "Produce" };
  if (state === "To Close") return { action: "close", label: "Close" };
  return null;
}

const MO_COLUMNS: CentralTableColumn<ManufacturingOrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order",
    sortable: true,
    width: "130px",
    cell: ({ value }) => <span className="font-mono text-sm font-bold text-foreground">{value}</span>,
  },
  {
    accessorKey: "product",
    header: "Product",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.product}</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.sku}</div>
      </div>
    ),
  },
  {
    accessorKey: "qtyProduced",
    header: "Produced",
    align: "center",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((row.qtyProduced / row.qty) * 100)}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{row.qtyProduced}/{row.qty}</span>
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: "State",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", MO_STATE_BADGE[value as MoState])}>{value}</span>
    ),
  },
  {
    accessorKey: "origin",
    header: "Source",
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "scheduledDate",
    header: "Scheduled",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "responsible",
    header: "Responsible",
    cell: ({ value }) => <span className="text-sm text-muted-foreground font-medium">{value}</span>,
  },
  {
    accessorKey: "cost",
    header: "Cost",
    sortable: true,
    align: "right",
    cell: ({ row }) => <span className="font-mono font-bold text-sm text-foreground">{fmtMoney(row.cost)}</span>,
  },
];

export default function ManufacturingPage() {
  const version = useOps();
  const [rows, setRows] = useState<ManufacturingOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "list" | "graph">("kanban");
  const [stateFilter, setStateFilter] = useState("all");
  const appToast = useToast();

  useEffect(() => {
    let alive = true;
    getManufacturingOrders().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  const stats = useMemo(() => moStats(rows), [rows]);
  const filtered = useMemo(
    () => rows.filter((r) => stateFilter === "all" || r.state === stateFilter),
    [rows, stateFilter],
  );
  const graphData = useMemo(
    () =>
      MO_STAGES.map((s) => ({
        label: s,
        value: filtered.filter((r) => r.state === s).reduce((sum, r) => sum + r.qty, 0),
        color: MO_STATE_ACCENT[s] + "/70",
      })),
    [filtered],
  );

  const act = (row: ManufacturingOrderRow, action: "confirm" | "start" | "produce" | "close") => {
    const res = applyMoAction(row.id, action, { state: row.state, qty: row.qty, qtyProduced: row.qtyProduced }, Math.ceil(row.qty / 2));
    if (res.ok) {
      appToast.success("MO updated", res.message);
    } else {
      appToast.error("Update failed", res.message);
    }
  };
  const move = (row: ManufacturingOrderRow, toKey: string) => {
    const res = setMoState(row.id, toKey as MoState, { state: row.state, qty: row.qty, qtyProduced: row.qtyProduced });
    if (res.ok) {
      appToast.success("Stage updated", `Moved ${row.id} to ${toKey}`);
    } else {
      appToast.error("Transition failed", res.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Manufacturing</h1>
          <p className="text-sm text-muted-foreground">
            Plan and track manufacturing orders, bills of materials and work centre capacity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/manufacturing/bom" className="inline-flex h-11 items-center rounded-md border border-input bg-transparent px-5 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]">
            <ClipboardList className="mr-2 h-4 w-4" /> Bills of Materials
          </Link>
          <Link href="/manufacturing/workcenters" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]">
            <Factory className="mr-2 h-4 w-4" /> Work Centres
          </Link>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total MOs" value={String(stats.total)} icon={Factory} tone="blue" tooltip="All manufacturing orders" />
        <KpiCard title="Open" value={String(stats.open)} icon={Hourglass} tone="amber" tooltip="Not yet finished or cancelled" />
        <KpiCard title="In Progress / To Close" value={String(stats.inProgress)} icon={Play} tone="cyan" tooltip="Currently on the floor" />
        <KpiCard title="Units To Produce" value={String(stats.plannedUnits)} icon={Boxes} tone="violet" tooltip="Remaining units across open MOs" />
      </KpiGrid>

      {/* View switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card p-1 shadow-xs">
          <ViewTab active={view === "kanban"} onClick={() => setView("kanban")} icon={<LayoutGrid className="h-4 w-4" />}>Board</ViewTab>
          <ViewTab active={view === "list"} onClick={() => setView("list")} icon={<List className="h-4 w-4" />}>List</ViewTab>
          <ViewTab active={view === "graph"} onClick={() => setView("graph")} icon={<BarChart3 className="h-4 w-4" />}>Graph</ViewTab>
        </div>
        <div className="w-full sm:w-72">
          <SearchableDropbox
            options={MO_STATE_OPTIONS as DropboxOption[]}
            value={stateFilter}
            onChange={setStateFilter}
            placeholder="All states..."
            searchPlaceholder="Search state..."
          />
        </div>
      </div>

      {view === "kanban" && (
        <KanbanBoard
          data={filtered}
          loading={loading}
          idOf={(m) => m.id}
          stageOf={(m) => m.state}
          onMove={move}
          stages={MO_STAGES.map((s) => ({ key: s, label: s, accent: MO_STATE_ACCENT[s] }))}
          renderCard={(m) => {
            const next = moNextAction(m.state);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground">{m.id}</span>
                  <span className="text-[10px] text-muted-foreground">{m.scheduledDate}</span>
                </div>
                <p className="truncate text-sm font-semibold text-foreground">{m.product}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((m.qtyProduced / m.qty) * 100)}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{m.qtyProduced}/{m.qty}</span>
                </div>
                {next && (
                  <Button
                    size="sm"
                    className="h-8 w-full text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all duration-200"
                    onClick={() => act(m, next.action)}
                  >
                    {next.action === "close" ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : null}
                    {next.label}
                  </Button>
                )}
              </div>
            );
          }}
        />
      )}

      {view === "list" && (
        <CentralTable
          data={filtered}
          columns={MO_COLUMNS}
          loading={loading}
          loadingRows={6}
          title="Manufacturing Orders"
          description={`${filtered.length} of ${rows.length} MOs`}
          pagination
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
        />
      )}

      {view === "graph" && <GraphView data={graphData} formatValue={(v) => `${v} units`} />}
    </>
  );
}

function ViewTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 h-9 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
