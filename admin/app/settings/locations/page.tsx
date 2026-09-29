"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { MapPin, Plus } from "lucide-react";
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
    header: "Location",
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
    header: "Warehouse",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant={TYPE_CLASS[value as LocationRow["type"]]} className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "products",
    header: "Products",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>,
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

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground">The storage-location tree inside each warehouse.</p>
        </div>
        <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Location
        </Button>
      </div>

      <CentralTable
        data={rows}
        columns={LOCATION_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable={false}
        title="Location Tree"
        description={`${rows.length} location(s)`}
        pagination={false}
      />
    </>
  );
}
