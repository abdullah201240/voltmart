"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SfIconPerson,
  SfIconPackage,
  SfIconFavorite,
  SfIconCompareArrows,
  SfIconLocationOn,
  SfIconStar,
  SfIconPublishedWithChanges,
  SfIconSafetyCheck,
  SfIconCalendarToday,
  SfIconLogout,
} from "@storefront-ui/react";
import { classNames } from "@/lib/format";

const LINKS = [
  { href: "/account", label: "Dashboard", icon: <SfIconPerson size="sm" /> },
  { href: "/account/orders", label: "Orders", icon: <SfIconPackage size="sm" /> },
  { href: "/wishlist", label: "Wishlist", icon: <SfIconFavorite size="sm" /> },
  { href: "/compare", label: "Compare", icon: <SfIconCompareArrows size="sm" /> },
  { href: "/account", label: "Addresses", icon: <SfIconLocationOn size="sm" /> },
  { href: "/account", label: "My Reviews", icon: <SfIconStar size="sm" /> },
  { href: "/account", label: "Returns", icon: <SfIconPublishedWithChanges size="sm" /> },
  { href: "/account", label: "Warranty", icon: <SfIconSafetyCheck size="sm" /> },
  { href: "/account", label: "Notifications", icon: <SfIconCalendarToday size="sm" /> },
];

export function AccountSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="rounded-md border border-neutral-200/90 bg-white p-3 sm:p-3.5">
        <div className="mb-3 flex items-center gap-2.5 border-b border-neutral-100 pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">AR</span>
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm font-semibold text-neutral-900">Ayesha Rahman</p>
            <p className="truncate text-[11px] text-neutral-500">Gold member</p>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-1 lg:flex lg:flex-col">
          {LINKS.map((l) => {
            const active = pathname === l.href && (l.label === "Dashboard" || l.label === "Orders");
            return (
              <Link
                key={l.label}
                href={l.href}
                className={classNames(
                  "flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                  active ? "bg-primary-50 text-primary-800" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                {l.icon} {l.label}
              </Link>
            );
          })}
          <button type="button" className="flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium text-negative-600 hover:bg-negative-50">
            <SfIconLogout size="sm" /> Log out
          </button>
        </nav>
      </div>
    </aside>
  );
}
