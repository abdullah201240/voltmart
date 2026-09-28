"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SfButton,
  SfRating,
  SfModal,
  SfIconFavorite,
  SfIconFavoriteFilled,
  SfIconCompareArrows,
  SfIconVisibility,
  SfIconAdd,
  SfIconRemove,
  SfIconCheck,
  SfIconLocalShipping,
  SfIconSafetyCheck,
  SfIconAddShoppingCart,
  SfChip,
} from "@storefront-ui/react";
import { type Product } from "@/lib/data";
import { classNames, discountPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ProductImage } from "./ProductImage";

export function QuantitySelector({
  value,
  onChange,
  max,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  className?: string;
}) {
  return (
    <div className={classNames("inline-flex items-stretch rounded-md border border-neutral-200 overflow-hidden", className)}>
      <SfButton
        variant="tertiary"
        square
        className="!rounded-none px-3"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <SfIconRemove size="sm" />
      </SfButton>
      <span className="flex min-w-10 items-center justify-center px-2 text-sm font-semibold text-neutral-900">
        {value}
      </span>
      <SfButton
        variant="tertiary"
        square
        className="!rounded-none px-3"
        aria-label="Increase quantity"
        disabled={max ? value >= max : false}
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
      >
        <SfIconAdd size="sm" />
      </SfButton>
    </div>
  );
}

export function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  const { wishlist, toggleWishlist, compare, toggleCompare, addToCart } = useStore();
  const [quick, setQuick] = useState(false);
  const [qty, setQty] = useState(1);
  const disc = discountPercent(product.price, product.oldPrice);
  const saved = wishlist.includes(product.id);
  const comparing = compare.includes(product.id);

  const media = (
    <div className={classNames("relative", layout === "grid" ? "aspect-square" : "aspect-square w-full sm:w-40 sm:shrink-0")}>
      <ProductImage
        category={product.category}
        tone={product.tone}
        name={product.name}
        src={product.image}
        className="h-full w-full transition-transform duration-200 group-hover:scale-[1.02]"
        rounded="rounded-sm"
      />
      <div className="absolute left-1 top-1 flex flex-col items-start gap-1">
        {product.isNew && (
          <SfChip size="sm" square className="!rounded-xs !border-0 !bg-primary-700 !text-white !px-1.5 !py-0.5 !text-[10px] font-bold">
            NEW
          </SfChip>
        )}
        {disc && (
          <SfChip size="sm" square className="!rounded-xs !border-0 !bg-negative-600 !text-white !px-1.5 !py-0.5 !text-[10px] font-bold">
            -{disc}%
          </SfChip>
        )}
      </div>
      <div className="absolute right-1 top-1 flex flex-col gap-1 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
        <SfButton variant="tertiary" size="sm" square aria-label="Quick view" className="!rounded-md border border-neutral-200/90 bg-white/95 p-1 text-neutral-600 hover:text-neutral-900" onClick={() => setQuick(true)}>
          <SfIconVisibility size="xs" />
        </SfButton>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={classNames(
          "group flex rounded-md border border-neutral-200/90 bg-white transition-colors duration-150 hover:border-primary-400",
          layout === "grid" ? "flex-col p-2 sm:p-2.5" : "flex-col gap-2.5 p-2.5 sm:flex-row sm:p-3",
        )}
      >
        {media}
        <div className={classNames("flex flex-1 flex-col gap-1", layout === "grid" && "pt-1.5 px-0.5")}>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 lg:text-xs">{product.brand}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="Toggle wishlist"
                onClick={() => toggleWishlist(product.id)}
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-negative-600"
              >
                {saved ? <SfIconFavoriteFilled size="xs" className="text-negative-600" /> : <SfIconFavorite size="xs" />}
              </button>
              <button
                type="button"
                aria-label="Toggle compare"
                onClick={() => toggleCompare(product.id)}
                className={classNames("rounded-md p-1 transition-colors hover:bg-neutral-50", comparing ? "text-primary-600" : "text-neutral-400 hover:text-primary-600")}
              >
                <SfIconCompareArrows size="xs" />
              </button>
            </div>
          </div>

          <Link href={`/product/${product.id}`} className="leading-snug">
            <h3 className="line-clamp-2 text-xs font-semibold text-neutral-900 group-hover:text-primary-700 sm:text-sm lg:text-[15px] lg:leading-snug">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1">
            <SfRating size="xs" value={product.rating} max={5} />
            <span className="text-[11px] text-neutral-500 lg:text-xs">({product.reviews.toLocaleString("en-IN")})</span>
          </div>

          {layout === "list" && (
            <p className="line-clamp-2 text-xs text-neutral-600 lg:text-sm">{product.tagline}</p>
          )}

          <div className="mt-auto flex items-end justify-between pt-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-neutral-900 sm:text-base lg:text-lg">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-[11px] text-neutral-400 line-through lg:text-xs">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] lg:text-xs">
                {product.inStock ? (
                  product.stockCount && product.stockCount <= 5 ? (
                    <span className="font-medium text-negative-700">Only {product.stockCount} left</span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 font-medium text-positive-700">
                      <SfIconCheck size="xs" /> In stock
                    </span>
                  )
                ) : (
                  <span className="font-medium text-neutral-500">Out of stock</span>
                )}
              </p>
            </div>
            {layout === "list" && (
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 lg:text-xs">
                <SfChip size="sm" square slotPrefix={<SfIconSafetyCheck size="xs" />}>
                  Warranty
                </SfChip>
              </div>
            )}
          </div>

          <SfButton size="sm" className="mt-1.5 w-full !gap-1 whitespace-nowrap !rounded-md !px-2 !py-1 text-xs font-medium sm:!gap-1.5 lg:!px-3 lg:!py-1.5 lg:text-sm" disabled={!product.inStock} onClick={() => addToCart(product.id)}>
            <SfIconAddShoppingCart size="xs" />
            Add to Cart
          </SfButton>
        </div>
      </div>

      {/* Quick view modal */}
      <SfModal open={quick} onClose={() => setQuick(false)} className="max-w-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">{product.brand}</span>
            <SfButton variant="tertiary" square className="!rounded-full p-2" aria-label="Close" onClick={() => setQuick(false)}>
              <SfIconRemove size="sm" />
            </SfButton>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="aspect-square w-full" />
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-neutral-900">{product.name}</h3>
              <p className="text-sm text-neutral-600">{product.tagline}</p>
              <div className="flex items-center gap-1.5">
                <SfRating size="xs" value={product.rating} max={5} />
                <span className="text-xs text-neutral-500">({product.reviews.toLocaleString("en-IN")})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                {product.oldPrice && <span className="text-sm text-neutral-400 line-through">{formatPrice(product.oldPrice)}</span>}
              </div>
              <div className="flex gap-2 pt-1">
                {Object.entries(product.attrs).slice(0, 4).map(([k, v]) => (
                  <SfChip key={k} size="sm" square>{`${k}: ${v}`}</SfChip>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1"><SfIconLocalShipping size="sm" /> Fast delivery</span>
                <span className="inline-flex items-center gap-1"><SfIconSafetyCheck size="sm" /> Official warranty</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <QuantitySelector value={qty} onChange={setQty} />
                <SfButton className="flex-1" disabled={!product.inStock} onClick={() => { addToCart(product.id, qty); setQuick(false); }}>
                  Add to Cart
                </SfButton>
              </div>
              <Link href={`/product/${product.id}`} onClick={() => setQuick(false)} className="text-sm font-medium text-primary-700 underline">
                View full details
              </Link>
            </div>
          </div>
        </div>
      </SfModal>
    </>
  );
}
