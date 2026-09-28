"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SfButton,
  SfIconChevronLeft,
  SfIconChevronRight,
  SfIconPercent,
} from "@storefront-ui/react";
import {
  PRODUCTS,
  CATEGORIES,
  BRANDS,
  BRAND_LOGOS,
  HERO_SLIDES,
  HERO_SIDE_PROMOS,
  PROMO_BANNERS,
  type Product,
} from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { Countdown } from "@/components/Countdown";
import { Container, SectionHeading, TrustSection } from "@/components/ui";

/* ------------------------------- Hero ------------------------------- */
export function HeroSlider() {
  const [i, setI] = useState(0);
  const n = HERO_SLIDES.length;
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n]);
  const happyHour = HERO_SIDE_PROMOS.happyHour;
  const proSound = HERO_SIDE_PROMOS.proSound;

  return (
    <Container className="py-2 sm:py-2.5">
      <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-3">
        {/* Left (2/3): large banner carousel */}
        <div className="relative h-[220px] overflow-hidden rounded-md bg-neutral-100 sm:h-[280px] lg:col-span-2 lg:h-[320px]">
          {HERO_SLIDES.map((s, idx) => (
            <div
              key={s.poster}
              aria-hidden={idx !== i}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Image src={s.poster} alt={s.title} fill priority={idx === 0} sizes="(max-width: 1023px) 100vw, 66vw" className="object-cover" />
              {/* Brand tint: pulls the poster lighting toward the VoltMart primary hue */}
              <div className="absolute inset-0 bg-primary-500/25 mix-blend-color" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-900/35 to-transparent" />
              <div className="relative z-10 flex h-full items-center">
                <div className="max-w-sm p-3.5 text-white sm:p-5">
                  <p className="mb-1.5 inline-flex items-center gap-1 rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-white/20 lg:text-xs">
                    <SfIconPercent size="xs" /> {s.eyebrow}
                  </p>
                  <h1 className="font-headings text-lg font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl">{s.title}</h1>
                  <p className="mt-0.5 font-headings text-xl font-extrabold leading-none text-primary-300 drop-shadow-sm sm:text-3xl lg:text-4xl">{s.offer}</p>
                  <p className="mt-1 hidden text-xs text-neutral-200 sm:block lg:text-sm">{s.subtitle}</p>
                  <SfButton as={Link} href={s.href} size="sm" className="mt-2.5 !rounded-md !bg-white !px-3 !py-1 text-xs font-semibold !text-neutral-900 hover:!bg-neutral-100 lg:!px-4 lg:!py-1.5 lg:text-sm">
                    {s.cta} <SfIconChevronRight size="xs" />
                  </SfButton>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.poster}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className="group/dot flex h-6 items-center px-1"
              >
                <span className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-primary-500" : "w-1.5 bg-white/60 group-hover/dot:bg-white"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right (1/3): two stacked promo cards */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-rows-2">
          <Link href={happyHour.href} className="group relative block h-28 overflow-hidden rounded-md border border-neutral-200/90 bg-primary-50 sm:h-32 lg:h-auto">
            <Image src={happyHour.image} alt="Happy Hour" fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover object-left transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary-500/20 mix-blend-color" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary-50/70" />
            <div className="relative z-10 flex h-full flex-col items-end justify-center gap-0.5 p-3 text-right sm:p-4">
              <span className="font-headings text-base font-extrabold uppercase leading-none tracking-tight text-primary-700 sm:text-lg lg:text-xl">Happy Hour</span>
              <span className="text-xs font-bold leading-tight text-neutral-900 sm:text-sm lg:text-base">{happyHour.title}</span>
              <span className="text-[10px] font-semibold text-neutral-600 lg:text-xs">{happyHour.time}</span>
            </div>
          </Link>
          <Link href={proSound.href} className="group relative block h-28 overflow-hidden rounded-md border border-neutral-200/90 bg-gradient-to-br from-emerald-50 via-white to-primary-50 sm:h-32 lg:h-auto">
            <Image src={proSound.image} alt="Pro Sound" fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover object-left transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-white/95" />
            <div className="relative z-10 flex h-full flex-col items-end justify-center gap-0.5 p-3 text-right sm:p-4">
              <span className="font-headings text-sm font-bold leading-tight text-neutral-900 sm:text-base lg:text-lg">{proSound.title}</span>
              <span className="text-xs font-extrabold leading-none text-primary-700 sm:text-base lg:text-lg">{proSound.price}</span>
              <span className="mt-1 rounded-sm bg-primary-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white transition group-hover:bg-primary-800 lg:text-xs">Buy Now</span>
              <span className="text-[9px] font-medium text-neutral-600 lg:text-[11px]">{proSound.product}</span>
            </div>
          </Link>
        </div>
      </div>
    </Container>
  );
}

/* --------------------------- Categories ----------------------------- */
export function CategoryGrid() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeading title="Shop by Category" subtitle="Explore our full range of electronics" href="/category/mobiles" linkLabel="Browse all" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-2.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group flex flex-col rounded-md border border-neutral-200/90 bg-white p-2 transition-colors duration-150 hover:border-primary-400 sm:p-2.5"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-neutral-50">
              <ProductImage
                category={c.slug}
                tone={c.tone}
                name={c.name}
                src={c.image}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                rounded="rounded-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-semibold text-neutral-900 group-hover:text-primary-700 sm:text-sm lg:text-[15px]">
                  {c.name}
                </h3>
                <p className="text-[10px] text-neutral-500 lg:text-xs">{c.count} products</p>
              </div>
              <span className="text-neutral-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary-600">
                <SfIconChevronRight size="xs" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}

