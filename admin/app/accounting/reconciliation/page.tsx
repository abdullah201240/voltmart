"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { ArrowLeft, Landmark, Wallet, CheckCheck, CircleDashed, Building2, Undo2, Sparkles } from "lucide-react";
import {
  getBankStatementLines,
  suggestAccountForLine,
  type BankStatementLine,
} from "@/lib/data/accounting";
import { getInvoices, getBills, type InvoiceRow, type BillRow } from "@/lib/data/finance";
import { reconcileStatement, unreconcileStatement, statementStatus } from "@/lib/data/workflows";
import { useOps } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";

function money(v: number) {
  const sign = v < 0 ? "−" : "";
  return sign + "৳" + Math.abs(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** An open receivable/payable that a bank line can be matched against. */
interface OpenDoc {
  ref: string;
  number: string;
  partner: string;
  open: number;
  /** +1 = money expected in (receivable), -1 = money to pay out (payable). */
  dir: 1 | -1;
}

export default function BankReconciliationPage() {
  const version = useOps();
  const [lines, setLines] = useState<BankStatementLine[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [bills, setBills] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const appToast = useToast();

  useEffect(() => {
    let alive = true;
    Promise.all([getBankStatementLines(), getInvoices(), getBills()]).then(([l, i, b]) => {
      if (alive) {
        setLines(l);
        setInvoices(i);
        setBills(b);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  // Effective status always read from the overlay so it survives reloads.
  const statusOf = (l: BankStatementLine) => statementStatus(l.id) ?? l.status;

  const openDocs = useMemo<OpenDoc[]>(() => {
    const rec: OpenDoc[] = invoices
      .filter((i) => i.state === "Posted")
      .map((i) => ({ ref: i.id, number: i.number, partner: i.partner, open: i.total, dir: 1 as const }));
    const pay: OpenDoc[] = bills
      .filter((b) => b.state === "Posted")
      .map((b) => ({ ref: b.id, number: b.number, partner: b.vendor, open: b.amountTotal - b.amountPaid, dir: -1 as const }));
    return [...rec, ...pay].filter((d) => d.open > 0.5);
  }, [invoices, bills]);

  // Odoo-style auto-match: same partner, same direction, equal amount.
  const matchesFor = (line: BankStatementLine) =>
    openDocs.filter(
      (d) => d.partner === line.partner && Math.sign(d.dir) === Math.sign(line.amount) && Math.abs(d.open - Math.abs(line.amount)) < 0.5,
    );

  const active = lines.find((l) => l.id === activeId) ?? null;
  const activeMatches = active ? matchesFor(active) : [];
  const suggestedAccount = active ? suggestAccountForLine(active) : null;

  const unreconciled = lines.filter((l) => statusOf(l) === "unreconciled");
  const reconciled = lines.filter((l) => statusOf(l) === "reconciled");
  const netMovement = lines.reduce((s, l) => s + l.amount, 0);

  const doReconcile = (line: BankStatementLine, match: OpenDoc | null) => {
    const res = reconcileStatement(
      line.id,
      line.label,
      match ? { docRef: match.ref, docNumber: match.number } : null,
    );
    if (res.ok) {
      appToast.success("Statement reconciled", res.message);
    } else {
      appToast.error("Reconciliation failed", res.message);
    }
  };

  const doUnreconcile = (line: BankStatementLine) => {
    const [m] = matchesFor(line);
    const res = unreconcileStatement(
      line.id,
      line.label,
      m ? { docRef: m.ref, docNumber: m.number } : null,
    );
    if (res.ok) {
      appToast.info("Reconciliation cleared", res.message);
    } else {
      appToast.error("Failed to unreconcile", res.message);
    }
  };

  return (
    <>
      <Link href="/accounting/journals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Journal Entries
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-sm text-muted-foreground">
            Match the bank feed against open receivables and payables — exactly how Odoo validates a statement.
          </p>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Statement Lines" value={String(lines.length)} icon={Landmark} tone="blue" />
        <KpiCard title="Unreconciled" value={String(unreconciled.length)} icon={CircleDashed} tone="amber" tooltip="Lines awaiting a match" />
        <KpiCard title="Reconciled" value={String(reconciled.length)} icon={CheckCheck} tone="emerald" />
        <KpiCard title="Net Bank Movement" value={money(netMovement)} icon={Wallet} tone="violet" tooltip="Sum of all statement lines (in − out)" />
      </KpiGrid>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] w-full">
        {/* Bank feed list */}
        <Card className="p-0 shadow-xs border-border/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/80">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bank Feed · City Bank · Current Account</h3>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {lines.map((l) => {
                const done = statusOf(l) === "reconciled";
                const hasMatch = !done && matchesFor(l).length > 0;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveId(l.id)}
                    className={cn(
                      "w-full text-left px-6 py-4 transition-colors cursor-pointer hover:bg-muted/40",
                      activeId === l.id && "bg-muted/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-sm text-foreground">{l.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{l.date} · {l.partner}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn("font-mono font-bold text-sm tabular-nums", l.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
                          {money(l.amount)}
                        </div>
                        <div className="mt-1">
                          {done ? (
                            <Badge variant="default" className="text-[10px] font-semibold">Reconciled</Badge>
                          ) : hasMatch ? (
                            <Badge variant="outline" className="text-[10px] font-semibold text-blue-600 border-blue-500/30 dark:text-blue-400">Suggested</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">Manual</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Reconciliation detail */}
        <Card className="p-6 shadow-xs border-border/80">
          {!active ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center gap-2">
              <Landmark className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Select a bank statement line</p>
              <p className="text-xs text-muted-foreground">Pick a movement on the left to match it against an open invoice or bill, or reconcile it directly to an account.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{active.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{active.date} · {active.partner}</p>
                </div>
                <span className={cn("font-mono text-xl font-extrabold tabular-nums", active.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
                  {money(active.amount)}
                </span>
              </div>

              {statusOf(active) === "reconciled" ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">This line has been reconciled.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
                    onClick={() => doUnreconcile(active)}
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Reverse reconciliation
                  </Button>
                </div>
              ) : (
                <>
                  {activeMatches.length > 0 ? (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" /> Automatic match
                      </div>
                      {activeMatches.map((m) => (
                        <div key={m.ref} className="flex items-center justify-between gap-3 rounded-lg border border-border/80 p-4">
                          <div className="min-w-0">
                            <div className="font-mono text-sm font-bold text-foreground">{m.number}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{m.partner} · open {money(m.open)}</div>
                          </div>
                          <Button
                            className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200"
                            onClick={() => doReconcile(active, m)}
                          >
                            <CheckCheck className="h-4 w-4" /> Reconcile
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/80 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" /> No open document matches — reconcile on account
                      </div>
                      {suggestedAccount && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Counterpart account</span>
                          <span className="font-medium text-foreground">
                            {suggestedAccount.name} <span className="font-mono text-xs text-muted-foreground">({suggestedAccount.code})</span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-end">
                        <Button
                          variant="outline"
                          className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200"
                          onClick={() => doReconcile(active, null)}
                        >
                          <CheckCheck className="h-4 w-4" /> Reconcile on account
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Reconciling a matched line settles its {active.amount >= 0 ? "invoice" : "bill"} to <span className="font-semibold">Paid</span> and posts a note to its chatter.
                  </p>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
