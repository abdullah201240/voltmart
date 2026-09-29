"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SfButton,
  SfBadge,
  SfDrawer,
  SfIconMenu,
  SfIconPerson,
  SfIconFavorite,
  SfIconCompareArrows,
  SfIconShoppingCart,
  SfIconSearch,
  SfIconClose,
  SfIconChevronRight,
  SfIconPercent,
  SfIconLocalShipping,
  SfIconContactSupport,
  SfIconCall,
  SfIconInfo,
} from "@storefront-ui/react";
import { ANNOUNCEMENT, NAV_CATEGORIES, CATEGORY_NAMES, CATEGORIES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Container } from "@/components/ui";
import { SearchBox } from "./SearchBox";

function IconButton({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <SfButton as={Link} href={href} variant="tertiary" square aria-label={label} className="relative !rounded-md p-2">
      {children}
      {count ? <SfBadge content={count} max={99} placement="top-right" className="!bg-primary-600 !text-[10px] !leading-[10px]" /> : null}
    </SfButton>
  );
}

function CategoriesMenu() {
  return (
    <div className="pointer-events-none absolute left-0 top-full z-30 w-full translate-y-1 rounded-b-lg border-x border-b border-neutral-200 bg-white opacity-0 shadow-md transition-all duration-200 ease-out will-change-transform group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
      {/* hover bridge so the pointer can travel from the trigger to the panel */}
      <div className="h-2 bg-transparent" />
      <Container className="py-3.5">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group/item flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors hover:bg-neutral-50"
            >
              <span className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${c.tone}`}>
                <Image src={c.image} alt="" fill sizes="36px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-neutral-800 transition-colors group-hover/item:text-primary-700 sm:text-sm">{c.name}</span>
                <span className="block text-[11px] text-neutral-400">{c.count} products</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

function DrawerLink({
  href,
  icon,
  label,
  count,
  onClose,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
    >
      <span className="text-neutral-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {count ? <span className="rounded-full bg-primary-100 px-1.5 text-[10px] font-bold text-primary-800">{count}</span> : null}
      <SfIconChevronRight size="xs" className="text-neutral-300" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-4 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-neutral-400">{children}</p>;
}

export function Header() {
  const { cartCount, wishlist, compare } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      {/* Announcement */}
      <div className="truncate bg-primary-700 px-3 py-1.5 text-center text-xs font-medium tracking-wide text-white sm:text-[12px] lg:text-[13px]">
        {ANNOUNCEMENT}
      </div>

      {mobileSearch ? (
        <div className="flex items-center gap-2 border-b border-neutral-200 p-2.5 lg:hidden">
          <button type="button" aria-label="Close search" onClick={() => setMobileSearch(false)} className="p-1 text-neutral-500">
            <SfIconClose />
          </button>
          <SearchBox autoFocus className="flex-1" onNavigate={() => setMobileSearch(false)} />
        </div>
      ) : (
        <Container className="flex h-14 items-center gap-2.5 lg:h-16 lg:gap-4">
          <button type="button" aria-label="Open menu" className="p-2 text-neutral-700 lg:hidden" onClick={() => setMobileOpen(true)}>
            <SfIconMenu />
          </button>

          <Link href="/" className="flex items-center gap-1 font-headings text-xl font-bold tracking-tight lg:text-2xl">
            <span className="text-neutral-900">Volt</span>
            <span className="text-primary-600">Mart</span>
          </Link>

          <div className="hidden flex-1 lg:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1 lg:gap-1.5">
            <button type="button" aria-label="Search" className="p-2 text-neutral-700 lg:hidden" onClick={() => setMobileSearch(true)}>
              <SfIconSearch />
            </button>
            <div className="hidden lg:block">
              <IconButton href="/account" label="Account"><SfIconPerson /></IconButton>
            </div>
            <div className="hidden lg:block">
              <IconButton href="/wishlist" label="Wishlist" count={wishlist.length}><SfIconFavorite /></IconButton>
            </div>
            <div className="hidden lg:block">
              <IconButton href="/compare" label="Compare" count={compare.length}><SfIconCompareArrows /></IconButton>
            </div>
            <IconButton href="/cart" label="Cart" count={cartCount}><SfIconShoppingCart /></IconButton>
          </div>
        </Container>
      )}

      {/* Desktop category nav */}
      <nav className="hidden lg:block">
        <Container className="relative flex items-center gap-1">
          <div className="group">
            <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-800 lg:text-sm">
              <SfIconMenu size="xs" /> Categories
              <SfIconChevronRight size="xs" className="rotate-90 text-white/70 transition-transform group-hover:-rotate-90" />
            </button>
            <CategoriesMenu />
          </div>
          {NAV_CATEGORIES.map((slug) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="inline-flex items-center rounded-md px-2 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-primary-700 sm:text-sm lg:px-2.5 lg:text-[14px]"
            >
              {CATEGORY_NAMES[slug]}
            </Link>
          ))}
          <Link href="/deals" className="ml-auto inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-xs font-bold text-negative-600 transition-colors hover:bg-negative-50 sm:text-sm lg:text-[14px]">
            🔥 Deals
          </Link>
        </Container>
      </nav>
    </header>

    {/* Mobile drawer — rendered outside <header> so the sticky z-40 stacking
        context can't trap it under the bottom nav; real scrim behind it. */}
    {mobileOpen && (
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-50 bg-black/40 lg:hidden"
      />
    )}
    <SfDrawer open={mobileOpen} placement="left" onClose={() => setMobileOpen(false)} className="z-[60] w-80 max-w-[85vw] border-r border-neutral-200 bg-white p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 p-4">
            <span className="font-headings text-lg font-bold text-neutral-900">Menu</span>
            <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-1 text-neutral-500">
              <SfIconClose />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            <SectionLabel>Shop by Category</SectionLabel>
            <nav className="flex flex-col px-2">
              {CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-neutral-50">
                  <span className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${c.tone}`}>
                    <Image src={c.image} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-800">{c.name}</span>
                    <span className="block text-[11px] text-neutral-400">{c.count} products</span>
                  </span>
                  <SfIconChevronRight size="xs" className="text-neutral-300" />
                </Link>
              ))}
            </nav>

            <Link href="/deals" onClick={() => setMobileOpen(false)} className="mx-2 mt-2 flex items-center gap-2 rounded-md bg-negative-50 px-3 py-2.5 text-sm font-bold text-negative-700 hover:bg-negative-100">
              <SfIconPercent size="sm" /> Today&apos;s Deals
            </Link>

            <SectionLabel>Customer Care</SectionLabel>
            <nav className="flex flex-col px-2">
              <DrawerLink href="/compare" icon={<SfIconCompareArrows size="sm" />} label="Compare" count={compare.length} onClose={() => setMobileOpen(false)} />
              <DrawerLink href="/track-order" icon={<SfIconLocalShipping size="sm" />} label="Track Order" onClose={() => setMobileOpen(false)} />
              <DrawerLink href="/support" icon={<SfIconContactSupport size="sm" />} label="Help Center" onClose={() => setMobileOpen(false)} />
              <DrawerLink href="/contact" icon={<SfIconCall size="sm" />} label="Contact Us" onClose={() => setMobileOpen(false)} />
              <DrawerLink href="/about" icon={<SfIconInfo size="sm" />} label="About Us" onClose={() => setMobileOpen(false)} />
            </nav>

            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-neutral-100 px-4 pt-3 text-[11px] text-neutral-500">
              <Link href="/legal/privacy" onClick={() => setMobileOpen(false)} className="hover:text-neutral-900">Privacy</Link>
              <Link href="/legal/terms" onClick={() => setMobileOpen(false)} className="hover:text-neutral-900">Terms</Link>
              <Link href="/legal/refund" onClick={() => setMobileOpen(false)} className="hover:text-neutral-900">Refund Policy</Link>
            </div>
          </div>
        </div>
      </SfDrawer>
    </>
  );
}
