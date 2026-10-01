"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Plus,
  Check,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { CHANNEL_OPTIONS } from "@/lib/data/products";
import { useOps } from "@/lib/data/ops";
import { setSaleStatus } from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
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

export default function OrdersPage() {
  const router = useRouter();
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const confirm = useConfirm();
  const appToast = useToast();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "kanban" | "graph" | "pivot">("list");

  // Restore and sync active view tab from URL or localStorage across reloads
  useEffect(() => {
    const STORAGE_KEY = "vm_orders_active_view";
    const validViews = ["list", "kanban", "graph", "pivot"] as const;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlView = urlParams.get("view");
      if (urlView && (validViews as readonly string[]).includes(urlView)) {
        setView(urlView as typeof view);
        localStorage.setItem(STORAGE_KEY, urlView);
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (validViews as readonly string[]).includes(saved)) {
        setView(saved as typeof view);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("view", saved);
        window.history.replaceState(null, "", currentUrl.toString());
      }
    } catch {}
  }, []);

  const handleViewChange = (newView: "list" | "kanban" | "graph" | "pivot") => {
    setView(newView);
    try {
      localStorage.setItem("vm_orders_active_view", newView);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("view", newView);
      window.history.replaceState(null, "", currentUrl.toString());
    } catch {}
  };

  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  const orderColumns: CentralTableColumn<OrderRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order #",
        sortable: true,
        width: "120px",
        cell: ({ row, value }) => (
          <Link
            href={`/orders/${row.id}`}
            className="font-mono font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
          >
            <span>{value}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
          </Link>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer & Contact",
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
        header: "Placed Date",
        sortable: true,
        width: "140px",
        cell: ({ value }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span>{value}</span>
          </div>
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        sortable: true,
        width: "130px",
        cell: ({ value }) => <span className="text-xs text-muted-foreground font-medium">{value}</span>,
      },
      {
        accessorKey: "itemCount",
        header: "Items",
        align: "center",
        width: "90px",
        cell: ({ value }) => (
          <Badge variant="outline" className="text-xs font-semibold tabular-nums">
            {value} items
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Order Status",
        sortable: true,
        width: "130px",
        cell: ({ value }) => (
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border inline-block", STATUS_META[value as OrderStatus])}>
            {value}
          </span>
        ),
      },
      {
        accessorKey: "deliveryStage",
        header: "Delivery Milestone",
        sortable: true,
        width: "170px",
        cell: ({ row }) => {
          const stage = row.deliveryStage || (row.status === "Quotation" ? "Pending Confirmation" : "Confirmed");
          const isPending = stage === "Pending Confirmation";
          const isPacked = stage === "Packed";
          const isCourier = stage === "Handed to Courier" || stage === "In Transit" || stage === "Out for Delivery";
          const isDelivered = stage === "Delivered";

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2 py-0.5 inline-flex items-center gap-1",
                isDelivered
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  : isCourier
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  : isPacked
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30"
                  : isPending
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : "bg-muted text-foreground border-border"
              )}
            >
              {stage}
            </Badge>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment",
        sortable: true,
        width: "110px",
        cell: ({ value }) => (
          <Badge variant={value === "Paid" ? "default" : value === "Refunded" ? "outline" : "secondary"} className="text-xs font-semibold px-2.5 py-1">
            {value}
          </Badge>
        ),
      },
      {
        accessorKey: "totalValue",
        header: "Total Value",
        sortable: true,
        align: "right",
        width: "120px",
        cell: ({ row }) => <span className="font-mono font-bold text-sm text-foreground">{row.total}</span>,
      },
      {
        id: "details",
        header: "Details",
        align: "right",
        width: "130px",
        cell: ({ row }) => (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs font-semibold text-foreground hover:text-primary hover:border-primary/50 gap-1.5 cursor-pointer transition-colors"
            >
              <Link href={`/orders/${row.id}`}>
                <span>Details</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

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
  const graphData = useMemo(() => {
    const relevantRows = rows.filter((o) => {
      const matchesChannel = selectedChannel === "all" || o.channelKey === selectedChannel;
      const matchesPayment = selectedPayment === "all" || o.paymentStatus === selectedPayment;
      const matchesQuery =
        !effectiveQuery ||
        o.id.toLowerCase().includes(effectiveQuery) ||
        o.customer.toLowerCase().includes(effectiveQuery) ||
        o.email.toLowerCase().includes(effectiveQuery);
      return matchesChannel && matchesPayment && matchesQuery;
    });

    return STAGE_KEYS.map((s) => {
      const stageRows = relevantRows.filter((o) => o.status === s);
      return {
        label: s,
        value: stageRows.reduce((sum, o) => sum + o.totalValue, 0),
        count: stageRows.length,
      };
    });
  }, [rows, selectedChannel, selectedPayment, effectiveQuery]);

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

  return (
    <>
      {/* Title & Station Links Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <Badge variant="outline" className="text-xs bg-muted/60 font-semibold">
              History &amp; Overview
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete historical audit log of customer orders. Click any order row to open its detailed profile, timeline, and fulfillment stations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={exportOrdersCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer">
            <Link href="/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Link>
          </Button>
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
        onChange={(k) => handleViewChange(k as typeof view)}
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
          columns={orderColumns}
          loading={loading}
          loadingRows={6}
          selectable
          searchable
          searchPlaceholder="Search order/customer... or total>100000, status:draft"
          title="All Orders"
          description={`${filteredRows.length} of ${rows.length} orders`}
          groupable
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
          onRowClick={(row) => router.push(`/orders/${row.id}`)}
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
          selectedLabel={selectedStatus}
          onSelect={(d) => {
            setSelectedStatus(d.label === selectedStatus ? "all" : d.label);
          }}
          onClearSelection={() => setSelectedStatus("all")}
          title="Orders Revenue by Stage"
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
    </>
  );
}
