"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { MapPin, Plus, Boxes, Warehouse, CheckCircle2, Info } from "lucide-react";
import { getLocations, type LocationRow } from "@/lib/data/settings";

const TYPE_CLASS: Record<LocationRow["type"], "default" | "secondary" | "outline"> = {
  Input: "secondary",
  Stock: "default",
  Output: "secondary",
  Transit: "outline",
  Shipment: "outline",
};

const LOCATION_COLUMNS: CentralTableColumn<LocationRow>[] = [
  {
    accessorKey: "name",
    header: "Shelf / Storage Location",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">under {row.parent}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "warehouse",
    header: "Warehouse Site",
    sortable: true,
    cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant={TYPE_CLASS[value as LocationRow["type"]]} className="text-xs font-semibold">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "products",
    header: "Products Stored",
    sortable: true,
    align: "right",
    cell: ({ value }) => (
      <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>
    ),
  },
];

export default function SettingsLocationsPage() {
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getLocations().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const stockShelves = rows.filter((r) => r.type === "Stock").length;
    const warehousesSet = new Set(rows.map((r) => r.warehouse));
    return {
      total,
      stockShelves,
      warehousesCount: warehousesSet.size,
    };
  }, [rows]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shelves &amp; Storage Locations</h1>
          <p className="text-sm text-muted-foreground">
            Aisles, racks, shelves, and bins inside each warehouse (e.g. Shelf A1, Shelf A2, BIN-A-01-01).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" className="h-11 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/settings/warehouses">
              <Warehouse className="mr-2 h-4 w-4" /> View Warehouses
            </Link>
          </Button>
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/settings/locations/new">
              <Plus className="mr-2 h-4 w-4" /> Add Shelf / Bin
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard
          title="Total Storage Nodes"
          value={String(stats.total)}
          icon={Boxes}
          tone="blue"
          tooltip="Total internal storage locations defined"
        />
        <KpiCard
          title="Stock Shelves & Bins"
          value={String(stats.stockShelves)}
          icon={CheckCircle2}
          tone="emerald"
          tooltip="Internal picking locations holding sellable stock"
        />
        <KpiCard
          title="Warehouses Covered"
          value={String(stats.warehousesCount)}
          icon={Warehouse}
          tone="violet"
          tooltip="Warehouses mapped to internal shelves"
        />
      </KpiGrid>

      {/* Advisory Callout */}
      <div className="p-4 rounded-lg border border-border/80 bg-muted/20 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
          <div className="font-semibold text-foreground text-sm">Are shelves and bins mandatory?</div>
          <p>
            <strong>No, shelves are completely optional.</strong> If you run a small-to-medium business or store all your inventory in one central room, 
            you do not need to configure individual shelves or bins. Your products will track stock directly against the <strong>Warehouse</strong>. 
            Only configure shelves if you have large racking aisles and need pickers to know the exact bin (e.g. <em>Aisle 2, Shelf B</em>).
          </p>
        </div>
      </div>

      <CentralTable
        data={rows}
        columns={LOCATION_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search shelf, bin or warehouse..."
        title="Warehouse Shelf Tree"
        description={`${rows.length} storage location(s)`}
        pagination={false}
      />
    </>
  );
}
