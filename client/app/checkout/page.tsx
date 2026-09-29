"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SfButton,
  SfInput,
  SfIconCheck,
  SfIconLock,
  SfIconPercent,
  SfIconPackage,
  SfIconCall,
  SfIconCreditCard,
  SfIconLocationOn,
  SfIconLocalShipping,
  SfIconShoppingCart,
  SfIconSafetyCheck,
  SfIconSell,
} from "@storefront-ui/react";
import { useCartLines, useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { classNames } from "@/lib/format";
import { Container, CustomSelect } from "@/components/ui";
import { ProductImage } from "@/components/ProductImage";

const DELIVERY = [
  { id: "std", name: "Standard Delivery", note: "2–3 business days", price: 0 },
  { id: "express", name: "Express Delivery", note: "Next day, before 8 PM", price: 250 },
  { id: "pickup", name: "Store Pickup", note: "Ready in 2 hours — Dhaka", price: 0 },
];

type PayKind = "card" | "mfb" | "cod";
const PAYMENTS: { id: string; label: string; kind: PayKind; icon: React.ReactNode }[] = [
  { id: "Card", label: "Card", kind: "card", icon: <SfIconCreditCard size="sm" /> },
  { id: "bKash", label: "bKash", kind: "mfb", icon: <SfIconCall size="sm" /> },
  { id: "Nagad", label: "Nagad", kind: "mfb", icon: <SfIconCall size="sm" /> },
  { id: "Cash on Delivery", label: "Cash on Delivery", kind: "cod", icon: <SfIconPackage size="sm" /> },
];

const DIVISIONS = [
  { value: "Dhaka", label: "Dhaka Division" },
  { value: "Chittagong", label: "Chittagong Division" },
  { value: "Sylhet", label: "Sylhet Division" },
  { value: "Rajshahi", label: "Rajshahi Division" },
  { value: "Khulna", label: "Khulna Division" },
  { value: "Barishal", label: "Barishal Division" },
  { value: "Rangpur", label: "Rangpur Division" },
  { value: "Mymensingh", label: "Mymensingh Division" },
];

// Working demo coupons — mirrors the cart summary coupon UX.
const COUPONS = [
  { code: "VOLT10", label: "10% off", calc: (s: number) => Math.round(s * 0.1) },
  { code: "SAVE500", label: "৳500 off", calc: (s: number) => Math.min(500, s) },
];

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartLines();
  const { subtotal, clearCart, notify } = useStore();

  const [form, setForm] = useState({ name: "Ayesha Rahman", phone: "01700-000000", email: "ayesha@example.com", address: "House 12, Road 5, Gulshan 2", city: "Dhaka", area: "Gulshan" });
  const [delivery, setDelivery] = useState("std");
  const [payment, setPayment] = useState("Card");
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);

  const payKind = PAYMENTS.find((p) => p.id === payment)?.kind ?? "card";
  const dFee = DELIVERY.find((d) => d.id === delivery)?.price ?? 0;
  const discount = applied;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + dFee + tax);
  const itemCount = lines.reduce((n, l) => n + l.item.qty, 0);
  const totalSavings = lines.reduce((s, { product, item }) => (product.oldPrice ? s + (product.oldPrice - product.price) * item.qty : s), 0);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setCardField = (k: keyof typeof card) => (e: React.ChangeEvent<HTMLInputElement>) => setCard((c) => ({ ...c, [k]: e.target.value }));

  if (lines.length === 0) {
    return (
      <Container className="py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
          <SfIconShoppingCart />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-neutral-500">Add products before checking out.</p>
        <SfButton as={Link} href="/" className="mt-6 !rounded-md">Start shopping</SfButton>
      </Container>
    );
  }

  function applyCoupon(codeArg?: string) {
    const code = (codeArg ?? coupon).trim().toUpperCase();
    const found = COUPONS.find((c) => c.code === code);
    if (found && subtotal > 0) {
      setApplied(found.calc(subtotal));
      setAppliedCode(found.code);
      setCoupon(found.code);
      setCouponError("");
      notify(`Coupon ${found.code} applied!`);
    } else {
      setApplied(0);
      setAppliedCode("");
      setCouponError(code ? `"${code}" isn't a valid coupon code` : "Type a code or tap one below");
    }
  }

  function removeCoupon() {
    setApplied(0);
    setAppliedCode("");
    setCoupon("");
    setCouponError("");
  }

  function placeOrder() {
    if (placing) return;
    setPlacing(true);
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
    setTimeout(() => {
      clearCart();
      notify("Order placed successfully!");
      router.push("/order-success");
    }, 500);
  }

  return (
    <Container className="py-4 sm:py-5 lg:py-6">
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Checkout</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-positive-50 px-2.5 py-1 text-[11px] font-semibold text-positive-700">
          <SfIconLock size="xs" /> Secure
        </span>
      </div>

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Left: all checkout sections on one page */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-7 xl:col-span-8">
          {/* Contact & Shipping */}
          <SectionCard icon={<SfIconLocationOn size="sm" />} title="Contact & Shipping" subtitle="Where should we deliver your order?">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name"><SfInput value={form.name} onChange={set("name")} className="!rounded-md" /></Field>
              <Field label="Phone"><SfInput value={form.phone} onChange={set("phone")} className="!rounded-md" /></Field>
              <Field label="Email" className="sm:col-span-2"><SfInput type="email" value={form.email} onChange={set("email")} className="!rounded-md" /></Field>
              <Field label="Street address" className="sm:col-span-2"><SfInput value={form.address} onChange={set("address")} className="!rounded-md" /></Field>
              <Field label="Division / Region">
                <CustomSelect value={form.city} onChange={(val) => setForm((f) => ({ ...f, city: val }))} options={DIVISIONS} className="w-full" size="sm" />
              </Field>
              <Field label="Area / Thana"><SfInput value={form.area} onChange={set("area")} className="!rounded-md" /></Field>
            </div>
          </SectionCard>

          {/* Delivery method */}
          <SectionCard icon={<SfIconLocalShipping size="sm" />} title="Delivery Method" subtitle="Choose how you want to receive it">
            <div className="flex flex-col gap-2.5">
              {DELIVERY.map((d) => {
                const selected = delivery === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDelivery(d.id)}
                    className={classNames(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                      selected ? "border-primary-600 bg-primary-50/60 ring-1 ring-primary-600" : "border-neutral-200 hover:border-neutral-300",
                    )}
                  >
                    <RadioDot checked={selected} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900">{d.name}</p>
                      <p className="text-xs text-neutral-500">{d.note}</p>
                    </div>
                    <span className={classNames("shrink-0 text-sm font-bold", d.price === 0 ? "text-positive-700" : "text-neutral-900")}>
                      {d.price === 0 ? "Free" : formatPrice(d.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Payment method */}
          <SectionCard icon={<SfIconCreditCard size="sm" />} title="Payment" subtitle="Pay securely with your preferred method">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENTS.map((p) => {
                const selected = payment === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPayment(p.id)}
                    className={classNames(
                      "flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center text-xs font-semibold transition sm:text-[13px]",
                      selected ? "border-primary-600 bg-primary-50 text-primary-800 ring-1 ring-primary-600" : "border-neutral-200 text-neutral-700 hover:border-neutral-300",
                    )}
                  >
                    <span className={selected ? "text-primary-700" : "text-neutral-400"}>{p.icon}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>

            {payKind === "card" && (
              <div className="mt-4 grid gap-3 rounded-lg bg-neutral-50 p-3.5 sm:grid-cols-2">
                <Field label="Card number" className="sm:col-span-2"><SfInput inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={setCardField("number")} className="!rounded-md" /></Field>
                <Field label="Name on card" className="sm:col-span-2"><SfInput placeholder="Ayesha Rahman" value={card.holder} onChange={setCardField("holder")} className="!rounded-md" /></Field>
                <Field label="Expiry"><SfInput placeholder="MM / YY" value={card.expiry} onChange={setCardField("expiry")} className="!rounded-md" /></Field>
                <Field label="CVV"><SfInput inputMode="numeric" placeholder="123" value={card.cvv} onChange={setCardField("cvv")} className="!rounded-md" /></Field>
              </div>
            )}

            {payKind === "mfb" && (
              <div className="mt-4 space-y-3 rounded-lg bg-neutral-50 p-3.5">
                <Field label={`${payment} account number`}><SfInput inputMode="tel" placeholder="01XXXXXXXXX" wrapperClassName="max-w-xs" /></Field>
                <p className="flex items-start gap-1.5 text-xs text-neutral-500">
                  <SfIconSafetyCheck size="xs" className="mt-0.5 shrink-0 text-primary-600" />
                  You&apos;ll receive an OTP on your mobile to confirm the {payment} payment.
                </p>
              </div>
            )}

            {payKind === "cod" && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-50 p-3.5 text-xs text-neutral-600">
                <SfIconPackage size="sm" className="mt-0.5 shrink-0 text-primary-600" />
                <span>Please have the exact amount ready when our courier arrives. Cash on delivery is available nationwide.</span>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: sticky order summary */}
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-36">
            <div className="overflow-hidden rounded-md border border-neutral-200/90 bg-white">
              {/* Brand header band */}
              <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-4 py-4 sm:px-5">
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-1.5 font-headings text-base font-bold tracking-tight text-white lg:text-lg">
                      <SfIconShoppingCart size="sm" />
                      Order Summary
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-white/80">Review your total before placing the order</p>
                  </div>
                  <span className="rounded-xs bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white ring-1 ring-white/30">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {/* Line items */}
                <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                  {lines.map(({ item, product, lineTotal }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <ProductImage category={product.category} tone={product.tone} name={product.name} src={product.image} className="h-12 w-12" rounded="rounded-md" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">{item.qty}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                        <p className="text-[11px] text-neutral-500">{formatPrice(product.price)} each</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">{formatPrice(lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-5 border-t border-dashed border-neutral-200" />

                {/* Coupon */}
                {appliedCode && applied > 0 ? (
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-positive-300 bg-positive-50 px-4 py-3">
                    <span className="flex items-center gap-3 text-xs text-positive-800">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-positive-600 text-white">
                        <SfIconPercent size="sm" />
                      </span>
                      <span className="leading-tight">
                        <span className="block font-bold">{appliedCode} applied</span>
                        <span className="block font-normal text-positive-700">You save {formatPrice(applied)}</span>
                      </span>
                    </span>
                    <button type="button" onClick={removeCoupon} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:bg-white hover:text-negative-600">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      <SfIconSell size="xs" className="text-primary-600" /> Have a coupon?
                    </label>
                    <div className="relative">
                      <SfInput
                        value={coupon}
                        onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") applyCoupon(); }}
                        placeholder="Enter code"
                        aria-label="Coupon code"
                        className={classNames("!rounded-xl pr-[86px]", couponError && "!border-negative-400 ring-1 ring-negative-100")}
                      />
                      <SfButton size="sm" className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 !rounded-lg !px-4 text-xs font-bold" onClick={() => applyCoupon()}>
                        Apply
                      </SfButton>
                    </div>
                    {couponError ? (
                      <p className="mt-1.5 text-[11px] font-semibold text-negative-600">{couponError}</p>
                    ) : (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {COUPONS.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => applyCoupon(c.code)}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-neutral-50 py-1 pl-2.5 pr-3 text-[11px] font-bold text-neutral-600 transition-colors hover:border-primary-500 hover:bg-primary-50 hover:text-primary-800"
                          >
                            <SfIconPercent size="xs" className="text-primary-600" />
                            {c.code}
                            <span className="font-medium text-neutral-400 transition-colors group-hover:text-primary-600">· {c.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="my-5 border-t border-dashed border-neutral-200" />

                {/* Cost breakdown */}
                <dl className="space-y-3.5 text-sm">
                  <Row label="Subtotal" value={formatPrice(subtotal)} hint={`${itemCount} ${itemCount === 1 ? "item" : "items"}`} />
                  {discount > 0 && <Row label="Discount" value={`− ${formatPrice(discount)}`} hint={appliedCode} tone="positive" />}
                  <Row label="Delivery" value={dFee === 0 ? "FREE" : formatPrice(dFee)} tone={dFee === 0 ? "positive" : undefined} />
                  <Row label="VAT (5%)" value={formatPrice(tax)} />
                </dl>

                {/* Total block */}
                <div className="mt-4 flex items-center justify-between rounded-md bg-primary-50 px-3.5 py-3 ring-1 ring-primary-100">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-primary-700">Total Payable</p>
                    <p className="mt-0.5 text-[11px] font-medium text-neutral-500">Incl. VAT &amp; delivery</p>
                  </div>
                  <span className="font-headings text-xl font-extrabold leading-none text-primary-800 sm:text-2xl">{formatPrice(total)}</span>
                </div>

                {totalSavings + discount > 0 && (
                  <p className="mt-2.5 flex items-center justify-center gap-1.5 rounded-sm bg-positive-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    <SfIconCheck size="xs" /> You&apos;re saving {formatPrice(totalSavings + discount)} on this order
                  </p>
                )}

                {/* CTA */}
                <SfButton size="base" className="mt-4 w-full !rounded-md font-bold" disabled={placing} onClick={placeOrder}>
                  <SfIconLock size="sm" /> {placing ? "Placing order…" : `Place Order · ${formatPrice(total)}`}
                </SfButton>

                {/* Trust */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-[11px] font-medium text-neutral-500">
                  <p className="flex items-center gap-1.5"><SfIconLock size="xs" className="text-primary-600" /> Secure payment</p>
                  <p className="flex items-center gap-1.5"><SfIconSafetyCheck size="xs" className="text-primary-600" /> 100% authentic</p>
                  <p className="flex items-center gap-1.5"><SfIconLocalShipping size="xs" className="text-primary-600" /> 24–72h delivery</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-neutral-900">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span className={classNames("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition", checked ? "border-primary-600" : "border-neutral-300")}>
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
    </span>
  );
}

function Row({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-baseline gap-1.5 text-neutral-500">
        {label}
        {hint && <span className="text-[10px] font-medium text-neutral-400">{hint}</span>}
      </dt>
      <dd className={classNames("font-semibold tabular-nums", tone === "positive" ? "text-positive-700" : "text-neutral-900")}>{value}</dd>
    </div>
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
