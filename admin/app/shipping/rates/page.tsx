"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Plus, RotateCcw } from "lucide-react";
import { getShippingRates, type ShippingRateRow } from "@/lib/data/shipping";

const RATE_COLUMNS: CentralTableColumn<ShippingRateRow>[] = [
  {
    accessorKey: "carrier",
    header: "Carrier",
    sortable: true,
    cell: ({ value }) => <span className="font-semibold text-sm text-foreground">{value}</span>,
  },
  {
    accessorKey: "zone",
    header: "Zone",
    sortable: true,
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-medium">{value}</Badge>,
  },
  {
    accessorKey: "basis",
    header: "Basis",
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "price",
    header: "Rate",
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{value}</span>,
  },
  {
    accessorKey: "freeAbove",
    header: "Free Over",
    align: "right",
    cell: ({ value }) =>
      value != null ? (
        <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">${value}</span>
      ) : (
        <span className="text-xs text-muted-foreground/60 italic">—</span>
      ),
  },
];

export default function ShippingRatesPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<ShippingRateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getShippingRates().then((d) => {
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

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (r) =>
        r.carrier.toLowerCase().includes(effectiveQuery) ||
        r.zone.toLowerCase().includes(effectiveQuery) ||
        r.basis.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shipping Rates</h1>
          <p className="text-sm text-muted-foreground">
            Weight and order-value based rate rules per carrier and zone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Add Rate
          </Button>
        </div>
      </div>

      <CentralTable
        data={filteredRows}
        columns={RATE_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search carrier, zone or basis..."
        title="Rate Rules"
        description={`${filteredRows.length} of ${rows.length} rates`}
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
