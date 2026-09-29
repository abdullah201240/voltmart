"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { ThemeToggle } from "@/components/theme-toggle";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Search,
  Bell,
  Download,
  Plus,
  Store,
  Layers,
  Filter,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Activity,
  Percent,
} from "lucide-react";

const CHANNEL_OPTIONS: DropboxOption[] = [
  {
    value: "all",
    label: "All Channels",
    badge: "GLOBAL",
    description: "Combined sales across all markets",
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: "default-channel",
    label: "Default Channel (USD)",
    badge: "USD",
    description: "Primary international online store",
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: "channel-pln",
    label: "Poland Channel (PLN)",
    badge: "PLN",
    description: "Central & Eastern Europe localized channel",
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: "channel-eur",
    label: "Eurozone Store (EUR)",
    badge: "EUR",
    description: "Western Europe direct-to-consumer store",
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: "mobile-app",
    label: "Mobile App Channel",
    badge: "APP",
    description: "iOS & Android in-app purchases",
    icon: <Store className="h-4 w-4" />,
  },
  {
    value: "b2b-wholesale",
    label: "B2B Wholesale Portal",
    badge: "B2B",
    description: "Tiered pricing corporate sales",
    icon: <Store className="h-4 w-4" />,
  },
];

const STATUS_OPTIONS: DropboxOption[] = [
  { value: "all", label: "All Statuses", description: "Show all orders" },
  {
    value: "Fulfilled",
    label: "Fulfilled",
    badge: "DELIVERED",
    description: "Completed & shipped out",
  },
  {
    value: "Processing",
    label: "Processing",
    badge: "PACKING",
    description: "In warehouse preparation",
  },
  {
    value: "Pending",
    label: "Pending Payment",
    badge: "WAITING",
    description: "Awaiting gateway clearance",
  },
  {
    value: "Cancelled",
    label: "Cancelled",
    badge: "REFUNDED",
    description: "Voided or cancelled orders",
  },
];

const CATEGORY_OPTIONS: DropboxOption[] = [
  { value: "all", label: "All Categories", icon: <Layers className="h-4 w-4" /> },
  { value: "mobiles", label: "Smartphones & Tablets", description: "Flagships, foldables & pads" },
  { value: "laptops", label: "Laptops & Workstations", description: "Ultrabooks & creators" },
  { value: "audio", label: "Audio & Acoustics", description: "Noise-canceling & studio gear" },
  { value: "gaming", label: "Gaming Gear", description: "Consoles, handhelds, peripherals" },
  { value: "accessories", label: "Peripherals & Cables", description: "Chargers, hubs, adapters" },
];

const STATS = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    period: "vs last month",
    icon: DollarSign,
  },
  {
    title: "Total Orders",
    value: "1,248",
    change: "+12.4%",
    trend: "up",
    period: "vs last month",
    icon: ShoppingCart,
  },
  {
    title: "Active Customers",
    value: "3,842",
    change: "+18.2%",
    trend: "up",
    period: "new registered buyers",
    icon: Users,
  },
  {
    title: "Pending Stock Alerts",
    value: "14 Items",
    change: "-4.5%",
    trend: "down",
    period: "threshold alerts",
    icon: Package,
  },
];

