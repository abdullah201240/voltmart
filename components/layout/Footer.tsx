import Link from "next/link";
import {
  SfIconFacebook,
  SfIconYoutube,
  SfIconInstagram,
  SfIconTwitter,
  SfIconCall,
  SfIconEmail,
  SfIconLocationOn,
} from "@storefront-ui/react";
import { Container } from "@/components/ui";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Smartphones", href: "/category/mobiles" },
      { label: "Laptops", href: "/category/laptops" },
      { label: "TV & Audio", href: "/category/tv-audio" },
      { label: "Gaming", href: "/gaming" },
      { label: "Accessories", href: "/category/accessories" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Help Center", href: "/support" },
      { label: "Shipping", href: "/support" },
      { label: "Returns", href: "/support" },
      { label: "Warranty", href: "/support" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Store Locations", href: "/contact" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Refund Policy", href: "/legal/refund" },
    ],
  },
];

const PAYMENTS = ["bKash", "Nagad", "VISA", "Mastercard", "COD"];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-200 bg-neutral-50 pb-36 sm:mt-12 lg:pb-0">
      <Container className="py-8 sm:py-9">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2">
            <Link href="/" className="font-headings text-xl font-bold tracking-tight">
              <span className="text-neutral-900">Volt</span>
              <span className="text-primary-600">Mart</span>
            </Link>
            <p className="mt-2.5 max-w-sm text-xs text-neutral-600 sm:text-sm">
              Bangladesh&apos;s premium electronics marketplace. Authentic products, official
              warranty, and fast nationwide delivery — all in one place.
            </p>
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-neutral-600 sm:text-sm">
              <span className="inline-flex items-center gap-2"><SfIconCall size="xs" className="text-primary-600" /> +880 1600-000-000</span>
              <span className="inline-flex items-center gap-2"><SfIconEmail size="xs" className="text-primary-600" /> support@voltmart.com</span>
              <span className="inline-flex items-center gap-2"><SfIconLocationOn size="xs" className="text-primary-600" /> Gulshan Ave, Dhaka 1212</span>
            </div>
            <div className="mt-4 flex gap-1.5">
              {[<SfIconFacebook key="f" />, <SfIconYoutube key="y" />, <SfIconInstagram key="i" />, <SfIconTwitter key="t" />].map((icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-neutral-600 ring-1 ring-neutral-200 transition-colors hover:text-primary-700 [&>svg]:h-3.5 [&>svg]:w-3.5">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-900 sm:text-sm">{col.title}</h4>
              <ul className="mt-2.5 space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-xs text-neutral-600 hover:text-primary-700 sm:text-sm">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t border-neutral-200">
        <Container className="flex flex-col items-center justify-between gap-3 py-3 sm:flex-row sm:py-3.5">
          <p className="text-[11px] text-neutral-500">© 2026 VoltMart Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            {PAYMENTS.map((p) => (
              <span key={p} className="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600">{p}</span>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}
