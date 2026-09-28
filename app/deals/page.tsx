import { PRODUCTS } from "@/lib/data";
import { Container, SectionHeading } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { SfButton, SfIconChevronRight, SfIconPercent } from "@storefront-ui/react";
import Link from "next/link";

const SECTIONS = [
  { key: "Today's Deals", match: (p: (typeof PRODUCTS)[number]) => p.isDeal },
  { key: "Flash Sale", match: (p: (typeof PRODUCTS)[number]) => !!p.oldPrice },
  { key: "Clearance", match: (p: (typeof PRODUCTS)[number]) => (p.oldPrice ?? 0) - p.price > 5000 },
  { key: "Bundle Offers", match: (p: (typeof PRODUCTS)[number]) => p.category === "accessories" || p.category === "tv-audio" },
];

export default function DealsPage() {
  const topDeals = PRODUCTS.filter((p) => p.oldPrice);
  return (
    <Container className="py-4 sm:py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/90 pb-3">
        <div>
          <h1 className="font-headings text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
            Deals &amp; Offers
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500 lg:text-sm">
            Authentic electronics at discounted prices
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-negative-200/80 bg-negative-50/80 px-2.5 py-1 text-xs font-semibold text-negative-800 lg:text-sm">
          <SfIconPercent size="xs" className="text-negative-600" />
          <span>{topDeals.length} active deals</span>
        </div>
      </div>
        {SECTIONS.map((s) => {
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

        <div className="rounded-md border border-neutral-200/90 bg-neutral-50/60 p-3 sm:p-4">
          <h2 className="text-base font-bold text-neutral-900 sm:text-lg">Bank Offers</h2>
          <p className="mt-0.5 text-xs text-neutral-600">Extra 10% instant discount on BRAC Bank & City Bank cards. Up to ৳5,000 off.</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {["City Bank", "BRAC Bank", "Islami Bank", "DBH"].map((b) => (
              <span key={b} className="rounded-md border border-neutral-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700">{b}</span>
            ))}
          </div>
          <SfButton as={Link} href="/checkout" variant="secondary" size="sm" className="mt-3 !rounded-md !px-2.5 !py-1 text-xs">Use at checkout <SfIconChevronRight size="xs" /></SfButton>
        </div>
      </Container>
  );
}
