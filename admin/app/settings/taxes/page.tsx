"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { Percent, Plus } from "lucide-react";
import { getTaxes, TAX, type TaxRow } from "@/lib/data/settings";
import { addRecord } from "@/lib/data/ops";
import { RecordCreateDrawer, type CreateFieldDef } from "@/components/ui/record-create-drawer";
import { useToast } from "@/components/app-feedback";

const CREATE_FIELDS: CreateFieldDef[] = [
  { key: "name", label: "Tax Name", required: true, placeholder: "e.g. VAT 15%" },
  { key: "country", label: "Country / Region", required: true, defaultValue: "Bangladesh" },
  {
    key: "scope",
    label: "Applies To",
    type: "select",
    required: true,
    defaultValue: "Sales",
    options: [
      { value: "Sales", label: "Sales (customer invoices)" },
      { value: "Purchases", label: "Purchases (vendor bills)" },
    ],
  },
  { key: "amount", label: "Rate (%)", type: "number", required: true, placeholder: "15", helper: "Use 0 for an exempt tax." },
];

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
  const appToast = useToast();
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

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

  const createTax = (v: Record<string, string>) => {
    const amount = Number(v.amount);
    if (Number.isNaN(amount) || amount < 0 || amount > 100) return "Rate must be a number between 0 and 100.";
    const row: TaxRow = {
      id: `TX-${Date.now().toString(36)}`,
      name: v.name,
      country: v.country,
      amount,
      scope: v.scope === "Purchases" ? "Purchases" : "Sales",
      active: true,
    };
    addRecord(TAX, row as unknown as Record<string, unknown>);
    setRows((prev) => [row, ...prev]);
    appToast.success("Tax created", `“${row.name}” is now available on invoices and bills.`);
    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Taxes</h1>
          <p className="text-sm text-muted-foreground">Tax rates applied to customer invoices and vendor bills.</p>
        </div>
        <Button
          className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => setCreateOpen(true)}
        >
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

      <RecordCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New Tax"
        description="Define a rate and where it applies."
        submitLabel="Create Tax"
        fields={CREATE_FIELDS}
        onSubmit={createTax}
      />
    </>
  );
}
