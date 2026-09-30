"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Printer,
  Scale,
  TrendingUp,
  Landmark,
  FileText,
  Users,
} from "lucide-react";
import {
  getMoves,
  postedBalances,
  netOf,
  reportSections,
  trialBalanceRows,
  ACCOUNT_TYPE_LABEL,
  ASSET_TYPES,
  LIABILITY_TYPES,
  EQUITY_TYPES,
  INCOME_TYPES,
  EXPENSE_TYPES,
  type MoveRow,
  type ReportSection,
} from "@/lib/data/accounting";
import { getInvoices, getBills, type InvoiceRow, type BillRow } from "@/lib/data/finance";
import { useOps } from "@/lib/data/ops";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type ReportTab = "trial" | "income" | "balance" | "aging";

const TABS: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
  { id: "trial", label: "Trial Balance", icon: <Scale className="h-4 w-4" /> },
  { id: "income", label: "Income Statement", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "balance", label: "Balance Sheet", icon: <Landmark className="h-4 w-4" /> },
  { id: "aging", label: "Partner Aging", icon: <Users className="h-4 w-4" /> },
];

/** Fixed reference date so the mock aging buckets are deterministic. */
const AS_OF = Date.parse("Sep 30, 2026 00:00:00");
const AGE_BUCKETS = ["Current", "1-30", "31-60", "61-90", "Over 90"] as const;
type AgeBucket = (typeof AGE_BUCKETS)[number];

/** Days overdue from a due date (negative = not yet due). */
function daysOverdue(dueDate: string): number {
  return Math.floor((AS_OF - Date.parse(dueDate + " 00:00:00")) / 86_400_000);
}

function bucketOf(overdue: number): AgeBucket {
  if (overdue <= 0) return "Current";
  if (overdue <= 30) return "1-30";
  if (overdue <= 60) return "31-60";
  if (overdue <= 90) return "61-90";
  return "Over 90";
}

/** Group open documents per partner into the five aging buckets. */
interface AgingLine {
  partner: string;
  buckets: Record<AgeBucket, number>;
  total: number;
}

function buildAging(docs: Array<{ partner: string; dueDate: string; open: number }>): AgingLine[] {
  const byPartner = new Map<string, AgingLine>();
  for (const d of docs) {
    if (d.open <= 0.005) continue;
    let line = byPartner.get(d.partner);
    if (!line) {
      line = { partner: d.partner, buckets: { Current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "Over 90": 0 }, total: 0 };
      byPartner.set(d.partner, line);
    }
    line.buckets[bucketOf(daysOverdue(d.dueDate))] += d.open;
    line.total += d.open;
  }
  return [...byPartner.values()].sort((a, b) => b.total - a.total);
}

/** One indented account line inside a report section. */
function ReportLine({ code, name, value, bold }: { code?: string; name: string; value: number; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-2", bold ? "border-t border-border/80 mt-1 pt-3" : "border-t border-border/60")}>
      <div className="min-w-0">
        <span className={cn("text-sm", bold ? "font-bold text-foreground" : "font-medium text-foreground")}>{name}</span>
        {code && <span className="ml-2 font-mono text-xs text-muted-foreground">{code}</span>}
      </div>
      <span className={cn("font-mono tabular-nums text-sm", bold ? "font-bold text-foreground" : "text-foreground")}>{money(value)}</span>
    </div>
  );
}

function SectionCard({ section, subtitle }: { section: ReportSection; subtitle?: string }) {
  return (
    <Card className="p-6 shadow-xs border-border/80">
      <div className="mb-2">
        <h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {section.rows
        .filter((r) => r.balance !== 0)
        .map((r) => (
          <ReportLine key={r.code} code={r.code} name={r.name} value={r.balance} />
        ))}
      <ReportLine name={`Total ${section.title}`} value={section.total} bold />
    </Card>
  );
}

