"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  PieChart,
  ArrowUpRight,
  Globe,
  Store,
  Share2,
} from "lucide-react";

export function CommercialAnalyticsPanel() {
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
              Saleor Pulse Protocol
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Net commercial revenue, average order value (AOV), and multi-channel origin breakdown.
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
        {/* Channel Contribution */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Sales Origin Breakdown</h3>
              <p className="text-xs text-muted-foreground">Revenue share tracked via Commerce Context headers.</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              4 Channels Active
            </Badge>
          </div>

          <div className="space-y-4 pt-2">
            {/* Online Storefront */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-foreground">Online Web Storefront (Next.js)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">৳32,56,700</span>
                  <span className="text-muted-foreground">60.0%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>

            {/* POS Dhanmondi Outlet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-foreground">POS Retail Dhanmondi Outlet</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">৳13,56,900</span>
                  <span className="text-muted-foreground">25.0%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>

            {/* Daraz Mall Flagship */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-semibold text-foreground">Daraz Mall Flagship Integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">৳5,42,700</span>
                  <span className="text-muted-foreground">10.0%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>

            {/* Social Commerce */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <Share2 className="h-3.5 w-3.5 text-violet-500" />
                  <span className="font-semibold text-foreground">Social Commerce (WhatsApp / FB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">৳2,71,527</span>
                  <span className="text-muted-foreground">5.0%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: "5%" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Top Electronics Products */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Top Performing Electronics</h3>
              <p className="text-xs text-muted-foreground">Ranked by net revenue volume today.</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-primary">
                All Products <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {/* Item 1 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Apple iPhone 15 Pro Max 256GB</div>
                <div className="text-xs text-muted-foreground">24 units sold · Dhanmondi & Online</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="font-mono font-bold text-sm text-foreground">৳14,20,000</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+18.4%</div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">MacBook Air M3 16GB / 512GB</div>
                <div className="text-xs text-muted-foreground">12 units sold · Online Storefront</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="font-mono font-bold text-sm text-foreground">৳18,50,000</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+12.1%</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Sony WH-1000XM5 Wireless ANC</div>
                <div className="text-xs text-muted-foreground">42 units sold · All Channels</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="font-mono font-bold text-sm text-foreground">৳6,80,000</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+24.0%</div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Anker 737 GaN PowerBank 24000mAh</div>
                <div className="text-xs text-muted-foreground">68 units sold · Fast accessories</div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className="font-mono font-bold text-sm text-foreground">৳3,40,000</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">+8.5%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
