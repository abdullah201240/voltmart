import { PRODUCTS } from "@/lib/data";
import { Container, SectionHeading, TrustSection } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import {
  HeroSlider,
  CategoryGrid,
  FlashDeals,
  ProductRail,
  BestSellers,
  PromoBanners,
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
      <HeroSlider />
      <CategoryGrid />
      <FlashDeals />
      <ProductRail title="Trending Right Now" subtitle="Popular across every category" products={trending} />
      <BestSellers />
      <PromoBanners />

      <Container className="py-4 sm:py-5">
        <SectionHeading title="Just Arrived" subtitle="Fresh drops, freshly stocked" href="/category/mobiles" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
          {newArrivals.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>

      <ProductRail title="Find Your Next Smartphone" subtitle="Apple · Samsung · Google · Xiaomi · OnePlus · Nothing" products={smartphones} />
      <ProductRail title="Find the Right Laptop" subtitle="Work · Gaming · Creator · Student · Business" products={laptops} />

      <GamingSection />

      <section className="border-y border-neutral-100 bg-neutral-50/50 py-4 sm:py-5">
        <Container>
          <SectionHeading title="Bring the Cinema Home" subtitle="Smart TVs, soundbars, speakers & projectors" href="/category/tv-audio" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
            {tv.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <BrandStrip />
      <Container className="py-3 sm:py-4"><TrustSection /></Container>
      <Newsletter />
    </>
  );
}
