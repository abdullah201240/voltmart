import Link from "next/link";
import { PRODUCTS } from "@/lib/data";
import { Container, SectionHeading, TrustSection } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { SfButton, SfIconChevronRight } from "@storefront-ui/react";

const ZONES = [
  { name: "Smart Lighting", slug: "accessories", tone: "from-amber-100 to-yellow-100" },
  { name: "Security", slug: "cameras", tone: "from-slate-100 to-neutral-200" },
  { name: "Smart Speakers", slug: "tv-audio", tone: "from-emerald-100 to-teal-100" },
  { name: "Smart Displays", slug: "tv-audio", tone: "from-sky-100 to-blue-100" },
  { name: "Smart Plugs", slug: "accessories", tone: "from-lime-100 to-green-100" },
  { name: "Cameras", slug: "cameras", tone: "from-rose-100 to-pink-100" },
  { name: "Wearables", slug: "smart-devices", tone: "from-violet-100 to-fuchsia-100" },
  { name: "Appliances", slug: "home-appliances", tone: "from-cyan-100 to-sky-100" },
];

export default function SmartHomePage() {
  const picks = PRODUCTS.filter((p) => ["smart-devices", "tv-audio", "accessories", "cameras"].includes(p.category));
  return (
    <>
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-8 sm:py-10 text-white">
        <Container className="flex flex-col items-start gap-2.5 sm:gap-3">
          <span className="rounded-xs bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Smart Living</span>
          <h1 className="font-headings text-2xl font-bold sm:text-3xl lg:text-4xl">Upgrade Your Home</h1>
          <p className="max-w-xl text-xs sm:text-sm text-white/85">Automate lighting, security and entertainment with devices that just work together.</p>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <SectionHeading title="Shop by Room & Zone" subtitle="Everything for a connected home" />
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {ZONES.map((z) => (
            <Link key={z.name} href={`/category/${z.slug}`} className="group overflow-hidden rounded-md border border-neutral-200/90 bg-white transition-colors hover:border-primary-400">
              <ProductImage category={z.slug} tone={z.tone} name={z.name} className="aspect-[4/3] w-full" rounded="rounded-none" />
              <div className="flex items-center justify-between p-2.5">
                <span className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-primary-700">{z.name}</span>
                <SfIconChevronRight size="xs" className="text-neutral-400 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 sm:mt-10">
          <SectionHeading title="Popular Smart Devices" href="/category/smart-devices" />
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {picks.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <SfButton as={Link} href="/category/home-appliances" variant="secondary" size="sm" className="!rounded-md">Browse all home appliances <SfIconChevronRight size="sm" /></SfButton>
        </div>

        <div className="mt-8 sm:mt-10"><TrustSection /></div>
      </Container>
    </>
  );
}
