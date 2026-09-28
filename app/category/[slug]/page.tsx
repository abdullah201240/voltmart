"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  SfButton,
  SfCheckbox,
  SfSelect,
  SfDrawer,
  SfChip,
  SfIconTune,
  SfIconClose,
  SfIconChevronRight,
} from "@storefront-ui/react";
import {
  PRODUCTS,
  CATEGORIES,
  CATEGORY_NAMES,
  filtersForCategory,
  type Product,
} from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { classNames } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Container, EmptyState } from "@/components/ui";

type Sort = "recommended" | "newest" | "price-asc" | "price-desc" | "rating" | "bestselling";

const SORTS: { value: Sort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rated" },
  { value: "bestselling", label: "Best Selling" },
];

function matches(product: Product, selected: Record<string, string[]>, maxPrice: number) {
  if (product.price > maxPrice) return false;
  for (const [key, values] of Object.entries(selected)) {
    if (values.length === 0) continue;
    const val = key === "brand" ? product.brand : product.attrs[key];
    if (!val || !values.includes(val)) return false;
  }
  return true;
}

function SortSelect({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-600">
      <span className="hidden sm:inline">Sort:</span>
      <SfSelect value={value} onChange={(e) => onChange(e.target.value as Sort)} className="w-48" size="sm">
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </SfSelect>
    </label>
  );
}

function FilterGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <details open className="group border-t border-neutral-100 pt-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-neutral-900">
        <span className="flex items-center gap-1.5">
          {label}
          {count > 0 && (
            <span className="rounded-full bg-primary-100 px-1.5 text-[10px] font-bold text-primary-800">{count}</span>
          )}
        </span>
        <SfIconChevronRight size="xs" className="rotate-90 text-neutral-400 transition-transform group-open:-rotate-90" />
      </summary>
      <div className="mt-2.5 flex flex-col gap-2">{children}</div>
    </details>
  );
}

function FilterOption({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900">
      <SfCheckbox checked={checked} onChange={onToggle} />
      {label}
    </label>
  );
}

// Quick price presets (৳ upper bounds) shown above the slider.
const PRICE_PRESETS = [25000, 50000, 100000, 150000];

