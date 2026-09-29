"use client";

import { useStore } from "@/lib/store";
import { getProduct, PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { Container } from "@/components/ui";

export function RecentlyViewed() {
  const { recent } = useStore();
  const viewed = recent.map(getProduct).filter(Boolean).slice(0, 4);
  const fallback = PRODUCTS.slice(0, 4);
  const list = viewed.length > 0 ? (viewed as NonNullable<ReturnType<typeof getProduct>>[]) : fallback;
  return (
    <Container className="py-4 sm:py-5">
      <h2 className="mb-3 text-lg sm:text-xl font-bold tracking-tight">{viewed.length ? "Recently Viewed" : "Recommended for you"}</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </Container>
  );
}
