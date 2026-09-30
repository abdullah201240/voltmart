"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { useAdminLayout } from "@/components/admin-shell";
import {
  ArrowLeft,
  ListTree,
  Landmark,
  PiggyBank,
  Scale,
  Receipt,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import {
  getAccounts,
  getMoves,
  postedBalances,
  netOf,
  ACCOUNT_TYPE_LABEL,
  ASSET_TYPES,
  LIABILITY_TYPES,
  EQUITY_TYPES,
  INCOME_TYPES,
  EXPENSE_TYPES,
  type AccountRow,
  type AccountInternalType,
  type MoveRow,
} from "@/lib/data/accounting";
import { useOps } from "@/lib/data/ops";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TYPE_TONE: Record<AccountInternalType, string> = {
  asset_receivable: "text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10",
  asset_current: "text-cyan-600 dark:text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  asset_fixed: "text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
  liability_payable: "text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10",
  liability_credit: "text-orange-600 dark:text-orange-400 border-orange-500/20 bg-orange-500/10",
  liability_current: "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10",
  equity: "text-violet-600 dark:text-violet-400 border-violet-500/20 bg-violet-500/10",
  income: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  income_other: "text-teal-600 dark:text-teal-400 border-teal-500/20 bg-teal-500/10",
  expense: "text-orange-600 dark:text-orange-400 border-orange-500/20 bg-orange-500/10",
  expense_direct: "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10",
};

/** Debit-natural account types (assets & expenses show positive debit balances). */
const DEBIT_NATURAL = new Set<AccountInternalType>([...ASSET_TYPES, ...EXPENSE_TYPES]);

export default function ChartOfAccountsPage() {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableQuery, setTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([getAccounts(), getMoves()]).then(([a, m]) => {
      if (alive) {
        setAccounts(a);
        setMoves(m);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  const balances = useMemo(() => postedBalances(moves), [moves]);
  const net = (code: string, type: AccountInternalType) => {
    const n = netOf(balances, code);
    return DEBIT_NATURAL.has(type) ? n : -n;
  };

  const sumType = (types: AccountInternalType[]) =>
    accounts.filter((a) => types.includes(a.internalType)).reduce((s, a) => s + net(a.code, a.internalType), 0);

  const assets = sumType(ASSET_TYPES);
  const liabilities = sumType(LIABILITY_TYPES);
  const equity = sumType(EQUITY_TYPES);
  const income = sumType(INCOME_TYPES);
  const expense = sumType(EXPENSE_TYPES);
  const netIncome = income - expense;

  const effectiveQuery = (tableQuery || searchQuery).trim().toLowerCase();
  const filteredRows = useMemo(
    () =>
      accounts.filter((a) => {
        const q = effectiveQuery;
        return (
          !q ||
          a.code.includes(q) ||
          a.name.toLowerCase().includes(q) ||
          ACCOUNT_TYPE_LABEL[a.internalType].toLowerCase().includes(q)
        );
      }),
    [accounts, effectiveQuery],
  );

  const COLUMNS: CentralTableColumn<AccountRow>[] = [
    {
      accessorKey: "code",
      header: "Code",
      sortable: true,
      width: "110px",
      cell: ({ value }) => <span className="font-mono text-sm font-semibold text-foreground">{value}</span>,
    },
    {
      accessorKey: "name",
      header: "Account",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Journals: {row.journalCodes}</div>
        </div>
      ),
    },
    {
      accessorKey: "internalType",
      header: "Type",
      sortable: true,
      cell: ({ value }) => (
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", TYPE_TONE[value as AccountInternalType])}>
          {ACCOUNT_TYPE_LABEL[value as AccountInternalType]}
        </span>
      ),
    },
    {
      accessorKey: "code",
      id: "debit",
      header: "Debit (posted)",
      align: "right",
      accessorFn: (row) => balances[row.code]?.debit ?? 0,
      sortable: true,
      cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value ? money(value) : "—"}</span>,
    },
    {
      accessorKey: "code",
      id: "credit",
      header: "Credit (posted)",
      align: "right",
      accessorFn: (row) => balances[row.code]?.credit ?? 0,
      sortable: true,
      cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value ? money(value) : "—"}</span>,
    },
    {
      accessorKey: "code",
      id: "balance",
      header: "Balance",
      align: "right",
      accessorFn: (row) => net(row.code, row.internalType),
      sortable: true,
      cell: ({ row }) => {
        const v = net(row.code, row.internalType);
        return (
          <span className={cn("font-mono text-sm font-bold tabular-nums", v < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
            {money(v)}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Link href="/accounting/journals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Journal Entries
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">
            The account catalogue — balances are computed live from posted journal items only.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/accounting/reports" className="inline-flex h-11 items-center rounded-md border border-input bg-transparent px-5 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-muted/40 active:scale-[0.98] gap-2">
            <Scale className="h-4 w-4" /> Financial Reports
          </Link>
          <Link href="/accounting/journals" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] gap-2">
            <BookOpen className="h-4 w-4" /> Journal Entries
          </Link>
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Assets" value={money(assets)} icon={Landmark} tone="blue" tooltip="Receivables, bank, prepaid VAT and equipment" />
        <KpiCard title="Total Liabilities" value={money(liabilities)} icon={Receipt} tone="amber" tooltip="Payables and VAT owed (positive = owed)" />
        <KpiCard
          title="Equity + Net Income"
          value={money(equity + netIncome)}
          icon={PiggyBank}
          tone="emerald"
          tooltip="Owner capital plus profit of the period — Assets − Liabilities"
        />
        <KpiCard title="Accounts" value={String(accounts.length)} icon={ListTree} tone="violet" />
      </KpiGrid>

      {/* Assets = Liabilities + Equity proof line */}
      <div className={cn("flex flex-wrap items-center gap-2 text-xs font-semibold rounded-md px-4 py-3 border", Math.abs(assets - (liabilities + equity + netIncome)) < 1 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20")}>
        <Scale className="h-4 w-4" />
        Accounting equation: Assets {money(assets)} = Liabilities {money(liabilities)} + Equity &amp; Income {money(equity + netIncome)}
        {Math.abs(assets - (liabilities + equity + netIncome)) < 1 ? " ✓ balanced" : " — check unposted drafts"}
      </div>

      <CentralTable
        data={filteredRows}
        columns={COLUMNS}
        loading={loading}
        loadingRows={8}
        searchable
        searchPlaceholder="Search code, name or type..."
        title="All Accounts"
        description={`${filteredRows.length} of ${accounts.length} accounts`}
        keyExtractor={(row) => row.code}
        pagination
        pageSize={20}
        pageSizeOptions={[10, 20, 50]}
        emptyAction={
          effectiveQuery && (
            <Button variant="outline" size="sm" onClick={() => setTableQuery("")} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Search
            </Button>
          )
        }
      />

      <p className="text-xs text-muted-foreground">
        Receivable (111100) and Payable (211000) are partner-ledger accounts — their balances clear as payments reconcile.
      </p>
    </>
  );
}