function FiltersPanel({
  slug,
  brands,
  selected,
  toggle,
  clear,
  maxPrice,
  setMaxPrice,
  priceCeiling,
}: {
  slug: string;
  brands: string[];
  selected: Record<string, string[]>;
  toggle: (key: string, value: string) => void;
  clear: () => void;
  maxPrice: number;
  setMaxPrice: (n: number) => void;
  priceCeiling: number;
}) {
  const schema = filtersForCategory(slug);
  const groups = schema.filter((f) => f.key !== "brand" && f.options.length > 0);
  const activeCount = Object.values(selected).reduce((n, v) => n + v.length, 0);
  return (
    <div className="flex flex-col gap-3 pb-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-neutral-900">
          <SfIconTune size="sm" /> Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{activeCount}</span>
          )}
        </h3>
        <button type="button" onClick={clear} className="text-xs font-medium text-primary-700 hover:underline">Clear all</button>
      </div>

      <FilterGroup label="Price" count={maxPrice < priceCeiling ? 1 : 0}>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary-600"
        />
        <p className="text-xs text-neutral-500">
          Up to <span className="font-semibold text-neutral-900">{formatPrice(maxPrice)}</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.filter((v) => v < priceCeiling).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMaxPrice(v)}
              className={classNames(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                maxPrice === v
                  ? "border-primary-600 bg-primary-50 text-primary-800"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
              )}
            >
              Under {formatPrice(v)}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Brand" count={(selected["brand"] ?? []).length}>
        {brands.map((b) => (
          <FilterOption key={b} label={b} checked={(selected["brand"] ?? []).includes(b)} onToggle={() => toggle("brand", b)} />
        ))}
      </FilterGroup>

      {groups.map((f) => (
        <FilterGroup key={f.key} label={f.label} count={(selected[f.key] ?? []).length}>
          {f.options.map((opt) => (
            <FilterOption key={opt} label={opt} checked={(selected[f.key] ?? []).includes(opt)} onToggle={() => toggle(f.key, opt)} />
          ))}
        </FilterGroup>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug = "mobiles" } = useParams<{ slug: string }>();
  const name = CATEGORY_NAMES[slug] ?? slug;
  const category = useMemo(() => CATEGORIES.find((c) => c.slug === slug), [slug]);

  const base = useMemo(() => PRODUCTS.filter((p) => p.category === slug), [slug]);
  const priceCeiling = useMemo(() => Math.max(100000, ...base.map((p) => p.price)), [base]);

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [maxPrice, setMaxPrice] = useState<number>(priceCeiling);
  const [sort, setSort] = useState<Sort>("recommended");
  const [drawer, setDrawer] = useState(false);
  const [pageSize, setPageSize] = useState(12);

  // brand options come from products in category
  const brands = useMemo(() => Array.from(new Set(base.map((p) => p.brand))), [base]);

  function toggle(key: string, value: string) {
    setSelected((prev) => {
      const cur = prev[key] ?? [];
      return { ...prev, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
    setPageSize(12);
  }
  function clear() {
    setSelected({});
    setMaxPrice(priceCeiling);
    setPageSize(12);
  }

  const filtered = useMemo(() => {
    let list = base.filter((p) => matches(p, selected, maxPrice));
    list = [...list];
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "newest": list.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false)); break;
      case "bestselling": list.sort((a, b) => Number(b.isBestSeller ?? false) - Number(a.isBestSeller ?? false)); break;
    }
    return list;
  }, [base, selected, maxPrice, sort]);

  const activeCount = Object.values(selected).reduce((n, v) => n + v.length, 0);
  const shown = filtered.slice(0, pageSize);
  const otherCategories = CATEGORIES.filter((c) => c.slug !== slug).slice(0, 6);

  return (
    <Container className="py-4 sm:py-5">
      {/* Category banner */}
      <section className="relative mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700">
        {category && (
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="object-cover opacity-25"
          />
        )}
        <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-neutral-300">
              <Link href="/" className="hover:text-white">Home</Link>
              <SfIconChevronRight size="xs" className="text-neutral-500" />
              <span className="font-medium text-white">{name}</span>
            </nav>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">{name}</h1>
            {category && <p className="mt-1 text-xs text-neutral-300 sm:text-sm">{category.blurb}</p>}
            <p className="mt-1.5 text-xs text-neutral-400">{filtered.length} of {base.length} products</p>
          </div>
          {/* Quick brand pills */}
          <div className="flex flex-wrap gap-1.5">
            {brands.map((b) => {
              const on = (selected["brand"] ?? []).includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggle("brand", b)}
                  className={classNames(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    on
                      ? "border-white bg-white text-neutral-900"
                      : "border-white/30 bg-white/10 text-white hover:bg-white/20",
                  )}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex gap-4 lg:gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-32 flex flex-col gap-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <FiltersPanel
                slug={slug}
                brands={brands}
                selected={selected}
                toggle={toggle}
                clear={clear}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                priceCeiling={priceCeiling}
              />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="mb-2.5 text-sm font-semibold text-neutral-900">Browse categories</p>
              <div className="flex flex-col gap-1">
                {otherCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-primary-700"
                  >
                    {c.name}
                    <SfIconChevronRight size="xs" className="text-neutral-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-3 py-2.5">
            <SfButton variant="secondary" size="sm" className="!rounded-md !px-2.5 !py-1 text-xs lg:hidden" onClick={() => setDrawer(true)}>
              <SfIconTune size="xs" /> Filters{activeCount > 0 && ` (${activeCount})`}
            </SfButton>
            <p className="hidden text-xs text-neutral-500 sm:block lg:hidden">
              Showing {shown.length} of {filtered.length}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          {/* Active chips */}
          {(activeCount > 0 || maxPrice < priceCeiling) && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {Object.entries(selected).flatMap(([k, vals]) =>
                vals.map((v) => (
                  <SfChip key={k + v} size="sm" square className="!rounded-md text-xs" slotSuffix={<button type="button" aria-label="Remove" onClick={() => toggle(k, v)}><SfIconClose size="xs" /></button>}>{v}</SfChip>
                )),
              )}
              {maxPrice < priceCeiling && (
                <SfChip size="sm" square className="!rounded-md text-xs" slotSuffix={<button type="button" aria-label="Remove" onClick={() => setMaxPrice(priceCeiling)}><SfIconClose size="xs" /></button>}>Under {formatPrice(maxPrice)}</SfChip>
              )}
              <button type="button" onClick={clear} className="ml-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline">Clear all</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState title="No products match your filters" description="Try adjusting or clearing your filters to see more items." actionLabel="Clear filters" actionHref={`/category/${slug}`} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 sm:gap-2.5">
                {shown.map((p) => <ProductCard key={p.id} product={p} layout="grid" />)}
              </div>
              {filtered.length > shown.length && (
                <div className="mt-5 flex justify-center">
                  <SfButton variant="secondary" size="lg" className="!rounded-md" onClick={() => setPageSize((n) => n + 12)}>
                    Show more ({filtered.length - shown.length} left)
                  </SfButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer — z above the bottom nav, and sits on top of it so the action row stays tappable */}
      <SfDrawer open={drawer} placement="bottom" onClose={() => setDrawer(false)} className="bottom-16 z-[60] max-h-[85vh] rounded-t-lg border border-neutral-200 bg-white lg:hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 p-3">
          <h3 className="text-sm font-bold">Filters</h3>
          <button type="button" aria-label="Close" onClick={() => setDrawer(false)} className="p-1 text-neutral-500"><SfIconClose /></button>
        </div>
        <div className="overflow-y-auto p-3" style={{ maxHeight: "60vh" }}>
          <FiltersPanel slug={slug} brands={brands} selected={selected} toggle={toggle} clear={clear} maxPrice={maxPrice} setMaxPrice={setMaxPrice} priceCeiling={priceCeiling} />
        </div>
        <div className="flex gap-2.5 border-t border-neutral-200 p-3">
          <SfButton variant="secondary" size="sm" className="flex-1 !rounded-md" onClick={clear}>Clear All</SfButton>
          <SfButton size="sm" className="flex-1 !rounded-md" onClick={() => setDrawer(false)}>Show {filtered.length} items<SfIconChevronRight size="xs" /></SfButton>
        </div>
      </SfDrawer>
    </Container>
  );
}
