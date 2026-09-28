"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  SfButton,
  SfCheckbox,
  SfSelect,
  SfDrawer,
  SfChip,
  SfIconTune,
  SfIconGridView,
  SfIconViewList,
  SfIconClose,
  SfIconChevronRight,
} from "@storefront-ui/react";
import { PRODUCTS, CATEGORY_NAMES, filtersForCategory, type Product } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { classNames } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs, Container, EmptyState } from "@/components/ui";

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

function FiltersPanel({
  slug,
  selected,
  toggle,
  clear,
  maxPrice,
  setMaxPrice,
  priceCeiling,
}: {
  slug: string;
  selected: Record<string, string[]>;
  toggle: (key: string, value: string) => void;
  clear: () => void;
  maxPrice: number;
  setMaxPrice: (n: number) => void;
  priceCeiling: number;
}) {
  const schema = filtersForCategory(slug);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-neutral-900"><SfIconTune size="sm" /> Filters</h3>
        <button type="button" onClick={clear} className="text-xs font-medium text-primary-700 hover:underline">Clear all</button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-neutral-900">Price</p>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary-600"
        />
        <p className="mt-1 text-xs text-neutral-500">Up to {formatPrice(maxPrice)}</p>
      </div>

      {schema.filter((f) => f.key !== "brand" && f.options.length > 0).map((f) => (
        <div key={f.key}>
          <p className="mb-2 text-sm font-semibold text-neutral-900">{f.label}</p>
          <div className="flex flex-col gap-2">
            {f.options.map((opt) => (
              <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
                <SfCheckbox checked={(selected[f.key] ?? []).includes(opt)} onChange={() => toggle(f.key, opt)} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug = "mobiles" } = useParams<{ slug: string }>();
  const name = CATEGORY_NAMES[slug] ?? slug;

  const base = useMemo(() => PRODUCTS.filter((p) => p.category === slug), [slug]);
  const priceCeiling = useMemo(() => Math.max(100000, ...base.map((p) => p.price)), [base]);

  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [maxPrice, setMaxPrice] = useState<number>(priceCeiling);
  const [sort, setSort] = useState<Sort>("recommended");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);

  // brand options come from products in category
  const brands = useMemo(() => Array.from(new Set(base.map((p) => p.brand))), [base]);

  function toggle(key: string, value: string) {
    setSelected((prev) => {
      const cur = prev[key] ?? [];
      return { ...prev, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }
  function clear() {
    setSelected({});
    setMaxPrice(priceCeiling);
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

  // brand filter rendered separately (from products)
  const brandFilter = (
    <div>
      <p className="mb-2 text-sm font-semibold text-neutral-900">Brand</p>
      <div className="flex flex-col gap-2">
        {brands.map((b) => (
          <label key={b} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <SfCheckbox checked={(selected["brand"] ?? []).includes(b)} onChange={() => toggle("brand", b)} />
            {b}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <Container className="py-4 sm:py-5">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories", href: "/category/mobiles" }, { label: name }]} />
      <div className="mb-4 mt-2">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">{name}</h1>
        <p className="mt-0.5 text-xs text-neutral-500">{filtered.length} of {base.length} products</p>
      </div>

      <div className="flex gap-4 lg:gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-32 rounded-md border border-neutral-200 bg-white p-3.5">
            {brandFilter}
            <div className="mt-4" />
            <FiltersPanel
              slug={slug}
              selected={selected}
              toggle={toggle}
              clear={clear}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              priceCeiling={priceCeiling}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-3.5 flex items-center justify-between gap-2.5">
            <SfButton variant="secondary" size="sm" className="!rounded-md !px-2.5 !py-1 text-xs lg:hidden" onClick={() => setDrawer(true)}>
              <SfIconTune size="xs" /> Filters{activeCount > 0 && ` (${activeCount})`}
            </SfButton>
            <div className="ml-auto flex items-center gap-2">
              <SortSelect value={sort} onChange={setSort} />
              <div className="hidden items-center gap-1 sm:flex">
                <SfButton variant={view === "grid" ? "secondary" : "tertiary"} square aria-label="Grid view" className="!rounded-md p-1.5" onClick={() => setView("grid")}><SfIconGridView size="xs" /></SfButton>
                <SfButton variant={view === "list" ? "secondary" : "tertiary"} square aria-label="List view" className="!rounded-md p-1.5" onClick={() => setView("list")}><SfIconViewList size="xs" /></SfButton>
              </div>
            </div>
          </div>

          {/* Active chips */}
          {activeCount > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {Object.entries(selected).flatMap(([k, vals]) =>
                vals.map((v) => (
                  <SfChip key={k + v} size="sm" className="!rounded-sm text-xs" slotSuffix={<button type="button" aria-label="Remove" onClick={() => toggle(k, v)}><SfIconClose size="xs" /></button>}>{v}</SfChip>
                )),
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState title="No products match your filters" description="Try adjusting or clearing your filters to see more items." actionLabel="Browse smartphones" actionHref="/category/mobiles" />
          ) : (
            <div className={classNames(view === "grid" ? "grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 sm:gap-2.5" : "flex flex-col gap-2.5")}>
              {filtered.map((p) => <ProductCard key={p.id} product={p} layout={view} />)}
            </div>
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
          {brandFilter}
          <div className="mt-4" />
          <FiltersPanel slug={slug} selected={selected} toggle={toggle} clear={clear} maxPrice={maxPrice} setMaxPrice={setMaxPrice} priceCeiling={priceCeiling} />
        </div>
        <div className="flex gap-2.5 border-t border-neutral-200 p-3">
          <SfButton variant="secondary" size="sm" className="flex-1 !rounded-md" onClick={clear}>Clear All</SfButton>
          <SfButton size="sm" className="flex-1 !rounded-md" onClick={() => setDrawer(false)}>Apply Filters<SfIconChevronRight size="xs" /></SfButton>
        </div>
      </SfDrawer>
    </Container>
  );
}
