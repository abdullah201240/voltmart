"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SfChip, SfIconSearch } from "@storefront-ui/react";
import { PRODUCTS, CATEGORIES, BRANDS } from "@/lib/data";
import { Container, EmptyState, SkeletonGrid } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/layout/SearchBox";

function SearchView() {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const term = q.toLowerCase();

  const results = useMemo(() => {
    if (!term) return [];
    return PRODUCTS.filter((p) => `${p.name} ${p.brand} ${p.category} ${Object.values(p.attrs).join(" ")}`.toLowerCase().includes(term));
  }, [term]);

  const related = useMemo(() => {
    const set = new Set<string>();
    results.forEach((p) => { set.add(p.brand); set.add(p.name.split(" ").slice(0, 2).join(" ")); });
    return Array.from(set).filter(Boolean).slice(0, 6);
  }, [results]);

  return (
    <Container className="py-4 sm:py-5">
      <div className="mx-auto mb-4 sm:mb-5 max-w-2xl">
        <SearchBox />
      </div>

      {!q ? (
        <EmptyState icon={<SfIconSearch />} title="Search the store" description="Try “iPhone”, “laptop”, “headphones” or a brand name to find products, categories and more." />
      ) : (
        <>
          <p className="text-xs sm:text-sm text-neutral-500">
            <span className="text-base sm:text-lg font-bold text-neutral-900">{results.length}</span> result{results.length === 1 ? "" : "s"} for “{q}”
          </p>

          {related.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Related:</span>
              {related.map((r) => (
                <Link key={r} href={`/search?q=${encodeURIComponent(r)}`}><SfChip size="sm" className="!rounded-md !px-2 !py-0.5 !text-xs">{r}</SfChip></Link>
              ))}
            </div>
          )}

          {results.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState icon={<SfIconSearch />} title="No results found" description={`We couldn't find anything matching “${q}”. Check the spelling or try a broader term.`} actionLabel="Browse categories" actionHref="/category/mobiles" />
            </div>
          )}
        </>
      )}

      {/* Popular categories + brands */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 border-t border-neutral-100 pt-6">
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Popular categories</h3>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}><SfChip size="sm" className="!rounded-md !px-2.5 !py-1 !text-xs">{c.name}</SfChip></Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Top brands</h3>
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.slice(0, 10).map((b) => (
              <Link key={b} href={`/brand/${b.toLowerCase()}`}><SfChip size="sm" className="!rounded-md !px-2.5 !py-1 !text-xs">{b}</SfChip></Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Container className="py-4 sm:py-5"><SkeletonGrid count={4} /></Container>}>
      <SearchView />
    </Suspense>
  );
}
