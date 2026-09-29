import Link from "next/link";
import { SfButton, SfIconPackage, SfIconLocationOn, SfIconCreditCard } from "@storefront-ui/react";
import { ORDERS, type Order } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Breadcrumbs, Container, EmptyState } from "@/components/ui";
import { OrderTimeline, StatusBadge } from "@/components/account/OrderTimeline";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order: Order | undefined = ORDERS.find((o) => o.id === id);

  return (
    <Container className="py-4 sm:py-5">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: `#${id}` }]} />

      {!order ? (
        <div className="py-8">
          <EmptyState icon={<SfIconPackage />} title="Order not found" description="We couldn't find this order. It may have been just placed — check back in a moment." actionLabel="Back to orders" actionHref="/account/orders" />
        </div>
      ) : (
        <>
          <div className="mb-4 mt-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Order #{order.id}</h1>
              <p className="mt-0.5 text-xs text-neutral-500">Placed on {order.date}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid gap-3.5 lg:grid-cols-3 lg:gap-4">
            <div className="space-y-3 sm:space-y-3.5 lg:col-span-2">
              <section className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
                <h2 className="mb-3 text-base font-bold">Items</h2>
                <div className="divide-y divide-neutral-100">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
                      <div>
                        <p className="font-medium text-neutral-900">{it.name}</p>
                        <p className="text-neutral-500">Qty {it.qty}</p>
                      </div>
                      <span className="font-semibold">{formatPrice(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm sm:text-base font-bold">
                  <span>Total</span><span>{formatPrice(order.total)}</span>
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
                  <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><SfIconLocationOn size="sm" className="text-primary-600" /> Delivery Address</h2>
                  <p className="text-xs sm:text-sm font-medium">Ayesha Rahman</p>
                  <p className="text-xs sm:text-sm text-neutral-500">House 12, Road 5, Gulshan 2</p>
                  <p className="text-xs sm:text-sm text-neutral-500">Dhaka 1212, Bangladesh</p>
                </section>
                <section className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
                  <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold"><SfIconCreditCard size="sm" className="text-primary-600" /> Payment</h2>
                  <p className="text-xs sm:text-sm text-neutral-600">Method: <span className="font-medium text-neutral-900">Visa •••• 4242</span></p>
                  <p className="text-xs sm:text-sm text-neutral-600">Status: <span className="font-medium text-positive-700">Paid</span></p>
                </section>
              </div>
            </div>

            <aside className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
              <h2 className="mb-3 text-base font-bold">Tracking</h2>
              <OrderTimeline status={order.status} />
              <SfButton as={Link} href="/track-order" variant="secondary" size="sm" className="mt-2 w-full !rounded-md">Track this order</SfButton>
            </aside>
          </div>

          <div className="mt-4">
            <SfButton as={Link} href="/account/orders" variant="tertiary" size="sm" className="!rounded-md">← Back to orders</SfButton>
          </div>
        </>
      )}
    </Container>
  );
}