/** Aged balance schedule (Odoo "Aged Partner Balance") for AR or AP. */
function AgingTable({
  title,
  lines,
  grandTotal,
  tone,
  note,
}: {
  title: string;
  lines: AgingLine[];
  grandTotal: number;
  tone: "emerald" | "rose";
  note: string;
}) {
  const totals = AGE_BUCKETS.reduce(
    (acc, b) => {
      acc[b] = lines.reduce((s, l) => s + l.buckets[b], 0);
      return acc;
    },
    { Current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "Over 90": 0 } as Record<AgeBucket, number>,
  );
  const overdueTone = tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";

  return (
    <Card className="p-6 shadow-xs border-border/80">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
        </div>
        <span className={cn("font-mono text-lg font-extrabold tracking-tight", overdueTone)}>{money(grandTotal)}</span>
      </div>
      {lines.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing outstanding.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border/80">
                <th className="py-3 pr-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Partner</th>
                {AGE_BUCKETS.map((b) => (
                  <th key={b} className="py-3 px-4 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">{b}</th>
                ))}
                <th className="py-3 pl-4 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.partner} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                  <td className="py-3 pr-4 font-medium text-foreground">{l.partner}</td>
                  {AGE_BUCKETS.map((b) => (
                    <td key={b} className={cn("py-3 px-4 text-right font-mono tabular-nums", l.buckets[b] > 0 && b !== "Current" ? overdueTone : "text-muted-foreground")}>
                      {l.buckets[b] > 0 ? money(l.buckets[b]) : "—"}
                    </td>
                  ))}
                  <td className="py-3 pl-4 text-right font-mono font-bold tabular-nums text-foreground">{money(l.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2 border-border/80">
                <td className="py-4 pr-4">Totals</td>
                {AGE_BUCKETS.map((b) => (
                  <td key={b} className="py-4 px-4 text-right font-mono tabular-nums">{money(totals[b])}</td>
                ))}
                <td className="py-4 pl-4 text-right font-mono tabular-nums">{money(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function FinancialReportsPage() {
  const version = useOps();
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [bills, setBills] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReportTab>("trial");

  useEffect(() => {
    let alive = true;
    Promise.all([getMoves(), getInvoices(), getBills()]).then(([m, inv, bl]) => {
      if (alive) {
        setMoves(m);
        setInvoices(inv);
        setBills(bl);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  const balances = useMemo(() => postedBalances(moves), [moves]);
  const tbRows = useMemo(() => trialBalanceRows(moves), [moves]);

  const incomeSections = useMemo(() => {
    const revenue = reportSections(balances, INCOME_TYPES, "Revenue", false);
    const cogs = reportSections(balances, ["expense_direct"], "Cost of Goods Sold", true);
    const overhead = reportSections(balances, EXPENSE_TYPES.filter((t) => t !== "expense_direct"), "Operating Expenses", true);
    const gross = revenue.total - cogs.total;
    const net = gross - overhead.total;
    return { revenue, cogs, overhead, gross, net };
  }, [balances]);

  const balanceSections = useMemo(() => {
    const assets = reportSections(balances, ASSET_TYPES, "Assets", true);
    const liabilities = reportSections(balances, LIABILITY_TYPES, "Liabilities", true);
    const equity = reportSections(balances, EQUITY_TYPES, "Equity", true);
    const retained = incomeSections.net; // current-period profit sits in equity
    return { assets, liabilities, equity, retained };
  }, [balances, incomeSections]);

  const tbDebit = tbRows.reduce((s, r) => s + (r.balance >= 0 ? r.balance : 0), 0);
  const tbCredit = tbRows.reduce((s, r) => s + (r.balance < 0 ? -r.balance : 0), 0);
  const tbBalanced = Math.abs(tbDebit - tbCredit) < 1;

  // Partner aging: open receivables (Posted invoices) and payables (unpaid
  // posted bill balances) bucketed by how overdue they are as of AS_OF.
  const arAging = useMemo(
    () => buildAging(invoices.filter((i) => i.state === "Posted").map((i) => ({ partner: i.partner, dueDate: i.dueDate, open: i.total }))),
    [invoices],
  );
  const apAging = useMemo(
    () => buildAging(bills.filter((b) => b.state === "Posted").map((b) => ({ partner: b.vendor, dueDate: b.dueDate, open: b.amountTotal - b.amountPaid }))),
    [bills],
  );
  const arTotal = arAging.reduce((s, r) => s + r.total, 0);
  const apTotal = apAging.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <Link href="/accounting/journals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Journal Entries
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-sm text-muted-foreground">
            Computed live from posted journal items — draft and cancelled entries never touch these books.
          </p>
        </div>
        <Button variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print / PDF
        </Button>
      </div>

      {/* Report tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b border-border/80 pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold rounded-t-md transition-all duration-200 cursor-pointer",
              tab === t.id
                ? "bg-card text-foreground border border-border/80 border-b-transparent -mb-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="p-10 shadow-xs border-border/80">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      ) : (
        <>
          {tab === "trial" && (
            <Card className="p-6 shadow-xs border-border/80">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Trial Balance — September 2026</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tbRows.length} active accounts · {moves.filter((m) => m.state === "Posted" || m.state === "Paid").length} posted entries
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5",
                    tbBalanced
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
                  )}
                >
                  <Scale className="h-3.5 w-3.5" /> {tbBalanced ? "Books in balance" : "Out of balance"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-border/80">
                      <th className="py-3 pr-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Code</th>
                      <th className="py-3 pr-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Account</th>
                      <th className="py-3 pr-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Debit</th>
                      <th className="py-3 pl-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tbRows.map((r) => (
                      <tr key={r.code} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                        <td className="py-3 pr-4 font-mono text-foreground">{r.code}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">{r.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">{ACCOUNT_TYPE_LABEL[r.internalType]}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{r.balance >= 0 ? money(r.balance) : ""}</td>
                        <td className="py-3 pl-4 text-right font-mono tabular-nums">{r.balance < 0 ? money(-r.balance) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold border-t-2 border-border/80">
                      <td className="py-4 pr-4" colSpan={3}>
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" /> Totals
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums">{money(tbDebit)}</td>
                      <td className="py-4 pl-4 text-right font-mono tabular-nums">{money(tbCredit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}

          {tab === "income" && (
            <div className="w-full grid gap-5 lg:grid-cols-2">
              <SectionCard section={incomeSections.revenue} subtitle="All income accounts (output VAT is a liability, not revenue)" />
              <div className="space-y-5">
                <SectionCard section={incomeSections.cogs} />
                <SectionCard section={incomeSections.overhead} />
              </div>
              <Card className="p-6 shadow-xs border-border/80 lg:col-span-2">
                <h3 className="text-xl font-bold tracking-tight mb-2">Result of the Period</h3>
                <ReportLine name="Total Revenue" value={incomeSections.revenue.total} />
                <ReportLine name="− Cost of Goods Sold" value={-incomeSections.cogs.total} />
                <ReportLine name="Gross Profit" value={incomeSections.gross} bold />
                <ReportLine name="− Operating Expenses" value={-incomeSections.overhead.total} />
                <ReportLine
                  name={`Net Profit${incomeSections.net >= 0 ? " ↑" : " ↓"}`}
                  value={incomeSections.net}
                  bold
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Net profit flows into Equity on the Balance Sheet (retained earnings of the period).
                </p>
              </Card>
            </div>
          )}

          {tab === "balance" && (
            <div className="w-full grid gap-5 lg:grid-cols-2">
              <SectionCard section={balanceSections.assets} subtitle="Bank, receivables, prepaid VAT and equipment" />
              <div className="space-y-5">
                <SectionCard section={balanceSections.liabilities} subtitle="Positive = owed to vendors and tax authority" />
                <Card className="p-6 shadow-xs border-border/80">
                  <h3 className="text-xl font-bold tracking-tight mb-2">Equity</h3>
                  {balanceSections.equity.rows.filter((r) => r.balance !== 0).map((r) => (
                    <ReportLine key={r.code} code={r.code} name={r.name} value={r.balance} />
                  ))}
                  <ReportLine name="Retained Earnings (this period)" value={balanceSections.retained} />
                  <ReportLine name="Total Equity" value={balanceSections.equity.total + balanceSections.retained} bold />
                </Card>
              </div>
              <Card className="p-6 shadow-xs border-border/80 lg:col-span-2">
                <h3 className="text-xl font-bold tracking-tight mb-3">Balance Check</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg border border-border/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Assets</p>
                    <p className="mt-1 font-mono font-extrabold text-3xl tracking-tight">{money(balanceSections.assets.total)}</p>
                  </div>
                  <div className="rounded-lg border border-border/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Liabilities + Equity</p>
                    <p className="mt-1 font-mono font-extrabold text-3xl tracking-tight">
                      {money(balanceSections.liabilities.total + balanceSections.equity.total + balanceSections.retained)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg border p-4 flex flex-col justify-center",
                      Math.abs(balanceSections.assets.total - (balanceSections.liabilities.total + balanceSections.equity.total + balanceSections.retained)) < 1
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    <p className="text-xs uppercase tracking-wider font-semibold">Equation</p>
                    <p className="mt-1 font-bold">
                      {Math.abs(balanceSections.assets.total - (balanceSections.liabilities.total + balanceSections.equity.total + balanceSections.retained)) < 1
                        ? "Assets = Liabilities + Equity ✓"
                        : "Mismatch — check draft entries"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "aging" && (
            <div className="w-full space-y-5">
              <AgingTable title="Accounts Receivable — aged by customer" lines={arAging} grandTotal={arTotal} tone="emerald" note="Open customer invoices (Posted), bucketed by days past due." />
              <AgingTable title="Accounts Payable — aged by vendor" lines={apAging} grandTotal={apTotal} tone="rose" note="Unpaid vendor bill balances (Posted), bucketed by days past due." />
            </div>
          )}
        </>
      )}

      {/* VAT snapshot (BD 15%) */}
      <p className="text-xs text-muted-foreground">
        VAT Payable (215000): <span className="font-mono font-semibold text-foreground">{money(-netOf(balances, "215000"))}</span> owed ·
        Prepaid VAT (121000): <span className="font-mono font-semibold text-foreground">{money(netOf(balances, "121000"))}</span> input credit
      </p>
    </>
  );
}
