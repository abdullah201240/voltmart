"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Warehouse, Plus, Boxes, Route, MapPin, Info, ArrowUpRight } from "lucide-react";
import { getWarehouses, getLocations, type WarehouseRow, type LocationRow } from "@/lib/data/settings";

const TYPE_CLASS: Record<LocationRow["type"], "default" | "secondary" | "outline"> = {
  Input: "secondary",
  Stock: "default",
  Output: "secondary",
  Transit: "outline",
  Shipment: "outline",
};

export default function SettingsWarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"warehouses" | "shelves">("warehouses");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    Promise.all([getWarehouses(), getLocations()]).then(([whs, locs]) => {
      if (alive) {
        setWarehouses(whs);
        setLocations(locs);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Compute shelves count per warehouse
  const shelvesPerWarehouse = useMemo(() => {
    const map: Record<string, number> = {};
    for (const loc of locations) {
      map[loc.warehouse] = (map[loc.warehouse] || 0) + 1;
    }
    return map;
  }, [locations]);

  const stats = useMemo(
    () => ({
      totalWarehouses: warehouses.length,
      activeWarehouses: warehouses.filter((w) => w.active).length,
      totalShelves: locations.length,
      stockShelves: locations.filter((l) => l.type === "Stock").length,
      multiStepRoutes: warehouses.filter((w) => w.steps >= 3).length,
    }),
    [warehouses, locations]
  );

  const filteredLocations = useMemo(() => {
    if (warehouseFilter === "all") return locations;
    return locations.filter((l) => l.warehouse.toLowerCase().includes(warehouseFilter.toLowerCase()));
  }, [locations, warehouseFilter]);

  const warehouseColumns: CentralTableColumn<WarehouseRow>[] = [
    {
      accessorKey: "name",
      header: "Warehouse",
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <Warehouse className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.code}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location (City)",
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      id: "shelves",
      header: "Shelves & Bins",
      align: "center",
      cell: ({ row }) => {
        const count = shelvesPerWarehouse[row.name] || 0;
        return (
          <button
            type="button"
            onClick={() => {
              setWarehouseFilter(row.name);
              setActiveTab("shelves");
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
          >
            <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{count} {count === 1 ? "shelf / bin" : "shelves / bins"}</span>
            <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
          </button>
        );
      },
    },
    {
      accessorKey: "steps",
      header: "Fulfillment Steps",
      sortable: true,
      align: "center",
      cell: ({ value }) => (
        <Badge variant={value >= 3 ? "default" : "secondary"} className="text-xs font-semibold">
          {value >= 3 ? "3-Step (Pick / Pack / Ship)" : "1-Step (Direct Ship)"}
        </Badge>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      align: "center",
      cell: ({ value }) =>
        value ? (
          <Badge variant="default" className="text-xs font-semibold">Active</Badge>
        ) : (
          <span className="text-xs text-muted-foreground/60 italic">Disabled</span>
        ),
    },
  ];

  const locationColumns: CentralTableColumn<LocationRow>[] = [
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
      header: "Warehouse",
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "type",
      header: "Location Type",
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
      header: "Assigned Products",
      sortable: true,
      align: "right",
      cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Warehouses &amp; Shelves</h1>
          <p className="text-sm text-muted-foreground">
            Physical warehouse sites, routing steps, and internal shelves, racks &amp; storage bins.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" className="h-11 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/settings/locations/new">
              <Boxes className="mr-2 h-4 w-4 text-primary" /> Add Shelf / Bin
            </Link>
          </Button>
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Link href="/settings/warehouses/new">
              <Plus className="mr-2 h-4 w-4" /> Add Warehouse
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard
          title="Physical Warehouses"
          value={String(stats.totalWarehouses)}
          icon={Warehouse}
          tone="blue"
          tooltip={`${stats.activeWarehouses} active operational sites`}
        />
        <KpiCard
          title="Shelves & Storage Bins"
          value={String(stats.totalShelves)}
          icon={Boxes}
          tone="emerald"
          tooltip={`${stats.stockShelves} picking shelves configured across warehouses`}
        />
        <KpiCard
          title="Multi-Step Routes"
          value={String(stats.multiStepRoutes)}
          icon={Route}
          tone="violet"
          tooltip="Warehouses configured with Pick / Pack / Ship 3-step routing"
        />
      </KpiGrid>

      {/* Advisory Callout: Do you need shelves? */}
      <div className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>Do you need shelves and bin options?</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground leading-relaxed">
          <div className="p-3 rounded-md bg-card border border-border/60 space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span> For Small Stores / Standard Retail (Shelves NOT needed)
            </div>
            <p>
              If your inventory is stored in a single room or shop, you <strong>do not need shelves</strong>. 
              Tracking stock simply at the <strong>Warehouse level</strong> (e.g. <em>Main Warehouse: 50 pcs</em>) is completely sufficient, much faster, and zero hassle.
            </p>
          </div>
          <div className="p-3 rounded-md bg-card border border-border/60 space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="text-blue-500 font-bold">✓</span> For Large Warehouses &amp; Fulfillment Centers (Shelves helpful)
            </div>
            <p>
              If you operate multi-aisle warehouses with dedicated warehouse staff, configuring <strong>Shelves &amp; Bins</strong> (e.g. <em>Shelf A1, Rack B-02</em>) 
              helps pickers locate products quickly with handheld barcode scanners.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "warehouses" | "shelves")} className="w-full space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="warehouses" className="cursor-pointer text-xs font-semibold gap-2">
              <Warehouse className="h-3.5 w-3.5" />
              Warehouses ({warehouses.length})
            </TabsTrigger>
            <TabsTrigger value="shelves" className="cursor-pointer text-xs font-semibold gap-2">
              <Boxes className="h-3.5 w-3.5" />
              Shelves &amp; Storage Bins ({locations.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === "shelves" && warehouseFilter !== "all" && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Filtered: {warehouseFilter}
              </Badge>
              <button
                type="button"
                onClick={() => setWarehouseFilter("all")}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Show All
              </button>
            </div>
          )}
        </div>

        <TabsContent value="warehouses" className="mt-0">
          <CentralTable
            data={warehouses}
            columns={warehouseColumns}
            loading={loading}
            loadingRows={4}
            searchable={false}
            title="Warehouse Sites"
            description={`${warehouses.length} physical facility(s)`}
            pagination={false}
          />
        </TabsContent>

        <TabsContent value="shelves" className="mt-0 space-y-4">
          <CentralTable
            data={filteredLocations}
            columns={locationColumns}
            loading={loading}
            loadingRows={6}
            searchable
            searchPlaceholder="Search shelf or location..."
            title="Shelves, Racks &amp; Bins Matrix"
            description={`${filteredLocations.length} storage location(s)`}
            pagination={false}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
