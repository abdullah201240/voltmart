"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SfButton,
  SfInput,
  SfIconDelete,
  SfIconCheck,
  SfIconLocalShipping,
  SfIconSafetyCheck,
  SfIconLock,
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconPercent,
  SfIconSell,
  SfIconChevronRight,
} from "@storefront-ui/react";
import { useCartLines, useStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/data";
import { classNames, formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { QuantitySelector } from "@/components/ProductCard";
import { Container, EmptyState } from "@/components/ui";
import { ProductRail } from "@/components/home/sections";

const FREE_DELIVERY_THRESHOLD = 5000;
const DELIVERY_FEE = 120;

// Working demo coupons — clicking a chip in the summary applies them instantly.
const COUPONS = [
  { code: "VOLT10", label: "10% off", calc: (s: number) => Math.round(s * 0.1) },
  { code: "SAVE500", label: "৳500 off", calc: (s: number) => Math.min(500, s) },
];

export default function CartPage() {
  const lines = useCartLines();
  const { updateQty, removeFromCart, toggleWishlist, wishlist, subtotal } = useStore();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const itemCount = lines.reduce((n, { item }) => n + item.qty, 0);
  const discount = applied;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + delivery + tax);
  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const totalSavings = lines.reduce((s, { product, item }) => (product.oldPrice ? s + (product.oldPrice - product.price) * item.qty : s), 0);

  const suggestions = useMemo(
    () => PRODUCTS.filter((p) => p.isTrending && !lines.some(({ item }) => item.id === p.id)).slice(0, 8),
    [lines],
  );

  function applyCoupon(codeArg?: string) {
    const code = (codeArg ?? coupon).trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code);
    if (found && subtotal > 0) {
      setApplied(found.calc(subtotal));
      setAppliedCode(found.code);
      setCoupon(found.code);
      setCouponError("");
    } else {
      setApplied(0);
      setAppliedCode("");
      setCouponError(code ? `"${code}" isn't a valid coupon code` : "Type a code or tap one below");
    }
  }

  function removeCoupon() {
    setApplied(0);
    setAppliedCode("");
    setCoupon("");
    setCouponError("");
  }

  return (
    <>
      <Container className="py-4 sm:py-5">
        {/* Page header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-neutral-900">
            <SfIconShoppingCart className="text-primary-600" />
            Shopping Cart
            <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-sm font-bold text-primary-800">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </h1>
        </div>

        {lines.length === 0 ? (
          <EmptyState
            icon={<SfIconShoppingCart />}
            title="No products in your cart yet"
            description="Looks like you haven't added anything. Explore our latest electronics and start filling up your cart."
            actionLabel="Start Shopping"
            actionHref="/"
          />
        ) : (
          <>
            {/* Free delivery progress */}
            <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-neutral-800">
                  {toFreeDelivery > 0 ? (
                    <>
                      <SfIconLocalShipping size="sm" className="text-primary-600" />
                      Add <span className="font-bold text-primary-700">{formatPrice(toFreeDelivery)}</span> more to unlock <span className="font-bold">FREE delivery</span>
                    </>
                  ) : (
                    <>
                      <SfIconCheck size="sm" className="text-positive-600" />
                      <span className="font-bold text-positive-700">You&apos;ve unlocked FREE delivery!</span>
                    </>
                  )}
                </p>
                <span className="hidden shrink-0 text-xs text-neutral-500 sm:block">{progress}% of {formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${toFreeDelivery > 0 ? "bg-gradient-to-r from-primary-400 to-primary-600" : "bg-positive-500"}`}
                  style={{ width: `${Math.max(4, progress)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Line items */}
              <div className="flex flex-col gap-3 lg:col-span-2">
                {lines.map(({ item, product, lineTotal }) => {
                  const saved = product.oldPrice ? (product.oldPrice - product.price) * item.qty : 0;
                  const lowStock = product.inStock && item.qty > (product.stockCount ?? 99);
                  return (
                    <div key={item.id + (item.variant ?? "")} className="rounded-md border border-neutral-200/90 bg-white p-3 sm:p-3.5 transition-colors hover:border-primary-400">
                      <div className="flex gap-3 sm:gap-4">
                        <Link href={`/product/${product.id}`} className="shrink-0">
                          <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="h-20 w-20 sm:h-24 sm:w-24" rounded="rounded-md" />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 lg:text-xs">{product.brand}</p>
                              <Link href={`/product/${product.id}`} className="line-clamp-2 text-xs sm:text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700 lg:text-[15px]">{product.name}</Link>
                              {item.variant && <span className="mt-1 inline-block rounded-xs bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">{item.variant}</span>}
                            </div>
                            <button type="button" aria-label="Remove item" onClick={() => removeFromCart(product.id)} className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-negative-50 hover:text-negative-600">
                              <SfIconDelete size="sm" />
                            </button>
                          </div>

                          <p className={classNames("mt-1 inline-flex items-center gap-1.5 text-xs font-medium", !product.inStock ? "text-negative-600" : lowStock ? "text-warning-700" : "text-positive-700")}>
                            <span className={`h-1.5 w-1.5 rounded-full ${!product.inStock ? "bg-negative-500" : lowStock ? "bg-warning-500" : "bg-positive-500"}`} />
                            {!product.inStock ? "Out of stock" : lowStock ? `Only ${product.stockCount} left` : "In stock"}
                          </p>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                            <div className="flex items-center gap-2.5">
                              <QuantitySelector value={item.qty} onChange={(n) => updateQty(product.id, n)} max={product.stockCount} />
                              <button
                                type="button"
                                onClick={() => { toggleWishlist(product.id); removeFromCart(product.id); }}
                                className={classNames("inline-flex items-center gap-1 text-xs font-medium transition-colors", wishlist.includes(product.id) ? "text-negative-600" : "text-neutral-500 hover:text-primary-700")}
                              >
                                <SfIconFavorite size="xs" /> {wishlist.includes(product.id) ? "Saved to wishlist" : "Save for later"}
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm sm:text-base font-bold text-neutral-900 lg:text-lg">{formatPrice(lineTotal)}</p>
                              <p className="text-[11px] text-neutral-400 lg:text-xs">{formatPrice(product.price)} each</p>
                              {saved > 0 && <p className="text-[11px] font-semibold text-positive-700 lg:text-xs">Save {formatPrice(saved)}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order summary */}
              <aside>
                <div className="sticky top-32 overflow-hidden rounded-md border border-neutral-200/90 bg-white">
                  {/* Brand header band */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-4 py-4 sm:px-5">
                    <div className="relative flex items-center justify-between">
                      <div>
                        <h2 className="flex items-center gap-1.5 font-headings text-base font-bold tracking-tight text-white lg:text-lg">
                          <SfIconShoppingCart size="sm" />
                          Order Summary
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-white/80">Review your total before checkout</p>
                      </div>
                      <span className="rounded-xs bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/30">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Coupon */}
                    {appliedCode && applied > 0 ? (
                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-positive-300 bg-positive-50 px-4 py-3">
                        <span className="flex items-center gap-3 text-xs text-positive-800">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-positive-600 text-white">
                            <SfIconPercent size="sm" />
                          </span>
                          <span className="leading-tight">
                            <span className="block font-bold">{appliedCode} applied</span>
                            <span className="block font-normal text-positive-700">You save {formatPrice(applied)}</span>
                          </span>
                        </span>
                        <button type="button" onClick={removeCoupon} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:bg-white hover:text-negative-600">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          <SfIconSell size="xs" className="text-primary-600" /> Have a coupon?
                        </label>
                        <div className="relative">
                          <SfInput
                            value={coupon}
                            onChange={(e) => {
                              setCoupon(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") applyCoupon();
                            }}
                            placeholder="Enter code"
                            aria-label="Coupon code"
                            className={classNames("!rounded-xl pr-[86px]", couponError && "!border-negative-400 ring-1 ring-negative-100")}
                          />
                          <SfButton size="sm" className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 !rounded-lg !px-4 text-xs font-bold" onClick={() => applyCoupon()}>
                            Apply
                          </SfButton>
                        </div>
                        {couponError ? (
                          <p className="mt-1.5 text-[11px] font-semibold text-negative-600">{couponError}</p>
                        ) : (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {COUPONS.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => applyCoupon(c.code)}
                                className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-neutral-50 py-1 pl-2.5 pr-3 text-[11px] font-bold text-neutral-600 transition-colors hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
                              >
                                <SfIconPercent size="xs" className="text-primary-600" />
                                {c.code}
                                <span className="font-medium text-neutral-400 transition-colors group-hover:text-primary-600">· {c.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="my-5 border-t border-dashed border-neutral-200" />

                    {/* Cost breakdown */}
                    <dl className="space-y-3.5 text-sm">
                      <Row label="Subtotal" value={formatPrice(subtotal)} hint={`${itemCount} ${itemCount === 1 ? "item" : "items"}`} />
                      {discount > 0 && <Row label="Discount" value={`− ${formatPrice(discount)}`} hint={appliedCode} tone="positive" />}
                      <Row label="Delivery" value={delivery === 0 ? "FREE" : formatPrice(delivery)} tone={delivery === 0 ? "positive" : undefined} />
                      <Row label="VAT (5%)" value={formatPrice(tax)} />
                    </dl>

                    {/* Total block */}
                    <div className="mt-4 flex items-center justify-between rounded-md bg-primary-50 px-3.5 py-3 ring-1 ring-primary-100">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Total Payable</p>
                        <p className="mt-0.5 text-[11px] font-medium text-neutral-500">Incl. VAT &amp; delivery</p>
                      </div>
                      <span className="font-headings text-xl sm:text-2xl font-extrabold leading-none text-primary-800">{formatPrice(total)}</span>
                    </div>

                    {totalSavings > 0 && (
                      <p className="mt-2.5 flex items-center justify-center gap-1.5 rounded-sm bg-positive-600 px-2.5 py-1 text-[11px] font-bold text-white">
                        <SfIconCheck size="xs" /> You&apos;re saving {formatPrice(totalSavings + discount)} on this order
                      </p>
                    )}

                    {/* CTA */}
                    <SfButton size="base" className="mt-4 w-full !rounded-md font-bold" onClick={() => router.push("/checkout")}>
                      <SfIconLock size="sm" /> Proceed to Checkout <SfIconChevronRight size="xs" />
                    </SfButton>

                    {/* Trust */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-[11px] font-medium text-neutral-500">
                      <p className="flex items-center gap-1.5"><SfIconLock size="xs" className="text-primary-600" /> Secure payment</p>
                      <p className="flex items-center gap-1.5"><SfIconSafetyCheck size="xs" className="text-primary-600" /> 100% authentic</p>
                      <p className="flex items-center gap-1.5"><SfIconLocalShipping size="xs" className="text-primary-600" /> 24–72h delivery</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </Container>

      {/* Cross-sell rail */}
      {lines.length > 0 && suggestions.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/60">
          <ProductRail title="You may also like" subtitle="Hand-picked trending gear" products={suggestions} />
        </div>
      )}
    </>
  );
}

function Row({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-baseline gap-1.5 text-neutral-500">
        {label}
        {hint && <span className="text-[10px] font-medium text-neutral-400">{hint}</span>}
      </dt>
      <dd className={classNames("font-semibold tabular-nums", tone === "positive" ? "text-positive-700" : "text-neutral-900")}>{value}</dd>
    </div>
  );
}
