"use client";

import { useState } from "react";
import { SfButton, SfInput, SfTextarea, SfIconCall, SfIconEmail, SfIconLocationOn, SfIconContactSupport } from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { Container } from "@/components/ui";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

export default function ContactPage() {
  const { notify } = useStore();
  const [sent, setSent] = useState(false);

  const channels = [
    { icon: <SfIconCall />, title: "Call us", value: "+880 1600-000-000", note: "Sat–Thu, 9 AM – 9 PM" },
    { icon: <SfIconEmail />, title: "Email", value: "support@voltmart.com", note: "Replies within 24h" },
    { icon: <SfIconContactSupport />, title: "Live Chat", value: "Chat with us", note: "Instant support" },
    { icon: <SfIconLocationOn />, title: "Visit", value: "Gulshan Ave, Dhaka 1212", note: "Flagship store" },
  ];

  return (
    <Container className="py-6 sm:py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Get in touch</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-neutral-500">Questions about an order, warranty or a product? We&apos;d love to help.</p>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {channels.map((c) => (
            <div key={c.title} className="flex flex-col gap-1.5 rounded-md border border-neutral-200/90 bg-white p-3 sm:p-3.5 [&>span>svg]:h-5 [&>span>svg]:w-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700">{c.icon}</span>
              <p className="text-xs sm:text-sm font-bold text-neutral-900">{c.title}</p>
              <p className="text-xs sm:text-sm text-neutral-700">{c.value}</p>
              <p className="text-[11px] text-neutral-500">{c.note}</p>
            </div>
          ))}
          <div className="col-span-2 flex min-h-32 items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 bg-neutral-100/70 text-xs text-neutral-500">
            <SfIconLocationOn size="sm" /> Flagship Store · Gulshan Avenue, Dhaka
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); notify("Message sent — we'll reply shortly!"); }}
          className="space-y-3 rounded-md border border-neutral-200/90 bg-white p-4 sm:p-5 [&_input]:!rounded-md [&_textarea]:!rounded-md"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><SfInput required placeholder="Your name" /></Field>
            <Field label="Email"><SfInput required type="email" placeholder="you@email.com" /></Field>
          </div>
          <Field label="Subject"><SfInput placeholder="How can we help?" /></Field>
          <Field label="Message"><SfTextarea required rows={4} placeholder="Write your message..." /></Field>
          <SfButton type="submit" size="base" className="w-full !rounded-md">{sent ? "Message sent ✓" : "Send message"}</SfButton>
        </form>
      </div>
    </Container>
  );
}
