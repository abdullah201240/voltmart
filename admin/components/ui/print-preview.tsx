"use client";

import React, { useState } from "react";
import { Printer, FileText, ReceiptText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { OrderDetail } from "@/lib/data/orders";

export type PrintKind = "quotation" | "invoice" | "delivery";

const KIND_META: Record<
  PrintKind,
  { label: string; docTitle: string; icon: React.ComponentType<{ className?: string }>; note: string }
> = {
  quotation: {
    label: "Quotation",
    docTitle: "Quotation",
    icon: FileText,
    note: "This quotation is valid for 30 days from the date of issue.",
  },
  invoice: {
    label: "Invoice",
    docTitle: "Customer Invoice",
    icon: ReceiptText,
    note: "Payment due within 30 days. Bank transfer or online payment accepted. VAT registered.",
  },
  delivery: {
    label: "Delivery Slip",
    docTitle: "Delivery Order",
    icon: Truck,
    note: "Please verify all products at handover and sign to confirm receipt of the delivery.",
  },
};

function money(v: number) {
  return "৳" + v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PrintPreviewProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  order: OrderDetail;
  initialKind?: PrintKind;
}

/**
 * Odoo-style "Print" document preview. Renders a clean A4 sheet (letterhead,
 * parties, line table, totals) and prints just that sheet via the browser
 * print dialog (see the `.print-area` rules in globals.css). This is the stub
 * that a real PDF report engine (QWeb / wkhtmltopdf) would later replace.
 */
export function PrintPreviewDialog({ open, onOpenChange, order, initialKind = "quotation" }: PrintPreviewProps) {
  const [kind, setKind] = useState<PrintKind>(initialKind);
  const meta = KIND_META[kind];
  const total = order.subtotal + order.shipping + order.tax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="print-max-h max-w-[820px] gap-0 overflow-hidden p-0 sm:max-w-[820px]">
        <DialogHeader className="no-print border-b border-border/70 px-5 py-4 text-left">
          <DialogTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Print preview
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a document and print the {meta.docTitle} for {order.id}.
          </DialogDescription>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {(Object.keys(KIND_META) as PrintKind[]).map((k) => {
              const Icon = KIND_META[k].icon;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]",
                    kind === k
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {KIND_META[k].label}
                </button>
              );
            })}
          </div>
        </DialogHeader>

        {/* Scrollable paper preview */}
        <div className="print-scroll max-h-[58vh] overflow-y-auto bg-muted/30 px-4 py-5 sm:px-8">
          <article
            className="print-area mx-auto bg-white text-slate-900 shadow-lg ring-1 ring-black/5"
            style={{ width: "100%", maxWidth: 720, padding: "40px 44px" }}
          >
            {/* Letterhead */}
            <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-2xl font-extrabold tracking-tight">VoltMart</div>
                <div className="text-[11px] leading-relaxed text-slate-500">
                  House 42, Road 11, Banani<br />Dhaka 1213, Bangladesh<br />
                  BIN 0012·334·9911 · hello@voltmart.example
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold uppercase tracking-tight">{meta.docTitle}</div>
                <div className="font-mono text-[12px] text-slate-600">{order.id}</div>
                <div className="text-[11px] text-slate-500">{order.date}</div>
                {kind === "invoice" && order.status === "Invoiced" && (
                  <div className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Payment status: {order.paymentStatus}
                  </div>
                )}
              </div>
            </header>

            {/* Parties */}
            <section className="mt-5 grid grid-cols-2 gap-6 text-[12px]">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</div>
                <div className="font-semibold">{order.customer}</div>
                <div className="text-slate-600">{order.email}</div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {kind === "delivery" ? "Ship to" : "Invoice address"}
                </div>
                <div className="text-slate-700">
                  {kind === "delivery" ? order.shippingAddress : order.billingAddress}
                </div>
              </div>
            </section>

            {kind === "delivery" && (
              <section className="mt-3 text-[12px]">
                <div className="inline-block rounded bg-slate-100 px-2 py-1 text-slate-700">
                  <span className="font-semibold">Carrier:</span> {order.carrier}
                  {order.trackingUrl ? ` · Tracking: ${order.trackingUrl}` : ""}
                </div>
              </section>
            )}

            {/* Line table */}
            <table className="mt-6 w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-y-2 border-slate-900 text-left uppercase tracking-wider text-slate-500">
                  <th className="py-2 font-bold">Description</th>
                  <th className="py-2 text-center font-bold">Qty</th>
                  <th className="py-2 text-right font-bold">Unit Price</th>
                  <th className="py-2 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((l) => (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-900">{l.productName}</div>
                      <div className="text-[10px] text-slate-500">{l.sku} · {l.variant}</div>
                    </td>
                    <td className="py-2.5 text-center tabular-nums">{l.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums font-mono">{money(l.unitPrice)}</td>
                    <td className="py-2.5 text-right tabular-nums font-mono">{money(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-mono tabular-nums">{money(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-mono tabular-nums">{order.shipping === 0 ? "Free" : money(order.shipping)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">VAT (15%)</span><span className="font-mono tabular-nums">{money(order.tax)}</span></div>
                <div className="mt-1 flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-bold"><span>Total</span><span className="font-mono tabular-nums">{money(total)}</span></div>
              </div>
            </div>

            {/* Note + signature */}
            <footer className="mt-8 flex items-end justify-between gap-8">
              <p className="max-w-[60%] text-[10px] leading-relaxed text-slate-500">{meta.note}</p>
              <div className="w-44 text-center">
                <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-500">
                  {kind === "delivery" ? "Recipient signature" : "Authorized signature"}
                </div>
              </div>
            </footer>
          </article>
        </div>

        {/* Action bar (never printed) */}
        <div className="no-print flex items-center justify-end gap-2 border-t border-border/70 bg-card px-5 py-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-9 px-4 text-sm font-medium cursor-pointer">
            Close
          </Button>
          <Button onClick={() => window.print()} className="h-9 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
            <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
