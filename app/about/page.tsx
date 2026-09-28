import Link from "next/link";
import { SfButton, SfIconSafetyCheck, SfIconLocalShipping, SfIconWarehouse, SfIconContactSupport, SfIconStarFilled, SfIconCheckCircle, SfIconChevronRight } from "@storefront-ui/react";
import { Container, SectionHeading, TrustSection, Stars } from "@/components/ui";
import { PRODUCTS, BRANDS } from "@/lib/data";

const STATS = [
  { label: "Happy customers", value: "250k+" },
  { label: "Products listed", value: "12k+" },
  { label: "Brand partners", value: `${BRANDS.length * 4}+` },
  { label: "Delivery cities", value: "64" },
];

const VALUES = [
  { icon: <SfIconCheckCircle />, title: "Authenticity first", note: "Every device is sourced from authorized distributors and ships sealed with an official warranty." },
  { icon: <SfIconLocalShipping />, title: "Fast & tracked", note: "Nationwide delivery in 24–72 hours with real-time tracking on every order." },
  { icon: <SfIconSafetyCheck />, title: "Buyer protection", note: "7-day hassle-free returns and secure card, bKash, Nagad & COD payments." },
  { icon: <SfIconContactSupport />, title: "Expert support", note: "A dedicated team of electronics specialists available 7 days a week." },
];

export default function AboutPage() {
  const brandsCount = BRANDS.length;
  return (
    <>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-8 sm:py-10 text-white">
        <Container className="grid items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div>
            <span className="inline-flex items-center gap-1 rounded-sm bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
              <SfIconWarehouse size="xs" /> Since 2016
            </span>
            <h1 className="mt-3 font-headings text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Powering Bangladesh&apos;s digital lifestyle
            </h1>
            <p className="mt-2.5 max-w-lg text-xs sm:text-sm text-white/85">
              VoltMart began with a single shop in Dhaka and one simple promise: genuine electronics
              at honest prices. Today we&apos;re the country&apos;s most trusted marketplace for phones,
              laptops, TVs, gaming and smart-home gear — backed by official warranty and next-day delivery.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <SfButton as={Link} href="/category/mobiles" size="sm" className="!rounded-md !bg-white !text-primary-800 hover:!bg-neutral-100">
                Shop the catalog <SfIconChevronRight size="sm" />
              </SfButton>
              <SfButton as={Link} href="/contact" variant="tertiary" size="sm" className="!rounded-md !text-white ring-1 ring-white/30 hover:!bg-white/10">
                Talk to us
              </SfButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-md bg-white/10 p-3.5 sm:p-4 backdrop-blur-sm ring-1 ring-white/15">
                <p className="font-headings text-xl sm:text-2xl font-bold">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/75">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <SectionHeading title="What we stand for" subtitle="The principles behind every order we ship." />
        <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="flex flex-col gap-2 rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700 [&>svg]:h-5 [&>svg]:w-5">{v.icon}</span>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">{v.title}</h3>
              <p className="text-xs sm:text-sm text-neutral-600">{v.note}</p>
            </div>
          ))}
        </div>
      </Container>

      <section className="border-y border-neutral-200/90 bg-neutral-50/70 py-6 sm:py-8">
        <Container>
          <SectionHeading title="Trusted by shoppers" subtitle={`${PRODUCTS.length.toLocaleString()}+ curated products from ${brandsCount} leading brands.`} />
          <div className="grid gap-2.5 sm:gap-3 lg:grid-cols-3">
            {[
              { name: "Nusrat Rahman", role: "Verified buyer", quote: "Ordered a laptop at night, received it next morning — sealed, with warranty card. Flawless." },
              { name: "Tanvir Ahmed", role: "Gamers club owner", quote: "VoltMart is my go-to for consoles and peripherals. Genuine stock and fair prices, every time." },
              { name: "Farhana Karim", role: "Small business", quote: "Their support team helped me pick the right monitors for our office. Real experts." },
            ].map((r) => (
              <figure key={r.name} className="flex flex-col gap-2 rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
                <Stars value={5} />
                <blockquote className="text-xs sm:text-sm text-neutral-700">&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="mt-auto pt-2 text-xs">
                  <span className="font-bold text-neutral-900">{r.name}</span>
                  <span className="block text-neutral-500">{r.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
            <SfIconStarFilled size="xs" className="text-warning-500" /> Rated 4.8 / 5 from 12,400+ reviews
          </div>
        </Container>
      </section>

      <Container className="py-6 sm:py-8">
        <TrustSection />
      </Container>
    </>
  );
}
