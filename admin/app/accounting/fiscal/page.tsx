"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  Landmark,
  Plus,
  Lock,
  ArrowRight,
  Check,
  RotateCcw,
  ShieldAlert,
  CalendarClock,
} from "lucide-react";
import { useOps, patchFields, addHistory, addRecord, clearRecord } from "@/lib/data/ops";
import {
  getFiscalPositions,
  getTaxLockBase,
  FISCAL_POSITION,
  ACCOUNT_LOCK,
  type FiscalPositionRow,
  type TaxLockRow,
} from "@/lib/data/settings";
import { useConfirm, useToast } from "@/components/app-feedback";

/** Pretty-print an ISO lock date (or an "unlocked" hint). */
function fmtDate(iso: string): string {
  if (!iso) return "Not locked";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function FiscalPositionsPage() {
  useOps(); // re-render when the ops overlay changes
  const appToast = useToast();
  const confirm = useConfirm();

  const [fps, setFps] = useState<FiscalPositionRow[]>([]);
  const [locks, setLocks] = useState<TaxLockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getFiscalPositions().then((d) => {
      if (alive) {
        setFps(d);
        setLocks(getTaxLockBase());
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Toggle a fiscal position on/off — persists through the overlay.
  const toggleFp = async (fp: FiscalPositionRow) => {
    const next = !fp.active;
    if (!next) {
      const allowed = await confirm({
        title: `Deactivate ${fp.name}?`,
        description: "Invoices using this position will fall back to the default tax mapping.",
        tone: "destructive",
        confirmLabel: "Deactivate",
      });
      if (!allowed) return;
    }
    patchFields(FISCAL_POSITION, fp.id, { active: next });
    addHistory(FISCAL_POSITION, fp.id, `Active: ${fp.active} → ${next}`);
    setFps((prev) => prev.map((x) => (x.id === fp.id ? { ...x, active: next } : x)));
    appToast.success(next ? "Fiscal position activated" : "Fiscal position deactivated", fp.name);
  };



  // Columns are built inline so the Active switch can call the toggle handler.
  const COLUMNS: CentralTableColumn<FiscalPositionRow>[] = [
    {
      accessorKey: "name",
      header: "Fiscal Position",
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">{row.note}</div>
        </div>
      ),
    },
    {
      accessorKey: "appliesTo",
      header: "Applies To",
      sortable: true,
      cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
    },
    {
      id: "taxMaps",
      header: "Tax Mapping",
      accessorFn: (row) => row.taxMaps.length,
      cell: ({ row }) =>
        row.taxMaps.length === 0 ? (
          <span className="text-xs text-muted-foreground/60 italic">No tax change</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {row.taxMaps.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {m.source}
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                {m.dest}
              </span>
            ))}
          </div>
        ),
    },
    {
      accessorKey: "reverseCharge",
      header: "Reverse Charge",
      align: "center",
      sortable: true,
      accessorFn: (row) => (row.reverseCharge ? "Yes" : "No"),
      cell: ({ row }) =>
        row.reverseCharge ? (
          <Badge variant="secondary" className="text-[11px] font-semibold gap-1">
            <ShieldAlert className="h-3 w-3" /> Self-assessed
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground/60">—</span>
        ),
    },
    {
      id: "active",
      header: "Active",
      align: "center",
      sortable: true,
      accessorFn: (row) => (row.active ? "Active" : "Inactive"),
      cell: ({ row }) => (
        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
          <Switch checked={row.active} onCheckedChange={() => toggleFp(row)} aria-label={`Toggle ${row.name}`} />
        </div>
      ),
    },
  ];

  const setLockDate = (id: string, date: string) => {
    setLocks((prev) => prev.map((r) => (r.id === id ? { ...r, date } : r)));
  };

  const saveLocks = () => {
    for (const r of locks) {
      patchFields(ACCOUNT_LOCK, r.id, { date: r.date });
      addHistory(ACCOUNT_LOCK, r.id, `${r.label} → ${fmtDate(r.date)}`);
    }
    appToast.success("Tax lock dates saved", "All periods are locked at the new dates.");
  };

  const resetLocks = async () => {
    const allowed = await confirm({
      title: "Reset tax lock dates?",
      description: "This discards your custom lock dates and restores the base configuration.",
      tone: "destructive",
      confirmLabel: "Reset Locks",
    });
    if (!allowed) return;
    for (const r of locks) clearRecord(ACCOUNT_LOCK, r.id);
    const base = getTaxLockBase();
    setLocks(base);
    appToast.success("Lock dates reset", "Base configuration restored.");
  };

  const journalLock = locks.find((r) => r.id === "lock");
  const activeCount = fps.filter((f) => f.active).length;

  return (
    <>
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Fiscal Positions &amp; Lock Dates</h1>
          <p className="text-sm text-muted-foreground">
            Tax substitution rules per partner, plus period locks that protect closed accounting.
          </p>
        </div>
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/accounting/fiscal/new">
            <Plus className="mr-2 h-4 w-4" /> New Fiscal Position
          </Link>
        </Button>
      </div>

      {/* Tax Lock Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Lock className="h-5 w-5 text-muted-foreground" /> Tax Lock Dates
          </CardTitle>
          <CardDescription>
            Entries on or before the lock date can no longer be edited. Set these after closing a period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {locks.map((r) => (
              <div key={r.id} className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-4">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  {r.label}
                </Label>
                <Input
                  type="date"
                  value={r.date}
                  onChange={(e) => setLockDate(r.id, e.target.value)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">{r.help}</p>
              </div>
            ))}
          </div>

          {journalLock && (
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Journal entries locked through {fmtDate(journalLock.date)}</AlertTitle>
              <AlertDescription>
                Any draft move dated on or before this date is read-only until the lock is moved forward.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2.5">
            <Button
              className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
              onClick={saveLocks}
            >
              <Check className="mr-2 h-4 w-4" /> Save Lock Dates
            </Button>
            <Button
              variant="outline"
              className="h-10 px-4 text-sm font-medium cursor-pointer gap-2 active:scale-[0.98] transition-all"
              onClick={resetLocks}
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fiscal Positions */}
      <CentralTable
        data={fps}
        columns={COLUMNS}
        loading={loading}
        loadingRows={4}
        searchable
        searchPlaceholder="Search position or tax... e.g. VAT, Reverse Charge:true"
        title="Fiscal Positions"
        description={`${fps.length} positions · ${activeCount} active`}
        groupable
        favoriteKey="fiscal"
        pagination={false}
      />


      {/* Action toast */}
    </>
  );
}
