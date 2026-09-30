"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { ArrowLeft, ClipboardList, Package, Cog, Cpu, Plus } from "lucide-react";
import { getBoms, type BomRow, type BomType } from "@/lib/data/manufacturing";

function fmtMoney(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const TYPE_BADGE: Record<BomType, string> = {
  normal: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  phantom: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  kit: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const BOM_COLUMNS: CentralTableColumn<BomRow>[] = [
  {
    accessorKey: "id",
    header: "BoM",
    sortable: true,
    width: "110px",
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
    accessorKey: "type",
    header: "Type",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block capitalize", TYPE_BADGE[value as BomType])}>{value}</span>
    ),
  },
  {
    accessorKey: "components",
    header: "Components",
    align: "center",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-semibold gap-1">
        <Package className="h-3 w-3" /> {row.components.length}
      </Badge>
    ),
  },
  {
    id: "opsCount",
    accessorKey: "operations",
    header: "Operations",
    align: "center",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-semibold gap-1">
        <Cog className="h-3 w-3" /> {row.operations.length}
      </Badge>
    ),
  },
  {
    id: "cycleTime",
    accessorKey: "operations",
    header: "Cycle Time",
    align: "right",
    cell: ({ row }) => {
      const mins = row.operations.reduce((s, o) => s + o.duration, 0);
      return <span className="font-mono text-sm text-foreground">{mins ? `${mins} min` : "—"}</span>;
    },
  },
  {
    accessorKey: "unitCost",
    header: "Unit Cost",
    sortable: true,
    align: "right",
    cell: ({ row }) => <span className="font-mono font-bold text-sm text-foreground">{fmtMoney(row.unitCost)}</span>,
  },
];

export default function BomPage() {
  const [rows, setRows] = useState<BomRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getBoms().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const totalCost = rows.reduce((s, r) => s + r.unitCost, 0);
  const withOps = rows.filter((r) => r.operations.length > 0).length;

  return (
    <>
      <Link href="/manufacturing" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Manufacturing
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bills of Materials</h1>
          <p className="text-sm text-muted-foreground">Product recipes — components, operations and unit cost.</p>
        </div>
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/manufacturing/bom/new">
            <Plus className="mr-2 h-4 w-4" /> Create BoM
          </Link>
        </Button>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Bills of Materials" value={String(rows.length)} icon={ClipboardList} tone="blue" />
        <KpiCard title="Manufacturable (with ops)" value={String(withOps)} icon={Cpu} tone="cyan" />
        <KpiCard title="Total Recipe Cost" value={fmtMoney(totalCost)} icon={Package} tone="emerald" />
      </KpiGrid>

      <CentralTable
        data={rows}
        columns={BOM_COLUMNS}
        loading={loading}
        loadingRows={5}
        searchable
        searchPlaceholder="Search BoM or product..."
        title="All Bills of Materials"
        description={`${rows.length} recipes`}
        pagination
        pageSize={10}
      />
    </>
  );
}
