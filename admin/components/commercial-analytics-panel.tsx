"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, ArrowUpRight, Split } from "lucide-react";
import { formatBDT, type DashboardSnapshot } from "@/lib/data/dashboard";
import type { TopProduct } from "@/lib/data/analytics";

export interface CommercialAnalyticsPanelProps {
  snapshot: DashboardSnapshot;
  topProducts: TopProduct[];
}

export function CommercialAnalyticsPanel({ snapshot, topProducts }: CommercialAnalyticsPanelProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Commercial & Multi-Channel Performance
            </span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary bg-primary/5">
              {snapshot.orderCount} order(s) in scope
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Net revenue {formatBDT(snapshot.revenue)} · AOV {formatBDT(snapshot.aov)} across active channels.
          </p>
        </div>

        <Link href="/analytics">
          <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-muted-foreground" />
            Full Analytics Suite
          </Button>
        </Link>
      </div>

      {/* Grid: Channel Split + Top Products */}
      <div className="grid gap-6 lg:grid-cols-2 w-full">
        {/* Channel Contribution — compact table, no progress tracks */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Revenue by Channel</h3>
              <p className="text-xs text-muted-foreground">Derived from orders in the selected channel & date context.</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              {snapshot.channelSplit.length} active
            </Badge>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/80">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Channel</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Orders</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.channelSplit.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No orders in the current context.
                    </td>
                  </tr>
                )}
                {snapshot.channelSplit.map((c) => (
                  <tr key={c.key} className="border-t border-border/70">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Split className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{c.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono tabular-nums text-muted-foreground">{c.orders}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">{formatBDT(c.revenue)}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">{c.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Electronics Products */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Top Performing Electronics</h3>
              <p className="text-xs text-muted-foreground">Ranked by net revenue volume.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-primary">
                All Products <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {topProducts.map((p) => (
              <div key={p.sku} className="py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.units} units · {p.sku}</div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="font-mono font-bold text-sm text-foreground">{formatBDT(p.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
