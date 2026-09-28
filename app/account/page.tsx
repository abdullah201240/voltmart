import Link from "next/link";
import { SfButton, SfIconPackage, SfIconFavorite, SfIconStar, SfIconCreditCard } from "@storefront-ui/react";
import { ORDERS } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { RecentlyViewed } from "@/components/account/RecentlyViewed";
import { StatusBadge } from "@/components/account/OrderTimeline";

const CARDS = [
  { label: "Orders", value: String(ORDERS.length), href: "/account/orders", icon: <SfIconPackage /> },
  { label: "Wishlist", value: "4", href: "/wishlist", icon: <SfIconFavorite /> },
  { label: "Rewards", value: "1,250 pts", href: "/account", icon: <SfIconStar /> },
  { label: "Store Credit", value: formatPrice(3500), href: "/account", icon: <SfIconCreditCard /> },
];

export default function AccountPage() {
  return (
    <Container className="py-5 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">My Account</h1>
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        <AccountSidebar />
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
            {CARDS.map((c) => (
              <Link key={c.label} href={c.href} className="flex flex-col gap-1.5 rounded-md border border-neutral-200/90 bg-white p-3 transition-colors hover:border-primary-400 [&>span>svg]:h-5 [&>span>svg]:w-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700">{c.icon}</span>
                <p className="text-[11px] uppercase tracking-wide text-neutral-500">{c.label}</p>
                <p className="text-base font-bold text-neutral-900">{c.value}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Recent Orders</h2>
              <SfButton as={Link} href="/account/orders" variant="tertiary" size="sm" className="!rounded-md">View all</SfButton>
            </div>
            <div className="divide-y divide-neutral-100 rounded-md border border-neutral-200/90 bg-white">
              {ORDERS.slice(0, 3).map((o) => (
                <Link key={o.id} href={`/orders/${o.id}`} className="flex items-center gap-3 p-3 transition-colors hover:bg-neutral-50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500"><SfIconPackage size="sm" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs sm:text-sm font-semibold text-neutral-900">#{o.id}</p>
                    <p className="text-[11px] text-neutral-500">{o.date} · {o.items.length} item(s)</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="hidden text-xs sm:text-sm font-bold text-neutral-900 sm:block">{formatPrice(o.total)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </Container>
  );
}
