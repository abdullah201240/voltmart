import Link from "next/link";
import { Container, Breadcrumbs } from "@/components/ui";
import { SfButton, SfIconChevronRight, SfIconLock, SfIconLocalShipping, SfIconPublishedWithChanges, SfIconSafetyCheck } from "@storefront-ui/react";

type Section = { heading: string; body: string[] };
type Doc = { title: string; updated: string; intro: string; icon: React.ReactNode; sections: Section[] };

const DOCS: Record<string, Doc> = {
  privacy: {
    title: "Privacy Policy",
    updated: "September 1, 2026",
    intro: "Your trust matters to us. This policy explains what information VoltMart collects, how we use it, and the choices you have.",
    icon: <SfIconLock />,
    sections: [
      { heading: "Information we collect", body: ["We collect the details you provide when creating an account or placing an order — name, contact number, email, and shipping address — along with order history and, with your consent, device usage data used to improve the shopping experience."] },
      { heading: "How we use your data", body: ["Your data is used to process orders, arrange delivery, provide warranty support, and send transactional updates. We may send marketing messages only if you opt in, and you can unsubscribe anytime."] },
      { heading: "Sharing & disclosure", body: ["We share the minimum necessary information with trusted delivery partners and payment processors to fulfil your order. We never sell your personal data to third parties."] },
      { heading: "Data security", body: ["All transactions are protected with industry-standard encryption. Payment card details are handled by certified processors and are never stored on our servers."] },
      { heading: "Your rights", body: ["You may request access to, correction of, or deletion of your personal data by contacting privacy@voltmart.com. We respond within 30 days."] },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "September 1, 2026",
    intro: "By using VoltMart you agree to the terms below. Please read them carefully before placing an order.",
    icon: <SfIconSafetyCheck />,
    sections: [
      { heading: "Using the marketplace", body: ["You agree to provide accurate information and to use the service lawfully. Accounts are personal and must not be shared or resold."] },
      { heading: "Pricing & availability", body: ["All prices are shown in Bangladeshi Taka (৳) and include applicable taxes unless stated otherwise. Product availability is subject to stock; we will notify you promptly if an item becomes unavailable."] },
      { heading: "Orders & payment", body: ["An order is confirmed once payment is authorised or, for Cash on Delivery, once we confirm the order by phone. We reserve the right to refuse orders that appear fraudulent."] },
      { heading: "Product warranty", body: ["Every product ships with the manufacturer's official warranty. Warranty terms vary by brand and category and are summarized on each product page."] },
      { heading: "Limitation of liability", body: ["VoltMart is not liable for indirect damages arising from use of the service beyond the value of the affected order."] },
    ],
  },
  refund: {
    title: "Refund & Return Policy",
    updated: "September 1, 2026",
    intro: "Changed your mind or received a faulty item? Here's how returns and refunds work at VoltMart.",
    icon: <SfIconPublishedWithChanges />,
    sections: [
      { heading: "7-day returns", body: ["You can request a return within 7 days of delivery for unused items in their original, sealed packaging with all accessories and the invoice."] },
      { heading: "How to start a return", body: ["Visit your Orders page or contact support with your order number. Our team arranges a pickup or drop-off and inspects the item on return."] },
      { heading: "Refund processing", body: ["Approved refunds are processed within 3–5 business days to the original payment method. COD refunds are issued via bank transfer or mobile financial services."] },
      { heading: "Non-returnable items", body: ["For hygiene and safety reasons, opened personal-care and certain accessories are non-returnable unless defective. Custom-configured items follow brand policy."] },
      { heading: "Faulty or damaged on arrival", body: ["Report damaged or faulty products within 48 hours of delivery with photos and we will replace or refund at no cost to you."] },
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    updated: "September 1, 2026",
    intro: "Fast, tracked delivery nationwide — here's what to expect.",
    icon: <SfIconLocalShipping />,
    sections: [
      { heading: "Delivery times", body: ["Standard delivery takes 24–72 hours depending on your location. Express next-day delivery is available inside Dhaka for orders placed before the daily cutoff."] },
      { heading: "Shipping fees", body: ["Fees are calculated at checkout based on weight and destination. Orders above the free-shipping threshold shown in your cart qualify for complimentary delivery."] },
      { heading: "Order tracking", body: ["Every order includes a tracking link. Use the Track Order page with your order number to see live shipment progress."] },
      { heading: "Remote areas", body: ["Delivery to some remote districts may take an extra 1–2 days. Our courier partners cover all 64 districts."] },
    ],
  },
};

const META: Record<string, { label: string; href: string }[]> = {
  privacy: [
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Refund Policy", href: "/legal/refund" },
    { label: "Shipping", href: "/legal/shipping" },
  ],
  terms: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Refund Policy", href: "/legal/refund" },
    { label: "Shipping", href: "/legal/shipping" },
  ],
  refund: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Shipping", href: "/legal/shipping" },
  ],
  shipping: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms & Conditions", href: "/legal/terms" },
    { label: "Refund Policy", href: "/legal/refund" },
  ],
};

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug] ?? DOCS.terms;
  const key = DOCS[slug] ? slug : "terms";

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/privacy" }, { label: doc.title }]} />

      <div className="mt-3.5 grid gap-6 lg:grid-cols-[1fr_240px]">
        <article className="max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700 [&>svg]:h-5 [&>svg]:w-5">{doc.icon}</span>
            <div>
              <h1 className="font-headings text-2xl font-bold tracking-tight sm:text-3xl">{doc.title}</h1>
              <p className="text-xs text-neutral-500">Last updated: {doc.updated}</p>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-neutral-600">{doc.intro}</p>

          <div className="mt-6 space-y-5">
            {doc.sections.map((s, i) => (
              <section key={s.heading}>
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">{i + 1}. {s.heading}</h2>
                {s.body.map((p, j) => (
                  <p key={j} className="mt-1 text-xs sm:text-sm leading-relaxed text-neutral-600">{p}</p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-neutral-200/90 bg-neutral-50/70 p-3.5 text-xs sm:text-sm text-neutral-600">
            Questions about this policy? <Link href="/contact" className="font-semibold text-primary-700 hover:underline">Contact our team</Link>.
          </div>
        </article>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-md border border-neutral-200/90 bg-white p-3.5 sm:p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-900">Policies</h3>
            <nav className="mt-2.5 flex flex-col gap-0.5">
              {META[key].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs sm:text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-700">
                  {l.label} <SfIconChevronRight size="xs" />
                </Link>
              ))}
            </nav>
            <SfButton as={Link} href="/support" variant="secondary" size="sm" className="mt-3 w-full !rounded-md">Visit help center</SfButton>
          </div>
        </aside>
      </div>
    </Container>
  );
}
