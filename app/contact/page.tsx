"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SfButton,
  SfInput,
  SfTextarea,
  SfIconCall,
  SfIconEmail,
  SfIconLocationOn,
  SfIconContactSupport,
  SfIconSafetyCheck,
  SfIconLocalShipping,
  SfIconCheckCircle,
  SfIconCheck,
  SfIconChevronRight,
  SfIconPackage,
  SfIconPublishedWithChanges,
  SfAccordionItem,
} from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { Container, Breadcrumbs, CustomSelect, TrustSection } from "@/components/ui";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "orders", label: "Order & Delivery Tracking" },
  { value: "warranty", label: "Official Warranty & Servicing" },
  { value: "returns", label: "7-Day Return & Replacement" },
  { value: "trade-in", label: "Device Exchange & Trade-In" },
  { value: "corporate", label: "Corporate & Bulk Procurement" },
  { value: "technical", label: "Technical & Compatibility Help" },
];

const CHANNELS = [
  {
    icon: <SfIconCall />,
    title: "Call Hotline",
    value: "+880 1600-000-000",
    href: "tel:+8801600000000",
    note: "Sat–Thu: 9 AM – 9 PM",
    badge: "Toll Free",
  },
  {
    icon: <SfIconEmail />,
    title: "Email Support",
    value: "support@voltmart.com",
    href: "mailto:support@voltmart.com",
    note: "Replies within 2–4 hours",
    badge: "24/7 Queue",
  },
  {
    icon: <SfIconContactSupport />,
    title: "Live WhatsApp",
    value: "+880 1700-111-222",
    href: "https://wa.me/8801700111222",
    note: "Instant chat assistance",
    badge: "Quick Chat",
  },
  {
    icon: <SfIconPackage />,
    title: "Corporate Desk",
    value: "corporate@voltmart.com",
    href: "mailto:corporate@voltmart.com",
    note: "Bulk orders & institutional B2B",
    badge: "Business",
  },
];

const STORE_SERVICES = [
  {
    icon: <SfIconPackage size="xs" />,
    label: "Click & Collect Pickup",
    desc: "Pick up your confirmed online order in person.",
  },
  {
    icon: <SfIconSafetyCheck size="xs" />,
    label: "Official Warranty Claims",
    desc: "Direct verification & authorized brand service drop-off.",
  },
  {
    icon: <SfIconPublishedWithChanges size="xs" />,
    label: "Instant Device Trade-In",
    desc: "On-the-spot evaluation for phone and laptop exchanges.",
  },
  {
    icon: <SfIconLocalShipping size="xs" />,
    label: "Express Courier Hub",
    desc: "Same-day express dispatch across Dhaka metro.",
  },
];

const QUICK_FAQS = [
  {
    q: "How can I track my active order status?",
    a: "You can track your order at any time on our Track Order page using your order ID (e.g., ELX-20260928-00125) and registered phone number or email.",
    href: "/track-order",
    linkText: "Go to Order Tracker",
  },
  {
    q: "How does the official brand warranty claim work?",
    a: "Every product sold by VoltMart includes an official manufacturer warranty card and invoice. You can visit any authorized brand service center nationwide or bring the product to our Gulshan hub.",
  },
  {
    q: "Can I collect my online order from the Gulshan Experience Store?",
    a: "Yes! At checkout, select 'Store Pickup (Gulshan Flagship)' to pick up your order without any shipping fees. You'll receive an SMS notification as soon as it is packaged and ready.",
  },
  {
    q: "What is your 7-day return policy?",
    a: "If an item arrives damaged, defective, or incorrect, you can request an instant return or replacement within 7 calendar days of delivery with original packaging and invoice.",
  },
];

function Field({
  label,
  required = false,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-800">
          {label} {required && <span className="text-negative-600">*</span>}
        </span>
        {helper && <span className="text-[11px] text-neutral-400">{helper}</span>}
      </div>
      {children}
    </label>
  );
}

