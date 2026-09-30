"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { Warehouse, Plus } from "lucide-react";
import { getWarehouses, WAREHOUSE, type WarehouseRow } from "@/lib/data/settings";
import { addRecord } from "@/lib/data/ops";
import { RecordCreateDrawer, type CreateFieldDef } from "@/components/ui/record-create-drawer";
import { useToast } from "@/components/app-feedback";

const CREATE_FIELDS: CreateFieldDef[] = [
  { key: "name", label: "Warehouse Name", required: true, placeholder: "e.g. Khulna Depot" },
  { key: "code", label: "Short Code", required: true, placeholder: "KHL", helper: "Used as the location prefix (KHL/Stock)." },
  { key: "location", label: "Address", required: true, placeholder: "City, Country" },
  {
    key: "steps",
    label: "Route Steps",
    type: "select",
    required: true,
    defaultValue: "1",
    options: [
      { value: "1", label: "1-Step (direct ship)" },
      { value: "3", label: "Pick / Pack / Ship" },
    ],
  },
];

const WAREHOUSE_COLUMNS: CentralTableColumn<WarehouseRow>[] = [
  {
    accessorKey: "name",
    header: "Warehouse",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Warehouse className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.code}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "steps",
    header: "Route Steps",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant={value >= 3 ? "default" : "secondary"} className="text-xs font-semibold">
        {value >= 3 ? "Pick / Pack / Ship" : "1-Step"}
      </Badge>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    align: "center",
    cell: ({ value }) =>
      value ? <Badge variant="default" className="text-xs font-semibold">Active</Badge> : <span className="text-xs text-muted-foreground/60 italic">Disabled</span>,
  },
];

export default function SettingsWarehousesPage() {
  const appToast = useToast();
  const [rows, setRows] = useState<WarehouseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getWarehouses().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const createWarehouse = (v: Record<string, string>) => {
    const code = v.code.trim().toUpperCase();
    if (rows.some((r) => r.code.toUpperCase() === code)) return `Code "${code}" already exists.`;
    const row: WarehouseRow = {
      id: `WH-${Date.now().toString(36)}`,
      name: v.name,
      code,
      location: v.location,
      steps: Number(v.steps),
      active: true,
    };
    addRecord(WAREHOUSE, row as unknown as Record<string, unknown>);
    setRows((prev) => [row, ...prev]);
    appToast.success("Warehouse created", `\u201C${row.name}\u201D is now available for warehouse routing.`);
    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Physical sites and their fulfillment routes (steps).</p>
        </div>
        <Button
          className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Warehouse
        </Button>
      </div>

      <CentralTable
        data={rows}
        columns={WAREHOUSE_COLUMNS}
        loading={loading}
        loadingRows={4}
        searchable={false}
        title="Warehouses"
        description={`${rows.length} warehouse(s)`}
        pagination={false}
      />

      <RecordCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Warehouse"
        description="Register a physical site and its routes."
        submitLabel="Create Warehouse"
        fields={CREATE_FIELDS}
        onSubmit={createWarehouse}
      />
    </>
  );
}
