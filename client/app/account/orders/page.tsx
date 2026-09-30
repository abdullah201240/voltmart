"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { SfButton, SfIconPackage, SfIconChevronRight } from "@storefront-ui/react";
import { ORDERS } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Container, CustomSelect } from "@/components/ui";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { StatusBadge } from "@/components/account/OrderTimeline";

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "delivered", label: "Delivered" },
  { value: "shipped", label: "Shipped" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
];

export default function OrdersPage() {
  const [status, setStatus] = useState("all");
  const [localOrder, setLocalOrder] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sf_last_order");
      if (raw) setLocalOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const allOrders = useMemo(() => {
    if (!localOrder) return ORDERS;
    const mapped = {
      id: localOrder.id,
      date: localOrder.date,
      total: localOrder.total,
      status: "confirmed" as const,
      items: localOrder.items || [],
    };
    return [mapped, ...ORDERS];
  }, [localOrder]);

  const filteredOrders = useMemo(() => {
    if (status === "all") return allOrders;
    return allOrders.filter((o) => o.status === status);
  }, [status, allOrders]);

  return (
    <Container className="py-5 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Orders</h1>
          <p className="mt-0.5 text-xs text-neutral-500">Track, return or review your purchases</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-medium text-neutral-500">Status:</span>
          <CustomSelect
            value={status}
            onChange={setStatus}
            options={STATUS_FILTERS}
            className="w-40 sm:w-44"
            size="sm"
            align="right"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        <AccountSidebar />
        <div className="min-w-0 flex-1">
          {filteredOrders.length === 0 ? (
            <div className="rounded-md border border-neutral-200/90 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-neutral-800">No {status} orders found</p>
              <p className="mt-1 text-xs text-neutral-500">Try selecting another status from the filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOrders.map((o) => (
                <Link key={o.id} href={`/orders/${o.id}`} className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4 transition-colors hover:border-primary-400">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500"><SfIconPackage size="sm" /></span>
                      <div>
                        <p className="font-mono text-xs sm:text-sm font-bold text-neutral-900">#{o.id}</p>
                        <p className="text-[11px] text-neutral-500">Placed {o.date}</p>
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <p className="truncate text-xs sm:text-sm text-neutral-600">{o.items.map((i: any) => `${i.name} × ${i.qty}`).join(", ")}</p>
                    <div className="flex items-center gap-3 pl-3">
                      <span className="text-sm sm:text-base font-bold text-neutral-900">{formatPrice(o.total)}</span>
                      <SfButton size="sm" variant="secondary" className="!rounded-md">Details<SfIconChevronRight size="sm" /></SfButton>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
