"use client";

import Link from "next/link";
import { SfButton, SfRating, SfIconClose, SfIconCompareArrows, SfIconAddShoppingCart } from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/data";
import { classNames, formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { Container, EmptyState } from "@/components/ui";

export default function ComparePage() {
  const { compare, toggleCompare, addToCart } = useStore();
  const products = compare.map(getProduct).filter((p) => !!p);

  if (products.length === 0) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Compare Products</h1>
        <EmptyState
          icon={<SfIconCompareArrows />}
          title="Nothing to compare yet"
          description="Add products using the compare button on any product card to see them side by side."
          actionLabel="Browse products"
          actionHref="/category/mobiles"
        />
      </Container>
    );
  }

  const attrKeys = Array.from(new Set(products.flatMap((p) => Object.keys(p!.attrs))));

  function highlight(key: string, value: string) {
    const distinct = new Set(products.map((p) => (key === "price" ? String(p!.price) : key === "name" ? p!.brand : p!.attrs[key])));
    return distinct.size > 1 && value !== "—";
  }

  const rows: { label: string; get: (p: NonNullable<(typeof products)[number]>) => string }[] = [
    { label: "Price", get: (p) => formatPrice(p.price) },
    { label: "Brand", get: (p) => p.brand },
    { label: "Availability", get: (p) => (p.inStock ? "In stock" : "Out of stock") },
    ...attrKeys.map((k) => ({ label: k, get: (p: NonNullable<(typeof products)[number]>) => p.attrs[k] ?? "—" })),
  ];

  return (
    <Container className="py-5 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">Compare Products</h1>

      <p className="mb-2 text-xs text-neutral-400 lg:hidden">👉 Swipe the table sideways to see every product.</p>
      <div className="overflow-x-auto rounded-md border border-neutral-200/90">
        <table className="w-full min-w-[600px] border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-24 bg-white p-2.5 text-left align-bottom sm:w-36 sm:p-3" />
              {products.map((p) => (
                <th key={p!.id} className="sticky top-0 z-10 bg-white p-3 text-left align-bottom">
                  <div className="flex flex-col gap-1.5">
                    <div className="relative">
                      <ProductImage category={p!.category} tone={p!.tone} name={p!.name} src={p!.image} className="aspect-square w-full" rounded="rounded-md" />
                      <button type="button" aria-label="Remove" onClick={() => toggleCompare(p!.id)} className="absolute right-1 top-1 rounded-md bg-neutral-700/80 p-1 text-white transition hover:bg-neutral-900">
                        <SfIconClose size="xs" />
                      </button>
                    </div>
                    <Link href={`/product/${p!.id}`} className="line-clamp-2 text-xs sm:text-sm font-semibold text-neutral-900 hover:text-primary-700">{p!.name}</Link>
                    <span className="inline-flex items-center gap-1"><SfRating size="xs" value={p!.rating} max={5} /><span className="text-[11px] font-normal text-neutral-500">{p!.rating}</span></span>
                    <SfButton size="sm" disabled={!p!.inStock} onClick={() => addToCart(p!.id)} className="!rounded-md !py-1 text-xs"><SfIconAddShoppingCart size="sm" /> Add</SfButton>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-neutral-100">
                <td className="sticky left-0 z-10 bg-neutral-50 p-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:p-3">{row.label}</td>
                {products.map((p) => {
                  const val = row.get(p!);
                  const hot = highlight(row.label, val);
                  return (
                    <td key={p!.id} className={classNames("p-3 align-top", hot ? "bg-primary-50/40 font-medium text-neutral-900" : "text-neutral-700")}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-500">Highlighted cells show where the compared products differ.</p>
    </Container>
  );
}