const ALL_ORDERS = [
  {
    id: "ORD-7392",
    customer: "Liam Johnson",
    email: "liam@example.com",
    channel: "Default Channel (USD)",
    channelKey: "default-channel",
    total: "$359.00",
    status: "Fulfilled",
    date: "Sep 29, 2026",
  },
  {
    id: "ORD-7391",
    customer: "Olivia Smith",
    email: "olivia@example.com",
    channel: "Mobile App Channel",
    channelKey: "mobile-app",
    total: "$899.50",
    status: "Processing",
    date: "Sep 29, 2026",
  },
  {
    id: "ORD-7390",
    customer: "Noah Williams",
    email: "noah@example.com",
    channel: "Default Channel (USD)",
    channelKey: "default-channel",
    total: "$124.00",
    status: "Fulfilled",
    date: "Sep 28, 2026",
  },
  {
    id: "ORD-7389",
    customer: "Emma Brown",
    email: "emma@example.com",
    channel: "Poland Channel (PLN)",
    channelKey: "channel-pln",
    total: "1,840.00 PLN",
    status: "Pending",
    date: "Sep 28, 2026",
  },
  {
    id: "ORD-7388",
    customer: "James Davis",
    email: "james@example.com",
    channel: "B2B Wholesale Portal",
    channelKey: "b2b-wholesale",
    total: "$14,200.00",
    status: "Fulfilled",
    date: "Sep 27, 2026",
  },
  {
    id: "ORD-7387",
    customer: "Sophia Taylor",
    email: "sophia@example.com",
    channel: "Eurozone Store (EUR)",
    channelKey: "channel-eur",
    total: "€430.00",
    status: "Processing",
    date: "Sep 27, 2026",
  },
  {
    id: "ORD-7386",
    customer: "Lucas White",
    email: "lucas@example.com",
    channel: "Default Channel (USD)",
    channelKey: "default-channel",
    total: "$79.99",
    status: "Cancelled",
    date: "Sep 26, 2026",
  },
];

