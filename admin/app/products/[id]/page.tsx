"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Barcode,
  Boxes,
  Tags,
  Store,
} from "lucide-react";
import { getProducts, type ProductRow } from "@/lib/data/products";
import { getVariantsFor, type VariantRow } from "@/lib/data/catalog";
import { useToast } from "@/components/app-feedback";

const VARIANT_COLUMNS: CentralTableColumn<VariantRow>[] = [
  {
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ value }) => <span className="text-sm font-medium text-foreground">{value}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ value }) => <span className="font-mono text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ value }) => (
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Barcode className="h-3.5 w-3.5" /> {value}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    align: "right",
    cell: ({ value }) => <span className="font-mono font-bold text-sm text-foreground">{value}</span>,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>,
  },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const appToast = useToast();
  const [product, setProduct] = useState<ProductRow | undefined>();
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);

  // When navigating between products, re-enter the loading state during render
  // (React's "adjust state on prop change" pattern) rather than a setState effect.
  const [prevId, setPrevId] = useState(params.id);
  if (prevId !== params.id) {
    setPrevId(params.id);
    setLoading(true);
  }

  useEffect(() => {
    let alive = true;
    Promise.all([getProducts(), getVariantsFor(params.id)]).then(([prods, vars]) => {
      if (alive) {
        setProduct(prods.find((p) => p.id === params.id));
        setVariants(vars);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="p-7 shadow-xs border-border/80">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Product not found</h1>
          <p className="text-sm text-muted-foreground mt-1">No product matches <span className="font-mono">{params.id}</span>.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      {/* Title & actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <Badge variant={product.status === "Active" ? "default" : "secondary"} className="text-xs font-semibold">{product.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{product.sku} · {product.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={() => appToast.info("Edit template", `Opening the editor for ${product.name}.`)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
          <Button className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all" onClick={() => appToast.success("Variant queued", `A new variant for ${product.name} was added to the draft list.`)}><Plus className="mr-2 h-4 w-4" /> Add Variant</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Variants */}
        <div className="lg:col-span-2">
          <CentralTable
            data={variants}
            columns={VARIANT_COLUMNS}
            title="Variants"
            description={`${variants.length} variant(s) — each has its own SKU, barcode, price and stock`}
            searchable={false}
            pagination={false}
          />
        </div>

        {/* Details sidebar */}
        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Tags className="h-4 w-4" /> General
            </div>
            <InfoRow label="Sales price" value={product.price} />
            <InfoRow label="Category" value={product.category} />
            <InfoRow label="Barcode" value={product.barcode || <span className="text-muted-foreground/60 italic">Not set</span>} />
            <InfoRow label="Variants" value={product.variants} />
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Boxes className="h-4 w-4" /> Inventory
            </div>
            <InfoRow label="On hand" value={product.stock} />
            <InfoRow label="Reserved" value={product.onOrder} />
            <InfoRow label="Reorder point" value={product.reorderPoint} />
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">Stock is tracked because this product is marked <span className="font-semibold">storable</span>.</p>
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Store className="h-4 w-4" /> Channel
            </div>
            <InfoRow label="Primary channel" value={product.channel} />
            <InfoRow label="Visibility" value={product.status === "Active" ? "Published" : product.status} />
          </Card>
        </div>
      </div>
    </>
  );
}
