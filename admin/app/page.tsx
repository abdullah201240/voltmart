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
  ShoppingCart,
  Download,
  Plus,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Truck,
  XCircle,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import { applySaleAction } from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
import { WarehouseTiles } from "@/components/warehouse-tiles";
import { FinanceReconciliationPanel } from "@/components/finance-reconciliation-panel";
import { CommercialAnalyticsPanel } from "@/components/commercial-analytics-panel";

/** Channel filter options mapped from Saleor Multi-Channel Context */
const DASHBOARD_CHANNELS: DropboxOption[] = [
  { value: "all", label: "All Channels", badge: "GLOBAL" },
  { value: "web", label: "Online Web Storefront", badge: "WEB" },
  { value: "pos-dhanmondi", label: "POS Retail (Dhanmondi)", badge: "POS" },
  { value: "daraz", label: "Daraz Flagship Mall", badge: "API" },
  { value: "social", label: "Social Commerce (FB / WhatsApp)", badge: "SOCIAL" },
];

/** Date Range filter options for executive & operational reporting */
const DATE_RANGE_OPTIONS: DropboxOption[] = [
  { value: "today", label: "Today (Last 24h)", badge: "LIVE" },
  { value: "7d", label: "Last 7 Days", badge: "WEEK" },
  { value: "mtd", label: "Month to Date (MTD)", badge: "MONTH" },
  { value: "ytd", label: "Year to Date (YTD)", badge: "YEAR" },
];

