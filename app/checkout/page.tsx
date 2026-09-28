"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SfButton,
  SfInput,
  SfChip,
  SfIconCheck,
  SfIconLocalShipping,
  SfIconCreditCard,
  SfIconLock,
  SfIconChevronLeft,
} from "@storefront-ui/react";
import { useCartLines, useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { classNames } from "@/lib/format";
import { Container } from "@/components/ui";
import { ProductImage } from "@/components/ProductImage";

const STEPS = ["Address", "Delivery", "Payment", "Review"];
const DELIVERY = [
  { id: "std", name: "Standard Delivery", note: "2–3 business days", price: 0 },
  { id: "express", name: "Express Delivery", note: "Next day, before 8 PM", price: 250 },
  { id: "pickup", name: "Store Pickup", note: "Ready in 2 hours — Dhaka", price: 0 },
];
const PAYMENTS = ["Card", "bKash", "Nagad", "Cash on Delivery"];

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartLines();
  const { subtotal, clearCart, notify } = useStore();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState("std");
  const [payment, setPayment] = useState("Card");
  const [form, setForm] = useState({ name: "Ayesha Rahman", phone: "01700-000000", email: "ayesha@example.com", address: "House 12, Road 5, Gulshan 2", city: "Dhaka", area: "Gulshan" });

  const dFee = DELIVERY.find((d) => d.id === delivery)?.price ?? 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + dFee + tax;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (lines.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-neutral-500">Add products before checking out.</p>
        <SfButton as={Link} href="/" className="mt-6">Start shopping</SfButton>
      </Container>
    );
  }

  function placeOrder() {
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const order = {
      id: `ELX-${stamp}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      total,
      payment,
      delivery: DELIVERY.find((d) => d.id === delivery)?.name,
      eta: new Date(now.getTime() + 2 * 864e5).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      items: lines.map((l) => ({ name: l.product.name, qty: l.item.qty, price: l.product.price })),
    };
    try { localStorage.setItem("sf_last_order", JSON.stringify(order)); } catch { /* ignore */ }
    clearCart();
    notify("Order placed successfully!");
    router.push("/order-success");
  }

  return (
    <Container className="py-4 sm:py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
        <SfButton as={Link} href="/cart" variant="tertiary" size="sm" className="!rounded-md !px-2.5 !py-1 text-xs"><SfIconChevronLeft size="xs" /> Back to cart</SfButton>
      </div>

      {/* Stepper */}
      <ol className="mb-5 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-1.5">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={classNames("flex items-center gap-1.5", i <= step ? "cursor-pointer" : "cursor-default")}
            >
              <span className={classNames("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", i < step ? "bg-positive-600 text-white" : i === step ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-500")}>
                {i < step ? <SfIconCheck size="xs" /> : i + 1}
              </span>
              <span className={classNames("hidden text-xs font-medium sm:inline", i === step ? "text-neutral-900" : "text-neutral-500")}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-neutral-200" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-md border border-neutral-200 bg-white p-4 sm:p-5">
            {step === 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold">Shipping Address</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name"><SfInput value={form.name} onChange={set("name")} className="!rounded-md" /></Field>
                  <Field label="Phone"><SfInput value={form.phone} onChange={set("phone")} className="!rounded-md" /></Field>
                  <Field label="Email" className="sm:col-span-2"><SfInput type="email" value={form.email} onChange={set("email")} className="!rounded-md" /></Field>
                  <Field label="Address" className="sm:col-span-2"><SfInput value={form.address} onChange={set("address")} className="!rounded-md" /></Field>
                  <Field label="City"><SfInput value={form.city} onChange={set("city")} className="!rounded-md" /></Field>
                  <Field label="Area"><SfInput value={form.area} onChange={set("area")} className="!rounded-md" /></Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold">Delivery Method</h2>
                {DELIVERY.map((d) => (
                  <button key={d.id} type="button" onClick={() => setDelivery(d.id)} className={classNames("flex w-full items-center gap-2.5 rounded-md border p-3 text-left transition", delivery === d.id ? "border-primary-600 bg-primary-50" : "border-neutral-200 hover:border-neutral-300")}>
                    <SfIconLocalShipping className={delivery === d.id ? "text-primary-700" : "text-neutral-400"} />
                    <div className="flex-1"><p className="text-sm font-semibold">{d.name}</p><p className="text-xs text-neutral-500">{d.note}</p></div>
                    <span className="text-xs font-semibold sm:text-sm">{d.price === 0 ? "Free" : formatPrice(d.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold">Payment Method</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PAYMENTS.map((p) => (
                    <button key={p} type="button" onClick={() => setPayment(p)} className={classNames("flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition sm:text-sm", payment === p ? "border-primary-600 bg-primary-50 text-primary-800" : "border-neutral-200 hover:border-neutral-300")}>
                      <SfIconCreditCard size="xs" /> {p}
                    </button>
                  ))}
                </div>
                {payment === "Card" && (
                  <div className="grid gap-3 rounded-md bg-neutral-50 p-3 sm:grid-cols-2">
                    <Field label="Card number" className="sm:col-span-2"><SfInput placeholder="4242 4242 4242 4242" className="!rounded-md" /></Field>
                    <Field label="Expiry"><SfInput placeholder="MM/YY" className="!rounded-md" /></Field>
                    <Field label="CVV"><SfInput placeholder="123" className="!rounded-md" /></Field>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h2 className="text-base font-bold">Review & Confirm</h2>
                <div className="rounded-md border border-neutral-200 p-3 text-xs sm:text-sm">
                  <p className="font-semibold text-neutral-900">{form.name}</p>
                  <p className="text-neutral-500">{form.address}, {form.area}, {form.city}</p>
                  <p className="text-neutral-500">{form.phone} · {form.email}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <SfChip size="sm" square className="!rounded-xs">{DELIVERY.find((d) => d.id === delivery)?.name}</SfChip>
                  <SfChip size="sm" square className="!rounded-xs">Pay: {payment}</SfChip>
                </div>
                <div className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
                  {lines.map(({ item, product }) => (
                    <div key={item.id} className="flex items-center gap-2.5 p-2.5">
                      <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="h-10 w-10" rounded="rounded-sm" />
                      <div className="flex-1"><p className="text-xs font-medium sm:text-sm">{product.name}</p><p className="text-[11px] text-neutral-500">Qty {item.qty}</p></div>
                      <span className="text-xs font-semibold sm:text-sm">{formatPrice(product.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <SfButton variant="secondary" size="sm" className="!rounded-md !px-3" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</SfButton>
              {step < STEPS.length - 1 ? (
                <SfButton size="sm" className="!rounded-md !px-4" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Continue</SfButton>
              ) : (
                <SfButton size="sm" className="!rounded-md !px-4" onClick={placeOrder}><SfIconLock size="xs" /> Place Order · {formatPrice(total)}</SfButton>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-32 rounded-md border border-neutral-200 bg-white p-3.5 sm:p-4">
            <h2 className="text-base font-bold">Summary</h2>
            <div className="mt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal ({lines.length} items)</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span className="font-medium">{dFee === 0 ? "Free" : formatPrice(dFee)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Tax</span><span className="font-medium">{formatPrice(tax)}</span></div>
              <div className="my-1.5 border-t border-neutral-200" />
              <div className="flex justify-between text-sm font-bold sm:text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={classNames("block", className)}>
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
