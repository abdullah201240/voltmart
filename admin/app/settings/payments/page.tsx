"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { CreditCard, Plus } from "lucide-react";
import { getPaymentProviders, type PaymentProviderRow } from "@/lib/data/settings";
import { useToast } from "@/components/app-feedback";



function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const PROVIDER_COLUMNS: CentralTableColumn<PaymentProviderRow>[] = [
  {
    accessorKey: "name",
    header: "Provider",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{row.kind}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "channels",
    header: "Channels",
    cell: ({ value }) => (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((c) => (
          <Badge key={c} variant="outline" className="text-xs font-medium">{c}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "captured",
    header: "Captured",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value)}</span>,
  },
  {
    accessorKey: "active",
    header: "Status",
    align: "center",
    cell: ({ value }) =>
      value ? <Badge variant="default" className="text-xs font-semibold">Enabled</Badge> : <span className="text-xs text-muted-foreground/60 italic">Disabled</span>,
  },
];

export default function SettingsPaymentsPage() {
  const appToast = useToast();
  const [rows, setRows] = useState<PaymentProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getPaymentProviders().then((d) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Providers</h1>
          <p className="text-sm text-muted-foreground">Card, wallet, bank and cash providers enabled per channel.</p>
        </div>
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/settings/payments/new">
            <Plus className="mr-2 h-4 w-4" /> Add Provider
          </Link>
        </Button>
      </div>

      <CentralTable
        data={rows}
        columns={PROVIDER_COLUMNS}
        loading={loading}
        loadingRows={4}
        searchable={false}
        title="Providers"
        description={`${rows.length} provider(s)`}
        pagination={false}
      />

    </>
  );
}
