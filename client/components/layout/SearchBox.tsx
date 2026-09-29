"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SfInput, SfIconSearch, SfIconClose, SfIconChevronRight } from "@storefront-ui/react";
import { PRODUCTS, CATEGORIES, BRANDS } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";

const RECENT_KEY = "sf_recent_searches";

export function SearchBox({
  autoFocus = false,
  onNavigate,
  className = "",
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const term = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!term) return { products: [], categories: [], brands: [] };
    return {
      products: PRODUCTS.filter((p) => (p.name + " " + p.brand + " " + p.category).toLowerCase().includes(term)).slice(0, 5),
      categories: CATEGORIES.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 3),
      brands: BRANDS.filter((b) => b.toLowerCase().includes(term)).slice(0, 4),
    };
  }, [term]);

  function remember(value: string) {
    const next = [value, ...recent.filter((r) => r !== value)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function go(url: string, value: string) {
    remember(value);
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(url);
  }

  function submit() {
    if (!q.trim()) return;
    go(`/search?q=${encodeURIComponent(q.trim())}`, q.trim());
  }

  const showPanel = open && (term === "" || results.products.length + results.categories.length + results.brands.length > 0);

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <SfInput
        autoFocus={autoFocus}
        value={q}
        placeholder="Search for phones, laptops, TVs, accessories..."
        aria-label="Search"
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        slotPrefix={<SfIconSearch size="sm" className="text-neutral-400" />}
        slotSuffix={
          q ? (
            <button type="button" aria-label="Clear" onClick={() => setQ("")} className="text-neutral-400 hover:text-neutral-700">
              <SfIconClose size="sm" />
            </button>
          ) : undefined
        }
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
          {term === "" ? (
            recent.length > 0 ? (
              <div className="p-2.5">
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Recent searches</p>
                {recent.map((r) => (
                  <button key={r} type="button" onClick={() => go(`/search?q=${encodeURIComponent(r)}`, r)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-neutral-50 sm:text-sm">
                    <SfIconSearch size="xs" className="text-neutral-400" /> {r}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2.5">
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Popular searches</p>
                {["iPhone", "MacBook", "PS5", "Sony headphones"].map((r) => (
                  <button key={r} type="button" onClick={() => go(`/search?q=${encodeURIComponent(r)}`, r)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-neutral-50 sm:text-sm">
                    <SfIconSearch size="xs" className="text-neutral-400" /> {r}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {results.products.length > 0 && (
                <Group label="Products">
                  {results.products.map((p) => (
                    <button key={p.id} type="button" onClick={() => go(`/product/${p.id}`, p.name)} className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left hover:bg-neutral-50">
                      <ProductImage category={p.category} tone={p.tone} name={p.name} src={p.image} className="h-9 w-9 shrink-0" rounded="rounded-sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-neutral-900 sm:text-sm">{p.name}</span>
                        <span className="block text-[11px] text-neutral-500">{p.brand}</span>
                      </span>
                      <span className="text-xs font-bold text-neutral-900 sm:text-sm">{formatPrice(p.price)}</span>
                    </button>
                  ))}
                </Group>
              )}
              {results.categories.length > 0 && (
                <Group label="Categories">
                  {results.categories.map((c) => (
                    <button key={c.slug} type="button" onClick={() => go(`/category/${c.slug}`, c.name)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-neutral-50 sm:text-sm">
                      <span className="inline-flex items-center gap-1.5"><SfIconChevronRight size="xs" className="text-neutral-400" /> {c.name}</span>
                      <span className="text-[11px] text-neutral-400">{c.count} items</span>
                    </button>
                  ))}
                </Group>
              )}
              {results.brands.length > 0 && (
                <Group label="Brands">
                  <div className="flex flex-wrap gap-1 px-1.5 py-1">
                    {results.brands.map((b) => (
                      <button key={b} type="button" onClick={() => go(`/brand/${b.toLowerCase()}`, b)} className="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] font-medium hover:border-primary-500 hover:text-primary-700">
                        {b}
                      </button>
                    ))}
                  </div>
                </Group>
              )}
              <button type="button" onClick={submit} className="mt-1 w-full rounded-md bg-neutral-50 px-2.5 py-1.5 text-left text-xs font-medium text-primary-700 hover:bg-neutral-100">
                See all results for “{q.trim()}”
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      {children}
    </div>
  );
}
