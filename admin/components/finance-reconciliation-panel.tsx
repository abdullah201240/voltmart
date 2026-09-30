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
import { formatBDT, type DashboardSnapshot } from "@/lib/data/dashboard";

export interface FinanceReconciliationPanelProps {
  snapshot: DashboardSnapshot;
}

export function FinanceReconciliationPanel({ snapshot }: FinanceReconciliationPanelProps) {
  return (
    <div className="w-full space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Financials & Tax Reconciliation
            </span>
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              Ledger-derived
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Outstanding payments, courier COD float and net VAT liability — all computed from the accounting records.
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
              VAT Report
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Core Finance Cards */}
      <div className="grid gap-5 lg:grid-cols-3 w-full">
        {/* CARD 1: Payments to settle */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Payments to Settle
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatBDT(snapshot.paymentsToSettle)}
              </div>
              <div className="text-xs text-muted-foreground">
                Unreconciled inbound payments across methods
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Pending payments</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{snapshot.paymentsPendingCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Failed payments</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{snapshot.paymentsFailedCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Of which COD float</span>
              <span className="font-mono text-muted-foreground">{formatBDT(snapshot.codFloat)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Match payments to invoices</span>
            <Link href="/payments">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Payments <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* CARD 2: Courier COD cash float */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Courier COD Cash Float
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatBDT(snapshot.codFloat)}
              </div>
              <div className="text-xs text-muted-foreground">
                Customer cash collected via COD, awaiting bank deposit
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Total inbound outstanding</span>
              <span className="font-mono font-bold text-foreground">{formatBDT(snapshot.paymentsToSettle)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Pending payment records</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{snapshot.paymentsPendingCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Failed payment records</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{snapshot.paymentsFailedCount}</span>
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

        {/* CARD 3: Net VAT liability */}
        <Card className="p-5 md:p-6 shadow-xs border-border/80 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Net VAT Liability
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatBDT(snapshot.vatNet, { decimals: true })}
              </div>
              <div className="text-xs text-muted-foreground">
                Output VAT less input VAT rebate from posted documents
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Output VAT (invoiced sales)</span>
              <span className="font-mono font-bold text-foreground">{formatBDT(snapshot.vatOutput, { decimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Input VAT rebate (bills)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">- {formatBDT(snapshot.vatInput, { decimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Draft tax invoices pending</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{snapshot.pendingMushak} order(s)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Filing-ready from the ledger</span>
            <Link href="/accounting/reports">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary gap-1">
                View Tax Report <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
