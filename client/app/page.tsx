import { PRODUCTS } from "@/lib/data";
import { Container, SectionHeading, TrustSection } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import {
  HeroSlider,
  CategoryGrid,
  FlashDeals,
  ProductRail,
  BestSellers,
  PosterBanner,
  DualPosterBanners,
  BrandStrip,
  GamingSection,
  Newsletter,
} from "@/components/home/sections";

export default function HomePage() {
  const trending = PRODUCTS.filter((p) => p.isTrending);
  const newArrivals = PRODUCTS.filter((p) => p.isNew);
  const smartphones = PRODUCTS.filter((p) => p.category === "mobiles");
  const laptops = PRODUCTS.filter((p) => p.category === "laptops");
  const tv = PRODUCTS.filter((p) => p.category === "tv-audio");

  return (
    <>
      {/* 1. Hero Carousel & Quick Promos */}
      <HeroSlider />

      {/* 2. Clean Light Category Cards */}
      <CategoryGrid />

      {/* 3. Limited-Time Flash Deals */}
      <FlashDeals />

      {/* GAP POSTER 1: Device Exchange / Upgrade Mega Banner */}
      <PosterBanner
        image="/promos/promo-exchange.jpg"
        alt="VoltMart Exchange Program — Upgrade & Save up to ৳25,000 with Instant Valuation"
        href="/deals"
      />

      {/* 4. Flagship Smartphones Rail */}
      <ProductRail
        title="Find Your Next Smartphone"
        subtitle="Apple · Samsung · Google · Xiaomi · OnePlus · Nothing"
        products={smartphones}
      />

      {/* GAP POSTERS 2: Dual Split Banners (Work Setup + Smart Living) */}
      <DualPosterBanners
        banners={[
          {
            image: "/promos/promo-work.jpg",
            alt: "Work From Anywhere — Pro Laptops, 4K Monitors & Desk Setups",
            href: "/category/laptops",
          },
          {
            image: "/promos/promo-smart.jpg",
            alt: "Smart Living — Smartwatches, Wearables & Connected Home Tech",
            href: "/smart-home",
          },
        ]}
      />

      {/* 5. Powerful Laptops Rail */}
      <ProductRail
        title="Find the Right Laptop"
        subtitle="Work · Creator · Gaming · Student · Business Portables"
        products={laptops}
      />

      {/* 6. Tabbed Best Sellers Grid */}
      <BestSellers />

      {/* GAP POSTER 3: Ultimate Gaming Banner */}
      <PosterBanner
        image="/promos/promo-gaming.jpg"
        alt="Ultimate Gaming Arena — Level Up with RTX Laptops, PS5 & Pro Esports Gear"
        href="/gaming"
      />

      {/* 7. Dedicated Gaming Hub Section */}
      <GamingSection />

      {/* 8. Trending Right Now Rail */}
      <ProductRail
        title="Trending Right Now"
        subtitle="Top picks gaining hype across Bangladesh this week"
        products={trending}
      />

      {/* GAP POSTER 4: Immersive Audio & Cinema Banner */}
      <PosterBanner
        image="/promos/promo-audio.jpg"
        alt="Immersive Studio Audio — ANC Headphones, Wireless Earbuds & Soundbars"
        href="/category/tv-audio"
      />

      {/* 9. Bring the Cinema Home (TV & Audio) */}
      <section className="border-y border-neutral-100 bg-neutral-50/50 py-4 sm:py-5">
        <Container>
          <SectionHeading
            title="Bring the Cinema Home"
            subtitle="Smart TVs, soundbars, theater audio & Bluetooth speakers"
            href="/category/tv-audio"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
            {tv.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* 10. Just Arrived Fresh Drops */}
      <Container className="py-4 sm:py-5">
        <SectionHeading
          title="Just Arrived"
          subtitle="Fresh drops, newly stocked authentic gear"
          href="/category/mobiles"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
          {newArrivals.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>

      {/* 11. Official Brand Stores */}
      <BrandStrip />

      {/* 12. Trust Badges & Guarantees */}
      <Container className="py-3 sm:py-4">
        <TrustSection />
      </Container>

      {/* 13. VIP Newsletter */}
      <Newsletter />
    </>
  );
}
