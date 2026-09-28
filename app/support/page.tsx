import Link from "next/link";
import { SfAccordionItem, SfButton, SfIconChevronRight, SfIconPublishedWithChanges, SfIconCreditCard, SfIconPackage, SfIconLocalShipping, SfIconPerson, SfIconGridView, SfIconSafetyCheck, SfIconCall } from "@storefront-ui/react";
import { Container } from "@/components/ui";
import { SearchBox } from "@/components/layout/SearchBox";

const TOPICS = [
  { label: "Orders", icon: <SfIconPackage />, href: "/account/orders" },
  { label: "Shipping", icon: <SfIconLocalShipping />, href: "/track-order" },
  { label: "Payments", icon: <SfIconCreditCard />, href: "/support" },
  { label: "Returns", icon: <SfIconPublishedWithChanges />, href: "/support" },
  { label: "Warranty", icon: <SfIconSafetyCheck />, href: "/support" },
  { label: "Products", icon: <SfIconGridView />, href: "/category/mobiles" },
  { label: "Account", icon: <SfIconPerson />, href: "/account" },
];

const FAQ = [
  { q: "How long does delivery take?", a: "Orders are delivered within 24–72 hours nationwide depending on your location. Express next-day delivery is available in Dhaka." },
  { q: "Are all products authentic?", a: "Yes. Every product is 100% genuine, sourced directly from authorized distributors, and ships sealed with an official warranty." },
  { q: "What is your return policy?", a: "You can request a return within 7 days of delivery for unused items in original packaging. Refunds are processed within 3–5 business days." },
  { q: "How do I claim warranty?", a: "Keep your invoice. Bring the product to any authorized brand service center, or contact our support team and we'll arrange service for you." },
  { q: "Which payment methods are accepted?", a: "We accept all major cards, bKash, Nagad, and Cash on Delivery for eligible orders." },
];

export default function SupportPage() {
  return (
    <Container className="py-6 sm:py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">How can we help?</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">Search our help center or browse popular topics below.</p>
        <div className="mx-auto mt-4 max-w-lg"><SearchBox /></div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {TOPICS.map((t) => (
          <Link key={t.label} href={t.href} className="flex flex-col items-center gap-1.5 rounded-md border border-neutral-200/90 bg-white p-3 text-center transition-colors hover:border-primary-400 [&>span>svg]:h-5 [&>span>svg]:w-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700">{t.icon}</span>
            <span className="text-xs sm:text-sm font-medium text-neutral-800">{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-8 sm:mt-10 max-w-3xl">
        <h2 className="mb-3 text-lg sm:text-xl font-bold">Frequently asked questions</h2>
        <div className="flex flex-col gap-1.5">
          {FAQ.map((f) => (
            <SfAccordionItem key={f.q} summary={<span className="text-sm font-semibold text-neutral-900">{f.q}</span>} className="rounded-md border border-neutral-200/90 bg-white px-3.5">
              <p className="px-1 pb-3 text-xs sm:text-sm text-neutral-600">{f.a}</p>
            </SfAccordionItem>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2.5 rounded-md border border-primary-200 bg-gradient-to-br from-primary-50/70 via-white to-emerald-50/60 p-5 sm:p-6 text-center text-neutral-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <SfIconCall size="base" />
          </div>
          <h3 className="font-headings text-lg font-bold text-neutral-900">Still need help?</h3>
          <p className="max-w-md text-xs sm:text-sm text-neutral-600">Our expert support team is available 7 days a week, 9 AM – 9 PM.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <SfButton as={Link} href="/contact" size="sm" className="!rounded-md">Contact us <SfIconChevronRight size="sm" /></SfButton>
            <SfButton as={Link} href="/track-order" variant="secondary" size="sm" className="!rounded-md">Track order</SfButton>
          </div>
        </div>
      </div>
    </Container>
  );
}
