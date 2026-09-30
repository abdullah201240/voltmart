"use client";

import { useState } from "react";
import { SfButton, SfInput, SfIconLocalShipping, SfIconSearch, SfIconOpenInNew } from "@storefront-ui/react";
import { Container } from "@/components/ui";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import type { Order } from "@/lib/data";

export default function TrackOrderPage() {
  const [num, setNum] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<null | {
    status: Order["status"];
    carrier?: string;
    consignmentId?: string;
    trackingUrl?: string;
  }>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    let orderStatus: Order["status"] = "shipped";
    const cleanedNum = num.trim().toUpperCase();

    // Check if matching locally saved customer order
    try {
      const raw = localStorage.getItem("sf_last_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.id?.toUpperCase() === cleanedNum || !cleanedNum) {
          orderStatus = "confirmed";
        }
      }
    } catch {
      /* ignore */
    }

    const cid = "PTH-BD-" + (cleanedNum.replace(/\D/g, "") || "894102");

    setResult({
      status: orderStatus,
      carrier: "Pathao Courier Express",
      consignmentId: cid,
      trackingUrl: `https://merchant.pathao.com/tracking?consignment_id=${cid}`,
    });
  }

  return (
    <Container className="py-6 sm:py-8">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Track Your Order</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">Enter your order number and the email or phone used at checkout.</p>

        <form onSubmit={submit} className="mt-5 space-y-2.5 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5 text-left [&_input]:!rounded-md">
          <SfInput value={num} onChange={(e) => setNum(e.target.value)} placeholder="Order number (e.g. ELX-20260930-00125)" aria-label="Order number" slotPrefix={<SfIconSearch size="sm" className="text-neutral-400" />} required />
          <SfInput value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" aria-label="Phone or email" required />
          <SfButton type="submit" size="base" className="w-full !rounded-md"><SfIconLocalShipping size="sm" /> Track Order</SfButton>
        </form>
      </div>

      {result && (
        <div className="mx-auto mt-6 max-w-xl rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5">
          <div className="mb-3.5 flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Shipment Progress</h2>
              <p className="text-xs text-neutral-500">Carrier: <span className="font-semibold text-neutral-800">{result.carrier}</span></p>
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-600">#{num || "ELX-20260930-00125"}</span>
          </div>

          <div className="mb-4 rounded bg-neutral-50 p-2.5 text-xs flex items-center justify-between">
            <div>
              <span className="text-neutral-500">Consignment ID:</span> <span className="font-mono font-bold text-neutral-800">{result.consignmentId}</span>
            </div>
            {result.trackingUrl && (
              <a
                href={result.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 hover:underline font-semibold"
              >
                Courier Live Tracking <SfIconOpenInNew size="xs" />
              </a>
            )}
          </div>

          <OrderTimeline status={result.status} />
        </div>
      )}
    </Container>
  );
}
