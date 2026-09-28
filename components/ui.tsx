import Link from "next/link";
import { SfButton, SfIconChevronRight, SfIconSafetyCheck, SfIconLocalShipping, SfIconPublishedWithChanges, SfIconLock, SfIconCall, SfIconStarFilled } from "@storefront-ui/react";
import { classNames } from "@/lib/format";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames("mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6", className)}>{children}</div>;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  dark = false,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  dark?: boolean;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2.5">
      <div>
        <h2 className={classNames("text-lg font-bold tracking-tight sm:text-xl lg:text-2xl", dark ? "text-white" : "text-neutral-900")}>
          {title}
        </h2>
        {subtitle && <p className={classNames("mt-0.5 text-xs lg:text-sm", dark ? "text-neutral-300" : "text-neutral-500")}>{subtitle}</p>}
      </div>
      {href && (
        <SfButton as={Link} href={href} variant={dark ? "tertiary" : "primary"} size="sm" className={classNames("hidden shrink-0 !rounded-md !px-2.5 !py-1 text-xs sm:inline-flex lg:!px-3 lg:!py-1.5 lg:text-sm", dark && "!text-white")}>
          {linkLabel}
          <SfIconChevronRight size="xs" />
        </SfButton>
      )}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-neutral-500 lg:text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          {item.href ? (
            <Link href={item.href} className="hover:text-neutral-900">{item.label}</Link>
          ) : (
            <span className="font-medium text-neutral-900">{item.label}</span>
          )}
          {i < items.length - 1 && <SfIconChevronRight size="xs" className="text-neutral-300" />}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center">
      {icon && <div className="text-neutral-300 [&>svg]:h-10 [&>svg]:w-10">{icon}</div>}
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="max-w-sm text-xs text-neutral-500">{description}</p>
      {actionLabel && actionHref && (
        <SfButton as={Link} href={actionHref} size="sm" className="mt-1 !rounded-md">
          {actionLabel}
        </SfButton>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-2.5">
      <div className="aspect-square w-full animate-pulse rounded-sm bg-neutral-100" />
      <div className="h-2.5 w-1/3 animate-pulse rounded-xs bg-neutral-100" />
      <div className="h-3.5 w-3/4 animate-pulse rounded-xs bg-neutral-100" />
      <div className="h-3.5 w-1/2 animate-pulse rounded-xs bg-neutral-100" />
      <div className="mt-1.5 h-8 w-full animate-pulse rounded-md bg-neutral-100" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 sm:gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

const TRUST = [
  { icon: <SfIconSafetyCheck />, label: "Official Warranty", note: "100% authentic products" },
  { icon: <SfIconLocalShipping />, label: "Fast Delivery", note: "Nationwide in 24–72h" },
  { icon: <SfIconPublishedWithChanges />, label: "Easy Returns", note: "7-day hassle-free" },
  { icon: <SfIconLock />, label: "Secure Payment", note: "Card, bKash, COD" },
  { icon: <SfIconCall />, label: "Expert Support", note: "7 days a week" },
];

export function TrustSection({ dark = false }: { dark?: boolean }) {
  return (
    <section className={classNames("rounded-md border", dark ? "border-primary-200/80 bg-gradient-to-br from-primary-50/70 via-white to-emerald-50/70" : "border-neutral-200 bg-white")}>
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 sm:p-3.5 lg:grid-cols-5 sm:gap-3">
        {TRUST.map((t) => (
          <div key={t.label} className="flex flex-col items-center gap-1 text-center">
            <div className={classNames("flex h-8 w-8 items-center justify-center rounded-md [&>svg]:h-4 [&>svg]:w-4", dark ? "bg-primary-100 text-primary-800" : "bg-primary-50 text-primary-700")}>
              {t.icon}
            </div>
            <p className="text-xs font-bold text-neutral-900 lg:text-sm">{t.label}</p>
            <p className="text-[10px] text-neutral-500 lg:text-xs">{t.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-warning-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <SfIconStarFilled key={i} size="xs" className={i < Math.round(value) ? "text-warning-500" : "text-neutral-200"} />
      ))}
    </span>
  );
}

export { CustomSelect, type SelectOption, type CustomSelectProps } from "./CustomSelect";

