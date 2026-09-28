import Link from "next/link";
import { SfButton, SfIconPackage, SfIconChevronRight } from "@storefront-ui/react";
import { ORDERS } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { StatusBadge } from "@/components/account/OrderTimeline";

export default function OrdersPage() {
  return (
    <Container className="py-5 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">My Orders</h1>
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        <AccountSidebar />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3">
            {ORDERS.map((o) => (
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
                  <p className="truncate text-xs sm:text-sm text-neutral-600">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</p>
                  <div className="flex items-center gap-3 pl-3">
                    <span className="text-sm sm:text-base font-bold text-neutral-900">{formatPrice(o.total)}</span>
                    <SfButton size="sm" variant="secondary" className="!rounded-md">Details<SfIconChevronRight size="sm" /></SfButton>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
