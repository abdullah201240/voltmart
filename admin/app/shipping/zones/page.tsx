"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Globe2, Map, Timer, RotateCcw, Plus } from "lucide-react";
import { getShippingZones, type ShippingZoneRow } from "@/lib/data/shipping";

const ZONE_COLUMNS: CentralTableColumn<ShippingZoneRow>[] = [
  {
    accessorKey: "name",
    header: "Zone",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Globe2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{value}</span>
      </div>
    ),
  },
  {
    accessorKey: "countries",
    header: "Countries",
    cell: ({ value }) => (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((c) => (
          <Badge key={c} variant="outline" className="text-xs font-medium">
            {c}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "carriers",
    header: "Carriers",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="secondary" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "deliveryDays",
    header: "Delivery Window",
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm text-foreground">{value}</span>,
  },
];

export default function ShippingZonesPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<ShippingZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getShippingZones().then((d) => {
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

  const stats = useMemo(
    () => ({
      total: rows.length,
      countries: rows.reduce((s, r) => s + r.countries.length, 0),
      carriers: rows.reduce((s, r) => s + r.carriers, 0),
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (z) =>
        z.name.toLowerCase().includes(effectiveQuery) ||
        z.countries.some((c) => c.toLowerCase().includes(effectiveQuery))
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shipping Zones</h1>
          <p className="text-sm text-muted-foreground">
            Group countries into zones and attach carriers with delivery windows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/shipping/zones/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Zones" value={String(stats.total)} icon={Globe2} tone="blue" />
        <KpiCard title="Countries Covered" value={String(stats.countries)} icon={Map} tone="emerald" />
        <KpiCard title="Carrier Links" value={String(stats.carriers)} icon={Timer} tone="violet" tooltip="Carrier-to-zone assignments" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={ZONE_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search zone or country..."
        title="Zones"
        description={`${filteredRows.length} of ${rows.length} zones`}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          effectiveQuery.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSearchTableQuery("")} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Clear Search
            </Button>
          )
        }
      />
    </>
  );
}
