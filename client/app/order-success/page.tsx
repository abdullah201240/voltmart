"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SfButton, SfIconCheck, SfIconLocalShipping, SfIconPackage } from "@storefront-ui/react";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui";

type LastOrder = {
  id: string; date: string; total: number; payment: string; delivery?: string; eta: string;
  items: { name: string; qty: number; price: number }[];
};

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sf_last_order");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw) as LastOrder);
    } catch { /* ignore */ }
  }, []);

  return (
    <Container className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl">
        <div className="flex flex-col items-center rounded-md border border-positive-200 bg-positive-50/70 px-5 py-7 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-positive-600 text-white">
            <SfIconCheck size="lg" />
          </span>
          <h1 className="mt-3.5 font-headings text-2xl font-bold text-neutral-900">Order Confirmed</h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600">Thank you for your purchase. A confirmation has been sent to your email.</p>
        </div>

        {order ? (
          <div className="mt-5 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">Order number</p>
                <p className="font-mono text-base font-bold text-neutral-900">#{order.id}</p>
              </div>
              <SfIconPackage size="base" className="text-neutral-300" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <Info label="Order date" value={order.date} />
              <Info label="Estimated delivery" value={order.eta} />
              <Info label="Payment method" value={order.payment} />
              <Info label="Delivery" value={order.delivery ?? "Standard"} />
            </dl>

            <div className="mt-4 divide-y divide-neutral-100 rounded-md border border-neutral-200/90">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 text-xs sm:text-sm">
                  <span className="text-neutral-700">{it.name} <span className="text-neutral-400">× {it.qty}</span></span>
                  <span className="font-medium">{formatPrice(it.price * it.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm sm:text-base font-bold">
              <span>Total paid</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-center text-xs sm:text-sm text-neutral-500">No recent order found. Your confirmed order details will appear here.</p>
        )}

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <SfButton as={Link} href="/track-order" size="base" className="flex-1 !rounded-md"><SfIconLocalShipping size="sm" /> Track Order</SfButton>
          <SfButton as={Link} href="/" size="base" variant="secondary" className="flex-1 !rounded-md">Continue Shopping</SfButton>
        </div>
      </div>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}
