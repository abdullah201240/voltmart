"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  SfButton,
  SfRating,
  SfChip,
  SfIconFavorite,
  SfIconFavoriteFilled,
  SfIconCompareArrows,
  SfIconAddShoppingCart,
  SfIconCheck,
  SfIconLocalShipping,
  SfIconSafetyCheck,
  SfIconPublishedWithChanges,
} from "@storefront-ui/react";
import { PRODUCTS, getProduct, CATEGORY_NAMES } from "@/lib/data";
import { classNames, discountPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard, QuantitySelector } from "@/components/ProductCard";
import { Breadcrumbs, Container, EmptyState } from "@/components/ui";

const TABS = ["Overview", "Specifications", "Features", "Reviews", "Warranty", "Shipping"];
const COLORS = ["Graphite", "Silver", "Ocean Blue"];

export default function ProductPage() {
  const { id = "" } = useParams<{ id: string }>();
  const router = useRouter();
  const product = getProduct(id);
  const { addToCart, toggleWishlist, toggleCompare, wishlist, compare, pushRecent, recent } = useStore();

  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const [tab, setTab] = useState(0);
  // Hover magnifier on the main gallery image (desktop pointer)
  const [isZoom, setIsZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  useEffect(() => {
    if (product) {
      pushRecent(product.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(0);
      setQty(1);
      window.scrollTo({ top: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const related = useMemo(
    () => (product ? PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product],
  );
  const viewed = useMemo(
    () => (product ? recent.map(getProduct).filter((p) => p && p.id !== product.id).slice(0, 4) : []),
    [recent, product],
  );

  if (!product) {
    return (
      <Container className="py-16">
        <EmptyState title="Product not found" description="The product you're looking for is no longer available." actionLabel="Continue shopping" actionHref="/" />
      </Container>
    );
  }

  const disc = discountPercent(product.price, product.oldPrice);
  const saved = wishlist.includes(product.id);
  const comparing = compare.includes(product.id);
  const gallery = [product, product, product, product]; // 4 angles (placeholder tiles)

  return (
    <Container className="py-4 pb-24 sm:py-5 lg:pb-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: CATEGORY_NAMES[product.category], href: `/category/${product.category}` }, { label: product.name }]} />

      <div className="mt-3 grid gap-5 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse items-start gap-3 sm:flex-row">
          <div className="flex gap-1.5 sm:flex-col">
            {gallery.map((_, i) => (
              <button key={i} type="button" onClick={() => setActive(i)} aria-label={`View ${i + 1}`} className={classNames("overflow-hidden rounded-md ring-2 transition", i === active ? "ring-primary-600" : "ring-transparent hover:ring-neutral-200")}>
                <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="h-14 w-14 sm:h-16 sm:w-16" rounded="rounded-none" />
              </button>
            ))}
          </div>
          {/* Main image — hover to magnify 2x */}
          <div
            className="group relative aspect-square w-full flex-1 overflow-hidden rounded-md border border-neutral-200"
            onMouseEnter={() => setIsZoom(true)}
            onMouseLeave={() => setIsZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <div
              className="h-full w-full transition-transform duration-150 ease-out"
              style={{ transform: isZoom ? "scale(2)" : "scale(1)", transformOrigin: origin }}
            >
              <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} sizes="(max-width: 640px) 100vw, 600px" className="h-full w-full" rounded="rounded-none" />
            </div>
            {disc && <span className="absolute left-2.5 top-2.5 rounded-sm bg-negative-600 px-2 py-0.5 text-[11px] font-bold text-white">-{disc}% OFF</span>}
            <span className="pointer-events-none absolute bottom-2 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary-900/80 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 sm:block">
              Hover to zoom
            </span>
          </div>
        </div>

        {/* Buy panel */}
        <div className="flex flex-col gap-3">
          <div>
            <Link href={`/brand/${product.brand.toLowerCase()}`} className="text-xs font-semibold uppercase tracking-wide text-primary-700 lg:text-sm">{product.brand}</Link>
            <h1 className="mt-0.5 font-headings text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">{product.name}</h1>
            <p className="mt-1 text-xs text-neutral-600 sm:text-sm lg:text-base">{product.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs lg:text-sm">
            <span className="inline-flex items-center gap-1"><SfRating size="xs" value={product.rating} max={5} /><span className="text-neutral-500">{product.rating} ({product.reviews.toLocaleString("en-IN")})</span></span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500">SKU: {product.id.toUpperCase()}</span>
            <span className={classNames("font-medium", product.inStock ? "text-positive-700" : "text-negative-700")}>{product.inStock ? "In stock" : "Out of stock"}</span>
          </div>

          <div className="rounded-md border border-neutral-200 bg-neutral-50/70 p-3 lg:p-4">
            <div className="flex items-end gap-2.5">
              <span className="text-2xl font-bold text-neutral-900 lg:text-3xl">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="pb-0.5 text-sm text-neutral-400 line-through lg:text-base">{formatPrice(product.oldPrice)}</span>}
              {disc && <span className="pb-0.5 text-xs font-semibold text-negative-600 lg:text-sm">Save {formatPrice(product.oldPrice! - product.price)}</span>}
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-500 lg:text-xs">Inclusive VAT where applicable · Official warranty included</p>
          </div>

          {/* Variants */}
          <div>
            <p className="mb-1.5 text-xs font-semibold text-neutral-900 lg:text-sm">Color: <span className="font-normal text-neutral-600">{COLORS[color]}</span></p>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c, i) => (
                <button key={c} type="button" onClick={() => setColor(i)} className={classNames("h-8 w-8 rounded-full ring-2 ring-offset-1 transition", i === color ? "ring-primary-600" : "ring-transparent hover:ring-neutral-300")} style={{ background: ["#2b2b2b", "#d7d9dd", "#2b4a72"][i] }} aria-label={c} />
              ))}
            </div>
          </div>

          {product.attrs.Storage && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-neutral-900 lg:text-sm">Storage</p>
              <div className="flex flex-wrap gap-1.5">
                {[product.attrs.Storage, ...Object.values(product.attrs).filter((v) => /GB|TB/.test(v) && v !== product.attrs.Storage)].slice(0, 4).map((s, i) => (
                  <SfChip key={s + i} size="sm" inputProps={{ type: "radio", checked: i === 0, readOnly: true }} className={classNames("!rounded-sm text-xs lg:text-sm", i === 0 ? "!border-primary-600" : "")}>{s}</SfChip>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <QuantitySelector value={qty} onChange={setQty} max={product.stockCount} />
            <SfButton size="sm" className="flex-1 !rounded-md !py-2 text-xs font-semibold lg:!py-2.5 lg:text-sm" disabled={!product.inStock} onClick={() => addToCart(product.id, qty, COLORS[color])}>
              <SfIconAddShoppingCart size="xs" /> Add to Cart
            </SfButton>
          </div>
          <SfButton size="sm" variant="secondary" className="w-full !rounded-md !py-2 text-xs font-semibold lg:!py-2.5 lg:text-sm" disabled={!product.inStock} onClick={() => { addToCart(product.id, qty, COLORS[color]); router.push("/checkout"); }}>
            Buy Now
          </SfButton>

          <div className="flex gap-2">
            <SfButton variant="tertiary" size="sm" className="flex-1 !rounded-md !border !border-neutral-200 text-xs lg:text-sm" onClick={() => toggleWishlist(product.id)}>
              {saved ? <SfIconFavoriteFilled size="xs" className="text-negative-600" /> : <SfIconFavorite size="xs" />} {saved ? "Saved" : "Wishlist"}
            </SfButton>
            <SfButton variant="tertiary" size="sm" className="flex-1 !rounded-md !border !border-neutral-200 text-xs lg:text-sm" onClick={() => toggleCompare(product.id)}>
              <SfIconCompareArrows size="xs" /> {comparing ? "Comparing" : "Compare"}
            </SfButton>
          </div>

          {/* Delivery reassurance */}
          <div className="grid grid-cols-1 gap-2 rounded-md border border-neutral-200 p-2.5 text-xs sm:grid-cols-3 lg:text-sm">
            <span className="flex items-center gap-1.5 text-neutral-700"><SfIconLocalShipping size="xs" className="text-primary-600" /> 24–72h Delivery</span>
            <span className="flex items-center gap-1.5 text-neutral-700"><SfIconSafetyCheck size="xs" className="text-primary-600" /> Official warranty</span>
            <span className="flex items-center gap-1.5 text-neutral-700"><SfIconPublishedWithChanges size="xs" className="text-primary-600" /> 7-day returns</span>
          </div>

          {/* Quick highlights */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(product.attrs).slice(0, 4).map(([k, v]) => (
              <SfChip key={k} size="sm" className="!rounded-xs text-[11px]">{k}: <span className="font-semibold">{v}</span></SfChip>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 sm:mt-10">
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t, i) => (
              <button key={t} type="button" onClick={() => setTab(i)} className={classNames("whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition sm:text-sm", i === tab ? "border-primary-600 text-primary-700" : "border-transparent text-neutral-500 hover:text-neutral-800")}>
                {t}
              </button>
            ))}
          </div>
          {/* right-edge fade hints that the strip scrolls on touch */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent lg:hidden" />
        </div>

        <div className="py-4">
          {tab === 0 && (
            <div className="max-w-3xl space-y-4 text-neutral-700">
              <h3 className="text-lg font-bold text-neutral-900">Overview</h3>
              <p>{product.tagline} The {product.name} from {product.brand} combines premium materials with everyday practicality. Every unit ships sealed with an official warranty and nationwide delivery.</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {Object.entries(product.attrs).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2 text-sm"><SfIconCheck size="sm" className="text-positive-600" /> <span className="text-neutral-500">{k}:</span> <span className="font-medium text-neutral-900">{v}</span></li>
                ))}
              </ul>
            </div>
          )}
          {tab === 1 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {product.specs.map((group) => (
                <div key={group.group}>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-900">{group.group}</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      {group.rows.map(([k, v]) => (
                        <tr key={k} className="border-b border-neutral-100">
                          <td className="py-2 pr-4 text-neutral-500">{k}</td>
                          <td className="py-2 font-medium text-neutral-900">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          {tab === 2 && (
            <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
              {Object.entries(product.attrs).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2.5 rounded-md border border-neutral-200/90 p-2.5">
                  <SfIconCheck className="text-primary-600" /> <div><p className="text-[11px] text-neutral-500">{k}</p><p className="text-xs sm:text-sm font-semibold">{v}</p></div>
                </div>
              ))}
            </div>
          )}
          {tab === 3 && (
            <div className="max-w-3xl space-y-3">
              {[5, 4, 5, 4].map((r, i) => (
                <div key={i} className="rounded-md border border-neutral-200/90 p-3 sm:p-3.5">
                  <div className="flex items-center justify-between"><span className="text-xs sm:text-sm font-semibold text-neutral-900">{["Areef", "Farhana", "Bappy", "Mou"][i]}</span><SfRating size="xs" value={r} max={5} /></div>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-600">{["Excellent product, exactly as described.", "Great value for the price.", "Fast delivery and sealed box.", "Works flawlessly, highly recommend."][i]}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-positive-700"><SfIconCheck size="xs" /> Verified Purchase</p>
                </div>
              ))}
            </div>
          )}
          {tab === 4 && (
            <div className="max-w-3xl space-y-2 text-sm text-neutral-700">
              <h4 className="text-base font-bold text-neutral-900">Warranty</h4>
              <p>This product includes an official brand warranty. Service is available through authorized centers nationwide. Keep your invoice for claim processing.</p>
            </div>
          )}
          {tab === 5 && (
            <div className="max-w-3xl space-y-2 text-sm text-neutral-700">
              <h4 className="text-base font-bold text-neutral-900">Shipping</h4>
              <p>Standard delivery within 24–72 hours nationwide. Free delivery on orders over ৳5,000. Cash on delivery and advance payment both supported.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {viewed.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {viewed.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* Sticky mobile purchase bar — rides above the compare tray when items are queued */}
      <div className={`fixed inset-x-0 z-30 flex items-center gap-3 border-t border-neutral-200 bg-white p-3 lg:hidden ${compare.length > 0 ? "bottom-[calc(4rem+76px)]" : "bottom-16"}`}>
        <div className="leading-tight">
          <p className="text-[11px] text-neutral-500">Total</p>
          <p className="text-lg font-bold text-neutral-900">{formatPrice(product.price * qty)}</p>
        </div>
        <SfButton className="min-w-0 flex-1 whitespace-nowrap" disabled={!product.inStock} onClick={() => addToCart(product.id, qty, COLORS[color])}>
          <SfIconAddShoppingCart size="sm" /> Add to Cart
        </SfButton>
      </div>
    </Container>
  );
}