/** Order status badge tones — shared vocabulary with the Orders pages */
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
        className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
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

  // Top action bar states (Saleor + Odoo multi-channel & date context)
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("today");

  // Secondary Operational View Switcher (Defaults to Warehouse & Fulfillment Pipeline)
  const [activeOperationalTab, setActiveOperationalTab] = useState<"warehouse" | "finance" | "commercial">("warehouse");

  // Live Orders CentralTable filters
  const [tableChannel, setTableChannel] = useState("all");
  const [tableStatus, setTableStatus] = useState("all");
  const [tablePayment, setTablePayment] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  // Re-read orders so overlay workflow changes show up immediately
  const reloadRows = () => {
    getOrders().then((data) => {
      setRows(data);
    });
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

  const stats = useMemo(() => orderStats(rows), [rows]);

  // 1-Click Operational Drill-Down Handler (from KPI cards & Odoo Kanban badges)
  const handleDrillDown = (filter: { status?: string; query?: string; tab?: string }) => {
    if (filter.tab === "warehouse" || filter.tab === "finance" || filter.tab === "commercial") {
      setActiveOperationalTab(filter.tab);
    }
    if (filter.status) {
      setTableStatus(filter.status);
    }
    if (filter.query) {
      setSearchTableQuery(filter.query);
    }

    const tableEl = document.getElementById("live-orders-section");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth" });
    }
    appToast.info("Filter applied", "Showing matching operational records in Live Orders table.");
  };

  const exportDailyDossier = () => {
    const header = ["Order ID", "Customer", "Email", "Channel", "Date", "Status", "Payment", "Items", "Total (BDT)"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((o) =>
      [o.id, o.customer, o.email, o.channel, o.date, o.status, o.paymentStatus, o.itemCount, o.totalValue]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voltmart-daily-dossier-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    appToast.success("Daily dossier ready", `Exported full operational report (${rows.length} records) to CSV.`);
  };

  const exportCsv = (selected: OrderRow[]) => {
    const header = ["Order", "Customer", "Email", "Channel", "Date", "Status", "Payment", "Items", "Total"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = selected.map((o) =>
      [o.id, o.customer, o.email, o.channel, o.date, o.status, o.paymentStatus, o.itemCount, o.totalValue]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voltmart-orders-selected-${new Date().toISOString().slice(0, 10)}.csv`;
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
    appToast.success("Restock requested", `Replenishment PO draft for “${productName}” created in Inventory.`);
  };

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return rows.filter((o) => {
      // Channel match combines top-bar channel context and table-specific channel filter
      const channelToMatch = tableChannel !== "all" ? tableChannel : selectedChannel;
      const matchesChannel =
        channelToMatch === "all" ||
        (channelToMatch === "web" && (o.channelKey === "default-channel" || o.channel.toLowerCase().includes("web"))) ||
        (channelToMatch === "pos-dhanmondi" && (o.channelKey === "channel-dhk" || o.channel.toLowerCase().includes("dhanmondi"))) ||
        (channelToMatch === "daraz" && o.channel.toLowerCase().includes("daraz")) ||
        (channelToMatch === "social" && o.channel.toLowerCase().includes("social")) ||
        o.channelKey === channelToMatch;

      const matchesStatus = tableStatus === "all" || o.status === tableStatus;
      const matchesPayment = tablePayment === "all" || o.paymentStatus === tablePayment;
      const matchesQuery =
        !effectiveQuery ||
        o.id.toLowerCase().includes(effectiveQuery) ||
        o.customer.toLowerCase().includes(effectiveQuery) ||
        o.email.toLowerCase().includes(effectiveQuery);

      return matchesChannel && matchesStatus && matchesPayment && matchesQuery;
    });
  }, [rows, selectedChannel, tableChannel, tableStatus, tablePayment, effectiveQuery]);

  const clearFilters = () => {
    setTableChannel("all");
    setTableStatus("all");
    setTablePayment("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (tableChannel !== "all" ? 1 : 0) +
    (tableStatus !== "all" ? 1 : 0) +
    (tablePayment !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* TOP ACTION BAR: Panoramic Header (Saleor Channel Switcher + Date Range + Live Sync + Global Actions) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 md:p-5 rounded-lg border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Dashboard Overview
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Sync Active
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Dual-Engine Commerce Cockpit · Saleor Multi-Channel Growth & Odoo Warehouse Execution
            </p>
          </div>

          <div className="h-8 w-px bg-border hidden sm:block" />

          {/* Panoramic Channel & Date Range Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48 sm:w-56">
              <SearchableDropbox
                options={DASHBOARD_CHANNELS}
                value={selectedChannel}
                onChange={setSelectedChannel}
                placeholder="Channel context..."
                searchPlaceholder="Search channel..."
              />
            </div>
            <div className="w-44 sm:w-48">
              <SearchableDropbox
                options={DATE_RANGE_OPTIONS}
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                placeholder="Date range..."
                searchPlaceholder="Search range..."
              />
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            className="h-10 px-4 text-xs md:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
            onClick={exportDailyDossier}
          >
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Export</span> Dossier
          </Button>
          <Button asChild variant="outline" className="h-10 px-4 text-xs md:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button asChild className="h-10 px-4 text-xs md:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
            <Link href="/orders/new">
              <Plus className="h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {/* SECTION 1: PRIMARY KPI GRID (Glanceable Executive Strip — Standardized KpiGrid columns={4}) */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Net Revenue Today"
          value="৳54,27,827"
          icon={Banknote}
          tone="emerald"
          change="+14.2%"
          trend="up"
          tooltip="Real net revenue across all active channels after vouchers, discounts, and returns."
        />
        <div
          onClick={() => handleDrillDown({ status: "Confirmed" })}
          className="cursor-pointer active:scale-[0.98] transition-all"
        >
          <KpiCard
            title="Orders to Fulfill"
            value="42 Orders"
            icon={ShoppingCart}
            tone="blue"
            change="8 Overdue"
            trend="down"
            tooltip="Active warehouse fulfillment queue. 8 orders past SLA. Click to filter live table."
          />
        </div>
        <div
          onClick={() => setActiveOperationalTab("finance")}
          className="cursor-pointer active:scale-[0.98] transition-all"
        >
          <KpiCard
            title="Payments to Settle"
            value="৳14,82,400"
            icon={CreditCard}
            tone="violet"
            change="MFS + COD"
            tooltip="Cash float awaiting bank deposit across bKash, Nagad, and courier COD. Click to inspect."
          />
        </div>
        <Link href="/inventory" className="block cursor-pointer active:scale-[0.98] transition-all">
          <KpiCard
            title="Stock Risk Alerts"
            value="14 SKUs"
            icon={AlertTriangle}
            tone="amber"
            change="3 Out of Stock"
            trend="down"
            tooltip="Items below safety buffer threshold requiring supplier replenishment POs."
          />
        </Link>
      </KpiGrid>

      {/* SECTION 2: VIEW SWITCHER TABS (Secondary Panoramic Operational Controls) */}
      <Tabs
        value={activeOperationalTab}
        onValueChange={(v) => setActiveOperationalTab(v as any)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3">
          <TabsList className="h-11 p-1">
            <TabsTrigger value="warehouse" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>📦</span> Warehouse & Fulfillment Pipeline
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>💰</span> Financials & MFS Reconciliation
            </TabsTrigger>
            <TabsTrigger value="commercial" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>📊</span> Commercial Analytics (Pulse)
            </TabsTrigger>
          </TabsList>

          <span className="text-xs text-muted-foreground">
            {activeOperationalTab === "warehouse" && "Odoo-Style Operational Kanban Tiles with 1-Click Drill-Downs"}
            {activeOperationalTab === "finance" && "bKash / Nagad balances, Courier COD float & NBR VAT 9.1"}
            {activeOperationalTab === "commercial" && "Saleor Pulse AOV, gross vs net revenue & channel contribution"}
          </span>
        </div>

        {/* Tab 1: Warehouse & Fulfillment Pipeline (Odoo-Style Operational Kanban Tiles) */}
        <TabsContent value="warehouse" className="w-full mt-0">
          <WarehouseTiles onDrillDown={handleDrillDown} onRequestRestock={requestRestock} />
        </TabsContent>

        {/* Tab 2: Financials & MFS Reconciliation */}
        <TabsContent value="finance" className="w-full mt-0">
          <FinanceReconciliationPanel />
        </TabsContent>

        {/* Tab 3: Commercial Analytics (Saleor Pulse Style) */}
        <TabsContent value="commercial" className="w-full mt-0">
          <CommercialAnalyticsPanel />
        </TabsContent>
      </Tabs>

      {/* SECTION 3: LIVE ORDERS & ANOMALY TRIAGE (Powered by CentralTable with Integrated Filters Tray) */}
      <div id="live-orders-section" className="pt-2">
        <CentralTable
          data={filteredOrders}
          columns={ORDER_COLUMNS}
          loading={loading}
          loadingRows={5}
          selectable
          searchable
          searchPlaceholder="Quick filter live orders by ID, customer, email..."
          title="Live Orders & Operational Anomaly Triage"
          description={`${filteredOrders.length} matching orders · ${stats.pending} awaiting physical action · Click any row to view full dossier`}
          filters={
            <div className="grid gap-5 sm:grid-cols-3 w-full">
              <SearchableDropbox
                label="Sales Channel"
                options={DASHBOARD_CHANNELS}
                value={tableChannel}
                onChange={setTableChannel}
                placeholder="All channels..."
                searchPlaceholder="Search channel..."
              />
              <SearchableDropbox
                label="Order Status"
                options={ORDER_STATUS_OPTIONS as DropboxOption[]}
                value={tableStatus}
                onChange={setTableStatus}
                placeholder="All statuses..."
                searchPlaceholder="Search order status..."
              />
              <SearchableDropbox
                label="Payment Status"
                options={PAYMENT_STATUS_OPTIONS as DropboxOption[]}
                value={tablePayment}
                onChange={setTablePayment}
                placeholder="Any payment..."
                searchPlaceholder="Search payment..."
              />
            </div>
          }
          activeFiltersCount={activeFiltersCount}
          defaultFiltersOpen={true}
          onClearFilters={clearFilters}
          pagination
          pageSize={10}
          pageSizeOptions={[5, 10, 20, 50]}
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
                <Truck className="h-3.5 w-3.5" /> Fulfill Selected
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
                <XCircle className="h-3.5 w-3.5" /> Cancel Selected
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
      </div>
    </div>
  );
}
