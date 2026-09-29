"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { Percent, Plus } from "lucide-react";
import { getTaxes, type TaxRow } from "@/lib/data/settings";

const TAX_COLUMNS: CentralTableColumn<TaxRow>[] = [
  {
    accessorKey: "name",
    header: "Tax",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Percent className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: "Country / Region",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "scope",
    header: "Applies To",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant={value === "Sales" ? "default" : "secondary"} className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "amount",
    header: "Rate",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{Number(value) === 0 ? "0% (exempt)" : `${value}%`}</span>,
  },
  {
    accessorKey: "active",
    header: "Status",
    align: "center",
    cell: ({ value }) =>
      value ? <Badge variant="default" className="text-xs font-semibold">Active</Badge> : <span className="text-xs text-muted-foreground/60 italic">Inactive</span>,
  },
];

export default function SettingsTaxesPage() {
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getTaxes().then((d) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Taxes</h1>
          <p className="text-sm text-muted-foreground">Tax rates applied to customer invoices and vendor bills.</p>
        </div>
        <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Tax
        </Button>
      </div>

      <CentralTable
        data={rows}
        columns={TAX_COLUMNS}
        loading={loading}
        loadingRows={5}
        searchable={false}
        title="Tax Rates"
        description={`${rows.length} tax(es)`}
        pagination={false}
      />
    </>
  );
}
