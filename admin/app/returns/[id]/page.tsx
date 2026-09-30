"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  SearchCheck,
  Banknote,
  Replace,
  XCircle,
  User,
  Package,
  Barcode,
  FileText,
} from "lucide-react";
import {
  getReturnById,
  RETURN_STATE_LABEL_META,
  type ReturnRow,
  type ReturnState,
} from "@/lib/data/returns";
import { RMA_RETURN, returnState, applyReturnAction, type ReturnAction } from "@/lib/data/workflows";
import { RecordChatter } from "@/components/ui/record-chatter";
import { useOps } from "@/lib/data/ops";
import { useConfirm, useToast } from "@/components/app-feedback";

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />} {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function ReturnDetailPage() {
  const params = useParams<{ id: string }>();
  const version = useOps();
  const appToast = useToast();
  const confirm = useConfirm();
  const [row, setRow] = useState<ReturnRow | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getReturnById(params.id).then((r) => {
      if (alive) {
        setRow(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id, version]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="p-7 shadow-xs border-border/80">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="space-y-4">
        <Link href="/returns" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Returns
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Return not found</h1>
          <p className="text-sm text-muted-foreground mt-1">No claim matches <span className="font-mono">{params.id}</span>.</p>
        </Card>
      </div>
    );
  }

  const liveState: ReturnState = returnState(row.id) ?? row.state;

  const run = async (action: ReturnAction) => {
    if (action === "reject") {
      const ok = await confirm({
        title: "Reject this return?",
        description: "The unit will be marked outside coverage. This is recorded on the chatter.",
        tone: "destructive",
        confirmLabel: "Reject Return",
      });
      if (!ok) return;
    }
    const res = applyReturnAction(row.id, row.customer, action, { state: row.state });
    if (res.ok) appToast.success("Claim updated", res.message);
    else appToast.error("Action blocked", res.message);
  };

  const canInspect = liveState === "Requested";
  const canResolve = liveState === "In Inspection";
  const resolved = liveState === "Approved Refund" || liveState === "Approved Replacement" || liveState === "Rejected";

  return (
    <div className="w-full space-y-6">
      <Link href="/returns" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Returns
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight font-mono">{row.id}</h1>
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", RETURN_STATE_LABEL_META[liveState])}>{liveState}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Return for <Link href={`/orders/${row.orderRef}`} className="font-mono text-primary hover:underline">{row.orderRef}</Link> · opened {row.opened}
          </p>
        </div>

        {/* Workflow action bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
            disabled={!canInspect}
            onClick={() => run("inspect")}
          >
            <SearchCheck className="h-4 w-4" /> Move to Inspection
          </Button>
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
            disabled={!canResolve}
            onClick={() => run("approve_refund")}
          >
            <Banknote className="h-4 w-4" /> Approve Refund
          </Button>
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
            disabled={!canResolve}
            onClick={() => run("approve_replace")}
          >
            <Replace className="h-4 w-4" /> Approve Replace
          </Button>
          <Button
            variant="ghost"
            className="h-10 px-4 text-sm font-semibold cursor-pointer gap-1.5 text-muted-foreground hover:text-rose-600"
            disabled={resolved}
            onClick={() => run("reject")}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <FileText className="h-4 w-4" /> Claim Detail
            </div>
            <InfoRow label="Customer" value={row.customer} icon={User} />
            <Separator className="my-1" />
            <InfoRow label="Product" value={row.product} icon={Package} />
            <InfoRow label="SKU" value={<span className="font-mono">{row.sku}</span>} />
            <InfoRow label="Serial / IMEI" value={<span className="font-mono">{row.serial}</span>} icon={Barcode} />
            <Separator className="my-1" />
            <InfoRow label="Reason" value={row.reason} />
            <InfoRow label="Value at Risk" value={<span className="font-mono font-bold">{money(row.amount)}</span>} />
          </Card>

          {resolved && (
            <Card className="p-5 shadow-xs border-border/80">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={liveState === "Rejected" ? "outline" : "default"} className="text-xs font-semibold">
                  {liveState}
                </Badge>
                <span className="text-muted-foreground">
                  {liveState === "Approved Refund"
                    ? `${money(row.amount)} refund approved for ${row.customer}.`
                    : liveState === "Approved Replacement"
                    ? `Replacement dispatch approved for ${row.customer}.`
                    : "Claim closed — unit outside coverage."}
                </span>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card className="p-6 shadow-xs border-border/80 space-y-2">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">RMA Lifecycle</div>
            {(["Requested", "In Inspection", liveState].filter((v, i, a) => a.indexOf(v) === i) as ReturnState[]).map((step) => (
              <div key={step} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", step === liveState ? "bg-primary" : "bg-emerald-500")} />
                <span className={cn("text-sm", step === liveState ? "font-semibold text-foreground" : "text-muted-foreground")}>{step}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <RecordChatter model={RMA_RETURN} recordId={row.id} />
    </div>
  );
}