const ORDER_COLUMNS: CentralTableColumn<(typeof ALL_ORDERS)[0]>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    sortable: true,
    width: "140px",
    cell: ({ value }) => (
      <span className="font-mono font-bold text-sm text-foreground">
        {value}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    sortable: true,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-sm text-foreground">{row.customer}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{row.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "channel",
    header: "Sales Channel",
    sortable: true,
    cell: ({ value }) => (
      <span className="text-sm text-muted-foreground font-medium">{value}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    sortable: true,
    cell: ({ value }) => (
      <span className="text-sm text-muted-foreground">{value}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => (
      <Badge
        variant={
          value === "Fulfilled"
            ? "default"
            : value === "Processing"
            ? "secondary"
            : "outline"
        }
        className="text-xs font-semibold px-3 py-1"
      >
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    sortable: true,
    align: "right",
    cell: ({ value }) => (
      <span className="font-mono font-bold text-sm text-foreground">{value}</span>
    ),
  },
];

export default function AdminDashboardPage() {
  const { searchQuery, setSearchQuery } = useAdminLayout();
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [kpiTab, setKpiTab] = useState<"overview" | "cart" | "compact">("overview");

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return ALL_ORDERS.filter((order) => {
      const matchesChannel =
        selectedChannel === "all" || order.channelKey === selectedChannel;
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;
      const matchesQuery =
        !effectiveQuery ||
        order.id.toLowerCase().includes(effectiveQuery) ||
        order.customer.toLowerCase().includes(effectiveQuery) ||
        order.email.toLowerCase().includes(effectiveQuery);

      return matchesChannel && matchesStatus && matchesQuery;
    });
  }, [selectedChannel, selectedStatus, effectiveQuery]);

  const hasActiveFilters =
    selectedChannel !== "all" ||
    selectedStatus !== "all" ||
    selectedCategory !== "all" ||
    effectiveQuery.length > 0;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedChannel !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedCategory !== "all") count++;
    return count;
  }, [selectedChannel, selectedStatus, selectedCategory]);

  return (
    <main className="px-8 md:px-12 py-8 md:py-10 w-full space-y-8">
        {/* Title & Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">
              Monitor multi-channel revenue, orders, and fulfillment pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5 text-sm font-medium">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="h-11 px-5 text-sm font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Centralized Reusable KPI System with View Switcher */}
        <div className="space-y-4">
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
                title="Total Revenue"
                value="$45,231.89"
                change="+20.1%"
                trend="up"
                period="vs last month"
                icon={DollarSign}
                tone="emerald"
                tooltip="Net gross sales processed across all verified channels"
                progress={82}
                progressLabel="Monthly Target: $55,000"
                sparkline={[31000, 33500, 32000, 38000, 42000, 41000, 45231]}
              />
              <KpiCard
                title="Total Orders"
                value="1,248"
                change="+12.4%"
                trend="up"
                period="vs last month"
                icon={ShoppingCart}
                tone="blue"
                badge="LIVE"
                tooltip="Total completed and pending orders recorded"
                sparkline={[920, 990, 940, 1080, 1140, 1190, 1248]}
              />
              <KpiCard
                title="Active Customers"
                value="3,842"
                change="+18.2%"
                trend="up"
                period="new registered buyers"
                icon={Users}
                tone="violet"
                tooltip="Unique customer accounts with activity in the last 30 days"
                sparkline={[2900, 3120, 3200, 3450, 3600, 3720, 3842]}
              />
              <KpiCard
                title="Pending Stock Alerts"
                value="14 Items"
                change="-4.5%"
                trend="down"
                period="threshold alerts"
                icon={Package}
                tone="amber"
                badge="ALERT"
                tooltip="Items whose inventory count is below minimum safety threshold"
                sparkline={[24, 21, 19, 18, 16, 15, 14]}
              />
            </KpiGrid>
          )}

          {kpiTab === "cart" && (
            <KpiGrid columns={4}>
              <KpiCard
                title="Average Cart Value (AOV)"
                value="$76.40"
                change="+8.4%"
                trend="up"
                period="vs previous period"
                icon={ShoppingBag}
                tone="cyan"
                variant="accent"
                tooltip="Average order value per completed checkout cart"
                sparkline={[64, 66, 68, 70, 72, 74, 76.4]}
              />
              <KpiCard
                title="Cart Abandonment Rate"
                value="24.6%"
                change="-3.1%"
                trend="down"
                trendInverse={true}
                period="vs last week (lower is better)"
                icon={Percent}
                tone="emerald"
                variant="accent"
                badge="HEALTHY"
                tooltip="Percentage of carts abandoned before checkout - downward trend is positive"
                sparkline={[31, 29.5, 28, 27.2, 26, 25.1, 24.6]}
              />
              <KpiCard
                title="Checkout Conversion Rate"
                value="3.82%"
                change="+0.9%"
                trend="up"
                period="organic & direct sessions"
                icon={TrendingUp}
                tone="violet"
                variant="accent"
                progress={76}
                progressLabel="Target: 5.0%"
                tooltip="Ratio of completed transactions relative to total unique store sessions"
                sparkline={[2.8, 2.9, 3.1, 3.2, 3.5, 3.6, 3.82]}
              />
              <KpiCard
                title="Active Cart Sessions"
                value="482"
                suffix="Live"
                change="+14.2%"
                trend="up"
                period="concurrent shoppers"
                icon={Activity}
                tone="indigo"
                variant="accent"
                badge="REALTIME"
                tooltip="Shoppers currently modifying carts or proceeding through checkout"
                sparkline={[320, 350, 390, 420, 440, 465, 482]}
              />
            </KpiGrid>
          )}

          {kpiTab === "compact" && (
            <KpiGrid columns={4}>
              <KpiCard
                title="Gross Revenue"
                value="$45.2k"
                change="+20.1%"
                trend="up"
                icon={DollarSign}
                tone="emerald"
                variant="compact"
              />
              <KpiCard
                title="Active Orders"
                value="1,248"
                change="+12.4%"
                trend="up"
                icon={ShoppingCart}
                tone="blue"
                variant="compact"
              />
              <KpiCard
                title="Cart Abandonment"
                value="24.6%"
                change="-3.1%"
                trend="down"
                trendInverse={true}
                icon={ShoppingBag}
                tone="cyan"
                variant="compact"
              />
              <KpiCard
                title="Low Inventory"
                value="14"
                suffix="skus"
                change="-4.5%"
                trend="down"
                icon={Package}
                tone="amber"
                variant="compact"
              />
            </KpiGrid>
          )}
        </div>

        {/* Tabs: Live Orders & Warehouse Pipeline */}
        <Tabs defaultValue="orders" className="space-y-5">
          <div className="flex items-center justify-between">
            <TabsList className="h-11 p-1">
              <TabsTrigger value="orders" className="text-sm font-medium px-5 cursor-pointer">
                Live Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="warehouse" className="text-sm font-medium px-5 cursor-pointer">
                Warehouse Pipeline
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Table Tab with CentralTable containing all integrated filters */}
          <TabsContent value="orders">
            <CentralTable
              data={filteredOrders}
              columns={ORDER_COLUMNS}
              selectable
              searchable
              searchPlaceholder="Quick filter live orders..."
              title="Recent Customer Orders"
              description="Real-time multi-channel order pipeline and transaction status"
              filters={
                <div className="grid gap-5 sm:grid-cols-3 w-full">
                  <SearchableDropbox
                    label="Sales Channel"
                    options={CHANNEL_OPTIONS}
                    value={selectedChannel}
                    onChange={setSelectedChannel}
                    placeholder="Choose channel..."
                    searchPlaceholder="Search channel or currency..."
                  />
                  <SearchableDropbox
                    label="Order Status"
                    options={STATUS_OPTIONS}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Choose status..."
                    searchPlaceholder="Search order status..."
                  />
                  <SearchableDropbox
                    label="Product Category"
                    options={CATEGORY_OPTIONS}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Choose category..."
                    searchPlaceholder="Search product category..."
                  />
                </div>
              }
              activeFiltersCount={activeFiltersCount}
              defaultFiltersOpen={true}
              onClearFilters={() => {
                setSelectedChannel("all");
                setSelectedStatus("all");
                setSelectedCategory("all");
                setSearchTableQuery("");
              }}
              pagination
              pageSize={5}
              pageSizeOptions={[5, 10, 20]}
              selectedActions={(selectedRows, clearSelection) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold cursor-pointer"
                    onClick={() => {
                      alert(`Exporting ${selectedRows.length} orders`);
                      clearSelection();
                    }}
                  >
                    Export Selected
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold cursor-pointer"
                    onClick={() => {
                      alert(`Batch updating status for ${selectedRows.length} orders`);
                      clearSelection();
                    }}
                  >
                    Batch Process
                  </Button>
                </div>
              )}
              emptyAction={
                hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedChannel("all");
                      setSelectedStatus("all");
                      setSelectedCategory("all");
                      setSearchTableQuery("");
                    }}
                    className="cursor-pointer text-xs font-semibold gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset All Filters
                  </Button>
                )
              }
            />
          </TabsContent>

          {/* Warehouse Pipeline Tab with generous padding */}
          <TabsContent value="warehouse">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-7 md:p-8 shadow-xs border-border/80 space-y-6">
                <h3 className="text-lg font-semibold">Fulfillment Progress</h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Ready to Ship</span>
                      <span className="text-muted-foreground font-semibold">85%</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Packaging in Progress</span>
                      <span className="text-muted-foreground font-semibold">52%</span>
                    </div>
                    <Progress value={52} className="h-3" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Awaiting Supplier Dispatch</span>
                      <span className="text-muted-foreground font-semibold">24%</span>
                    </div>
                    <Progress value={24} className="h-3" />
                  </div>
                </div>
              </Card>

              <Card className="p-7 md:p-8 shadow-xs border-border/80 space-y-5">
                <h3 className="text-lg font-semibold">Low Stock Thresholds</h3>
                <div className="flex items-center justify-between rounded-lg border border-border/70 p-4.5 bg-muted/20">
                  <div className="flex items-center gap-3.5">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">
                        Wireless Active ANC Headphones
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        3 units left (Reorder point: 10)
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold">
                    Restock
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/70 p-4.5 bg-muted/20">
                  <div className="flex items-center gap-3.5">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">
                        USB-C Fast Charging Hub 100W
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        5 units left (Reorder point: 15)
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-semibold">
                    Restock
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
  );
}
