"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Ticket, CheckCircle2, TicketCheck, CalendarX, RotateCcw, Plus } from "lucide-react";
import {
  getVouchers,
  voucherStats,
  VOUCHER_STATUS_OPTIONS,
  VOUCHER_TYPE_OPTIONS,
  type VoucherRow,
} from "@/lib/data/discounts";

const STATUS_CLASS: Record<VoucherRow["status"], "default" | "secondary" | "outline"> = {
  Active: "default",
  Scheduled: "secondary",
  Expired: "outline",
};

const TYPE_CLASS: Record<VoucherRow["type"], "default" | "secondary" | "outline"> = {
  Fixed: "secondary",
  Percentage: "default",
  Shipping: "outline",
};

const VOUCHER_COLUMNS: CentralTableColumn<VoucherRow>[] = [
  {
    accessorKey: "code",
    header: "Code",
    sortable: true,
    cell: ({ value }) => (
      <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
        <Ticket className="h-4 w-4 text-muted-foreground" /> {value}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant={TYPE_CLASS[value as VoucherRow["type"]]} className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ value }) => <span className="font-mono text-sm font-bold text-foreground">{value}</span>,
  },
  {
    accessorKey: "used",
    header: "Usage",
    align: "center",
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {row.used}
        {row.usageLimit > 0 ? ` / ${row.usageLimit}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => <Badge variant={STATUS_CLASS[value as VoucherRow["status"]]} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
  },
];

export default function DiscountsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    let alive = true;
    getVouchers().then((d) => {
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
  const stats = useMemo(() => voucherStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((v) => {
      const matchesStatus = selectedStatus === "all" || v.status === selectedStatus;
      const matchesType = selectedType === "all" || v.type === selectedType;
      const matchesQuery =
        !effectiveQuery ||
        v.code.toLowerCase().includes(effectiveQuery) ||
        v.discount.toLowerCase().includes(effectiveQuery);
      return matchesStatus && matchesType && matchesQuery;
    });
  }, [rows, selectedStatus, selectedType, effectiveQuery]);

  const clearFilters = () => {
    setSelectedStatus("all");
    setSelectedType("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (selectedStatus !== "all" ? 1 : 0) + (selectedType !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Discounts &amp; Vouchers</h1>
          <p className="text-sm text-muted-foreground">
            Coupon codes buyers enter at checkout — fixed, percentage or free shipping.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/discounts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Voucher
            </Link>
          </Button>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Vouchers" value={String(stats.total)} icon={Ticket} tone="blue" />
        <KpiCard title="Active" value={String(stats.active)} icon={CheckCircle2} tone="emerald" badge="LIVE" />
        <KpiCard title="Total Redemptions" value={String(stats.redeemed)} icon={TicketCheck} tone="violet" tooltip="Times vouchers have been applied" />
        <KpiCard title="Expired" value={String(stats.expired)} icon={CalendarX} tone="rose" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={VOUCHER_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search code or discount..."
        title="Vouchers"
        description={`${filteredRows.length} of ${rows.length} vouchers`}
        filters={
          <div className="grid gap-5 sm:grid-cols-2 w-full">
            <SearchableDropbox
              label="Status"
              options={VOUCHER_STATUS_OPTIONS as DropboxOption[]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="All statuses..."
              searchPlaceholder="Search status..."
            />
            <SearchableDropbox
              label="Type"
              options={VOUCHER_TYPE_OPTIONS as DropboxOption[]}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="All types..."
              searchPlaceholder="Search type..."
            />
          </div>
        }
        activeFiltersCount={activeFiltersCount}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
            </Button>
          )
        }
      />
    </>
  );
}