export default function ContactPage() {
  const { notify } = useStore();
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const generatedTicket = "VLT-" + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedTicket);
    setSent(true);
    notify(`Support ticket ${generatedTicket} created. We'll reply shortly!`);
  }

  function handleReset() {
    setSent(false);
    setMessage("");
    setOrderId("");
  }

  return (
    <>
      {/* Breadcrumb Bar */}
      <div className="border-b border-neutral-200/80 bg-neutral-50/60 py-2.5">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />
        </Container>
      </div>

      {/* Hero Header */}
      <section className="border-b border-neutral-200/90 bg-gradient-to-b from-primary-50/50 via-white to-white py-8 sm:py-10">
        <Container className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Support Desk Active · Response Time &lt; 15 mins
          </div>

          <h1 className="mt-3 font-headings text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl">
            How can we assist you today?
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Have a question about an order, warranty claim, product compatibility, or corporate quotation? Our specialized electronics support team in Dhaka is here to help 7 days a week.
          </p>

          {/* Quick Channels Grid */}
          <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 text-left">
            {CHANNELS.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="group flex flex-col justify-between rounded-lg border border-neutral-200/90 bg-white p-4 transition-all hover:border-primary-400 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition group-hover:bg-primary-600 group-hover:text-white [&>svg]:h-5 [&>svg]:w-5">
                      {c.icon}
                    </span>
                    <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      {c.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">{c.title}</h3>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {c.value}
                  </p>
                </div>
                <p className="mt-2.5 text-[11px] text-neutral-500 border-t border-neutral-100 pt-2 flex items-center justify-between">
                  <span>{c.note}</span>
                  <SfIconChevronRight size="xs" className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                </p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Main Content: Store Info & Interactive Contact Form */}
      <Container className="py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Flagship Experience Store */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-800">
                  <SfIconLocationOn size="base" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Experience Store</span>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">Gulshan Flagship &amp; Service Hub</h2>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-neutral-50 p-3.5 border border-neutral-200/80 text-xs sm:text-sm text-neutral-700 space-y-1.5">
                <p className="font-semibold text-neutral-900">VoltMart Electronics Tower, 4th Floor</p>
                <p className="text-neutral-600">Plot 18, Gulshan Avenue, Gulshan-2, Dhaka-1212</p>
                <p className="text-[11px] text-neutral-500">Opposite Westin Dhaka · Landmark: Gulshan 2 Circle</p>
              </div>

              {/* Operating Hours */}
              <div className="mt-4 border-t border-neutral-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Operating Schedule</h4>
                <div className="mt-2 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>Saturday – Thursday:</span>
                    <span className="font-semibold text-neutral-900">9:00 AM – 9:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Friday:</span>
                    <span className="font-semibold text-neutral-900">2:00 PM – 9:00 PM (After Juma)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Online &amp; Hotline:</span>
                    <span className="font-semibold text-emerald-700">7 Days a Week</span>
                  </div>
                </div>
              </div>

              {/* Services available on-site */}
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Available At This Location</h4>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STORE_SERVICES.map((s) => (
                    <div key={s.label} className="rounded-md border border-neutral-200/70 bg-white p-2.5">
                      <div className="flex items-center gap-1.5 text-primary-700 font-semibold text-xs">
                        {s.icon} <span>{s.label}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-500 leading-normal">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap gap-2.5 pt-2">
                <SfButton
                  as="a"
                  href="https://maps.google.com/?q=Gulshan+2+Dhaka"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  className="flex-1 !rounded-md !bg-primary-700 hover:!bg-primary-800 text-xs font-semibold"
                >
                  <SfIconLocationOn size="xs" /> Get Directions
                </SfButton>
                <SfButton
                  as="a"
                  href="tel:+8801600000000"
                  variant="secondary"
                  size="sm"
                  className="flex-1 !rounded-md text-xs font-semibold"
                >
                  <SfIconCall size="xs" /> Call Store
                </SfButton>
              </div>
            </div>

            {/* Quick Reassurance Card */}
            <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-4 text-xs text-primary-950">
              <div className="flex items-start gap-2.5">
                <SfIconSafetyCheck size="sm" className="shrink-0 text-primary-700 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-900">100% Official Brand Warranty</p>
                  <p className="mt-0.5 text-neutral-600 leading-relaxed">
                    Have an issue with a phone or laptop? We facilitate direct servicing with official service centers for Apple, Samsung, Sony, ASUS, and HP.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Support Request Form */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-neutral-200/90 bg-white p-5 sm:p-7 shadow-xs">
              {!sent ? (
                <>
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Send an Inquiry or Support Request</h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Fill out the form below. Our support team typically replies within 15–30 minutes during working hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <Field label="Full Name" required>
                        <SfInput
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Abdullah Sakib"
                          className="!rounded-md"
                        />
                      </Field>

                      <Field label="Email Address" required>
                        <SfInput
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="!rounded-md"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <Field label="Phone Number" helper="For SMS status updates">
                        <SfInput
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+880 1XXXXXXXXX"
                          className="!rounded-md"
                        />
                      </Field>

                      <Field label="Order ID (Optional)" helper="e.g. ELX-2026-0012">
                        <SfInput
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          placeholder="Leave blank if general"
                          className="!rounded-md"
                        />
                      </Field>
                    </div>

                    <Field label="Topic / Department" required>
                      <CustomSelect
                        value={subject}
                        onChange={setSubject}
                        options={SUBJECT_OPTIONS}
                        size="base"
                        className="w-full"
                      />
                    </Field>

                    <Field label="Your Message" required helper="Please include model details if applicable">
                      <SfTextarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your inquiry, question, or warranty issue in detail..."
                        className="!rounded-md"
                      />
                    </Field>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                      <p className="text-[11px] text-neutral-500">
                        🔒 Your personal details are strictly encrypted &amp; never shared.
                      </p>
                      <SfButton
                        type="submit"
                        size="base"
                        className="!rounded-md !bg-primary-700 hover:!bg-primary-800 font-semibold px-6"
                      >
                        Submit Ticket <SfIconChevronRight size="xs" />
                      </SfButton>
                    </div>
                  </form>
                </>
              ) : (
                /* Success Confirmation State */
                <div className="py-8 text-center sm:py-10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-positive-50 text-positive-600 ring-8 ring-positive-50/50">
                    <SfIconCheck size="lg" />
                  </div>
                  <h3 className="mt-4 font-headings text-xl font-bold text-neutral-900 sm:text-2xl">
                    Message Dispatched Successfully!
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Thank you, <span className="font-semibold text-neutral-900">{name || "Valued Customer"}</span>. Your inquiry has been routed to our specialized support queue.
                  </p>

                  <div className="mx-auto mt-6 max-w-sm rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-4 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Ticket Reference:</span>
                      <span className="font-mono font-bold text-primary-800">{ticketId}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Department:</span>
                      <span className="font-semibold text-neutral-800">
                        {SUBJECT_OPTIONS.find((s) => s.value === subject)?.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Estimated Response:</span>
                      <span className="font-semibold text-emerald-700">&lt; 30 minutes</span>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <SfButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="!rounded-md text-xs font-semibold"
                      onClick={handleReset}
                    >
                      Send Another Inquiry
                    </SfButton>
                    <SfButton
                      as={Link}
                      href="/category/mobiles"
                      size="sm"
                      className="!rounded-md text-xs font-semibold"
                    >
                      Browse Tech Catalog
                    </SfButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Frequently Asked Questions Section */}
      <section className="border-y border-neutral-200/90 bg-neutral-50/60 py-8 sm:py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headings text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Quick Answers &amp; Common Queries
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500">
              Find instant solutions before contacting support.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-3xl space-y-2">
            {QUICK_FAQS.map((faq) => (
              <SfAccordionItem
                key={faq.q}
                summary={<span className="text-xs sm:text-sm font-semibold text-neutral-900">{faq.q}</span>}
                className="rounded-lg border border-neutral-200/80 bg-white px-4 py-1"
              >
                <div className="pb-3 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  <p>{faq.a}</p>
                  {faq.href && (
                    <Link
                      href={faq.href}
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"
                    >
                      {faq.linkText} <SfIconChevronRight size="xs" />
                    </Link>
                  )}
                </div>
              </SfAccordionItem>
            ))}
          </div>
        </Container>
      </section>

      {/* Trust & Guarantee Section */}
      <Container className="py-8 sm:py-10">
        <TrustSection />
      </Container>
    </>
  );
}
