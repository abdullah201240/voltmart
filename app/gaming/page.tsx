import Link from "next/link";
import { PRODUCTS } from "@/lib/data";
import { Container, TrustSection } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { SfButton, SfIconChevronRight } from "@storefront-ui/react";

const SUBCATS = ["Gaming Laptops", "Graphics Cards", "Monitors", "Keyboards", "Mouse", "Headsets", "Controllers", "Consoles", "Chairs"];

export default function GamingPage() {
  const gear = PRODUCTS.filter((p) => p.category === "gaming");
  const laptops = PRODUCTS.filter((p) => p.category === "laptops");
  const audio = PRODUCTS.filter((p) => p.id.includes("buds") || p.id.includes("wh-"));

  return (
    <>
      <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-br from-violet-50/70 via-white to-primary-50/60 py-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-100/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-100/50 blur-2xl" />
        <Container className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-800 ring-1 ring-primary-700/20">
            🎮 Level Up Arena
          </span>
          <h1 className="mt-2.5 font-headings text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Built for Serious Players
          </h1>
          <p className="mt-1.5 max-w-xl text-xs text-neutral-600 sm:text-sm">
            High-refresh 240Hz monitors, RTX 40-series powerhouse rigs, pro esports peripherals & consoles — engineered to win.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SfButton as={Link} href="#gear" size="sm" className="!rounded-md !px-3 !py-1.5 text-xs font-semibold">
              Shop Gaming Gear <SfIconChevronRight size="xs" />
            </SfButton>
            <SfButton as={Link} href="/category/laptops" variant="secondary" size="sm" className="!rounded-md !px-3 !py-1.5 text-xs font-semibold">
              View RTX Laptops
            </SfButton>
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 bg-white py-2.5">
        <Container className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUBCATS.map((s) => (
            <Link
              key={s}
              href="/category/gaming"
              className="shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
            >
              {s}
            </Link>
          ))}
        </Container>
      </section>

      <section id="gear" className="bg-neutral-50/60 py-6 sm:py-8">
        <Container>
          <div className="mb-3.5 flex items-end justify-between">
            <div>
              <h2 className="font-headings text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">Featured Battlestations & Rigs</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Official authentic consoles and high-FPS gaming laptops</p>
            </div>
            <SfButton as={Link} href="/category/gaming" variant="secondary" size="sm" className="hidden !rounded-md !px-2.5 !py-1 text-xs sm:inline-flex">
              View all gear
            </SfButton>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
            {[...gear, ...laptops.slice(0, 2)].map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mb-3.5 mt-8 flex items-end justify-between">
            <div>
              <h2 className="font-headings text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">Audio & Pro Esports Peripherals</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Ultra-low latency headsets, mice & accessories</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
            {audio.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-200 bg-white py-6 sm:py-8">
        <Container>
          <TrustSection />
        </Container>
      </section>
    </>
  );
}
