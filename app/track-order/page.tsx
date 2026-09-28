"use client";

import { useState } from "react";
import { SfButton, SfInput, SfIconLocalShipping, SfIconSearch } from "@storefront-ui/react";
import { Container } from "@/components/ui";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import type { Order } from "@/lib/data";

export default function TrackOrderPage() {
  const [num, setNum] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<null | { status: Order["status"] }>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult({ status: "shipped" });
  }

  return (
    <Container className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Track Your Order</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">Enter your order number and the email or phone used at checkout.</p>

        <form onSubmit={submit} className="mt-5 space-y-2.5 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5 text-left [&_input]:!rounded-md">
          <SfInput value={num} onChange={(e) => setNum(e.target.value)} placeholder="Order number (e.g. ELX-20260928-00125)" aria-label="Order number" slotPrefix={<SfIconSearch size="sm" className="text-neutral-400" />} required />
          <SfInput value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" aria-label="Phone or email" required />
          <SfButton type="submit" size="base" className="w-full !rounded-md"><SfIconLocalShipping size="sm" /> Track Order</SfButton>
        </form>
      </div>

      {result && (
        <div className="mx-auto mt-6 max-w-xl rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Shipment progress</h2>
            <span className="text-xs text-neutral-500">#{num || "ELX-20260928-00125"}</span>
          </div>
          <OrderTimeline status={result.status} />
        </div>
      )}
    </Container>
  );
}
