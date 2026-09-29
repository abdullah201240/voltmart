"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, ShoppingCart, Receipt, Percent } from "lucide-react";
import {
  getAnalyticsSummary,
  getRevenueTrend,
  getSalesByChannel,
  getSalesByCategory,
  getTopProducts,
  type AnalyticsSummary,
  type TrendPoint,
  type BreakdownSlice,
  type TopProduct,
} from "@/lib/data/analytics";

const trendConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
};

const channelConfig: ChartConfig = {
  name: { label: "Channel" },
  value: { label: "Revenue" },
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function money(v: number) {
  return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | undefined>();
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [channels, setChannels] = useState<BreakdownSlice[]>([]);
  const [categories, setCategories] = useState<BreakdownSlice[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      getAnalyticsSummary(),
      getRevenueTrend(),
      getSalesByChannel(),
      getSalesByCategory(),
      getTopProducts(),
    ]).then(([s, t, ch, ca, tp]) => {
      if (alive) {
        setSummary(s);
        setTrend(t);
        setChannels(ch);
        setCategories(ca);
        setTop(tp);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Sales performance across channels — revenue, orders and conversion trends.
        </p>
      </div>

      <KpiGrid columns={4}>
        <KpiCard
          title="Revenue"
          value={summary ? money(summary.revenue) : "—"}
          icon={TrendingUp}
          tone="blue"
          loading={loading}
          change={summary ? `+${summary.revenueDelta}%` : undefined}
          trend="up"
          period="vs last period"
        />
        <KpiCard
          title="Orders"
          value={summary ? summary.orders.toLocaleString() : "—"}
          icon={ShoppingCart}
          tone="violet"
          loading={loading}
          change={summary ? `+${summary.ordersDelta}%` : undefined}
          trend="up"
          period="vs last period"
        />
        <KpiCard
          title="Avg Order Value"
          value={summary ? `$${summary.aov.toFixed(2)}` : "—"}
          icon={Receipt}
          tone="emerald"
          loading={loading}
          change={summary ? `+${summary.aovDelta}%` : undefined}
          trend="up"
          period="vs last period"
        />
        <KpiCard
          title="Conversion Rate"
          value={summary ? `${summary.conversion}%` : "—"}
          icon={Percent}
          tone="amber"
          loading={loading}
          change={summary ? `+${summary.conversionDelta}%` : undefined}
          trend="up"
          period="vs last period"
        />
      </KpiGrid>

      {/* Revenue trend */}
      <Card className="p-6 shadow-xs border-border/80">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Revenue &amp; Orders Trend</h2>
          <p className="text-sm text-muted-foreground">Monthly revenue against order volume</p>
        </div>
        <ChartContainer config={trendConfig} className="h-72 w-full">
          <AreaChart data={trend} margin={{ left: 4, right: 8 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={48} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#fillRevenue)"
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders per month */}
        <Card className="p-6 shadow-xs border-border/80">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Orders per Month</h2>
            <p className="text-sm text-muted-foreground">Order volume by month</p>
          </div>
          <ChartContainer config={trendConfig} className="h-64 w-full">
            <BarChart data={trend} margin={{ left: 4, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Sales by channel */}
        <Card className="p-6 shadow-xs border-border/80">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Revenue by Channel</h2>
            <p className="text-sm text-muted-foreground">Share of revenue per sales channel</p>
          </div>
          <ChartContainer config={channelConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={channels} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {channels.map((entry, idx) => (
                  <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            {channels.map((entry, idx) => (
              <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Sales by category + Top products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-xs border-border/80">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Revenue by Category</h2>
            <p className="text-sm text-muted-foreground">Top performing categories</p>
          </div>
          <ChartContainer config={channelConfig} className="h-64 w-full">
            <BarChart data={categories} layout="vertical" margin={{ left: 12, right: 16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-6 shadow-xs border-border/80">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <p className="text-sm text-muted-foreground">Best sellers by revenue</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/80">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Product</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Units</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.sku} className="border-t border-border/70">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.sku}</div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono tabular-nums text-muted-foreground">{p.units}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">{money(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
