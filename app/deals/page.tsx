"use client";

import { useState } from "react";
import Image from "next/image";
import { PRODUCTS } from "@/lib/data";
import { Container, SectionHeading, CustomSelect } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { SfButton, SfIconChevronRight, SfIconPercent } from "@storefront-ui/react";
import Link from "next/link";

const SECTIONS = [
  { key: "Today's Deals", match: (p: (typeof PRODUCTS)[number]) => p.isDeal },
  { key: "Flash Sale", match: (p: (typeof PRODUCTS)[number]) => !!p.oldPrice },
  { key: "Clearance", match: (p: (typeof PRODUCTS)[number]) => (p.oldPrice ?? 0) - p.price > 5000 },
  { key: "Bundle Offers", match: (p: (typeof PRODUCTS)[number]) => p.category === "accessories" || p.category === "tv-audio" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Deal Sections" },
  { value: "Today's Deals", label: "Today's Deals" },
  { value: "Flash Sale", label: "Flash Sale" },
  { value: "Clearance", label: "Clearance Deals" },
  { value: "Bundle Offers", label: "Bundle Offers" },
];

export default function DealsPage() {
  const [filter, setFilter] = useState("all");
  const topDeals = PRODUCTS.filter((p) => p.oldPrice);
  const visibleSections = filter === "all" ? SECTIONS : SECTIONS.filter((s) => s.key === filter);

  return (
    <>
      {/* Full-width edge-to-edge Deals Banner */}
      <div className="relative h-44 w-full overflow-hidden border-b border-neutral-200/60 sm:h-64 md:h-80 lg:h-96 xl:h-[420px]">
        <Image
          src="/deals-hero-bg.jpg"
          alt="Deals Festival"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <Container className="py-4 sm:py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div>
            <h1 className="font-headings text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
              Deals &amp; Offers
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500 lg:text-sm">
              Authentic electronics at discounted prices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-sm bg-negative-50 px-2.5 py-1 text-xs font-semibold text-negative-800 lg:text-sm">
              <SfIconPercent size="xs" className="text-negative-600" />
              <span>{topDeals.length} active deals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden text-xs text-neutral-500 sm:inline">Section:</span>
              <CustomSelect
                value={filter}
                onChange={setFilter}
                options={FILTER_OPTIONS}
                size="sm"
                className="min-w-44"
              />
            </div>
          </div>
        </div>
        {visibleSections.map((s) => {
          const items = s.match ? PRODUCTS.filter(s.match) : [];
          if (items.length === 0) return null;
          return (
            <section key={s.key} className="mb-6 sm:mb-8">
              <SectionHeading title={s.key} subtitle={`Save on ${items.length} products`} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
                {items.slice(0, 8).map((p) => <ProductCard key={p.id + s.key} product={p} />)}
              </div>
            </section>
          );
        })}

        <div className="rounded-md border border-neutral-200/70 bg-neutral-50/50 p-3 sm:p-4">
          <h2 className="text-base font-bold text-neutral-900 sm:text-lg">Bank Offers</h2>
          <p className="mt-0.5 text-xs text-neutral-600">Extra 10% instant discount on BRAC Bank & City Bank cards. Up to ৳5,000 off.</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["City Bank", "BRAC Bank", "Islami Bank", "DBH"].map((b) => (
              <span key={b} className="rounded-sm border border-neutral-200/70 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700">{b}</span>
            ))}
          </div>
          <SfButton as={Link} href="/checkout" variant="secondary" size="sm" className="mt-3 !rounded-md !px-2.5 !py-1 text-xs">Use at checkout <SfIconChevronRight size="xs" /></SfButton>
        </div>
      </Container>
    </>
  );
}
