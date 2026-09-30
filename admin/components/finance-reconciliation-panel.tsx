"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  CreditCard,
  FileCheck,
  Receipt,
  Download,
  ArrowUpRight,
} from "lucide-react";

export function FinanceReconciliationPanel() {
  return (
    <div className="w-full space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Financials, MFS & Tax Reconciliations
            </span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              NBR & MFS Ready
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitor real-time bKash/Nagad wallet balances, Courier COD float, and NBR VAT Form 9.1 liability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/accounting/reconciliation">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
              Journal Reconciliation
            </Button>
          </Link>
          <Link href="/accounting/reports">
            <Button variant="outline" size="sm" className="h-9 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5">
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              VAT Form 9.1 Report
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Finance Cards */}
      <div className="grid gap-5 lg:grid-cols-3 w-full">
        {/* CARD 1: MFS Gateways (bKash / Nagad / Cards) */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                MFS Payment Gateways
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳24,92,500
              </div>
              <div className="text-xs text-muted-foreground">
                Total liquid balance across merchant accounts
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            {/* bKash */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">bKash Merchant Pool</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  API: 180ms
                </span>
              </div>
              <span className="font-mono font-bold text-foreground">৳18,42,500</span>
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Nagad Disbursement</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  Active
                </span>
              </div>
              <span className="font-mono font-bold text-foreground">৳6,50,000</span>
            </div>

            {/* SSLCommerz Card Escrow */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">SSLCommerz Scheduled Deposit</span>
              <span className="font-mono text-muted-foreground">Oct 2, 2026</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">TrxID verification active</span>
            <Link href="/payments">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Gateways <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CARD 2: Courier COD Remittance Float */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Courier COD Cash Float
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳4,38,500
              </div>
              <div className="text-xs text-muted-foreground">
                Customer cash collected by 3PL delivery riders
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            {/* Settled Today */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Reconciled to Bank Today</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">৳3,12,000</span>
            </div>

            {/* Overdue Remittance */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">Overdue (&gt; 72h)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                  Follow-up
                </span>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">৳1,26,500</span>
            </div>

            {/* Pathao & Steadfast Breakdown */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pathao: ৳84,000 · Steadfast: ৳42,500</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">98.4% SLA</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Bank deposit matching</span>
            <Link href="/accounting/reconciliation">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                Match Deposits <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CARD 3: NBR VAT Form 9.1 Live Tax Ledger */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                NBR VAT Form 9.1 (Monthly)
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳2,72,074
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated Net Tax payable on 15th of next month
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            {/* Output VAT */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Output VAT Collected (15%)</span>
              <span className="font-mono font-bold text-foreground">৳8,14,174</span>
            </div>

            {/* Input VAT Rebate */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Input VAT Rebate Claimed (Challan 6.3)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">- ৳5,42,100</span>
            </div>

            {/* Pending Mushak 6.3 */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pending Mushak 6.3 Tax Invoices</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">14 Orders</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">BIN: 004819284-0101</span>
            <Link href="/accounting/reports">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Tax Ledger <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
