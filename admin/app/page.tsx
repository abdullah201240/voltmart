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
  ExternalLink,
} from "lucide-react";

const CHANNEL_OPTIONS: DropboxOption[] = [
  {
    value: "all",
    label: "All Channels",
    badge: "GLOBAL",
    description: "Combined sales across all markets",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    value: "default-channel",
    label: "Default Channel (USD)",
    badge: "USD",
    description: "Primary international online store",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    value: "channel-pln",
    label: "Poland Channel (PLN)",
    badge: "PLN",
    description: "Central & Eastern Europe localized channel",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    value: "channel-eur",
    label: "Eurozone Store (EUR)",
    badge: "EUR",
    description: "Western Europe direct-to-consumer store",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    value: "mobile-app",
    label: "Mobile App Channel",
    badge: "APP",
    description: "iOS & Android in-app purchases",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    value: "b2b-wholesale",
    label: "B2B Wholesale Portal",
    badge: "B2B",
    description: "Tiered pricing corporate sales",
    icon: <Store className="h-3.5 w-3.5" />,
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
  { value: "all", label: "All Categories", icon: <Layers className="h-3.5 w-3.5" /> },
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
      {/* Top Navbar: Sleek, balanced border, clean typography */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm shadow-xs">
              E
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight">
                Admin Panel
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                shadcn/ui
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick search bar */}
            <div className="relative w-60 md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                placeholder="Search orders, customers..."
                className="h-8 w-full rounded-md border border-input/80 bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Title & Actions Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-xs text-muted-foreground">
              Monitor multi-channel revenue, orders, and fulfillment pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Product
            </Button>
          </div>
        </div>

        {/* 4 Balanced KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-xs border-border/80">
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-md bg-muted/80 p-1.5 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-4">
                  <div className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`inline-flex items-center font-medium ${
                        stat.trend === "up"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">
                      {stat.period}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter Toolbar with Searchable Dropboxes */}
        <Card className="p-4 shadow-xs border-border/80">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Searchable Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChannel("all");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                    setSearchTableQuery("");
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset all
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
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
          </div>
        </Card>

        {/* Tabs: Live Orders & Warehouse Pipeline */}
        <Tabs defaultValue="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="h-9">
              <TabsTrigger value="orders" className="text-xs">
                Live Orders ({filteredOrders.length})
              </TabsTrigger>
              <TabsTrigger value="warehouse" className="text-xs">
                Warehouse Pipeline
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Table Tab */}
          <TabsContent value="orders">
            <Card className="shadow-xs border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[110px] text-xs">Order ID</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Channel</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-xs text-muted-foreground"
                      >
                        No orders match the selected filters. Try searching for a different channel or status.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-semibold">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-xs text-foreground">
                            {order.customer}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {order.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.channel}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {order.date}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "Fulfilled"
                                ? "default"
                                : order.status === "Processing"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px] font-medium"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-xs">
                          {order.total}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Warehouse Pipeline Tab */}
          <TabsContent value="warehouse">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-5 shadow-xs border-border/80 space-y-4">
                <h3 className="text-sm font-semibold">Fulfillment Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>Ready to Ship</span>
                      <span className="text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>Packaging in Progress</span>
                      <span className="text-muted-foreground">52%</span>
                    </div>
                    <Progress value={52} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span>Awaiting Supplier Dispatch</span>
                      <span className="text-muted-foreground">24%</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-5 shadow-xs border-border/80 space-y-3">
                <h3 className="text-sm font-semibold">Low Stock Thresholds</h3>
                <div className="flex items-center justify-between rounded-md border border-border/70 p-3 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-medium text-xs">
                        Wireless Active ANC Headphones
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        3 units left (Reorder point: 10)
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Restock
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-md border border-border/70 p-3 bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-medium text-xs">
                        USB-C Fast Charging Hub 100W
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        5 units left (Reorder point: 15)
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
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
