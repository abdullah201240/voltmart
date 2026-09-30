"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { GraphView, PivotView } from "@/components/ui/graph-view";
import { useAdminLayout } from "@/components/admin-shell";
import {
  ShoppingCart,
  Banknote,
  Clock,
  Truck,
  Download,
  RotateCcw,
  Ban,
  List,
  LayoutGrid,
  BarChart3,
  Table2,
} from "lucide-react";
import { CHANNEL_OPTIONS } from "@/lib/data/products";
import { useOps } from "@/lib/data/ops";
import { setSaleStatus, applySaleAction } from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
import { CreateFlow } from "@/components/ui/create-flow";
import {
  getOrders,
  orderStats,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type OrderRow,
  type OrderStatus,
} from "@/lib/data/orders";

const STATUS_META: Record<OrderStatus, string> = {
  Quotation: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Fulfilled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Invoiced: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function fmtMoney(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Kanban / Graph stage columns follow the Odoo sale.order pipeline. */
const STAGE_KEYS: OrderStatus[] = ["Quotation", "Confirmed", "Fulfilled", "Invoiced", "Cancelled"];
const STAGE_ACCENT: Record<OrderStatus, string> = {
  Quotation: "bg-slate-500",
  Confirmed: "bg-blue-500",
  Fulfilled: "bg-emerald-500",
  Invoiced: "bg-violet-500",
  Cancelled: "bg-rose-500",
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

export default function OrdersPage() {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const confirm = useConfirm();
  const appToast = useToast();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban" | "graph" | "pivot">("list");

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

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
  }, [version]);


  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => orderStats(rows), [rows]);

  const filteredRows = useMemo(() => {
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

  // Revenue by lifecycle stage for the Graph view.
  const graphData = useMemo(
    () =>
      STAGE_KEYS.map((s) => ({
        label: s,
        value: filteredRows.filter((o) => o.status === s).reduce((sum, o) => sum + o.totalValue, 0),
        color: STAGE_ACCENT[s].replace("bg-", "bg-") + "/70",
      })),
    [filteredRows],
  );

  // Drag a Kanban card into a new stage column -> workflow stage change.
  // Moving into Cancelled is destructive, so it asks for permission first.
  const moveStage = async (row: OrderRow, toKey: string) => {
    if (toKey === "Cancelled") {
      const allowed = await confirm({
        title: `Cancel ${row.id}?`,
        description: `This marks the order for ${row.customer} as cancelled.`,
        tone: "destructive",
        confirmLabel: "Cancel Order",
      });
      if (!allowed) return;
    }
    const res = setSaleStatus(row.id, toKey as OrderStatus, {
      status: row.status,
      paymentStatus: row.paymentStatus,
      fulfillmentStatus: row.fulfillmentStatus,
    });
    if (res.ok) appToast.success("Stage updated", `${row.id} moved to ${toKey}.`);
    else appToast.error("Move failed", res.message);
  };

  const exportOrdersCsv = () => {
    const header = ["Order", "Customer", "Channel", "Date", "Total", "Items", "Status", "Payment", "Fulfillment"];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...filteredRows.map((r) =>
        [r.id, r.customer, r.channel, r.date, r.totalValue, r.itemCount, r.status, r.paymentStatus, r.fulfillmentStatus]
          .map(esc)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voltmart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    appToast.success("Export ready", `${filteredRows.length} order(s) downloaded as CSV.`);
  };

  const bulkAction = async (selectedRows: OrderRow[], kind: "ship" | "cancel") => {
    const allowed = await confirm({
      title: kind === "ship" ? `Fulfill ${selectedRows.length} order(s)?` : `Cancel ${selectedRows.length} order(s)?`,
      description:
        kind === "ship"
          ? "Each selected order is marked shipped and its fulfillment updated."
          : "This cancels every selected order. Refunds are not processed automatically.",
      tone: kind === "cancel" ? "destructive" : "default",
      confirmLabel: kind === "ship" ? "Fulfill Orders" : "Cancel Orders",
    });
    if (!allowed) return;
    let moved = 0;
    for (const r of selectedRows) {
      const res = applySaleAction(r.id, r.customer, kind, {
        status: r.status,
        paymentStatus: r.paymentStatus,
        fulfillmentStatus: r.fulfillmentStatus,
      });
      if (res.ok) moved += 1;
    }
    appToast.success(
      kind === "ship" ? "Orders fulfilled" : "Orders cancelled",
      `${moved} of ${selectedRows.length} order(s) updated.`
    );
  };

  return (
    <>
      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track the full order lifecycle — quotation, confirmation, fulfillment and invoicing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={exportOrdersCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <CreateFlow<OrderRow>
            model="sale.order"
            buttonLabel="Create Order"
            drawerTitle="New Order"
            drawerDescription="Create a quotation for a customer; confirm it to start fulfillment."
            fields={[
              { key: "customer", label: "Customer", required: true, placeholder: "e.g. Rahim Ahmed" },
              { key: "email", label: "Customer Email", required: true, placeholder: "rahim@example.com" },
              {
                key: "channelKey",
                label: "Sales Channel",
                type: "select",
                required: true,
                defaultValue: "default-channel",
                options: CHANNEL_OPTIONS.filter((o) => o.value !== "all").map((o) => ({ value: o.value, label: o.label })),
              },
              { key: "itemCount", label: "Line Items", type: "number", defaultValue: "1" },
              { key: "total", label: "Order Total (৳)", type: "number", required: true, placeholder: "25000" },
            ]}
            validate={(v) => {
              const email = v.email.trim().toLowerCase();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid customer email.";
              if (!v.total || Number(v.total) <= 0) return "Enter an order total greater than zero.";
              return null;
            }}
            build={(v) => {
              const totalValue = Number(v.total) || 0;
              const channelKey = v.channelKey;
              const channel = CHANNEL_OPTIONS.find((o) => o.value === channelKey)?.label ?? "Default Channel (BDT)";
              return {
                id: `ORD-${1000 + Math.floor(Date.now() % 9000)}`,
                customer: v.customer.trim(),
                email: v.email.trim().toLowerCase(),
                channel,
                channelKey,
                date: "Today",
                totalValue,
                total: fmtMoney(totalValue),
                itemCount: Math.max(1, Number(v.itemCount) || 1),
                status: "Quotation",
                paymentStatus: "Unpaid",
                fulfillmentStatus: "Unfulfilled",
              };
            }}
            onCreated={(row) => setRows((prev) => [row, ...prev])}
            successMessage="Order created"
          />
        </div>
      </div>

      {/* Order KPIs */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Total Orders"
          value={String(stats.total)}
          icon={ShoppingCart}
          tone="blue"
          tooltip="All orders across channels in range"
        />
        <KpiCard
          title="Gross Revenue"
          value={fmtMoney(stats.revenue)}
          icon={Banknote}
          tone="emerald"
          tooltip="Sum of non-cancelled order totals"
        />
        <KpiCard
          title="Awaiting Action"
          value={String(stats.pending)}
          icon={Clock}
          tone="amber"
          tooltip="Quotations and confirmed orders not yet fulfilled"
        />
        <KpiCard
          title="To Fulfill"
          value={String(stats.unfulfilled)}
          icon={Truck}
          tone="violet"
          tooltip="Orders with pending or partial fulfillment"
        />
      </KpiGrid>

      {/* View switcher */}
      <ViewSwitcher
        active={view}
        onChange={(k) => setView(k as typeof view)}
        meta={`${filteredRows.length} of ${rows.length} orders`}
        tabs={[
          { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
          { key: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
          { key: "graph", label: "Graph", icon: <BarChart3 className="h-4 w-4" /> },
          { key: "pivot", label: "Pivot", icon: <Table2 className="h-4 w-4" /> },
        ]}
      />

      {/* Filters tray (also drives Kanban / Graph / Pivot) */}
      {view !== "list" && (
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
            searchPlaceholder="Search status..."
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
      )}

      {view === "list" && (
        <CentralTable
          data={filteredRows}
          columns={ORDER_COLUMNS}
          loading={loading}
          loadingRows={6}
          selectable
          searchable
          searchPlaceholder="Search order/customer... or total>100000, status:draft"
          title="All Orders"
          description={`${filteredRows.length} of ${rows.length} orders`}
          groupable
          favoriteKey="orders"
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
                searchPlaceholder="Search status..."
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
          defaultFiltersOpen={false}
          onClearFilters={clearFilters}
          pagination
          pageSize={10}
          pageSizeOptions={[10, 20, 50]}
          selectedActions={(selectedRows, clearSelection) => (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold cursor-pointer"
                onClick={() => {
                  bulkAction(selectedRows as OrderRow[], "ship");
                  clearSelection();
                }}
              >
                <Truck className="mr-1.5 h-3.5 w-3.5" /> Fulfill
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
                onClick={() => {
                  bulkAction(selectedRows as OrderRow[], "cancel");
                  clearSelection();
                }}
              >
                <Ban className="h-3.5 w-3.5" />
                Cancel
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
      )}

      {view === "kanban" && (
        <KanbanBoard
          data={filteredRows}
          loading={loading}
          idOf={(o) => o.id}
          stageOf={(o) => o.status}
          onMove={moveStage}
          stages={STAGE_KEYS.map((s) => ({ key: s, label: s, accent: STAGE_ACCENT[s] }))}
          renderCard={(o) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Link href={`/orders/${o.id}`} className="font-mono text-sm font-bold text-foreground hover:text-primary transition-colors">
                  {o.id}
                </Link>
                <span className="text-[10px] text-muted-foreground">{o.date}</span>
              </div>
              <p className="truncate text-sm font-semibold text-foreground">{o.customer}</p>
              <p className="truncate text-xs text-muted-foreground">{o.channel}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant="outline" className="text-[10px] font-semibold">{o.itemCount} items</Badge>
                <span className="font-mono text-sm font-bold text-foreground">{o.total}</span>
              </div>
            </div>
          )}
        />
      )}

      {view === "graph" && (
        <GraphView
          data={graphData}
          formatValue={fmtMoney}
          onSelect={(d) => {
            setSelectedStatus(d.label);
            setView("list");
          }}
        />
      )}

      {view === "pivot" && (
        <PivotView
          rows={filteredRows}
          groupOf={(o) => o.status}
          title="Orders by status"
          formatValue={fmtMoney}
          columns={[
            { key: "count", label: "Orders", measure: (g) => g.length, format: (v) => String(v) },
            { key: "revenue", label: "Revenue", measure: (g) => g.reduce((s, o) => s + o.totalValue, 0) },
            { key: "avg", label: "Avg. Order", measure: (g) => (g.length ? g.reduce((s, o) => s + o.totalValue, 0) / g.length : 0) },
          ]}
        />
      )}

      {/* Action notices now handled by the global toast system */}
    </>
  );
}
