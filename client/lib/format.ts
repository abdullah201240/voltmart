// Formatting helpers for the storefront UI.
// Currency is Bangladeshi Taka (৳) using South-Asian lakh grouping (e.g. ৳1,29,999).

const TAKA = "৳";

export function formatPrice(amount: number): string {
  return (
    TAKA +
    amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
  );
}

export function formatPriceFull(amount: number): string {
  return TAKA + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Discount percentage rounded to whole number, or null when no old price. */
export function discountPercent(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count.toLocaleString("en-IN")} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

export function classNames(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
