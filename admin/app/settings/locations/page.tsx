"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { MapPin, Plus } from "lucide-react";
import { getLocations, LOCATION, type LocationRow } from "@/lib/data/settings";
import { addRecord } from "@/lib/data/ops";
import { RecordCreateDrawer, type CreateFieldDef } from "@/components/ui/record-create-drawer";
import { useToast } from "@/components/app-feedback";

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
  const appToast = useToast();
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

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

  // Warehouse options are derived from the loaded warehouses.
  const CREATE_FIELDS: CreateFieldDef[] = [
    { key: "name", label: "Location Name", required: true, placeholder: "e.g. Shelf B3" },
    {
      key: "warehouse",
      label: "Warehouse",
      type: "select",
      required: true,
      options: [...new Set(rows.map((r) => r.warehouse))].map((w) => ({ value: w, label: w })),
    },
    {
      key: "type",
      label: "Usage Type",
      type: "select",
      required: true,
      defaultValue: "Stock",
      options: (["Input", "Stock", "Output", "Transit", "Shipment"] as const).map((t) => ({ value: t, label: t })),
    },
    { key: "parent", label: "Parent Location", required: true, placeholder: "e.g. Stock or WH", helper: "Internal path it lives under." },
  ];

  const createLocation = (v: Record<string, string>) => {
    if (rows.some((r) => r.name.toLowerCase() === v.name.trim().toLowerCase() && r.warehouse === v.warehouse)) {
      return `A location named "${v.name}" already exists in ${v.warehouse}.`;
    }
    const row: LocationRow = {
      id: `L-${Date.now().toString(36)}`,
      name: v.name,
      warehouse: v.warehouse,
      type: v.type as LocationRow["type"],
      products: 0,
      parent: v.parent,
    };
    addRecord(LOCATION, row as unknown as Record<string, unknown>);
    setRows((prev) => [row, ...prev]);
    appToast.success("Location created", `\u201C${row.name}\u201D is now available for stock movements.`);
    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground">The storage-location tree inside each warehouse.</p>
        </div>
        <Button
          className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => setCreateOpen(true)}
        >
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

      <RecordCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Location"
        description="Add a shelf, zone or transit point to the tree."
        submitLabel="Create Location"
        fields={CREATE_FIELDS}
        onSubmit={createLocation}
      />
    </>
  );
}