/* --------------------------- Flash Deals ---------------------------- */
function StockBar({ product }: { product: Product }) {
  const pct = product.stockCount ? Math.max(8, Math.min(100, (product.stockCount / 20) * 100)) : 60;
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-negative-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] font-medium text-negative-700 lg:text-xs">
        {product.stockCount ? `Only ${product.stockCount} left — hurry!` : "Selling fast"}
      </p>
    </div>
  );
}

export function FlashDeals() {
  const deals = PRODUCTS.filter((p) => p.oldPrice).slice(0, 5);
  return (
    <Container className="py-4 sm:py-5">
      <div className="rounded-md border border-neutral-200/90 bg-white p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-neutral-900 sm:text-xl lg:text-2xl">
              <span className="text-negative-600">⚡</span> Flash Deals
            </h2>
            <span className="text-xs text-neutral-500 lg:text-sm">Ends in</span>
            <Countdown />
          </div>
          <SfButton as={Link} href="/deals" variant="secondary" size="sm" className="!rounded-md !px-2.5 !py-1 text-xs lg:!px-3 lg:!py-1.5 lg:text-sm">View all deals</SfButton>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-2.5">
          {deals.map((p, idx) => (
            <div key={p.id}>
              <ProductCard product={p} />
              {idx < 3 && <StockBar product={p} />}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

/* --------------------------- Product Rail --------------------------- */
export function ProductRail({ title, subtitle, products }: { title: string; subtitle?: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <Container className="py-4 sm:py-5">
      <div className="mb-2.5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl lg:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-neutral-500 lg:text-sm">{subtitle}</p>}
        </div>
        <div className="hidden gap-1 sm:flex">
          <SfButton variant="secondary" square aria-label="Scroll left" className="!rounded-md p-1" onClick={() => scroll(-1)}><SfIconChevronLeft size="xs" /></SfButton>
          <SfButton variant="secondary" square aria-label="Scroll right" className="!rounded-md p-1" onClick={() => scroll(1)}><SfIconChevronRight size="xs" /></SfButton>
        </div>
      </div>
      <div ref={ref} className="flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2.5">
        {products.map((p) => (
          <div key={p.id} className="w-[68%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[22.5%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </Container>
  );
}

/* --------------------------- Tabbed Best Sellers -------------------- */
const TABS = [
  { label: "All", cat: "" },
  { label: "Smartphones", cat: "mobiles" },
  { label: "Laptops", cat: "laptops" },
  { label: "Gaming", cat: "gaming" },
  { label: "Audio", cat: "tv-audio" },
];

export function BestSellers() {
  const [tab, setTab] = useState(0);
  const pool = PRODUCTS.filter((p) => p.isBestSeller);
  const shown = (tab === 0 ? pool : pool.filter((p) => p.category === TABS[tab].cat)).slice(0, 8);
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeading title="Best Sellers" subtitle="The products everyone is grabbing this week" />
      <div className="mb-3 flex flex-wrap gap-1">
        {TABS.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setTab(idx)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors lg:px-3 lg:py-1.5 lg:text-sm ${idx === tab ? "bg-primary-700 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
        {shown.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </Container>
  );
}

/* --------------------------- Promotional Poster Banners (for section gaps) -------------------------- */
export function PosterBanner({
  image,
  alt,
  href,
}: {
  image: string;
  alt: string;
  href: string;
}) {
  return (
    <Container className="py-2.5 sm:py-3.5">
      <Link
        href={href}
        aria-label={alt}
        className="group relative block w-full overflow-hidden rounded-md border border-neutral-200/90 bg-white transition-colors duration-150 hover:border-primary-400"
      >
        <div className="relative h-28 w-full sm:h-36 md:h-44 lg:h-52 xl:h-56">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-center transition-transform duration-200 ease-out group-hover:scale-[1.008]"
          />
        </div>
      </Link>
    </Container>
  );
}

export function DualPosterBanners({
  banners,
}: {
  banners: { image: string; alt: string; href: string }[];
}) {
  return (
    <Container className="py-2.5 sm:py-3.5">
      <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-2">
        {banners.map((b) => (
          <Link
            key={b.image}
            href={b.href}
            aria-label={b.alt}
            className="group relative block w-full overflow-hidden rounded-md border border-neutral-200/90 bg-white transition-colors duration-150 hover:border-primary-400"
          >
            <div className="relative h-28 w-full sm:h-36 md:h-40 lg:h-44 xl:h-48">
              <Image
                src={b.image}
                alt={b.alt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-200 ease-out group-hover:scale-[1.01]"
              />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}

export function PromoBanners() {
  return (
    <DualPosterBanners
      banners={[
        { image: "/promos/promo-gaming.jpg", alt: "Ultimate Gaming", href: "/gaming" },
        { image: "/promos/promo-work.jpg", alt: "Work From Anywhere", href: "/category/laptops" },
      ]}
    />
  );
}

/* --------------------------- Brands --------------------------------- */
function BrandTile({ b }: { b: string }) {
  const [failed, setFailed] = useState(false);
  const logo = BRAND_LOGOS[b];
  return (
    <Link
      href={`/brand/${b.toLowerCase()}`}
      title={`${b} official store`}
      className="group flex h-20 sm:h-22 flex-col items-center justify-center gap-1.5 rounded-md border border-neutral-200/90 bg-white px-2.5 transition-colors duration-150 hover:border-primary-400"
    >
      {logo && !failed ? (
        // SVGs are tiny static files — skip the image optimizer entirely.
        <Image
          src={logo}
          alt={`${b} logo`}
          width={100}
          height={40}
          unoptimized
          sizes="100px"
          className="h-8 w-auto max-w-[90px] object-contain transition duration-200 group-hover:scale-105 sm:h-9"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-sm font-bold text-neutral-600 transition-colors group-hover:text-primary-700 sm:text-base">{b}</span>
      )}
      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 transition-colors group-hover:text-primary-700 sm:text-xs">{b}</span>
    </Link>
  );
}

export function BrandStrip() {
  return (
    <Container className="py-4 sm:py-5">
      <SectionHeading title="Shop by Brand" subtitle="Official stores from the world's leading brands" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 sm:gap-2.5">
        {BRANDS.map((b) => (
          <BrandTile key={b} b={b} />
        ))}
      </div>
    </Container>
  );
}

/* --------------------------- Gaming Section -------------------------- */
const GAMING_FILTERS = [
  { id: "all", label: "All Gear (5)" },
  { id: "laptops", label: "RTX Laptops (2)" },
  { id: "consoles", label: "Consoles (1)" },
  { id: "monitors", label: "4K Displays (1)" },
  { id: "peripherals", label: "Pro Esports (1)" },
];

export function GamingSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const allGaming = PRODUCTS.filter((p) => p.category === "gaming");

  const filteredItems = allGaming.filter((p) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "laptops") return p.id.includes("strix") || p.id.includes("predator");
    if (activeFilter === "consoles") return p.id.includes("ps5");
    if (activeFilter === "monitors") return p.id.includes("monitor");
    if (activeFilter === "peripherals") return p.id.includes("logitech");
    return true;
  });

  return (
    <Container className="py-4 sm:py-5">
      <div className="rounded-md border border-neutral-200/90 bg-white p-3 sm:p-4">
        <div>
          {/* Clean header: title + filter pills only */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-headings text-lg font-bold tracking-tight text-neutral-900 sm:text-xl lg:text-2xl">
              Built for Serious Players
            </h2>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {GAMING_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors lg:px-3 lg:py-1.5 lg:text-sm ${
                    activeFilter === f.id
                      ? "bg-primary-700 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-2.5">
            {filteredItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-3 flex justify-center sm:hidden">
            <SfButton as={Link} href="/gaming" className="w-full !rounded-md">
              Explore Gaming Hub <SfIconChevronRight size="xs" />
            </SfButton>
          </div>
        </div>
      </div>
    </Container>
  );
}

/* --------------------------- Newsletter ----------------------------- */
export function Newsletter() {
  return (
    <Container className="py-4 sm:py-5">
      <div className="relative overflow-hidden rounded-md border border-neutral-200/90">
        {/* Background Image */}
        <Image
          src="/newsletter-bg.jpg"
          alt="Stay Ahead of Technology"
          fill
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover object-center"
          priority
        />

        {/* Soft glass gradient overlay for readability & contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60 sm:from-white/95 sm:via-white/85 sm:to-white/40" />

        <div className="relative z-10 mx-auto max-w-xl px-4 py-8 text-center sm:px-6 sm:py-10">
          <h2 className="font-headings text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
            Stay Ahead of Technology
          </h2>
          <p className="mt-2 text-sm text-neutral-600 lg:text-base">
            Join over 45,000+ tech enthusiasts in Bangladesh. Get exclusive drops, secret discount codes &amp; instant alerts before stock runs out.
          </p>
        </div>
      </div>
    </Container>
  );
}

export { TrustSection };
