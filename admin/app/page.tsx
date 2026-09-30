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
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type OrderRow,
  type OrderStatus,
} from "@/lib/data/orders";
import { getStock, getPickings, type StockRow, type PickingRow } from "@/lib/data/inventory";
import {
  getPayments,
  getInvoices,
  getBills,
  type PaymentRow,
  type InvoiceRow,
  type BillRow,
} from "@/lib/data/finance";
import { getReturns, returnStats, type ReturnRow } from "@/lib/data/returns";
import { getSerials, serialStats, type SerialRow } from "@/lib/data/serials";
import { getTopProducts, type TopProduct } from "@/lib/data/analytics";
import {
  buildDashboardSnapshot,
  selectScopedOrders,
  formatBDT,
  type ChannelKey,
  type DateRangeKey,
} from "@/lib/data/dashboard";
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
  FileSpreadsheet,
} from "lucide-react";
import { applySaleAction } from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
import { WarehouseTiles } from "@/components/warehouse-tiles";
import { FinanceReconciliationPanel } from "@/components/finance-reconciliation-panel";
import { CommercialAnalyticsPanel } from "@/components/commercial-analytics-panel";

/**
 * Channel context mirrors the real `OrderRow.channelKey` values, so selecting
 * a channel genuinely recomputes every KPI, panel and the Live Orders table.
 */
const DASHBOARD_CHANNELS: DropboxOption[] = [
  { value: "all", label: "All Channels", badge: "GLOBAL" },
  { value: "default-channel", label: "Default Channel (BDT)", badge: "WEB" },
  { value: "channel-dhk", label: "Dhaka Store (BDT)", badge: "DHK" },
  { value: "channel-ctg", label: "Chattogram Store (BDT)", badge: "CTG" },
  { value: "b2b-wholesale", label: "B2B Wholesale (BDT)", badge: "B2B" },
];

const DATE_RANGE_OPTIONS: DropboxOption[] = [
  { value: "today", label: "Today", badge: "LIVE" },
  { value: "7d", label: "Last 7 Days", badge: "WEEK" },
  { value: "mtd", label: "Month to Date (MTD)", badge: "MONTH" },
  { value: "ytd", label: "Year to Date (YTD)", badge: "YEAR" },
];

