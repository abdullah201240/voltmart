"use client";

import Link from "next/link";
import {
  SfButton,
  SfRating,
  SfIconFavorite,
  SfIconFavoriteFilled,
  SfIconCompareArrows,
  SfIconAdd,
  SfIconRemove,
  SfIconCheck,
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
  const disc = discountPercent(product.price, product.oldPrice);
  const saved = wishlist.includes(product.id);
  const comparing = compare.includes(product.id);

  const media = (
    <Link href={`/product/${product.id}`} aria-label={product.name} className={classNames("relative block", layout === "grid" ? "aspect-square w-full" : "aspect-square w-full sm:w-40 sm:shrink-0")}>
      <ProductImage
        category={product.category}
        tone={product.tone}
        name={product.name}
        src={product.image}
        className="h-full w-full transition-transform duration-200 group-hover:scale-[1.02]"
        rounded={layout === "grid" ? "rounded-none" : "rounded-md"}
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
    </Link>
  );

  return (
    <>
      <div
        className={classNames(
          "group flex overflow-hidden rounded-md bg-white transition-colors duration-150",
          layout === "grid" ? "flex-col" : "flex-col gap-2.5 p-2.5 sm:flex-row sm:p-3",
        )}
      >
        {media}
        <div className={classNames("flex flex-1 flex-col gap-1", layout === "grid" ? "p-2" : "px-0")}>
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
    </>
  );
}
