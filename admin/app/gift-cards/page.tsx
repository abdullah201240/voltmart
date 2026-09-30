"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { CreateFlow } from "@/components/ui/create-flow";
import { useAdminLayout } from "@/components/admin-shell";
import { useOps } from "@/lib/data/ops";
import { Gift, Wallet, TrendingDown, Clock } from "lucide-react";
import {
  getGiftCards,
  giftCardStats,
  GIFT_CARD_STATE_OPTIONS,
  GIFT_CARD_STATE_LABEL_META,
  type GiftCardRow,
  type GiftCardState,
} from "@/lib/data/giftcards";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const COLUMNS: CentralTableColumn<GiftCardRow>[] = [
  {
    accessorKey: "code",
    header: "Card Code",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-mono font-bold text-sm text-foreground truncate">{row.code}</div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{row.id}</div>
      </div>
    ),
  },
  {
    accessorKey: "product",
    header: "Tied Product",
    cell: ({ row }) =>
      row.product ? (
        <span className="text-sm text-foreground">{row.product}</span>
      ) : (
        <span className="text-sm text-muted-foreground/60">Open amount</span>
      ),
  },
  {
    accessorKey: "state",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", GIFT_CARD_STATE_LABEL_META[value as GiftCardState])}>
        {value}
      </span>
    ),
  },
  {
    accessorKey: "initialBalance",
    header: "Initial",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-muted-foreground">{money(value as number)}</span>,
  },
  {
    accessorKey: "currentBalance",
    header: "Current Balance",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm tabular-nums text-foreground">{money(value as number)}</span>,
  },
  {
    accessorKey: "expiry",
    header: "Expires",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
];

export default function GiftCardsPage() {
  const { searchQuery } = useAdminLayout();
  useOps();

  const [rows, setRows] = useState<GiftCardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getGiftCards().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => giftCardStats(rows), [rows]);
  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filtered = useMemo(() => {
    return rows.filter((g) => {
      const matchesState = stateFilter === "all" || g.state === stateFilter;
      const matchesQuery =
        !effectiveQuery ||
        g.code.toLowerCase().includes(effectiveQuery) ||
        g.id.toLowerCase().includes(effectiveQuery) ||
        (g.product ?? "").toLowerCase().includes(effectiveQuery);
      return matchesState && matchesQuery;
    });
  }, [rows, stateFilter, effectiveQuery]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-sm text-muted-foreground">
            Stored-value cards issued to customers — track balances, activations and expiry.
          </p>
        </div>
        <CreateFlow<GiftCardRow>
          model="gift.card"
          buttonLabel="Issue Card"
          drawerTitle="Issue a gift card"
          drawerDescription="Creates a pending card with an initial balance, ready to activate."
          fields={[
            { key: "amount", label: "Initial Balance (BDT)", type: "number", required: true, placeholder: "5000" },
            { key: "product", label: "Tied Product (optional)", placeholder: "MacBook Pro 14 M3 Pro", colSpan: 2 },
            { key: "expiry", label: "Expiry Date", required: true, placeholder: "Sep 29, 2027" },
          ]}
          validate={(v) => {
            if (!v.amount || Number.isNaN(Number(v.amount)) || Number(v.amount) <= 0) return "Enter a valid balance.";
            if (!v.expiry?.trim()) return "Expiry date is required.";
            return null;
          }}
          build={(v) => {
            const bal = Number(v.amount);
            const tail = Math.floor(1000 + Math.random() * 9000);
            return {
              id: `GC-${Date.now().toString().slice(-5)}`,
              code: `VMRT-••••-••••-${tail}`,
              state: "Pending",
              initialBalance: bal,
              currentBalance: bal,
              currency: "BDT",
              issued: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              expiry: v.expiry.trim(),
              product: v.product?.trim() || undefined,
            };
          }}
          onCreated={(row) => setRows((prev) => [row, ...prev])}
          successMessage="Gift card issued"
        />
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Outstanding Value" value={money(stats.outstanding)} icon={Wallet} tone="emerald" tooltip="Sum of current balances on active & pending cards." />
        <KpiCard title="Active Cards" value={String(stats.active)} icon={Gift} tone="blue" tooltip="Activated cards available to spend." />
        <KpiCard title="Pending Activation" value={String(stats.pending)} icon={Clock} tone="amber" tooltip="Issued but not yet activated." />
        <KpiCard title="Total Redeemed" value={money(stats.redeemed)} icon={TrendingDown} tone="violet" tooltip="Cumulative value already spent from cards." />
      </KpiGrid>

      <CentralTable
        data={filtered}
        columns={COLUMNS}
        loading={loading}
        loadingRows={5}
        keyExtractor={(g) => g.id}
        searchable
        searchPlaceholder="Search card code, ID or product..."
        title="Gift Cards"
        description={`${filtered.length} of ${rows.length} cards · ${money(stats.outstanding)} outstanding`}
        filters={
          <div className="w-full sm:max-w-xs">
            <SearchableDropbox
              label="Status"
              options={GIFT_CARD_STATE_OPTIONS as DropboxOption[]}
              value={stateFilter}
              onChange={setStateFilter}
              placeholder="All states..."
              searchPlaceholder="Search status..."
            />
          </div>
        }
        activeFiltersCount={stateFilter !== "all" ? 1 : 0}
        onClearFilters={() => setStateFilter("all")}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
      />
    </div>
  );
}
