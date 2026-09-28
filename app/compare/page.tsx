"use client";

import Link from "next/link";
import {
  SfButton,
  SfRating,
  SfChip,
  SfIconClose,
  SfIconDelete,
  SfIconCompareArrows,
  SfIconAddShoppingCart,
  SfIconCheck,
  SfIconPercent,
} from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/data";
import { classNames, discountPercent, formatPrice } from "@/lib/format";
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

  const cheapestId = products.reduce((min, p) => (p!.price < min!.price ? p : min), products[0])!.id;
  const attrKeys = Array.from(new Set(products.flatMap((p) => Object.keys(p!.attrs))));

  const rows: { label: string; get: (p: NonNullable<(typeof products)[number]>) => string; hot?: (p: NonNullable<(typeof products)[number]>) => boolean }[] = [
    {
      label: "Price",
      get: (p) => formatPrice(p.price),
      hot: (p) => p.id === cheapestId,
    },
    { label: "Brand", get: (p) => p.brand },
    {
      label: "Rating",
      get: (p) => `${p.rating} / 5 (${p.reviews.toLocaleString("en-IN")} reviews)`,
    },
    { label: "Availability", get: (p) => (p.inStock ? "In stock" : "Out of stock") },
    ...attrKeys.map((k) => ({
      label: k,
      get: (p: NonNullable<(typeof products)[number]>) => p.attrs[k] ?? "—",
    })),
  ];

  function isDifferent(rowLabel: string, value: string) {
    if (value === "—") return false;
    const distinct = new Set(products.map((p) => rows.find((r) => r.label === rowLabel)!.get(p!)));
    return distinct.size > 1;
  }

  function clearAll() {
    compare.forEach((id) => toggleCompare(id));
  }

  return (
    <Container className="py-5 sm:py-6">
      {/* Page header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-100 text-primary-700">
            <SfIconCompareArrows size="sm" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Compare Products</h1>
            <p className="text-xs text-neutral-500">
              {products.length} {products.length === 1 ? "product" : "products"} side by side · up to 4
            </p>
          </div>
        </div>
        <SfButton variant="tertiary" size="sm" className="!text-negative-600 hover:!bg-negative-50" onClick={clearAll}>
          <SfIconDelete size="sm" />
          Clear all
        </SfButton>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <div
            className="grid min-w-max"
            style={{ gridTemplateColumns: `140px repeat(${products.length}, minmax(200px, 1fr))` }}
          >
            {/* ---- Product header row ---- */}
            <div className="sticky left-0 z-20 border-b border-neutral-100 bg-neutral-50" />
            {products.map((p) => {
              const disc = discountPercent(p!.price, p!.oldPrice);
              return (
                <div key={p!.id} className="relative flex flex-col gap-2 border-b border-l border-neutral-100 p-3 sm:p-4">
                  <button
                    type="button"
                    aria-label={`Remove ${p!.name} from comparison`}
                    onClick={() => toggleCompare(p!.id)}
                    className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200 transition hover:text-negative-600 hover:ring-negative-200"
                  >
                    <SfIconClose size="xs" />
                  </button>

                  {p!.id === cheapestId && (
                    <span className="absolute left-3 top-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                      <SfIconPercent size="xs" />
                      Best price
                    </span>
                  )}

                  <Link href={`/product/${p!.id}`} aria-label={p!.name} className="group/media relative mt-4 block aspect-square w-full overflow-hidden rounded-xl bg-neutral-50">
                    <ProductImage
                      category={p!.category}
                      tone={p!.tone}
                      name={p!.name}
                      src={p!.image}
                      className="h-full w-full transition-transform duration-200 group-hover/media:scale-[1.03]"
                      rounded="rounded-none"
                    />
                  </Link>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{p!.brand}</span>
                    <Link href={`/product/${p!.id}`} className="block leading-snug">
                      <h2 className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700">{p!.name}</h2>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <SfRating size="xs" value={p!.rating} max={5} />
                    <span className="text-[11px] text-neutral-500">{p!.rating}</span>
                  </div>

                  <div className="flex items-end gap-1.5">
                    <span className="text-base font-bold text-neutral-900">{formatPrice(p!.price)}</span>
                    {disc && <span className="text-[11px] text-neutral-400 line-through">{formatPrice(p!.oldPrice!)}</span>}
                  </div>

                  <SfButton
                    size="sm"
                    className="!rounded-md w-full whitespace-nowrap"
                    disabled={!p!.inStock}
                    onClick={() => addToCart(p!.id)}
                  >
                    <SfIconAddShoppingCart size="sm" />
                    Add to Cart
                  </SfButton>
                </div>
              );
            })}

            {/* ---- Attribute rows ---- */}
            {rows.map((row, rowIdx) => (
              <div key={row.label} className="contents">
                <div
                  className={classNames(
                    "sticky left-0 z-20 flex items-center border-b border-neutral-100 px-3 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 sm:px-4",
                    rowIdx % 2 === 0 ? "bg-neutral-50" : "bg-white",
                  )}
                >
                  {row.label}
                </div>
                {products.map((p) => {
                  const val = row.get(p!);
                  const hot = row.hot ? row.hot(p!) : false;
                  const diff = isDifferent(row.label, val);
                  const stockRow = row.label === "Availability";
                  return (
                    <div
                      key={p!.id}
                      className={classNames(
                        "flex items-center border-b border-l border-neutral-100 px-3 py-3 text-xs sm:px-4 sm:text-sm",
                        rowIdx % 2 === 0 ? "bg-neutral-50/60" : "bg-white",
                        hot && "bg-primary-50/70",
                      )}
                    >
                      {stockRow ? (
                        p!.inStock ? (
                          <span className="inline-flex items-center gap-1 font-medium text-positive-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-positive-600" />
                            In stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-neutral-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-negative-600" />
                            Out of stock
                          </span>
                        )
                      ) : (
                        <span
                          className={classNames(
                            diff ? "font-medium text-neutral-900" : "text-neutral-600",
                            hot && "font-bold text-primary-700",
                          )}
                        >
                          {val}
                          {row.label === "Price" && p!.id === cheapestId && (
                            <SfIconCheck size="xs" className="ml-1 inline text-primary-600" />
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <SfChip size="sm" square className="!border-0 !bg-primary-600 !px-1.5 !py-0 !text-[10px] !font-bold !text-white">
            BEST
          </SfChip>
          Lowest price among the compared products
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-primary-50 ring-1 ring-primary-200" />
          Row highlight marks the best-value cell
        </span>
        <span>Different values are shown in bold so you can spot contrasts fast.</span>
      </div>
    </Container>
  );
}