const RANGE_LABEL: Record<DateRangeKey, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  mtd: "MTD",
  ytd: "YTD",
};

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

  // Operational source-of-truth records (everything on the cockpit derives here).
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [stock, setStock] = useState<StockRow[]>([]);
  const [pickings, setPickings] = useState<PickingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [bills, setBills] = useState<BillRow[]>([]);
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [serials, setSerials] = useState<SerialRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Panorama context — genuinely recomputes KPIs, panels and the table.
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeKey>("ytd");

  const [activeOperationalTab, setActiveOperationalTab] = useState<"warehouse" | "finance" | "commercial">("warehouse");

  // Live Orders CentralTable filters (status / payment / search).
  const [tableStatus, setTableStatus] = useState("all");
  const [tablePayment, setTablePayment] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  const loadAll = () => {
    Promise.all([
      getOrders(),
      getStock(),
      getPickings("incoming"),
      getPickings("outgoing"),
      getPickings("internal"),
      getPayments(),
      getInvoices(),
      getBills(),
      getReturns(),
      getSerials(),
      getTopProducts(),
    ]).then(([o, s, pi, po, pint, pay, inv, bil, ret, ser, top]) => {
      setRows(o);
      setStock(s);
      setPickings([...pi, ...po, ...pint]);
      setPayments(pay);
      setInvoices(inv);
      setBills(bil);
      setReturns(ret);
      setSerials(ser);
      setTopProducts(top);
    });
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      getOrders(),
      getStock(),
      getPickings("incoming"),
      getPickings("outgoing"),
      getPickings("internal"),
      getPayments(),
      getInvoices(),
      getBills(),
      getReturns(),
      getSerials(),
      getTopProducts(),
    ]).then(([o, s, pi, po, pint, pay, inv, bil, ret, ser, top]) => {
      if (!alive) return;
      setRows(o);
      setStock(s);
      setPickings([...pi, ...po, ...pint]);
      setPayments(pay);
      setInvoices(inv);
      setBills(bil);
      setReturns(ret);
      setSerials(ser);
      setTopProducts(top);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Single derived snapshot — the cockpit's one source of truth.
  const snapshot = useMemo(
    () =>
      buildDashboardSnapshot({
        orders: rows,
        stock,
        pickings,
        payments,
        invoices,
        bills,
        channel: selectedChannel,
        range: selectedDateRange,
      }),
    [rows, stock, pickings, payments, invoices, bills, selectedChannel, selectedDateRange],
  );

  const returnStatsMemo = useMemo(() => returnStats(returns), [returns]);
  const serialStatsMemo = useMemo(() => serialStats(serials), [serials]);

  // Orders within the current channel + date-range context (drives the table).
  const scopedOrders = useMemo(
    () => selectScopedOrders(rows, selectedChannel, selectedDateRange),
    [rows, selectedChannel, selectedDateRange],
  );

  const rangeLabel = RANGE_LABEL[selectedDateRange];

  // 1-Click operational drill-down (KPI cards + warehouse tiles).
  const handleDrillDown = (filter: { status?: string; payment?: string; tab?: string }) => {
    if (filter.tab === "warehouse" || filter.tab === "finance" || filter.tab === "commercial") {
      setActiveOperationalTab(filter.tab);
    }
    if (filter.status) setTableStatus(filter.status);
    if (filter.payment) setTablePayment(filter.payment);

    const tableEl = document.getElementById("live-orders-section");
    if (tableEl) tableEl.scrollIntoView({ behavior: "smooth" });
    appToast.info("Filter applied", "Showing matching operational records in Live Orders table.");
  };

  const exportDossier = (orders: OrderRow[], name: string) => {
    const header = ["Order ID", "Customer", "Email", "Channel", "Date", "Status", "Payment", "Items", "Total (BDT)"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = orders.map((o) =>
      [o.id, o.customer, o.email, o.channel, o.date, o.status, o.paymentStatus, o.itemCount, o.totalValue]
        .map(esc)
        .join(",")
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    appToast.success("Export ready", `Exported ${orders.length} order(s) to CSV.`);
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
    loadAll();
    appToast.success(
      action === "ship" ? "Orders fulfilled" : "Orders cancelled",
      action === "ship"
        ? `Fulfilled ${moved} of ${selected.length} order(s).`
        : `Cancelled ${moved} of ${selected.length} order(s).`
    );
  };

  const requestRestock = (productName: string) => {
    appToast.success("Restock requested", `Replenishment rule for “${productName}” flagged in Inventory.`);
  };

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return scopedOrders.filter((o) => {
      const matchesStatus = tableStatus === "all" || o.status === tableStatus;
      const matchesPayment = tablePayment === "all" || o.paymentStatus === tablePayment;
      const matchesQuery =
        !effectiveQuery ||
        o.id.toLowerCase().includes(effectiveQuery) ||
        o.customer.toLowerCase().includes(effectiveQuery) ||
        o.email.toLowerCase().includes(effectiveQuery);
      return matchesStatus && matchesPayment && matchesQuery;
    });
  }, [scopedOrders, tableStatus, tablePayment, effectiveQuery]);

  const clearFilters = () => {
    setTableStatus("all");
    setTablePayment("all");
    setSearchTableQuery("");
  };

  const activeFiltersCount =
    (tableStatus !== "all" ? 1 : 0) + (tablePayment !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* TOP ACTION BAR — channel + date context that recomputes the whole cockpit */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 md:p-5 rounded-lg border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Live operational cockpit — every figure is derived from orders, inventory, finance & after-sales records.
            </p>
          </div>

          <div className="h-8 w-px bg-border hidden sm:block" />

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48 sm:w-56">
              <SearchableDropbox
                options={DASHBOARD_CHANNELS}
                value={selectedChannel}
                onChange={(v) => setSelectedChannel(v as ChannelKey)}
                placeholder="Channel context..."
                searchPlaceholder="Search channel..."
              />
            </div>
            <div className="w-44 sm:w-48">
              <SearchableDropbox
                options={DATE_RANGE_OPTIONS}
                value={selectedDateRange}
                onChange={(v) => setSelectedDateRange(v as DateRangeKey)}
                placeholder="Date range..."
                searchPlaceholder="Search range..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            className="h-10 px-4 text-xs md:text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
            onClick={() => exportDossier(scopedOrders, "voltmart-dossier")}
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

      {/* SECTION 1: PRIMARY KPI GRID — derived, not decorative */}
      <KpiGrid columns={4}>
        <KpiCard
          title={`Net Revenue · ${rangeLabel}`}
          value={formatBDT(snapshot.revenue)}
          icon={Banknote}
          tone="emerald"
          change={snapshot.revenueDeltaPct !== 0 ? `${snapshot.revenueDeltaPct > 0 ? "+" : ""}${snapshot.revenueDeltaPct}%` : "—"}
          trend={snapshot.revenueDeltaPct > 0 ? "up" : snapshot.revenueDeltaPct < 0 ? "down" : "neutral"}
          period={`${snapshot.orderCount} order(s) · AOV ${formatBDT(snapshot.aov)}`}
          tooltip="Net revenue for non-cancelled orders within the selected channel and date range."
        />
        <div onClick={() => handleDrillDown({ status: "Confirmed" })} className="cursor-pointer active:scale-[0.98] transition-all">
          <KpiCard
            title="Orders to Fulfill"
            value={String(snapshot.ordersToFulfill)}
            suffix="orders"
            icon={ShoppingCart}
            tone="blue"
            change={snapshot.ordersOverdue > 0 ? `${snapshot.ordersOverdue} overdue` : "On track"}
            trend={snapshot.ordersOverdue > 0 ? "down" : "neutral"}
            tooltip="Confirmed orders not yet fulfilled. Click to filter the live table to Confirmed orders."
          />
        </div>
        <div onClick={() => setActiveOperationalTab("finance")} className="cursor-pointer active:scale-[0.98] transition-all">
          <KpiCard
            title="Payments to Settle"
            value={formatBDT(snapshot.paymentsToSettle)}
            icon={CreditCard}
            tone="violet"
            change={`${snapshot.paymentsPendingCount} pending · ${snapshot.paymentsFailedCount} failed`}
            trend="neutral"
            tooltip="Unreconciled inbound payments (MFS, bank, courier COD). Click to open the financials panel."
          />
        </div>
        <Link href="/inventory" className="block cursor-pointer active:scale-[0.98] transition-all">
          <KpiCard
            title="Stock Risk Alerts"
            value={String(snapshot.stockRiskSkus)}
            suffix="SKUs"
            icon={AlertTriangle}
            tone="amber"
            change={`${snapshot.stockOutSkus} out of stock`}
            trend={snapshot.stockOutSkus > 0 ? "down" : "neutral"}
            tooltip="SKUs at/below their reorder point, plus items fully out of stock."
          />
        </Link>
      </KpiGrid>

      {/* SECTION 2: OPERATIONAL VIEW SWITCHER */}
      <Tabs
        value={activeOperationalTab}
        onValueChange={(v) => setActiveOperationalTab(v as "warehouse" | "finance" | "commercial")}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3">
          <TabsList className="h-11 p-1">
            <TabsTrigger value="warehouse" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>📦</span> Warehouse & Fulfillment
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>💰</span> Financials & Reconciliation
            </TabsTrigger>
            <TabsTrigger value="commercial" className="text-sm font-semibold px-4 sm:px-5 cursor-pointer gap-2">
              <span>📊</span> Commercial Overview
            </TabsTrigger>
          </TabsList>

          <span className="text-xs text-muted-foreground">
            {activeOperationalTab === "warehouse" && "Operational queues with 1-click drill-downs into the live order table"}
            {activeOperationalTab === "finance" && "Payment gateways, courier COD float & VAT liability from the ledger"}
            {activeOperationalTab === "commercial" && "Channel revenue split & top products for the selected context"}
          </span>
        </div>

        <TabsContent value="warehouse" className="w-full mt-0">
          <WarehouseTiles
            snapshot={snapshot}
            returnStats={returnStatsMemo}
            serialStats={serialStatsMemo}
            onDrillDown={handleDrillDown}
            onRequestRestock={requestRestock}
          />
        </TabsContent>

        <TabsContent value="finance" className="w-full mt-0">
          <FinanceReconciliationPanel snapshot={snapshot} />
        </TabsContent>

        <TabsContent value="commercial" className="w-full mt-0">
          <CommercialAnalyticsPanel snapshot={snapshot} topProducts={topProducts} />
        </TabsContent>
      </Tabs>

      {/* SECTION 3: LIVE ORDERS (CentralTable) */}
      <div id="live-orders-section" className="pt-2">
        <CentralTable
          data={filteredOrders}
          columns={ORDER_COLUMNS}
          loading={loading}
          loadingRows={5}
          selectable
          searchable
          searchPlaceholder="Quick filter live orders by ID, customer, email..."
          title="Live Orders & Operational Triage"
          description={`${filteredOrders.length} matching orders · ${snapshot.ordersToFulfill} awaiting fulfilment · Click any row to view the full dossier`}
          filters={
            <div className="grid gap-5 sm:grid-cols-2 w-full">
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
                  exportDossier(selectedRows, "voltmart-orders-selected");
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
