"use client";

import React, { useState, useMemo } from "react";
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

export default function AdminDashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTableQuery, setSearchTableQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return ALL_ORDERS.filter((order) => {
      const matchesChannel =
        selectedChannel === "all" || order.channelKey === selectedChannel;
      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;
      const matchesQuery =
        !searchTableQuery.trim() ||
        order.id.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTableQuery.toLowerCase());

      return matchesChannel && matchesStatus && matchesQuery;
    });
  }, [selectedChannel, selectedStatus, searchTableQuery]);

  const hasActiveFilters =
    selectedChannel !== "all" || selectedStatus !== "all" || selectedCategory !== "all" || searchTableQuery.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navbar: Full width with spacious horizontal padding */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur w-full">
        <div className="flex h-18 items-center justify-between px-8 md:px-12 w-full">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-base shadow-xs">
              E
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg tracking-tight">
                Admin Panel
              </span>
              <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                shadcn/ui
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick search bar with comfortable padding */}
            <div className="relative w-72 md:w-96">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Search orders, customers..."
                className="h-11 w-full rounded-md border border-input/80 bg-muted/40 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Full width with generous padding and vertical spacing */}
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

        {/* Centralized Reusable KPI Grid */}
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
            progressLabel="Target: $55,000"
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
          />
        </KpiGrid>

        {/* Filter Toolbar with Searchable Dropboxes and generous padding */}
        <Card className="p-6 md:p-8 shadow-xs border-border/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>Searchable Filters</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedChannel("all");
                  setSelectedStatus("all");
                  setSelectedCategory("all");
                  setSearchTableQuery("");
                }}
                className="h-9 px-3 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset all
              </Button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Searchable Dropbox 1: Channel Selector */}
            <SearchableDropbox
              label="Sales Channel"
              options={CHANNEL_OPTIONS}
              value={selectedChannel}
              onChange={setSelectedChannel}
              placeholder="Choose channel..."
              searchPlaceholder="Search channel or currency..."
            />

            {/* Searchable Dropbox 2: Order Status */}
            <SearchableDropbox
              label="Order Status"
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Choose status..."
              searchPlaceholder="Search order status..."
            />

            {/* Searchable Dropbox 3: Category Picker */}
            <SearchableDropbox
              label="Product Category"
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Choose category..."
              searchPlaceholder="Search product category..."
            />
          </div>
        </Card>

        {/* Tabs: Live Orders & Warehouse Pipeline */}
        <Tabs defaultValue="orders" className="space-y-5">
          <div className="flex items-center justify-between">
            <TabsList className="h-11 p-1">
              <TabsTrigger value="orders" className="text-sm font-medium px-5">
                Live Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="warehouse" className="text-sm font-medium px-5">
                Warehouse Pipeline
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Table Tab with generous padding */}
          <TabsContent value="orders">
            <Card className="shadow-xs border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-b border-border/70">
                    <TableHead className="w-[140px] text-sm font-semibold py-4 px-6">Order ID</TableHead>
                    <TableHead className="text-sm font-semibold py-4 px-6">Customer</TableHead>
                    <TableHead className="text-sm font-semibold py-4 px-6">Channel</TableHead>
                    <TableHead className="text-sm font-semibold py-4 px-6">Date</TableHead>
                    <TableHead className="text-sm font-semibold py-4 px-6">Status</TableHead>
                    <TableHead className="text-right text-sm font-semibold py-4 px-6">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-16 text-center text-sm text-muted-foreground"
                      >
                        No orders match the selected filters. Try searching for a different channel or status.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/40 border-b border-border/50">
                        <TableCell className="font-mono text-sm font-bold py-4.5 px-6">
                          {order.id}
                        </TableCell>
                        <TableCell className="py-4.5 px-6">
                          <div className="font-semibold text-sm text-foreground">
                            {order.customer}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {order.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-medium py-4.5 px-6">
                          {order.channel}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-4.5 px-6">
                          {order.date}
                        </TableCell>
                        <TableCell className="py-4.5 px-6">
                          <Badge
                            variant={
                              order.status === "Fulfilled"
                                ? "default"
                                : order.status === "Processing"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs font-semibold px-3 py-1"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-sm py-4.5 px-6">
                          {order.total}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
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
    </div>
  );
}
