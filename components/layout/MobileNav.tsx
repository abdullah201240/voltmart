"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SfIconHome,
  SfIconGridView,
  SfIconSearch,
  SfIconFavorite,
  SfIconPerson,
} from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/format";

const ITEMS = [
  { href: "/", label: "Home", icon: <SfIconHome size="sm" /> },
  { href: "/category/mobiles", label: "Categories", icon: <SfIconGridView size="sm" /> },
  { href: "/search", label: "Search", icon: <SfIconSearch size="sm" /> },
  { href: "/wishlist", label: "Wishlist", icon: <SfIconFavorite size="sm" /> },
  { href: "/account", label: "Account", icon: <SfIconPerson size="sm" /> },
];

export function MobileNav() {
  const pathname = usePathname();
  const { wishlist } = useStore();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={classNames(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary-700" : "text-neutral-500",
              )}
            >
              {item.icon}
              {item.label}
              {item.label === "Wishlist" && wishlist.length > 0 && (
                <span className="absolute right-6 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-negative-600 px-1 text-[9px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
