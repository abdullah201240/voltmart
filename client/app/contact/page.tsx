"use client";

import { useState } from "react";
import {
  SfButton,
  SfInput,
  SfTextarea,
  SfIconCall,
  SfIconEmail,
  SfIconLocationOn,
  SfIconContactSupport,
  SfIconChevronRight,
  SfIconExpandMore,
  SfIconCheck,
} from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { Container, Breadcrumbs, CustomSelect, TrustSection } from "@/components/ui";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "orders", label: "Order & Delivery" },
  { value: "warranty", label: "Warranty & Repair" },
  { value: "returns", label: "Returns & Refunds" },
];

const CHANNELS = [
  {
    icon: <SfIconCall size="sm" />,
    title: "Call Us",
    value: "+880 1600-000-000",
    href: "tel:+8801600000000",
    note: "Sat–Thu: 9 AM – 9 PM",
  },
  {
    icon: <SfIconEmail size="sm" />,
    title: "Email",
    value: "support@voltmart.com",
    href: "mailto:support@voltmart.com",
    note: "Replies within 2 hours",
  },
  {
    icon: <SfIconContactSupport size="sm" />,
    title: "WhatsApp",
    value: "+880 1700-111-222",
    href: "https://wa.me/8801700111222",
    note: "Instant chat",
  },
  {
    icon: <SfIconLocationOn size="sm" />,
    title: "Store",
    value: "Gulshan-2, Dhaka",
    href: "https://maps.google.com/?q=Gulshan+2+Dhaka",
    note: "Open 7 days",
  },
];

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "24–48 hours in Dhaka Metro, and 48–72 hours nationwide with live SMS tracking.",
  },
  {
    q: "Are products genuine with warranty?",
    a: "Yes. Every product is 100% authentic, brand-sealed, and includes official manufacturer warranty.",
  },
  {
    q: "Can I collect my order in person?",
    a: "Yes, select 'Store Pickup' at checkout to collect from our Gulshan hub for free.",
  },
  {
    q: "What is your return policy?",
    a: "7-day hassle-free replacement or refund for any defective or damaged items.",
  },
];

export default function ContactPage() {
  const { notify } = useStore();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    notify("Message sent! We'll reply shortly.");
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200/80 bg-neutral-50/60 py-2">
        <Container>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        </Container>
      </div>

      <Container className="py-6 sm:py-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-headings text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Contact Us
          </h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            We&apos;re here to help with orders, warranty, and questions.
          </p>
        </div>

        {/* 4 Quick Contact Cards */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="flex items-center gap-3 rounded-md border border-neutral-200/90 bg-white p-3 transition hover:border-primary-400 hover:bg-neutral-50/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                {c.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-900">{c.title}</p>
                <p className="truncate text-xs text-primary-700 font-medium">{c.value}</p>
                <p className="text-[10px] text-neutral-400">{c.note}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Store & Form Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-6 items-start">
          {/* Store Info */}
          <div className="lg:col-span-4 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Experience Store</span>
              <h2 className="mt-1 text-base font-bold text-neutral-900">Gulshan Flagship Hub</h2>
              <p className="mt-1 text-xs text-neutral-600">Plot 18, Gulshan Avenue, Gulshan-2, Dhaka-1212</p>
            </div>

            <div className="rounded-md bg-neutral-50 p-3 text-xs space-y-1 text-neutral-600 border border-neutral-100">
              <p className="flex justify-between">
                <span>Sat – Thu:</span>
                <span className="font-semibold text-neutral-800">9:00 AM – 9:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Friday:</span>
                <span className="font-semibold text-neutral-800">2:00 PM – 9:00 PM</span>
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <SfButton
                as="a"
                href="https://maps.google.com/?q=Gulshan+2+Dhaka"
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                className="flex-1 !rounded-md text-xs font-semibold"
              >
                <SfIconLocationOn size="xs" /> Directions
              </SfButton>
              <SfButton
                as="a"
                href="tel:+8801600000000"
                variant="secondary"
                size="sm"
                className="flex-1 !rounded-md text-xs font-semibold"
              >
                <SfIconCall size="xs" /> Call
              </SfButton>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="border-b border-neutral-100 pb-2.5">
                  <h2 className="text-base font-bold text-neutral-900">Send a Message</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">Name *</span>
                    <SfInput
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="!rounded-md"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">Email *</span>
                    <SfInput
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="!rounded-md"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">Phone (Optional)</span>
                    <SfInput
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1XXXXXXXXX"
                      className="!rounded-md"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-neutral-700">Topic *</span>
                    <CustomSelect
                      value={subject}
                      onChange={setSubject}
                      options={SUBJECT_OPTIONS}
                      size="sm"
                      className="w-full"
                    />
                  </label>
                </div>

                <label className="block w-full">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700">Message *</span>
                  <SfTextarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full !w-full !rounded-md min-h-[160px] sm:min-h-[180px] p-3 text-sm focus:border-primary-500"
                  />
                </label>

                <div className="pt-1">
                  <SfButton type="submit" size="sm" className="!rounded-md px-5 font-semibold">
                    Send Message <SfIconChevronRight size="xs" />
                  </SfButton>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-positive-50 text-positive-600">
                  <SfIconCheck size="base" />
                </span>
                <h3 className="mt-2 text-base font-bold text-neutral-900">Message Received!</h3>
                <p className="mt-0.5 text-xs text-neutral-500">We will get back to you shortly.</p>
                <SfButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4 !rounded-md text-xs font-semibold"
                  onClick={() => { setSent(false); setMessage(""); }}
                >
                  Send another message
                </SfButton>
              </div>
            )}
          </div>
        </div>

        {/* Simple Common Questions */}
        <div className="mt-8 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5">
          <div className="mb-3">
            <h2 className="text-base font-bold text-neutral-900">Common Questions</h2>
          </div>

          <div className="divide-y divide-neutral-100">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="py-2.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-semibold text-neutral-800 hover:text-primary-700"
                  >
                    <span>{faq.q}</span>
                    <SfIconExpandMore
                      size="xs"
                      className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180 text-primary-700" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Trust Bar */}
      <Container className="pb-8">
        <TrustSection />
      </Container>
    </>
  );
}
