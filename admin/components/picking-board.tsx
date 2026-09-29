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
  ClipboardList,
  Clock,
  CheckCircle2,
  CircleCheck,
  RotateCcw,
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

const STATE_CLASS: Record<PickingState, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  assigned: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancel: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
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
  const [rows, setRows] = useState<PickingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPickings(kind).then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [kind]);

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
        <KpiCard title="Ready" value={String(stats.ready)} icon={CircleCheck} tone="amber" badge="TO DO" tooltip="Reserved / ready to validate" />
        <KpiCard title="Waiting" value={String(stats.waiting)} icon={Clock} tone="violet" tooltip="Draft or awaiting availability" />
        <KpiCard title="Completed" value={String(stats.done)} icon={CheckCircle2} tone="emerald" tooltip="Validated / done" />
      </KpiGrid>

      {/* Pickings table */}
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
            className="h-8 text-xs font-semibold cursor-pointer"
            onClick={() => {
              alert(`${validateLabel} ${selectedRows.length} operation(s)`);
              clearSelection();
            }}
          >
            {validateLabel}
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
