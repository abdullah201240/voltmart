"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import {
  BookOpen,
  Check,
  XCircle,
  Undo2,
  X,
  Scale,
  AlertTriangle,
  ArrowRightLeft,
  FileClock,
  RotateCcw,
  Plus,
} from "lucide-react";
import {
  getMoves,
  getAccounts,
  moveTotal,
  isBalanced,
  postedBalances,
  netOf,
  createDraftMove,
  type MoveRow,
  type MoveLine,
  type AccountRow,
  type AcctMoveState,
} from "@/lib/data/accounting";
import { applyMoveAction } from "@/lib/data/workflows";
import { useOps } from "@/lib/data/ops";
import { MOVE_STATE_OPTIONS } from "@/lib/data/finance";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm, useToast } from "@/components/app-feedback";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATE_CLASS: Record<AcctMoveState, string> = {
  Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Posted: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const MOVE_TYPE_LABEL: Record<MoveRow["moveType"], string> = {
  out_invoice: "Customer Invoice",
  in_invoice: "Vendor Bill",
  entry: "Journal Entry",
};

const JOURNAL_OPTIONS: DropboxOption[] = [
  { value: "all", label: "All Journals" },
  { value: "INV", label: "INV — Customer Invoices" },
  { value: "BILL", label: "BILL — Vendor Bills" },
  { value: "BNK", label: "BNK — Bank" },
  { value: "MISC", label: "MISC — Miscellaneous" },
];

const CREATE_JOURNAL_OPTIONS: DropboxOption[] = [
  { value: "MISC", label: "MISC — Miscellaneous Operations" },
  { value: "BNK", label: "BNK — Bank — Dutch Bangla" },
  { value: "INV", label: "INV — Customer Invoices" },
  { value: "BILL", label: "BILL — Vendor Bills" },
];

const emptyLine = (): MoveLine => ({ account: "", accountName: "", label: "", debit: 0, credit: 0 });

export default function JournalEntriesPage() {
  const { searchQuery } = useAdminLayout();
  const version = useOps();
  const appToast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState<MoveRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableQuery, setTableQuery] = useState("");
  const [selectedJournal, setSelectedJournal] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [openMove, setOpenMove] = useState<MoveRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [newJournal, setNewJournal] = useState("MISC");
  const [newPartner, setNewPartner] = useState("");
  const [newNarration, setNewNarration] = useState("");
  const [newLines, setNewLines] = useState<MoveLine[]>([emptyLine(), emptyLine()]);

  useEffect(() => {
    let alive = true;
    Promise.all([getMoves(), getAccounts()]).then(([m, a]) => {
      if (alive) {
        setRows(m);
        setAccounts(a);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  // Keep the open drawer in sync with the latest overlay state.
  const drawerMove = openMove ? rows.find((r) => r.id === openMove.id) ?? null : null;

  const balances = useMemo(() => postedBalances(rows), [rows]);
  const totalDebit = useMemo(() => Object.values(balances).reduce((s, b) => s + b.debit, 0), [balances]);
  const draftCount = rows.filter((r) => r.state === "Draft").length;
  const unbalancedCount = rows.filter((r) => !isBalanced(r)).length;

  const effectiveQuery = (tableQuery || searchQuery).trim().toLowerCase();
  const filteredRows = useMemo(
    () =>
      rows.filter((m) => {
        const matchesJournal = selectedJournal === "all" || m.journalCode === selectedJournal;
        const matchesState = selectedState === "all" || m.state === selectedState;
        const matchesQuery =
          !effectiveQuery ||
          m.number.toLowerCase().includes(effectiveQuery) ||
          m.partner.toLowerCase().includes(effectiveQuery) ||
          m.narration.toLowerCase().includes(effectiveQuery);
        return matchesJournal && matchesState && matchesQuery;
      }),
    [rows, selectedJournal, selectedState, effectiveQuery],
  );

  const clearFilters = () => {
    setSelectedJournal("all");
    setSelectedState("all");
    setTableQuery("");
  };
  const activeFiltersCount = (selectedJournal !== "all" ? 1 : 0) + (selectedState !== "all" ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0 || effectiveQuery.length > 0;

  const act = async (m: MoveRow, action: "post" | "cancel" | "undo") => {
    if (action === "cancel") {
      const allowed = await confirm({
        title: `Cancel ${m.number}?`,
        description: "This voids the journal entry. Cancelled moves cannot be re-posted.",
        tone: "destructive",
        confirmLabel: "Cancel Entry",
      });
      if (!allowed) return;
    }
    const res = applyMoveAction(m.id, action, { state: m.state }, isBalanced(m));
    if (res.ok) {
      appToast.success(
        action === "post" ? "Entry posted" : action === "undo" ? "Entry reset to draft" : "Entry cancelled",
        m.number,
      );
    } else {
      appToast.error("Action failed", res.message);
    }
  };

  const bulkPost = async (selected: MoveRow[], clear: () => void) => {
    const allowed = await confirm({
      title: `Post ${selected.length} journal entr${selected.length === 1 ? "y" : "ies"}?`,
      description: "Posted entries become immutable ledger rows.",
      confirmLabel: "Post Entries",
    });
    if (!allowed) return;
    let posted = 0;
    let skipped = 0;
    for (const m of selected) {
      if (m.state !== "Draft") {
        skipped += 1;
        continue;
      }
      const res = applyMoveAction(m.id, "post", { state: m.state }, isBalanced(m));
      if (res.ok) posted += 1;
      else skipped += 1;
    }
    appToast.success(
      "Bulk post complete",
      `${posted} entr${posted === 1 ? "y" : "ies"} posted${skipped ? ` · ${skipped} skipped (not draft or unbalanced)` : ""}.`,
    );
    clear();
  };

  const COLUMNS: CentralTableColumn<MoveRow>[] = [
    {
      accessorKey: "number",
      header: "Number",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-muted-foreground" /> {row.number}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{MOVE_TYPE_LABEL[row.moveType]}</div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      accessorKey: "journalCode",
      header: "Journal",
      sortable: true,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-mono font-semibold cursor-pointer" title={row.journalName}>
          {row.journalCode}
        </Badge>
      ),
    },
    {
      accessorKey: "partner",
      header: "Partner",
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "narration",
      header: "Narration",
      cell: ({ value }) => <span className="text-xs text-muted-foreground line-clamp-1 truncate">{value}</span>,
    },
    {
      accessorKey: "id",
      header: "Debit",
      align: "right",
      accessorFn: (row) => moveTotal(row),
      sortable: true,
      cell: ({ row }) => (
        <span className={cn("font-mono text-sm", row.state === "Draft" || row.state === "Cancelled" ? "text-muted-foreground line-through" : "text-foreground font-semibold")}>
          {money(moveTotal(row))}
        </span>
      ),
    },
    {
      accessorKey: "state",
      header: "Status",
      sortable: true,
      cell: ({ value }) => (
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATE_CLASS[value as AcctMoveState])}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">
            The general ledger — double-entry movements across all journals. Only posted entries affect the books.
          </p>
        </div>
        <Button className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => { setNewLines([emptyLine(), emptyLine()]); setNewJournal("MISC"); setNewPartner(""); setNewNarration(""); setCreating(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Entry
        </Button>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Posted Debit / Credit" value={money(totalDebit)} icon={Scale} tone="blue" tooltip="Total turnover booked through posted moves" />
        <KpiCard title="Draft Entries" value={String(draftCount)} icon={FileClock} tone="violet" tooltip="Not yet accounted in the ledger" />
        <KpiCard title="Total Entries" value={String(rows.length)} icon={BookOpen} tone="cyan" />
        <KpiCard
          title="Balance Check"
          value={unbalancedCount === 0 ? "OK" : `${unbalancedCount} off`}
          icon={unbalancedCount === 0 ? Check : AlertTriangle}
          tone={unbalancedCount === 0 ? "emerald" : "rose"}
          tooltip="Entries where debits ≠ credits cannot be posted"
          trendInverse={unbalancedCount > 0}
        />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={COLUMNS}
        loading={loading}
        loadingRows={8}
        selectable
        searchable
        searchPlaceholder="Search number, partner or narration..."
        title="All Journal Entries"
        description={`${filteredRows.length} of ${rows.length} entries`}
        filters={
          <div className="grid gap-5 sm:grid-cols-2 w-full">
            <SearchableDropbox
              label="Journal"
              options={JOURNAL_OPTIONS}
              value={selectedJournal}
              onChange={setSelectedJournal}
              placeholder="All journals..."
              searchPlaceholder="Search journal..."
            />
            <SearchableDropbox
              label="Status"
              options={MOVE_STATE_OPTIONS as DropboxOption[]}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="All states..."
              searchPlaceholder="Search state..."
            />
          </div>
        }
        activeFiltersCount={activeFiltersCount}
        defaultFiltersOpen={false}
        onClearFilters={clearFilters}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        selectedActions={(selectedRows, clear) => (
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold cursor-pointer gap-1.5 active:scale-[0.98] transition-all duration-200"
            onClick={() => bulkPost(selectedRows, clear)}
          >
            <Check className="h-3.5 w-3.5" /> Post Selected
          </Button>
        )}
        onRowClick={(row) => setOpenMove(row)}
        emptyAction={
          hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
            </Button>
          )
        }
      />

      <p className="text-xs text-muted-foreground">Tip: click any entry to open its journal lines, validations and posting actions.</p>

      {/* Slide-over journal-line detail */}
      {drawerMove && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenMove(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[720px] overflow-y-auto bg-card border-l border-border/80 shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight font-mono">{drawerMove.number}</h2>
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATE_CLASS[drawerMove.state])}>{drawerMove.state}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {MOVE_TYPE_LABEL[drawerMove.moveType]} · {drawerMove.journalName} · {drawerMove.date}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer" onClick={() => setOpenMove(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="mt-4 text-sm text-foreground bg-muted/50 border border-border/60 rounded-md p-3">{drawerMove.narration}</p>

            {/* Journal lines */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Journal Items</h3>
              <div className="rounded-lg border border-border/80 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Account</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Label</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Debit</th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawerMove.lines.map((l, i) => (
                      <tr key={`${l.account}-${i}`} className="border-t border-border/60">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-muted-foreground">{l.account}</div>
                          <div className="font-medium text-foreground">{l.accountName}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{l.label}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">{l.debit ? money(l.debit) : ""}</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums">{l.credit ? money(l.credit) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/80 bg-muted/30 font-bold">
                      <td className="px-4 py-3" colSpan={2}>
                        <span className="inline-flex items-center gap-2">
                          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" /> Totals
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{money(drawerMove.lines.reduce((s, l) => s + l.debit, 0))}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{money(drawerMove.lines.reduce((s, l) => s + l.credit, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className={cn("flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 border", isBalanced(drawerMove) ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20")}>
                {isBalanced(drawerMove) ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {isBalanced(drawerMove) ? "Balanced — debits equal credits, safe to post." : "Unbalanced — fix the lines before posting."}
              </div>
            </div>

            {/* Partner balance snapshot */}
            {drawerMove.lines.some((l) => l.account === "111100") && (
              <div className="mt-5 text-xs text-muted-foreground">
                Receivable book balance (111100): <span className="font-mono font-semibold text-foreground">{money(netOf(balances, "111100"))}</span>
                {" · "}Bank (111200): <span className="font-mono font-semibold text-foreground">{money(netOf(balances, "111200"))}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/80 pt-5">
              {drawerMove.state === "Draft" && (
                <Button className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200" onClick={() => act(drawerMove, "post")}>
                  <Check className="h-4 w-4" /> Post
                </Button>
              )}
              {drawerMove.state === "Posted" && (
                <>
                  <Button variant="outline" className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200" onClick={() => act(drawerMove, "undo")}>
                    <Undo2 className="h-4 w-4" /> Reset to Draft
                  </Button>
                  <Button variant="ghost" className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => act(drawerMove, "cancel")}>
                    <XCircle className="h-4 w-4" /> Cancel Entry
                  </Button>
                </>
              )}
              {drawerMove.state === "Cancelled" && (
                <Button variant="outline" className="h-10 px-4 text-sm font-medium cursor-pointer gap-2" onClick={() => act(drawerMove, "post")}>
                  <Undo2 className="h-4 w-4" /> Restore & Post
                </Button>
              )}
              {(drawerMove.state === "Paid" || drawerMove.state === "Posted") && (
                <Link href="/accounting/credit-notes" className="inline-flex h-10 items-center px-4 rounded-md border border-input text-sm font-medium cursor-pointer hover:bg-muted/40 transition-all duration-200 gap-2">
                  <FileClock className="h-4 w-4" /> Credit Notes
                </Link>
              )}
              {accounts.length > 0 && (
                <Link href="/accounting/chart-of-accounts" className="inline-flex h-10 items-center px-4 rounded-md text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors gap-2">
                  <BookOpen className="h-4 w-4" /> Chart of Accounts
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Create-entry slide-over */}
      {creating && (() => {
        const filled = newLines.filter((l) => l.account.trim() !== "" && (l.debit > 0 || l.credit > 0));
        const d = filled.reduce((s, l) => s + l.debit, 0);
        const c = filled.reduce((s, l) => s + l.credit, 0);
        const balanced = filled.length >= 2 && Math.abs(d - c) < 0.01;
        const setLine = (i: number, patch: Partial<MoveLine>) =>
          setNewLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
        return (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCreating(false)} />
            <aside className="absolute right-0 top-0 h-full w-full sm:w-[720px] overflow-y-auto bg-card border-l border-border/80 shadow-xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Create Journal Entry</h2>
                  <p className="text-sm text-muted-foreground">Saved as a draft — post it once the lines balance.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer" onClick={() => setCreating(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <SearchableDropbox
                  label="Journal"
                  options={CREATE_JOURNAL_OPTIONS}
                  value={newJournal}
                  onChange={setNewJournal}
                  placeholder="Pick a journal..."
                  searchPlaceholder="Search journal..."
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Partner</label>
                  <Input value={newPartner} onChange={(e) => setNewPartner(e.target.value)} placeholder="e.g. Pathao Delivery" className="h-10" />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="text-sm font-medium text-foreground">Narration</label>
                <Textarea value={newNarration} onChange={(e) => setNewNarration(e.target.value)} rows={2} placeholder="What is this entry for?" />
              </div>

              {/* Editable lines */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight">Journal Items</h3>
                  <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold cursor-pointer gap-1.5" onClick={() => setNewLines((p) => [...p, emptyLine()])}>
                    <Plus className="h-3.5 w-3.5" /> Add Line
                  </Button>
                </div>
                <div className="rounded-lg border border-border/80 divide-y divide-border/60">
                  {newLines.map((l, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center">
                      <div className="col-span-4">
                        <Input
                          value={l.account}
                          onChange={(e) => {
                            const acc = accounts.find((a) => a.code === e.target.value.trim());
                            setLine(i, { account: e.target.value, accountName: acc ? acc.name : l.accountName });
                          }}
                          placeholder="Account code (511000)"
                          className="h-9 font-mono text-xs"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input value={l.label} onChange={(e) => setLine(i, { label: e.target.value })} placeholder="Label" className="h-9 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} step="0.01" value={l.debit || ""} onChange={(e) => setLine(i, { debit: Math.max(0, Number(e.target.value) || 0), credit: 0 })} placeholder="Debit" className="h-9 font-mono text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min={0} step="0.01" value={l.credit || ""} onChange={(e) => setLine(i, { credit: Math.max(0, Number(e.target.value) || 0), debit: 0 })} placeholder="Credit" className="h-9 font-mono text-xs" />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-rose-600" onClick={() => setNewLines((p) => p.filter((_, j) => j !== i))} aria-label="Remove line">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={cn("flex items-center gap-2 text-xs font-semibold rounded-md px-3 py-2 border", balanced ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20")}>
                  {balanced ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  Debits {money(d)} · Credits {money(c)} — {balanced ? "balanced, ready to save." : "entry must balance across at least two lines."}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-border/80 pt-5">
                <Button
                  className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200"
                  disabled={!balanced}
                  onClick={() => {
                    createDraftMove({ journalCode: newJournal, partner: newPartner, narration: newNarration, lines: filled });
                    setCreating(false);
                    appToast.success("Draft entry created", "Find it in the journals list to post.");
                  }}
                >
                  <Check className="h-4 w-4" /> Save Draft
                </Button>
                <Button variant="ghost" className="h-10 px-4 text-sm font-medium cursor-pointer" onClick={() => setCreating(false)}>
                  Discard
                </Button>
              </div>
            </aside>
          </div>
        );
      })()}

      {/* Action toast */}
    </>
  );
}
