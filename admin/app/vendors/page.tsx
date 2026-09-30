"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Store, Banknote, Timer, Target, RotateCcw } from "lucide-react";
import { getVendors, vendorStats, type VendorRow } from "@/lib/data/purchasing";
import { CreateFlow } from "@/components/ui/create-flow";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const VENDOR_COLUMNS: CentralTableColumn<VendorRow>[] = [
  {
    accessorKey: "name",
    header: "Vendor",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "products",
    header: "Products",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "leadTime",
    header: "Lead Time",
    sortable: true,
    align: "center",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value} days</span>,
  },
  {
    accessorKey: "onTimeRate",
    header: "On-Time",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge
        variant={value >= 95 ? "default" : value >= 90 ? "secondary" : "outline"}
        className="text-xs font-semibold tabular-nums"
      >
        {value}%
      </Badge>
    ),
  },
  {
    accessorKey: "totalPurchased",
    header: "Total Purchased",
    sortable: true,
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{money(value)}</span>,
  },
];

export default function VendorsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getVendors().then((d) => {
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
  const stats = useMemo(() => vendorStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (v) =>
        v.name.toLowerCase().includes(effectiveQuery) ||
        v.country.toLowerCase().includes(effectiveQuery) ||
        v.email.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">
            Your suppliers — vendor prices, lead times and delivery performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateFlow<VendorRow>
            model="res.partner.vendor"
            buttonLabel="Add Vendor"
            drawerTitle="New Vendor"
            drawerDescription="Register a supplier for purchasing and lead-time tracking."
            fields={[
              { key: "name", label: "Vendor Name", required: true, placeholder: "e.g. TechImport Ltd" },
              { key: "email", label: "Contact Email", required: true, placeholder: "sales@vendor.com" },
              { key: "country", label: "Country", defaultValue: "Bangladesh" },
              { key: "leadTime", label: "Lead Time (days)", type: "number", defaultValue: "7", helper: "Average days from PO confirmation to delivery." },
            ]}
            validate={(v) => {
              const email = v.email.trim().toLowerCase();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
              if (rows.some((r) => r.email.toLowerCase() === email)) return "A vendor with this email already exists.";
              return null;
            }}
            build={(v) => ({
              id: `VND-${Date.now().toString(36)}`,
              name: v.name.trim(),
              email: v.email.trim().toLowerCase(),
              country: v.country.trim() || "Bangladesh",
              products: 0,
              leadTime: Math.max(0, Number(v.leadTime) || 0),
              onTimeRate: 0,
              totalPurchased: 0,
            })}
            onCreated={(row) => setRows((prev) => [row, ...prev])}
            successMessage="Vendor created"
          />
        </div>
      </div>

      {/* Vendor KPIs */}
      <KpiGrid columns={4}>
        <KpiCard title="Active Vendors" value={String(stats.total)} icon={Store} tone="blue" />
        <KpiCard title="Total Purchased" value={money(stats.spend)} icon={Banknote} tone="emerald" tooltip="Annual purchase spend" />
        <KpiCard title="Avg Lead Time" value={`${stats.avgLead}d`} icon={Timer} tone="amber" tooltip="Average days from PO to receipt" />
        <KpiCard title="Avg On-Time Rate" value={`${stats.avgOnTime}%`} icon={Target} tone="violet" tooltip="Average vendor delivery reliability" />
      </KpiGrid>

      {/* Vendors table */}
      <CentralTable
        data={filteredRows}
        columns={VENDOR_COLUMNS}
        loading={loading}
        loadingRows={5}
        searchable
        searchPlaceholder="Search vendor, email or country..."
        title="Vendor Directory"
        description={`${filteredRows.length} of ${rows.length} vendors`}
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
