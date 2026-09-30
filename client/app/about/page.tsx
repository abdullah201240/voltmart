import Image from "next/image";
import Link from "next/link";
import {
  SfButton,
  SfIconSafetyCheck,
  SfIconLocalShipping,
  SfIconWarehouse,
  SfIconStarFilled,
  SfIconCheckCircle,
  SfIconChevronRight,
  SfIconPublishedWithChanges,
  SfIconLocationOn,
  SfIconCall,
} from "@storefront-ui/react";
import { Container, SectionHeading, TrustSection, Stars, Breadcrumbs } from "@/components/ui";
import { BRANDS } from "@/lib/data";

const STATS = [
  { label: "Happy Customers", value: "250K+", note: "Across 64 districts" },
  { label: "Official Warranty", value: "100%", note: "Brand backed guarantee" },
  { label: "Brand Partners", value: `${BRANDS.length * 4}+`, note: "Authorized distributors" },
  { label: "Fast Delivery", value: "24–72h", note: "Nationwide express tracking" },
];

const VALUES = [
  {
    icon: <SfIconCheckCircle />,
    title: "100% Genuine & Sealed",
    desc: "Every product is sourced strictly through authorized brand distributors in Bangladesh. No refurbished, grey-market, or counterfeit items.",
  },
  {
    icon: <SfIconSafetyCheck />,
    title: "Official Brand Warranty",
    desc: "Your purchase is covered by authentic manufacturer warranties, honored directly at authorized service centers nationwide.",
  },
  {
    icon: <SfIconLocalShipping />,
    title: "Nationwide Express Delivery",
    desc: "Door-to-door delivery covering all 64 districts of Bangladesh with live tracking, secure tamper-proof packaging, and insured transit.",
  },
  {
    icon: <SfIconPublishedWithChanges />,
    title: "7-Day Hassle-Free Returns",
    desc: "Enjoy peace of mind with our straightforward return policy, quick replacement service, and secure instant refunds.",
  },
];

const CATEGORY_SHOWCASE = [
  {
    title: "Smartphones & Tablets",
    desc: "Flagship devices with official BTRC approval and manufacturer warranty.",
    image: "/categories/mobiles.jpg",
    href: "/category/mobiles",
    tone: "from-blue-500/10 to-indigo-500/10",
  },
  {
    title: "Laptops & Workstations",
    desc: "From ultra-portable laptops to high-performance creative rigs.",
    image: "/categories/laptops.jpg",
    href: "/category/laptops",
    tone: "from-slate-500/10 to-zinc-500/10",
  },
  {
    title: "TV & Studio Audio",
    desc: "High-fidelity soundbars, ANC headphones, and immersive displays.",
    image: "/categories/tv-audio.jpg",
    href: "/category/tv-audio",
    tone: "from-amber-500/10 to-orange-500/10",
  },
  {
    title: "Smart Living & Wearables",
    desc: "Connected smartwatches, smart home cameras, and smart gadgets.",
    image: "/categories/smart-devices.jpg",
    href: "/category/smart-devices",
    tone: "from-emerald-500/10 to-teal-500/10",
  },
];

