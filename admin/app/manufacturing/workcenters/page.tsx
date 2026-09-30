"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { ArrowLeft, Factory, Gauge, Timer, Users2, Plus } from "lucide-react";
import { getWorkCenters, type WorkCenterRow } from "@/lib/data/manufacturing";

const WC_COLUMNS: CentralTableColumn<WorkCenterRow>[] = [
  {
    accessorKey: "name",
    header: "Work Centre",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.code}</div>
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    align: "center",
    cell: ({ value }) => (
      <Badge variant="outline" className="text-xs font-semibold gap-1">
        <Users2 className="h-3 w-3" /> {value} MOs
      </Badge>
    ),
  },
  {
    accessorKey: "efficiency",
    header: "Efficiency",
    sortable: true,
    align: "center",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, row.efficiency)}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{row.efficiency}%</span>
      </div>
    ),
  },
  {
    accessorKey: "cycleTime",
    header: "Cycle / MO",
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm text-foreground">{value} min</span>,
  },
  {
    accessorKey: "targetMove",
    header: "Move Time",
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm text-muted-foreground">{value} min</span>,
  },
];

export default function WorkCentersPage() {
  const [rows, setRows] = useState<WorkCenterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getWorkCenters().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const avgEff = rows.length ? Math.round(rows.reduce((s, r) => s + r.efficiency, 0) / rows.length) : 0;
  const totalCapacity = rows.reduce((s, r) => s + r.capacity, 0);

  return (
    <>
      <Link href="/manufacturing" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Manufacturing
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Work Centres</h1>
          <p className="text-sm text-muted-foreground">Machines and stations — capacity, efficiency and cycle times.</p>
        </div>
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/manufacturing/workcenters/new">
            <Plus className="mr-2 h-4 w-4" /> Create Work Centre
          </Link>
        </Button>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Work Centres" value={String(rows.length)} icon={Factory} tone="blue" />
        <KpiCard title="Total Capacity" value={`${totalCapacity} MOs`} icon={Users2} tone="cyan" />
        <KpiCard title="Avg. Efficiency" value={`${avgEff}%`} icon={Gauge} tone="emerald" />
      </KpiGrid>

      <CentralTable
        data={rows}
        columns={WC_COLUMNS}
        loading={loading}
        loadingRows={5}
        title="All Work Centres"
        description={`${rows.length} stations`}
        pagination
        pageSize={10}
      />

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Timer className="h-3.5 w-3.5" /> Cycle and move times feed the MO scheduling and capacity calculations.
      </p>
    </>
  );
}
