import Link from "next/link";
import { PRODUCTS, BRANDS } from "@/lib/data";
import { Container, SectionHeading } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/ui";
import { SfButton, SfIconChevronRight, SfIconSafetyCheck } from "@storefront-ui/react";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brandName = BRANDS.find((b) => b.toLowerCase() === slug) ?? slug.charAt(0).toUpperCase() + slug.slice(1);
  const items = PRODUCTS.filter((p) => p.brand.toLowerCase() === slug);
  const showcase = items.length > 0 ? items : PRODUCTS.filter((p) => p.isTrending);
  const latest = showcase.filter((p) => p.isNew);
  const best = showcase.filter((p) => p.isBestSeller);
  const cats = Array.from(new Set(showcase.map((p) => p.category)));

  return (
    <>
      <section className="border-b border-neutral-200 bg-gradient-to-br from-primary-50/70 via-white to-emerald-50/60 py-6 sm:py-8 text-neutral-900">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/search" }, { label: brandName }]} />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-headings text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{brandName}</h1>
              <p className="mt-1 max-w-xl text-xs text-neutral-600 sm:text-sm">Official {brandName} store at VoltMart — authentic products, manufacturer warranty and expert support.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-primary-800 ring-1 ring-neutral-200">
              <SfIconSafetyCheck size="xs" className="text-positive-600" /> Authorized Partner
            </span>
          </div>
        </Container>
      </section>

      <Container className="py-4 sm:py-5">
        {cats.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <Link key={c} href={`/category/${c}`} className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:border-primary-500 hover:text-primary-700">
                {c} <SfIconChevronRight size="xs" className="inline" />
              </Link>
            ))}
          </div>
        )}

        <SectionHeading title={`Featured ${brandName} products`} subtitle={`${showcase.length} products available`} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
          {showcase.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {latest.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <SectionHeading title="Latest from the brand" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
              {latest.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {best.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <SectionHeading title={`${brandName} Best Sellers`} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
              {best.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 p-4 text-center">
          <h3 className="text-base font-bold">Need help choosing?</h3>
          <p className="mt-0.5 text-xs text-neutral-600">Our product experts can help you find the right {brandName} device.</p>
          <SfButton as={Link} href="/contact" variant="secondary" size="sm" className="mt-2.5 !rounded-md">Talk to an expert</SfButton>
        </div>
      </Container>
    </>
  );
}
