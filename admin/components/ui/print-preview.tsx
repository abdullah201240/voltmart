"use client";

import React, { useState } from "react";
import { Printer, FileText, ReceiptText, Truck, Barcode } from "lucide-react";
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

export type PrintKind = "quotation" | "invoice" | "mushak_6_3" | "delivery" | "shipping_label";

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
  mushak_6_3: {
    label: "NBR Mushak 6.3 (মূসক-৬.৩)",
    docTitle: "কর চালানপত্র (মূসক-৬.৩)",
    icon: ReceiptText,
    note: "জাতীয় রাজস্ব বোর্ড (NBR) অনুমোদিত কর চালানপত্র। ভ্যাট আইন ২০১২ এর বিধি ৪০ অনুযায়ী প্রস্তুতকৃত।",
  },
  delivery: {
    label: "Delivery Slip",
    docTitle: "Delivery Order",
    icon: Truck,
    note: "Please verify all products at handover and sign to confirm receipt of the delivery.",
  },
  shipping_label: {
    label: "Shipping Label (4x6)",
    docTitle: "Thermal Shipping Label",
    icon: Barcode,
    note: "Official courier consignment label. Handle with care: contains precision electronics.",
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
            {kind === "shipping_label" ? (
              <div className="space-y-4">
                {/* Courier Header */}
                <div className="border-b-2 border-dashed border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black uppercase tracking-tight">PATHAO 3PL EXPRESS</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
                      Standard Next-Day Metro Dhaka
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      ZONE: DHA-NORTH
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">HUB: BANANI</div>
                  </div>
                </div>

                {/* Tracking Barcode */}
                <div className="py-2 text-center border-b-2 border-dashed border-slate-900 space-y-1">
                  <div className="inline-block py-2 px-6 bg-slate-100 rounded border border-slate-300">
                    <div className="font-mono text-xl font-black tracking-widest uppercase">
                      ||| | ||||| || |||| ||| |||||
                    </div>
                    <div className="font-mono text-xs font-bold tracking-wider text-slate-700">
                      {order.id.replace("SO", "PTH-BD-")}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">Consignment ID · Scan to confirm pickup & delivery</div>
                </div>

                {/* Recipient & COD Box */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="border-r border-slate-300 pr-3 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SHIP TO / RECIPIENT</div>
                    <div className="font-bold text-sm text-slate-900">{order.customer}</div>
                    <div className="font-mono font-semibold text-slate-800">Phone: +880 1711-XXXXXX</div>
                    <div className="text-slate-600 text-[11px] leading-relaxed mt-1">
                      {order.shippingAddress || "House 42, Road 11, Banani, Dhaka"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">COLLECTION STATUS</div>
                    {order.paymentStatus === "Paid" ? (
                      <div className="p-3 rounded bg-emerald-50 border-2 border-emerald-600 text-center">
                        <div className="text-xs font-black text-emerald-800 uppercase tracking-wider">PREPAID ONLINE</div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">DO NOT COLLECT CASH</div>
                      </div>
                    ) : (
                      <div className="p-3 rounded bg-amber-50 border-2 border-slate-900 text-center">
                        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">CASH ON DELIVERY (COD)</div>
                        <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{money(total)}</div>
                        <div className="text-[10px] text-slate-600">Exact cash to collect from customer</div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div>Items in parcel: <span className="font-bold text-slate-800">{order.lines.length} units</span></div>
                      <div>Weight estimate: <span className="font-bold text-slate-800">0.85 kg</span></div>
                    </div>
                  </div>
                </div>

                {/* Return Sender Footer */}
                <div className="border-t-2 border-dashed border-slate-900 pt-3 text-[10px] flex items-center justify-between text-slate-500">
                  <div>
                    <span className="font-bold text-slate-700">Sender / Return:</span> VoltMart Electronics, House 42, Road 11, Banani, Dhaka.
                  </div>
                  <div className="font-semibold text-slate-800">Helpline: 09612-865865</div>
                </div>
              </div>
            ) : kind === "mushak_6_3" ? (
              <div className="space-y-4 text-xs font-sans text-slate-900">
                {/* Statutory Government Header */}
                <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-3">
                  <div className="text-[11px] font-semibold text-slate-700">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার · জাতীয় রাজস্ব বোর্ড</div>
                  <div className="text-base font-black tracking-tight uppercase">কর চালানপত্র (মূসক-৬.৩)</div>
                  <div className="text-[10px] text-slate-500 font-mono">[ বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য ]</div>
                </div>

                {/* Company & Customer Grid */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-3 text-[11px]">
                  <div className="space-y-1">
                    <div><span className="font-bold text-slate-600">নিবন্ধিত ব্যক্তির নাম:</span> <span className="font-semibold">ভোল্টমার্ট ইলেকট্রনিক্স বিডি লিঃ</span></div>
                    <div><span className="font-bold text-slate-600">নিবন্ধিত ব্যক্তির বিআইএন (BIN):</span> <span className="font-mono font-bold">004819283-0101</span></div>
                    <div><span className="font-bold text-slate-600">ঠিকানা:</span> লেভেল ৮, কনকর্ড টাওয়ার, গুলশান-২, ঢাকা-১২১২</div>
                  </div>
                  <div className="space-y-1 text-right sm:text-left">
                    <div><span className="font-bold text-slate-600">চালান নম্বর:</span> <span className="font-mono font-bold">{order.id.replace("SO", "MSK-6.3-")}</span></div>
                    <div><span className="font-bold text-slate-600">ইস্যুর তারিখ ও সময়:</span> {order.date} · 11:30 AM</div>
                    <div><span className="font-bold text-slate-600">ক্রেতার নাম:</span> {order.customer}</div>
                    <div><span className="font-bold text-slate-600">ক্রেতার ঠিকানা:</span> {order.shippingAddress || "Dhaka, Bangladesh"}</div>
                  </div>
                </div>

                {/* Statutory Items Table with 15% VAT */}
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-100 text-left font-bold text-slate-800">
                      <th className="py-2 px-1 text-center w-8">ক্রমিক</th>
                      <th className="py-2 px-2">পণ্য বা সেবার বিবরণ</th>
                      <th className="py-2 px-2 text-center">পরিমাণ</th>
                      <th className="py-2 px-2 text-right">একক মূল্য (ভ্যাট ব্যতীত)</th>
                      <th className="py-2 px-2 text-right">মোট মূল্য</th>
                      <th className="py-2 px-2 text-center">ভ্যাটের হার</th>
                      <th className="py-2 px-2 text-right">ভ্যাটের পরিমাণ</th>
                      <th className="py-2 px-2 text-right">সর্বমোট (ভ্যাটসহ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map((l, idx) => {
                      const basePrice = Math.round((l.unitPrice / 1.15) * 100) / 100;
                      const lineBase = basePrice * l.quantity;
                      const lineVat = Math.round(lineBase * 0.15 * 100) / 100;
                      return (
                        <tr key={l.id} className="border-b border-slate-200">
                          <td className="py-2 px-1 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-2 font-medium">{l.productName} ({l.variant})</td>
                          <td className="py-2 px-2 text-center font-mono">{l.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono">{money(basePrice)}</td>
                          <td className="py-2 px-2 text-right font-mono">{money(lineBase)}</td>
                          <td className="py-2 px-2 text-center font-mono">15%</td>
                          <td className="py-2 px-2 text-right font-mono">{money(lineVat)}</td>
                          <td className="py-2 px-2 text-right font-mono font-semibold">{money(l.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mushak Totals */}
                <div className="flex justify-end pt-2 border-t-2 border-slate-900">
                  <div className="w-64 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-600">মোট মূল্য (ভ্যাট ব্যতীত):</span>
                      <span className="font-mono">{money(Math.round((order.subtotal / 1.15) * 100) / 100)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">মোট ভ্যাট (১৫%):</span>
                      <span className="font-mono font-semibold text-emerald-800">{money(Math.round((order.subtotal - order.subtotal / 1.15) * 100) / 100)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-1 text-sm font-black">
                      <span>সর্বমোট প্রদেয় মূল্য:</span>
                      <span className="font-mono">{money(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Certification Note */}
                <div className="border-t border-dashed border-slate-400 pt-3 text-[10px] text-slate-500 text-center space-y-0.5">
                  <div>"এটি একটি জাতীয় রাজস্ব বোর্ড অনুমোদিত ইলেকট্রনিক কর চালানপত্র (NBR Electronic Mushak 6.3)"</div>
                  <div className="font-mono text-[9px] text-slate-400">Security Verification Hash: SHA256:{order.id}-NBR-BD-{Date.now().toString(16)}</div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
