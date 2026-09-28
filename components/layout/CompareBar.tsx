"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SfButton, SfIconCompareArrows, SfIconClose } from "@storefront-ui/react";
import { useStore } from "@/lib/store";
import { getProduct } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";

export function CompareBar() {
  const { compare, toggleCompare } = useStore();
  const router = useRouter();
  const [min, setMin] = useState(false);
  if (compare.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 px-3 lg:bottom-4">
      <div className="mx-auto flex max-w-3xl items-center gap-2.5 rounded-md border border-neutral-200 bg-white p-2.5 shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 sm:text-sm">
          <SfIconCompareArrows size="xs" className="text-primary-600" />
          Compare
        </div>
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {compare.map((id) => {
            const p = getProduct(id);
            if (!p) return null;
            return (
              <div key={id} className={`relative shrink-0 ${min ? "hidden sm:block" : ""}`}>
                <ProductImage category={p.category} tone={p.tone} name={p.name} src={p.image} className="h-12 w-12" rounded="rounded-md" />
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() => toggleCompare(id)}
                  className="absolute -right-1 -top-1 rounded-full bg-neutral-600 p-0.5 text-white transition hover:bg-neutral-800"
                >
                  <SfIconClose size="xs" />
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => setMin((m) => !m)} className="hidden text-xs text-neutral-500 hover:text-neutral-800 sm:block">
          {min ? "Show" : "Hide"}
        </button>
        <SfButton size="sm" onClick={() => router.push("/compare")}>
          Compare ({compare.length})
        </SfButton>
      </div>
    </div>
  );
}