const MILESTONES = [
  {
    year: "2016",
    title: "The Beginning in Dhaka",
    desc: "Opened our flagship electronics retail shop in Gulshan, Dhaka with a pledge of 100% authentic tech at fair prices.",
  },
  {
    year: "2019",
    title: "Authorized Global Partnerships",
    desc: "Formed direct ties with official regional distributors for Apple, Samsung, Sony, ASUS, and Lenovo.",
  },
  {
    year: "2022",
    title: "64-District Logistics Hub",
    desc: "Established a centralized fulfillment warehouse in Dhaka with nationwide express door-to-door delivery network.",
  },
  {
    year: "2024",
    title: "Easy Exchange & Trade-In",
    desc: "Launched our seamless trade-in platform enabling customers to exchange older devices with verified valuation.",
  },
  {
    year: "2026",
    title: "250K+ Community Milestone",
    desc: "Proudly serving over a quarter-million happy tech enthusiasts, gamers, creators, and corporate partners.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nusrat Rahman",
    city: "Dhaka",
    role: "Software Engineer",
    quote: "Ordered my MacBook Pro late in the evening and had it delivered to Banani the next morning — sealed in original box with genuine warranty paper.",
  },
  {
    name: "Tanvir Ahmed",
    city: "Chittagong",
    role: "Content Creator",
    quote: "Finding genuine Sony cameras and gaming equipment with valid warranty in Chittagong used to be tough until VoltMart. Outstanding packaging!",
  },
  {
    name: "Farhana Karim",
    city: "Sylhet",
    role: "Architectural Studio",
    quote: "VoltMart equipped our entire office with color-accurate monitors and smart accessories. The support team provided professional invoice support.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Breadcrumb Bar */}
      <div className="border-b border-neutral-200/80 bg-neutral-50/60 py-2.5">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
        </Container>
      </div>

      {/* Hero Section with Split Visual */}
      <section className="relative overflow-hidden border-b border-neutral-200/90 bg-gradient-to-br from-primary-900 via-primary-800 to-neutral-900 py-10 text-white sm:py-14 lg:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />

        <Container className="relative z-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-white/15 backdrop-blur-sm">
              <SfIconWarehouse size="xs" /> Authentic Tech Since 2016
            </span>

            <h1 className="mt-4 font-headings text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-[42px]">
              Powering Bangladesh&apos;s digital lifestyle with authentic electronics.
            </h1>

            <p className="mt-3.5 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-white/80">
              VoltMart started in Dhaka with one uncompromising mission: to eradicate counterfeit and grey-market electronics by offering 100% genuine tech at honest prices. Today, we are Bangladesh&apos;s most reliable destination for smartphones, laptops, audio gear, and smart home tech — backed by official brand warranty and lightning-fast nationwide delivery.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <SfButton as={Link} href="/category/mobiles" size="base" className="!rounded-md !bg-white !text-primary-900 hover:!bg-neutral-100 font-semibold shadow-sm">
                Explore Catalog <SfIconChevronRight size="sm" />
              </SfButton>
              <SfButton as={Link} href="/contact" variant="tertiary" size="base" className="!rounded-md !text-white ring-1 ring-white/30 hover:!bg-white/10 font-semibold">
                Contact Our Team
              </SfButton>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
              <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden rounded-lg">
                <Image
                  src="/hero/promo-earbuds-light.jpg"
                  alt="VoltMart Authentic Tech Studio"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <SfIconSafetyCheck size="xs" /> 100% Genuine Guaranteed
                  </div>
                  <p className="text-sm font-bold sm:text-base">Sealed Original Packages</p>
                  <p className="text-[11px] text-white/70">Inspected and verified by certified tech specialists.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Metrics Banner */}
      <section className="border-b border-neutral-200/90 bg-white py-6">
        <Container>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-4 transition hover:border-primary-300"
              >
                <p className="font-headings text-2xl sm:text-3xl font-bold tracking-tight text-primary-800">{s.value}</p>
                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-neutral-800">{s.label}</p>
                <p className="text-[11px] text-neutral-500">{s.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Mission & Values */}
      <Container className="py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            title="The VoltMart Standard"
            subtitle="Built on authenticity, speed, and complete customer trust."
            className="mb-8 text-center"
          />
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="flex flex-col gap-2.5 rounded-lg border border-neutral-200/90 bg-white p-5 transition hover:border-primary-400 hover:shadow-xs"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 [&>svg]:h-5 [&>svg]:w-5">
                {v.icon}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">{v.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-neutral-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Rich Category Showcase with Photography */}
      <section className="border-y border-neutral-200/90 bg-neutral-50/70 py-8 sm:py-12">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="font-headings text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Curated Tech Across Every Category
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-neutral-500">
                Only the best electronics from authorized global manufacturers.
              </p>
            </div>
            <SfButton as={Link} href="/category/mobiles" variant="tertiary" size="sm" className="!rounded-md self-start sm:self-auto">
              View All Categories <SfIconChevronRight size="xs" />
            </SfButton>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_SHOWCASE.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200/90 bg-white transition hover:border-primary-400 hover:shadow-xs"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-100">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600 leading-relaxed flex-1">
                    {cat.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 group-hover:underline">
                    Browse gear <SfIconChevronRight size="xs" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Story & Growth Journey Timeline */}
      <Container className="py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700">Our Growth</span>
            <h2 className="mt-1 font-headings text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              From a single shop to Bangladesh&apos;s trusted tech marketplace
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-neutral-600">
              Ten years ago, buying original tech in Bangladesh required endless physical market visits and guessing which warranty was real. We set out to change that standard completely.
            </p>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600">
              Today, VoltMart operates automated fulfillment centers, direct brand partnerships, and a rapid delivery fleet reaching every corner of Bangladesh.
            </p>

            <div className="mt-6 rounded-lg border border-neutral-200/90 bg-neutral-50/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-800">
                  <SfIconLocationOn size="sm" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Flagship Experience Store</h4>
                  <p className="text-xs text-neutral-600">Gulshan Avenue, Dhaka-1212 · Open Sat–Thu, 9 AM – 9 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="lg:col-span-7">
            <div className="relative border-l-2 border-primary-200/80 pl-6 ml-3 sm:ml-4 space-y-6">
              {MILESTONES.map((m) => (
                <div key={m.year} className="relative">
                  <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-primary-600 ring-2 ring-primary-100" />
                  <span className="inline-block rounded-sm bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary-800">
                    {m.year}
                  </span>
                  <h3 className="mt-1 text-sm sm:text-base font-bold text-neutral-900">{m.title}</h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Verified Customer Feedback */}
      <section className="border-y border-neutral-200/90 bg-neutral-50/70 py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-headings text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Loved by 250,000+ Shoppers
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Verified reviews from tech enthusiasts across Bangladesh.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-3 py-1 text-xs font-semibold text-neutral-800">
              <SfIconStarFilled size="xs" className="text-amber-500" />
              <span>4.8 / 5 Rating (12,400+ reviews)</span>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-lg border border-neutral-200/90 bg-white p-4 sm:p-5 transition hover:border-neutral-300"
              >
                <Stars value={5} />
                <blockquote className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900">{t.name}</p>
                    <p className="text-[11px] text-neutral-500">{t.role} · {t.city}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-positive-700 bg-positive-50 px-2 py-0.5 rounded-sm">
                    <SfIconCheckCircle size="xs" /> Verified
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust & Guarantees Bar */}
      <Container className="py-8 sm:py-10">
        <TrustSection />
      </Container>

      {/* Call to Action Banner */}
      <section className="bg-primary-900 py-10 sm:py-12 text-white">
        <Container className="text-center">
          <h2 className="font-headings text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to upgrade your tech setup?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-white/80">
            Browse our full catalog of authentic electronics with official manufacturer warranty and express 24–72h delivery across Bangladesh.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <SfButton as={Link} href="/category/mobiles" size="base" className="!rounded-md !bg-white !text-primary-900 hover:!bg-neutral-100 font-semibold">
              Browse All Deals <SfIconChevronRight size="sm" />
            </SfButton>
            <SfButton as={Link} href="/contact" variant="tertiary" size="base" className="!rounded-md !text-white ring-1 ring-white/30 hover:!bg-white/10 font-semibold">
              <SfIconCall size="sm" /> Contact Support
            </SfButton>
          </div>
        </Container>
      </section>
    </>
  );
}
