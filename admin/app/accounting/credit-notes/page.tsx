"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SearchableDropbox,
  type DropboxOption,
} from "@/components/ui/searchable-dropbox";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  ArrowLeft,
  ArrowDownLeft,
  Check,
  XCircle,
  AlertTriangle,
  FileClock,
  ReceiptText,
  X,
} from "lucide-react";
import { getCreditNotes, moveTotal, isBalanced, createCreditNote, type MoveRow, type AcctMoveState } from "@/lib/data/accounting";
import { getInvoices, type InvoiceRow } from "@/lib/data/finance";
import { applyMoveAction } from "@/lib/data/workflows";
import { useOps } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATE_CLASS: Record<AcctMoveState, string> = {
  Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Posted: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

/** Extract the origin invoice number from the narration ("Credit note for INV/..."). */
function originOf(m: MoveRow): string {
  const match = m.narration.match(/INV\/2026\/\d{4}/);
  return match ? match[0] : "—";
}

export default function CreditNotesPage() {
  const version = useOps();
  const [notes, setNotes] = useState<MoveRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNote, setOpenNote] = useState<MoveRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickedInvoice, setPickedInvoice] = useState("all");
  const appToast = useToast();

  useEffect(() => {
    let alive = true;
    Promise.all([getCreditNotes(), getInvoices()]).then(([n, i]) => {
      if (alive) {
        setNotes(n);
        setInvoices(i);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [version]);

  const drawerNote = openNote ? notes.find((r) => r.id === openNote.id) ?? null : null;

  // Only posted/paid, non-cancelled invoices can receive a credit note.
  const eligibleInvoices: DropboxOption[] = useMemo(
    () =>
      invoices
        .filter((i) => (i.state === "Posted" || i.state === "Paid"))
        .map((i) => ({
          value: i.number,
          label: `${i.number} — ${i.partner}`,
          sub: `${money(i.total)} · ${i.state}`,
        })),
    [invoices],
  );

  const issuedTotal = notes.filter((n) => n.state !== "Cancelled").reduce((s, n) => s + moveTotal(n), 0);
  const draftCount = notes.filter((n) => n.state === "Draft").length;

  const act = (m: MoveRow, action: "post" | "cancel") => {
    const res = applyMoveAction(m.id, action, { state: m.state }, isBalanced(m));
    if (res.ok) {
      appToast.success("Credit note updated", res.message);
    } else {
      appToast.error("Update failed", res.message);
    }
  };

  const issue = () => {
    const inv = invoices.find((i) => i.number === pickedInvoice);
    if (!inv) {
      appToast.error("Selection required", "Pick a posted or paid invoice first.");
      return;
    }
    const cn = createCreditNote(inv.number, inv.partner, inv.total);
    if (!cn) {
      appToast.error("Duplicate credit note", `A credit note already exists for ${inv.number}.`);
      return;
    }
    setCreating(false);
    setPickedInvoice("all");
    appToast.success("Credit note created", `Credit note ${cn.number} created in draft for ${inv.partner}.`);
  };

  const COLUMNS: CentralTableColumn<MoveRow>[] = [
    {
      accessorKey: "number",
      header: "Credit Note",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
            <ArrowDownLeft className="h-4 w-4 text-rose-500" /> {row.number}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">for {originOf(row)}</div>
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
      accessorKey: "partner",
      header: "Customer",
      sortable: true,
      cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
    },
    {
      accessorKey: "narration",
      header: "Reason",
      cell: ({ value }) => <span className="text-xs text-muted-foreground line-clamp-1 truncate">{value}</span>,
    },
    {
      accessorKey: "id",
      header: "Amount",
      align: "right",
      accessorFn: (row) => moveTotal(row),
      sortable: true,
      cell: ({ row }) => (
        <span className={cn("font-mono text-sm font-semibold", row.state === "Cancelled" ? "line-through text-muted-foreground" : "text-foreground")}>
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
      <Link href="/accounting/journals" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Journal Entries
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-sm text-muted-foreground">
            Refunds and corrections for issued invoices — posting reverses revenue and VAT in the ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="inline-flex h-11 items-center rounded-md border border-input bg-transparent px-5 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-muted/40 active:scale-[0.98] gap-2">
            <ReceiptText className="h-4 w-4" /> Customer Invoices
          </Link>
          <Button className="h-11 px-5 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200" onClick={() => setCreating(true)}>
            <ArrowDownLeft className="h-4 w-4" /> Credit Note from Invoice
          </Button>
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Notes Issued" value={String(notes.length)} icon={FileClock} tone="violet" />
        <KpiCard title="Draft (not yet accounted)" value={String(draftCount)} icon={AlertTriangle} tone="amber" tooltip="Draft credit notes do not affect the books until posted" />
        <KpiCard title="Total Credited" value={money(issuedTotal)} icon={ArrowDownLeft} tone="rose" tooltip="Sum of all non-cancelled credit notes" />
      </KpiGrid>

      <CentralTable
        data={notes}
        columns={COLUMNS}
        loading={loading}
        loadingRows={4}
        searchable
        searchPlaceholder="Search number or customer..."
        title="All Credit Notes"
        description={`${notes.length} notes`}
        pagination
        pageSize={10}
        onRowClick={(row) => setOpenNote(row)}
      />

      <p className="text-xs text-muted-foreground">
        Odoo rule: a posted invoice can never be deleted — its effect is reversed with a balanced credit note (revenue + VAT debited, receivable credited).
      </p>

      {/* Slide-over credit-note detail */}
      {drawerNote && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenNote(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[640px] overflow-y-auto bg-card border-l border-border/80 shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight font-mono">{drawerNote.number}</h2>
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATE_CLASS[drawerNote.state])}>{drawerNote.state}</span>
                </div>
                <p className="text-sm text-muted-foreground">{drawerNote.partner} · {drawerNote.date} · for {originOf(drawerNote)}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer" onClick={() => setOpenNote(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="mt-4 text-sm text-foreground bg-muted/50 border border-border/60 rounded-md p-3">{drawerNote.narration}</p>

            <div className="mt-6 rounded-lg border border-border/80 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Account</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Debit</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {drawerNote.lines.map((l, i) => (
                    <tr key={`${l.account}-${i}`} className="border-t border-border/60">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted-foreground">{l.account}</div>
                        <div className="font-medium text-foreground">{l.accountName}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{l.debit ? money(l.debit) : ""}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{l.credit ? money(l.credit) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/80 pt-5">
              {drawerNote.state === "Draft" && (
                <Button className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200" onClick={() => act(drawerNote, "post")}>
                  <Check className="h-4 w-4" /> Post Credit Note
                </Button>
              )}
              {drawerNote.state !== "Cancelled" && drawerNote.state !== "Paid" && (
                <Button variant="ghost" className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" onClick={() => act(drawerNote, "cancel")}>
                  <XCircle className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Create-from-invoice dialog */}
      {creating && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreating(false)} />
          <Card className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-6 md:p-8 shadow-xl border-border/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Credit Note from Invoice</h2>
                <p className="text-sm text-muted-foreground mt-1">Full-credit draft for a posted or paid customer invoice.</p>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer" onClick={() => setCreating(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6">
              <SearchableDropbox
                label="Invoice"
                options={eligibleInvoices}
                value={pickedInvoice}
                onChange={setPickedInvoice}
                placeholder="Pick a posted invoice..."
                searchPlaceholder="Search invoices..."
              />
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Button className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all duration-200" onClick={issue} disabled={pickedInvoice === "all"}>
                <ArrowDownLeft className="h-4 w-4" /> Create Draft Note
              </Button>
              <Button variant="ghost" className="h-10 px-4 text-sm font-medium cursor-pointer" onClick={() => setCreating(false)}>
                Discard
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              VAT (15%) is reversed proportionally; the receivable of <span className="font-mono">{pickedInvoice === "all" ? "—" : pickedInvoice}</span> is credited once posted.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
