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
  Printer,
  Truck,
  ReceiptText,
  Check,
  MapPin,
  User,
  DollarSign,
  XCircle,
  RotateCcw,
  FileText,
} from "lucide-react";
import {
  getOrderById,
  ORDER_FLOW,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/data/orders";
import { RecordChatter } from "@/components/ui/record-chatter";
import { PrintPreviewDialog } from "@/components/ui/print-preview";
import { useOps, clearRecord, recordTouched } from "@/lib/data/ops";
import {
  SALE_ORDER,
  applySaleAction,
  type SaleAction,
} from "@/lib/data/workflows";
import { useConfirm, useToast } from "@/components/app-feedback";
import { fulfillOrderWithCourierAction } from "@/app/actions/orders";

const STATUS_META: Record<OrderStatus, string> = {
  Quotation: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  Confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Fulfilled: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Invoiced: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Horizontal lifecycle stepper (Quotation -> Confirmed -> Fulfilled -> Invoiced). */
function StatusStepper({ status }: { status: OrderStatus }) {
  const currentIdx = ORDER_FLOW.indexOf(status);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {ORDER_FLOW.map((step, i) => {
        const done = status !== "Cancelled" && currentIdx >= i;
        const isCurrent = status !== "Cancelled" && currentIdx === i;
        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                  done
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("text-xs font-semibold", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                {step}
              </span>
            </div>
            {i < ORDER_FLOW.length - 1 && (
              <span className={cn("h-px w-6 sm:w-10", done ? "bg-primary" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Odoo-style header smart button linking to a related document. */
function SmartButton({
  href,
  icon,
  label,
  value,
  active,
  done,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center transition-all duration-200 cursor-pointer hover:border-primary/40 hover:bg-muted/40 active:scale-[0.98]",
        active ? "border-primary/40 bg-primary/5" : "border-border/80 bg-card",
      )}
    >
      <span className={cn("transition-colors", done ? "text-emerald-600 dark:text-emerald-400" : active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
        {icon}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-bold", done ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>{value}</span>
    </Link>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const version = useOps();
  const appToast = useToast();
  const confirm = useConfirm();
  const [order, setOrder] = useState<OrderDetail | undefined>();
  const [loading, setLoading] = useState(true);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getOrderById(params.id).then((data) => {
      if (alive) {
        setOrder(data);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id, version]);

  const run = async (action: SaleAction) => {
    if (!order) return;
    if (action === "cancel") {
      const allowed = await confirm({
        title: `Cancel ${order.id}?`,
        description: `Cancels the order for ${order.customer}. This cannot be undone from the button bar.`,
        tone: "destructive",
        confirmLabel: "Cancel Order",
      });
      if (!allowed) return;
    }

    if (action === "ship") {
      const courierRes = await fulfillOrderWithCourierAction({
        orderId: order.id,
        carrier: "pathao",
        recipientName: order.customer,
        recipientPhone: "+880 1711-000000",
        recipientAddress: order.shippingAddress || "Dhaka, Bangladesh",
        amountToCollect: order.paymentStatus === "Paid" ? 0 : order.totalValue,
        orderNumber: order.id,
      });

      if (!courierRes.success) {
        appToast.error("Courier Booking Failed", courierRes.error || "Could not book consignment.");
        return;
      }
      appToast.success("Courier Dispatched", `Consignment ${courierRes.consignmentId} booked with ${courierRes.carrier}.`);
    }

    const res = applySaleAction(order.id, order.customer, action, {
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    });
    if (res.ok) {
      if (action !== "ship") {
        appToast.success("Order updated", `${order.id} — ${res.message}`);
      }
    } else {
      appToast.error("Action failed", res.message);
    }
  };

  const resetToBase = async () => {
    if (!order) return;
    const allowed = await confirm({
      title: "Reset to base record?",
      description: "Discards all local edits on this order and restores the seed data.",
      tone: "destructive",
      confirmLabel: "Reset Order",
    });
    if (!allowed) return;
    clearRecord(SALE_ORDER, order.id);
    appToast.success("Reset complete", `${order.id} restored to base record.`);
  };

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

  if (!order) {
    return (
      <div className="space-y-4">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="text-sm text-muted-foreground mt-1">No order matches <span className="font-mono">{params.id}</span>.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Back link */}
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Title & status actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-mono">{order.id}</h1>
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", STATUS_META[order.status])}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {order.customer} · {order.channel} · {order.date}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-medium cursor-pointer"
            onClick={() => setPrintOpen(true)}
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>

          {order.status === "Quotation" && (
            <Button className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => run("confirm")}>
              <Check className="mr-2 h-4 w-4" /> Confirm Order
            </Button>
          )}

          {order.status === "Confirmed" && (
            <Button className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => run("ship")}>
              <Truck className="mr-2 h-4 w-4" /> Create Delivery
            </Button>
          )}

          {(order.status === "Confirmed" || order.status === "Fulfilled") && (
            <Button variant="outline" className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => run("invoice")}>
              <ReceiptText className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          )}

          {(order.status === "Invoiced" || order.status === "Fulfilled" || order.status === "Confirmed") &&
            order.paymentStatus !== "Paid" && (
              <Button variant="outline" className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all duration-200" onClick={() => run("payment")}>
                <DollarSign className="mr-2 h-4 w-4" /> Register Payment
              </Button>
            )}

          {order.status !== "Cancelled" && order.status !== "Invoiced" && (
            <Button variant="ghost" className="h-10 px-4 text-sm font-medium cursor-pointer text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400" onClick={() => run("cancel")}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}

          {recordTouched(SALE_ORDER, order.id) && (
            <Button
              variant="ghost"
              className="h-10 px-3 text-sm font-medium cursor-pointer text-muted-foreground"
              title="Reset all demo operations on this order"
              onClick={resetToBase}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Lifecycle stepper */}
      <Card className="p-5 sm:p-6 shadow-xs border-border/80">
        <StatusStepper status={order.status} />
      </Card>

      {/* Odoo smart buttons — related documents */}
      <div className="grid grid-cols-3 gap-3">
        <SmartButton
          href="/inventory"
          icon={<Truck className="h-5 w-5" />}
          label="Delivery"
          value={
            order.status === "Fulfilled" || order.status === "Invoiced"
              ? "Delivered"
              : order.status === "Confirmed"
                ? "To deliver"
                : order.status === "Cancelled"
                  ? "—"
                  : "Not yet"
          }
          active={order.status === "Confirmed"}
          done={order.status === "Fulfilled" || order.status === "Invoiced"}
        />
        <SmartButton
          href="/invoices"
          icon={<FileText className="h-5 w-5" />}
          label="Invoices"
          value={order.status === "Invoiced" ? "1" : "0"}
          active={order.status === "Invoiced"}
          done={order.status === "Invoiced"}
        />
        <SmartButton
          href="/payments"
          icon={<DollarSign className="h-5 w-5" />}
          label="Payment"
          value={order.paymentStatus === "Paid" ? "Paid" : order.paymentStatus === "Refunded" ? "Refunded" : "To pay"}
          active={order.paymentStatus === "Paid"}
          done={order.paymentStatus === "Paid"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: lines + tracking */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 sm:p-7 shadow-xs border-border/80 space-y-5">
            <h2 className="text-lg font-semibold">Line items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                    <th className="py-2 font-semibold">Product</th>
                    <th className="py-2 font-semibold text-center">Qty</th>
                    <th className="py-2 font-semibold text-right">Unit</th>
                    <th className="py-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {order.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3">
                        <div className="font-semibold text-foreground">{l.productName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{l.sku} · {l.variant}</div>
                      </td>
                      <td className="py-3 text-center tabular-nums">{l.quantity}</td>
                      <td className="py-3 text-right tabular-nums font-mono">{money(l.unitPrice)}</td>
                      <td className="py-3 text-right tabular-nums font-mono font-semibold">{money(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono tabular-nums">{money(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-mono tabular-nums">{order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (VAT 15%)</span><span className="font-mono tabular-nums">{money(order.tax)}</span></div>
              <div className="flex justify-between text-base font-bold pt-1"><span>Total</span><span className="font-mono tabular-nums">{money(order.subtotal + order.shipping + order.tax)}</span></div>
            </div>
          </Card>

          <Card className="p-6 sm:p-7 shadow-xs border-border/80 space-y-4">
            <h2 className="text-lg font-semibold">Fulfillment</h2>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Carrier: <span className="text-muted-foreground">{order.carrier}</span></div>
                <div className="text-sm font-medium">Fulfillment: <span className="text-muted-foreground">{order.fulfillmentStatus}</span></div>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-sm text-primary font-medium hover:underline">
                    View tracking →
                  </a>
                )}
              </div>
              <Badge variant={order.fulfillmentStatus === "Fulfilled" ? "default" : "secondary"} className="text-xs font-semibold">
                {order.fulfillmentStatus}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Right: customer + addresses */}
        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <User className="h-4 w-4" /> Customer
            </div>
            <div>
              <div className="font-semibold text-foreground">{order.customer}</div>
              <div className="text-sm text-muted-foreground">{order.email}</div>
            </div>
            <Separator />
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Payment</div>
              <Badge variant={order.paymentStatus === "Paid" ? "default" : order.paymentStatus === "Refunded" ? "outline" : "secondary"} className="text-xs font-semibold">
                {order.paymentStatus}
              </Badge>
            </div>
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <MapPin className="h-4 w-4" /> Shipping address
            </div>
            <p className="text-sm text-foreground leading-relaxed">{order.shippingAddress}</p>
            <Separator />
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Billing address</div>
              <p className="text-foreground leading-relaxed">{order.billingAddress}</p>
            </div>
          </Card>

          {/* Odoo chatter — messages, internal notes, activities, history */}
          <RecordChatter model={SALE_ORDER} recordId={order.id} />
        </div>
      </div>

      {/* Print / PDF-stub preview (quotation · invoice · delivery slip) */}
      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        order={order}
        initialKind={order.status === "Quotation" ? "quotation" : order.status === "Invoiced" ? "invoice" : "quotation"}
      />

      {/* Action toast */}
    </>
  );
}
