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

export default function CartPage() {
  const lines = useCartLines();
  const { updateQty, removeFromCart, clearCart, toggleWishlist, wishlist, subtotal } = useStore();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

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

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (code === "VOLT10") {
      setApplied(Math.round(subtotal * 0.1));
      setAppliedCode(code);
    } else if (code === "SAVE500") {
      setApplied(Math.min(500, subtotal));
      setAppliedCode(code);
    } else {
      setApplied(0);
      setAppliedCode("");
    }
  }

  function removeCoupon() {
    setApplied(0);
    setAppliedCode("");
    setCoupon("");
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
          {lines.length > 0 && (
            <div className="flex items-center gap-1">
              <SfButton as={Link} href="/" variant="tertiary" size="sm" className="!px-2.5 text-xs">Continue shopping</SfButton>
              <SfButton variant="tertiary" size="sm" className="!px-2.5 text-xs !text-negative-600 hover:!bg-negative-50" onClick={clearCart}>
                <SfIconDelete size="xs" /> Clear cart
              </SfButton>
            </div>
          )}
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
                    <div key={item.id + (item.variant ?? "")} className="rounded-xl border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-md sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <Link href={`/product/${product.id}`} className="shrink-0">
                          <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="h-24 w-24" rounded="rounded-lg" />
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</p>
                              <Link href={`/product/${product.id}`} className="line-clamp-2 text-sm font-semibold text-neutral-900 transition-colors hover:text-primary-700 sm:text-base">{product.name}</Link>
                              {item.variant && <span className="mt-1 inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">{item.variant}</span>}
                            </div>
                            <button type="button" aria-label="Remove item" onClick={() => removeFromCart(product.id)} className="shrink-0 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-negative-50 hover:text-negative-600">
                              <SfIconDelete size="sm" />
                            </button>
                          </div>

                          <p className={classNames("mt-1 inline-flex items-center gap-1.5 text-xs font-medium", !product.inStock ? "text-negative-600" : lowStock ? "text-warning-700" : "text-positive-700")}>
                            <span className={`h-1.5 w-1.5 rounded-full ${!product.inStock ? "bg-negative-500" : lowStock ? "bg-warning-500" : "bg-positive-500"}`} />
                            {!product.inStock ? "Out of stock" : lowStock ? `Only ${product.stockCount} left` : "In stock"}
                          </p>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                            <div className="flex items-center gap-3">
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
                              <p className="text-base font-bold text-neutral-900">{formatPrice(lineTotal)}</p>
                              <p className="text-[11px] text-neutral-400">{formatPrice(product.price)} each</p>
                              {saved > 0 && <p className="text-[11px] font-semibold text-positive-700">Save {formatPrice(saved)}</p>}
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
                <div className="sticky top-32 rounded-xl border border-neutral-200 bg-white p-4">
                  <h2 className="text-base font-bold text-neutral-900">Order Summary</h2>

                  {/* Coupon */}
                  {appliedCode && applied > 0 ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-positive-200 bg-positive-50 px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-positive-800">
                        <SfIconPercent size="xs" /> {appliedCode} applied — you save {formatPrice(applied)}
                      </span>
                      <button type="button" onClick={removeCoupon} className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-negative-600 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-1.5">
                      <SfInput value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon: VOLT10 / SAVE500" aria-label="Coupon code" className="!rounded-lg" />
                      <SfButton variant="secondary" size="sm" className="!rounded-lg !px-3 text-xs" onClick={applyCoupon}>Apply</SfButton>
                    </div>
                  )}

                  <dl className="mt-4 space-y-2 text-sm">
                    <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? "items" : "items"})`} value={formatPrice(subtotal)} />
                    {discount > 0 && <Row label={`Discount (${appliedCode})`} value={`− ${formatPrice(discount)}`} tone="positive" />}
                    <Row label="Delivery" value={delivery === 0 ? "Free" : formatPrice(delivery)} tone={delivery === 0 ? "positive" : undefined} />
                    <Row label="VAT (5%)" value={formatPrice(tax)} />
                    <div className="my-2 border-t border-dashed border-neutral-200" />
                    <div className="flex items-center justify-between text-base font-bold text-neutral-900">
                      <dt>Total</dt>
                      <dd>{formatPrice(total)}</dd>
                    </div>
                    {totalSavings > 0 && (
                      <p className="rounded-lg bg-positive-50 px-3 py-1.5 text-center text-xs font-semibold text-positive-800">
                        You&apos;re saving {formatPrice(totalSavings + discount)} on this order 🎉
                      </p>
                    )}
                  </dl>

                  <SfButton size="lg" className="mt-4 w-full font-semibold" onClick={() => router.push("/checkout")}>
                    <SfIconLock size="sm" /> Proceed to Checkout <SfIconChevronRight size="xs" />
                  </SfButton>
                  <p className="mt-2 text-center text-[11px] text-neutral-400">bKash · Nagad · Rocket · Visa · Mastercard</p>

                  <div className="mt-4 space-y-2 border-t border-neutral-100 pt-3.5 text-xs text-neutral-500">
                    <p className="flex items-center gap-2"><SfIconCheck size="xs" className="shrink-0 text-positive-600" /> Official warranty on every product</p>
                    <p className="flex items-center gap-2"><SfIconSafetyCheck size="xs" className="shrink-0 text-positive-600" /> 100% authentic, sealed items</p>
                    <p className="flex items-center gap-2"><SfIconLocalShipping size="xs" className="shrink-0 text-positive-600" /> Fast 24–72h nationwide delivery</p>
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

function Row({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className={classNames("font-medium", tone === "positive" ? "text-positive-700" : "text-neutral-900")}>{value}</dd>
    </div>
  );
}
