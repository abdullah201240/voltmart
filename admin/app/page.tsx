"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { CHANNEL_OPTIONS } from "@/lib/data/products";
import {
  getOrders,
  orderStats,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type OrderRow,
  type OrderStatus,
} from "@/lib/data/orders";
import {
  Banknote,
  Package,
  ShoppingCart,
  Users,
  Download,
  Plus,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Activity,
  Percent,
  Truck,
  XCircle,
  CreditCard,
} from "lucide-react";
import { applySaleAction } from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
import { WarehouseTiles } from "@/components/warehouse-tiles";
import { FinanceReconciliationPanel } from "@/components/finance-reconciliation-panel";
import { CommercialAnalyticsPanel } from "@/components/commercial-analytics-panel";

/** Order status badge tones — shared vocabulary with the Orders pages. */
const STATUS_META: Record<OrderStatus, string> = {
  Quotation: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Fulfilled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Invoiced: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const ORDER_COLUMNS: CentralTableColumn<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order",
    sortable: true,
    width: "130px",
    cell: ({ row, value }) => (
      <Link
        href={`/orders/${row.id}`}
        className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors"
      >
        {value}
      </Link>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{row.customer}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground font-medium">{value}</span>,
  },
  {
    accessorKey: "itemCount",
    header: "Items",
    align: "center",
    cell: ({ value }) => (
      <Badge variant="outline" className="text-xs font-semibold tabular-nums">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", STATUS_META[value as OrderStatus])}>
        {value}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    sortable: true,
    cell: ({ value }) => (
      <Badge variant={value === "Paid" ? "default" : value === "Refunded" ? "outline" : "secondary"} className="text-xs font-semibold px-2.5 py-1">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "totalValue",
    header: "Total",
    sortable: true,
    align: "right",
    cell: ({ row }) => <span className="font-mono font-bold text-sm text-foreground">{row.total}</span>,
  },
];

export default function AdminDashboardPage() {
  const { searchQuery } = useAdminLayout();
  const appToast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [kpiTab, setKpiTab] = useState<"overview" | "cart" | "compact">("overview");
  const [mainTab, setMainTab] = useState<"orders" | "warehouse" | "finance" | "commercial">("orders");

  const handleDrillDown = (filter: { status?: string; query?: string; tab?: string }) => {
    if (filter.tab) {
      setMainTab(filter.tab as any);
    } else {
      setMainTab("orders");
    }
    if (filter.status) {
      setSelectedStatus(filter.status);
    }
    if (filter.query) {
      setSearchTableQuery(filter.query);
    }
    appToast.info("Filter applied", "Showing matching operational records.");
  };

  // Re-read orders so overlay workflow changes show up immediately.
  const reloadRows = () => {
    getOrders().then((data) => {
      setRows(data);
    });
  };

  const exportCsv = (selected: OrderRow[]) => {
    const header = ["Order", "Customer", "Email", "Channel", "Date", "Status", "Payment", "Items", "Total"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = selected.map((o) =>
      [o.id, o.customer, o.email, o.channel, o.date, o.status, o.paymentStatus, o.itemCount, o.totalValue]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voltmart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    appToast.success("Export ready", `Exported ${selected.length} order(s) to CSV.`);
  };

  const bulkSaleAction = async (selected: OrderRow[], action: "ship" | "cancel") => {
    if (action === "cancel") {
      const allowed = await confirm({
        title: `Cancel ${selected.length} order(s)?`,
        description: "This cancels every selected order. Refunds are not processed automatically.",
        tone: "destructive",
        confirmLabel: "Cancel Orders",
      });
      if (!allowed) return;
    }
    let moved = 0;
    for (const r of selected) {
      const res = applySaleAction(r.id, r.customer, action, {
        status: r.status,
        paymentStatus: r.paymentStatus,
        fulfillmentStatus: r.fulfillmentStatus,
      });
      if (res.ok) moved += 1;
    }
    reloadRows();
    appToast.success(
      action === "ship" ? "Orders fulfilled" : "Orders cancelled",
      action === "ship"
        ? `Fulfilled ${moved} of ${selected.length} order(s).`
        : `Cancelled ${moved} of ${selected.length} order(s).`
    );
  };

  const requestRestock = (productName: string) => {
    appToast.success("Restock requested", `A replenishment request for “${productName}” was sent to inventory.`);
  };

  useEffect(() => {
    let alive = true;
    getOrders().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => orderStats(rows), [rows]);

  const filteredOrders = useMemo(() => {
    return rows.filter((o) => {
      const matchesChannel = selectedChannel === "all" || o.channelKey === selectedChannel;
      const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
      const matchesPayment = selectedPayment === "all" || o.paymentStatus === selectedPayment;
      const matchesQuery =
        !effectiveQuery ||
        o.id.toLowerCase().includes(effectiveQuery) ||
        o.customer.toLowerCase().includes(effectiveQuery) ||
        o.email.toLowerCase().includes(effectiveQuery);
      return matchesChannel && matchesStatus && matchesPayment && matchesQuery;
    });
  }, [rows, selectedChannel, selectedStatus, selectedPayment, effectiveQuery]);

  const clearFilters = () => {
    setSelectedChannel("all");
    setSelectedStatus("all");
    setSelectedPayment("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (selectedChannel !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedPayment !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <>
        {/* Title & Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">
              Monitor multi-channel revenue, orders, and fulfillment pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={() => exportCsv(rows)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              className="h-11 px-5 text-sm font-medium cursor-pointer"
              render={<Link href="/products/new" />}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Centralized Reusable KPI System with View Switcher */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Key Performance Indicators
              </span>
              <span className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                Central Component
              </span>
            </div>

            <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs">
              <button
                type="button"
                onClick={() => setKpiTab("overview")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer",
                  kpiTab === "overview"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Revenue & Operations
              </button>
              <button
                type="button"
                onClick={() => setKpiTab("cart")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer",
                  kpiTab === "cart"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Cart & Conversion
              </button>
              <button
                type="button"
                onClick={() => setKpiTab("compact")}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer",
                  kpiTab === "compact"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Compact Strip
              </button>
            </div>
          </div>

          {kpiTab === "overview" && (
            <KpiGrid columns={4}>
              <KpiCard
                title="Net Revenue Today"
                value="৳54,27,827"
                icon={Banknote}
                tone="emerald"
                change="+14.2%"
                trend="up"
                tooltip="Real net revenue across all active channels after vouchers, discounts, and returns"
              />
              <KpiCard
                title="Orders to Fulfill"
                value="42 Orders"
                icon={ShoppingCart}
                tone="blue"
                change="8 Overdue"
                trend="down"
                tooltip="Active warehouse fulfillment queue awaiting picking or packing"
              />
              <KpiCard
                title="Payments to Settle"
                value="৳14,82,400"
                icon={CreditCard}
                tone="violet"
                change="MFS + COD"
                tooltip="Cash float awaiting bank deposit across bKash, Nagad, and courier COD"
              />
              <KpiCard
                title="Stock Risk Alerts"
                value="14 SKUs"
                icon={AlertCircle}
                tone="amber"
                change="3 Out of Stock"
                trend="down"
                tooltip="Items below safety buffer threshold requiring supplier replenishment"
              />
            </KpiGrid>
          )}

          {kpiTab === "cart" && (
            <KpiGrid columns={4}>
              <KpiCard
                title="Average Cart Value (AOV)"
                value="৳9,168"
                icon={ShoppingBag}
                tone="cyan"
                tooltip="Average order value per completed checkout cart"
              />
              <KpiCard
                title="Cart Abandonment Rate"
                value="24.6%"
                icon={Percent}
                tone="emerald"
                tooltip="Percentage of carts abandoned before checkout - downward trend is positive"
              />
              <KpiCard
                title="Checkout Conversion Rate"
                value="3.82%"
                icon={TrendingUp}
                tone="violet"
                tooltip="Ratio of completed transactions relative to total unique store sessions"
              />
              <KpiCard
                title="Active Cart Sessions"
                value="482"
                icon={Activity}
                tone="indigo"
                tooltip="Shoppers currently modifying carts or proceeding through checkout"
              />
            </KpiGrid>
          )}

          {kpiTab === "compact" && (
            <KpiGrid columns={4}>
              <KpiCard
                title="Gross Revenue"
                value="৳54.3L"
                icon={Banknote}
                tone="emerald"
                variant="compact"
              />
              <KpiCard
                title="Active Orders"
                value="1,248"
                icon={ShoppingCart}
                tone="blue"
                variant="compact"
              />
              <KpiCard
                title="Cart Abandonment"
                value="24.6%"
                icon={ShoppingBag}
                tone="cyan"
                variant="compact"
              />
              <KpiCard
                title="Low Inventory"
                value="14"
                icon={Package}
                tone="amber"
                variant="compact"
              />
            </KpiGrid>
          )}
        </div>

        {/* Secondary View Switcher Tabs: Live Orders, Warehouse Operations, Financials & MFS, Commercial Analytics */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="space-y-5">
          <div className="flex items-center justify-between">
            <TabsList className="h-11 p-1">
              <TabsTrigger value="orders" className="text-sm font-medium px-4 sm:px-5 cursor-pointer">
                Live Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="warehouse" className="text-sm font-medium px-4 sm:px-5 cursor-pointer">
                Warehouse Operations
              </TabsTrigger>
              <TabsTrigger value="finance" className="text-sm font-medium px-4 sm:px-5 cursor-pointer">
                Financials & MFS
              </TabsTrigger>
              <TabsTrigger value="commercial" className="text-sm font-medium px-4 sm:px-5 cursor-pointer">
                Commercial Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Table Tab with CentralTable containing all integrated filters */}
          <TabsContent value="orders">
            <CentralTable
              data={filteredOrders}
              columns={ORDER_COLUMNS}
              loading={loading}
              loadingRows={5}
              selectable
              searchable
              searchPlaceholder="Quick filter live orders..."
              title="Recent Customer Orders"
              description={`${filteredOrders.length} of ${stats.total} orders · ${stats.pending} awaiting action`}
              filters={
                <div className="grid gap-5 sm:grid-cols-3 w-full">
                  <SearchableDropbox
                    label="Sales Channel"
                    options={CHANNEL_OPTIONS as DropboxOption[]}
                    value={selectedChannel}
                    onChange={setSelectedChannel}
                    placeholder="All channels..."
                    searchPlaceholder="Search channel..."
                  />
                  <SearchableDropbox
                    label="Order Status"
                    options={ORDER_STATUS_OPTIONS as DropboxOption[]}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="All statuses..."
                    searchPlaceholder="Search order status..."
                  />
                  <SearchableDropbox
                    label="Payment Status"
                    options={PAYMENT_STATUS_OPTIONS as DropboxOption[]}
                    value={selectedPayment}
                    onChange={setSelectedPayment}
                    placeholder="Any payment..."
                    searchPlaceholder="Search payment..."
                  />
                </div>
              }
              activeFiltersCount={activeFiltersCount}
              defaultFiltersOpen={true}
              onClearFilters={clearFilters}
              pagination
              pageSize={5}
              pageSizeOptions={[5, 10, 20]}
              selectedActions={(selectedRows, clearSelection) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
                    onClick={() => {
                      exportCsv(selectedRows);
                      clearSelection();
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
                    onClick={() => {
                      bulkSaleAction(selectedRows, "ship");
                      clearSelection();
                    }}
                  >
                    <Truck className="h-3.5 w-3.5" /> Fulfill
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs font-semibold cursor-pointer gap-1.5 text-muted-foreground hover:text-rose-600"
                    onClick={() => {
                      bulkSaleAction(selectedRows, "cancel");
                      clearSelection();
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              )}
              emptyAction={
                hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="cursor-pointer text-xs font-semibold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset All Filters
                  </Button>
                )
              }
            />
          </TabsContent>

          {/* Warehouse Operations Tab with Odoo-Style Kanban Tiles */}
          <TabsContent value="warehouse" className="w-full">
            <WarehouseTiles onDrillDown={handleDrillDown} onRequestRestock={requestRestock} />
          </TabsContent>

          {/* Financials & MFS Tab */}
          <TabsContent value="finance" className="w-full">
            <FinanceReconciliationPanel />
          </TabsContent>

          {/* Commercial Analytics Tab (Saleor Pulse Style) */}
          <TabsContent value="commercial" className="w-full">
            <CommercialAnalyticsPanel />
          </TabsContent>
        </Tabs>

    </>
  );
}
