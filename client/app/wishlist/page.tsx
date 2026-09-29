"use client";

import Link from "next/link";
import { SfButton, SfIconFavorite } from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Container, EmptyState } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter((p) => !!p);

  return (
    <Container className="py-4 sm:py-5">
      <h1 className="mb-0.5 text-2xl font-bold tracking-tight sm:text-3xl">My Wishlist</h1>
      <p className="mb-4 text-xs sm:text-sm text-neutral-500">{items.length} saved product(s)</p>

      {items.length === 0 ? (
        <EmptyState
          icon={<SfIconFavorite />}
          title="Save products you love"
          description="Tap the heart on any product to add it here and track price drops."
          actionLabel="Explore products"
          actionHref="/category/mobiles"
        />
      ) : (
        <>
          {items.some((p) => p!.oldPrice) && (
            <div className="mb-3 rounded-md border border-positive-200 bg-positive-50/70 px-3 py-2 text-xs sm:text-sm text-positive-800">
              🎉 Price dropped on {items.filter((p) => p!.oldPrice).length} item(s) — up to {formatPrice(items.reduce((m, p) => Math.max(m, (p!.oldPrice ?? 0) - p!.price), 0))} saved
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-4">
            <SfButton as={Link} href="/cart" variant="secondary" size="sm" className="!rounded-md">Go to cart</SfButton>
          </div>
        </>
      )}
    </Container>
  );
}
