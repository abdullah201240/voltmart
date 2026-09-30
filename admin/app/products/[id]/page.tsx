"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Image as ImageIcon,
  Upload,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  Save,
} from "lucide-react";
import { getProducts, type ProductRow } from "@/lib/data/products";
import { getVariantsFor, type VariantRow } from "@/lib/data/catalog";
import { useToast, useConfirm } from "@/components/app-feedback";
import { patchFields } from "@/lib/data/ops";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

function generateGtin13Barcode(): string {
  const prefix = "894"; // GS1 Bangladesh
  let middle = "";
  for (let i = 0; i < 9; i++) {
    middle += Math.floor(Math.random() * 10).toString();
  }
  const digits = (prefix + middle).split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += i % 2 === 0 ? digits[i] * 1 : digits[i] * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return prefix + middle + checkDigit.toString();
}

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
  const router = useRouter();
  const appToast = useToast();
  const confirm = useConfirm();

  const [product, setProduct] = useState<ProductRow | undefined>();
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Modals state
  const [imagePickerVariantId, setImagePickerVariantId] = useState<string | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantRow | null>(null);

  // Edit Product state
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState<ProductRow["status"]>("Active");
  const [editReorderPoint, setEditReorderPoint] = useState(10);

  // Add / Edit Variant state
  const [variantFormAttributes, setVariantFormAttributes] = useState("");
  const [variantFormSku, setVariantFormSku] = useState("");
  const [variantFormBarcode, setVariantFormBarcode] = useState("");
  const [variantFormPrice, setVariantFormPrice] = useState("");
  const [variantFormStock, setVariantFormStock] = useState("");
  const [variantFormImage, setVariantFormImage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When navigating between products, re-enter loading state
  const [prevId, setPrevId] = useState(params.id);
  if (prevId !== params.id) {
    setPrevId(params.id);
    setLoading(true);
  }

  useEffect(() => {
    let alive = true;
    Promise.all([getProducts(), getVariantsFor(params.id)]).then(([prods, vars]) => {
      if (alive) {
        const found = prods.find((p) => p.id === params.id);
        setProduct(found);
        setVariants(vars);

        // Gather all gallery images: product images + variant images
        const imgs = new Set<string>();
        if (found?.images) found.images.forEach((img) => imgs.add(img));
        vars.forEach((v) => {
          if (v.image) imgs.add(v.image);
        });
        if (imgs.size === 0) {
          imgs.add("/products/galaxy-s24-ultra.jpg");
        }
        setGalleryImages(Array.from(imgs));

        if (found) {
          setEditName(found.name);
          setEditPrice(String(found.priceValue || 0));
          setEditCategory(found.category);
          setEditStatus(found.status);
          setEditReorderPoint(found.reorderPoint || 10);
        }

        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [params.id]);

  // Handle Master Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      newUrls.push(URL.createObjectURL(files[i]));
    }

    setGalleryImages((prev) => [...prev, ...newUrls]);
    appToast.success("Images Added", `${files.length} image(s) added to product gallery.`);
  };

  // Assign image to variant
  const handleAssignImageToVariant = (imgUrl: string) => {
    if (!imagePickerVariantId) return;

    setVariants((prev) =>
      prev.map((v) => (v.id === imagePickerVariantId ? { ...v, image: imgUrl } : v))
    );
    appToast.success("Variant Image Updated", "Linked photo to selected SKU variant.");
    setImagePickerVariantId(null);
  };

  // Apply variant image to all variants of same color/attribute prefix
  const handleApplyToAllMatching = (imgUrl: string) => {
    if (!imagePickerVariantId) return;
    const current = variants.find((v) => v.id === imagePickerVariantId);
    if (!current) return;

    const mainAttr = current.attributes.split("/")[0].trim().toLowerCase();
    setVariants((prev) =>
      prev.map((v) => {
        const vAttr = v.attributes.split("/")[0].trim().toLowerCase();
        if (vAttr === mainAttr) {
          return { ...v, image: imgUrl };
        }
        return v;
      })
    );

    appToast.success(
      "Applied to Matching Variants",
      `Image assigned to all "${current.attributes.split("/")[0].trim()}" variants.`
    );
    setImagePickerVariantId(null);
  };

  // Open Edit Product Drawer
  const handleOpenEditProduct = () => {
    if (!product) return;
    setEditName(product.name);
    setEditPrice(String(product.priceValue || 0));
    setEditCategory(product.category);
    setEditStatus(product.status);
    setEditReorderPoint(product.reorderPoint || 10);
    setIsEditProductOpen(true);
  };

  // Save Edit Product
  const handleSaveEditProduct = () => {
    if (!product) return;
    const priceNum = parseFloat(editPrice) || 0;

    const updatedProduct: ProductRow = {
      ...product,
      name: editName,
      price: `৳${priceNum.toLocaleString("en-BD")}`,
      priceValue: priceNum,
      category: editCategory,
      status: editStatus,
      reorderPoint: editReorderPoint,
      images: galleryImages,
    };

    setProduct(updatedProduct);
    patchFields("product.template", product.id, {
      name: editName,
      price: priceNum,
      category: editCategory,
      isActive: editStatus === "Active",
      reorderPoint: editReorderPoint,
      images: galleryImages,
    });

    appToast.success("Product Updated", `Changes to ${editName} saved.`);
    setIsEditProductOpen(false);
  };

  // Open Add Variant Modal
  const handleOpenAddVariant = () => {
    setVariantFormAttributes("");
    const catCode = (product?.category || "PROD").slice(0, 3).toUpperCase();
    const randCode = Math.floor(100 + Math.random() * 900);
    setVariantFormSku(`VM-${catCode}-${randCode}`);
    setVariantFormBarcode(generateGtin13Barcode());
    setVariantFormPrice(String(product?.priceValue || ""));
    setVariantFormStock("10");
    setVariantFormImage(galleryImages[0] || "");
    setEditingVariant(null);
    setIsAddVariantOpen(true);
  };

  // Open Edit Single Variant
  const handleOpenEditVariant = (variant: VariantRow) => {
    setEditingVariant(variant);
    setVariantFormAttributes(variant.attributes);
    setVariantFormSku(variant.sku);
    setVariantFormBarcode(variant.barcode);
    setVariantFormPrice(variant.price.replace(/[^0-9.]/g, ""));
    setVariantFormStock(String(variant.stock));
    setVariantFormImage(variant.image || galleryImages[0] || "");
    setIsAddVariantOpen(true);
  };

  // Save Variant (Create or Edit)
  const handleSaveVariant = () => {
    if (!variantFormAttributes.trim()) {
      appToast.error("Missing Attributes", "Provide attribute specs (e.g. 'Silver / 256GB').");
      return;
    }
    if (!variantFormSku.trim()) {
      appToast.error("Missing SKU", "A unique SKU identifier is required.");
      return;
    }

    const priceNum = parseFloat(variantFormPrice) || (product?.priceValue ?? 0);
    const stockNum = parseInt(variantFormStock, 10) || 0;

    if (editingVariant) {
      // Update existing
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editingVariant.id
            ? {
                ...v,
                attributes: variantFormAttributes.trim(),
                sku: variantFormSku.trim(),
                barcode: variantFormBarcode.trim(),
                price: `৳${priceNum.toLocaleString("en-BD")}`,
                stock: stockNum,
                image: variantFormImage,
              }
            : v
        )
      );
      appToast.success("Variant Updated", `SKU ${variantFormSku} has been updated.`);
    } else {
      // Add new
      const newVar: VariantRow = {
        id: `V-${Date.now()}`,
        attributes: variantFormAttributes.trim(),
        sku: variantFormSku.trim(),
        barcode: variantFormBarcode.trim(),
        price: `৳${priceNum.toLocaleString("en-BD")}`,
        stock: stockNum,
        image: variantFormImage || galleryImages[0] || "",
      };
      setVariants((prev) => [...prev, newVar]);
      if (product) {
        setProduct((prev) => (prev ? { ...prev, variants: prev.variants + 1 } : prev));
      }
      appToast.success("Variant Created", `Added SKU ${variantFormSku} to product.`);
    }

    setIsAddVariantOpen(false);
  };

  // Delete Variant
  const handleDeleteVariant = async (variant: VariantRow) => {
    const allowed = await confirm({
      title: `Delete Variant ${variant.sku}?`,
      description: `This will remove ${variant.attributes} (${variant.sku}) from this product catalog.`,
      tone: "destructive",
      confirmLabel: "Delete Variant",
    });
    if (!allowed) return;

    setVariants((prev) => prev.filter((v) => v.id !== variant.id));
    if (product) {
      setProduct((prev) => (prev ? { ...prev, variants: Math.max(1, prev.variants - 1) } : prev));
    }
    appToast.success("Variant Removed", `${variant.sku} was deleted.`);
  };

  // Copy to clipboard helper
  const copyText = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      appToast.info("Copied", `${label} copied to clipboard.`);
    }
  };

  const VARIANT_COLUMNS: CentralTableColumn<VariantRow>[] = [
    {
      accessorKey: "image",
      header: "Photo",
      cell: ({ row }) => {
        const img = row.image || galleryImages[0] || "/products/galaxy-s24-ultra.jpg";
        return (
          <button
            type="button"
            onClick={() => setImagePickerVariantId(row.id)}
            title="Click to assign or change variant photo"
            className="group relative h-12 w-12 rounded-md border border-border/80 bg-muted overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all flex items-center justify-center shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={row.attributes} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ImageIcon className="h-4 w-4 text-white" />
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "attributes",
      header: "Attributes & Title",
      sortable: true,
      cell: ({ value }) => (
        <div className="font-semibold text-sm text-foreground">
          {value}
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      sortable: true,
      cell: ({ value }) => (
        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/60">
          <span>{value}</span>
          <button
            type="button"
            onClick={() => copyText(value, "SKU")}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "barcode",
      header: "Barcode (GTIN-13)",
      cell: ({ value }) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Barcode className="h-3.5 w-3.5" /> {value || "—"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      sortable: true,
      align: "right",
      cell: ({ value }) => (
        <span className="font-mono font-bold text-sm text-foreground">{value}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      sortable: true,
      align: "right",
      cell: ({ value }) => {
        const num = Number(value);
        return (
          <span
            className={`font-mono text-sm font-semibold tabular-nums px-2 py-0.5 rounded-full ${
              num > 5
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : num > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {value} in stock
          </span>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Actions",
      align: "right",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditVariant(row)}
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Edit Variant"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteVariant(row)}
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-rose-500"
            title="Delete Variant"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 w-full">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card className="p-7 shadow-xs border-border/80">
          <div className="h-40 animate-pulse rounded bg-muted" />
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4 w-full">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <Card className="p-10 text-center shadow-xs border-border/80">
          <h1 className="text-xl font-semibold">Product not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            No product matches <span className="font-mono">{params.id}</span>.
          </p>
        </Card>
      </div>
    );
  }

  const currentVariantForImage = variants.find((v) => v.id === imagePickerVariantId);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-3 text-xs font-semibold cursor-pointer"
          >
            <a
              href={`http://localhost:3000/product/${product.id.toLowerCase()}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View on Storefront
            </a>
          </Button>
        </div>
      </div>

      {/* Title & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
            <Badge
              variant={product.status === "Active" ? "default" : "secondary"}
              className="text-xs font-semibold"
            >
              {product.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {product.sku} · {product.category} · {variants.length} Variants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleOpenEditProduct}
            className="h-10 px-4 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Details
          </Button>
          <Button
            onClick={handleOpenAddVariant}
            className="h-10 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Variant
          </Button>
        </div>
      </div>

      {/* Product Media Gallery Strip */}
      <div className="rounded-lg border border-border/80 bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Product Media Gallery ({galleryImages.length})
            </h2>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 text-xs font-semibold cursor-pointer"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Media
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative h-20 w-20 shrink-0 rounded-md border border-border/80 bg-muted overflow-hidden shadow-2xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Gallery item ${idx + 1}`} className="h-full w-full object-cover" />
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] font-bold text-white px-1 rounded-xs">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3 w-full">
        {/* Left 2 Cols: Variants Matrix Table */}
        <div className="lg:col-span-2 space-y-4">
          <CentralTable
            data={variants}
            columns={VARIANT_COLUMNS}
            title="Product Variants & SKU Matrix"
            description={`${variants.length} variant(s) — click any photo to assign variant images`}
            searchable={false}
            pagination={false}
          />
        </div>

        {/* Right 1 Col: General, Inventory & Channel Details */}
        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Tags className="h-4 w-4" /> General
            </div>
            <InfoRow label="Base price" value={product.price} />
            <InfoRow label="Category" value={product.category} />
            <InfoRow
              label="Default Barcode"
              value={
                product.barcode || (
                  <span className="text-muted-foreground/60 italic">Not set</span>
                )
              }
            />
            <InfoRow label="Total Variants" value={variants.length} />
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Boxes className="h-4 w-4" /> Inventory
            </div>
            <InfoRow
              label="Total on-hand"
              value={variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)}
            />
            <InfoRow label="Reserved" value={product.onOrder} />
            <InfoRow label="Reorder point" value={product.reorderPoint} />
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground">
              Stock is tracked per variant SKU because this product is marked{" "}
              <span className="font-semibold">storable</span>.
            </p>
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Store className="h-4 w-4" /> Channel
            </div>
            <InfoRow label="Primary channel" value={product.channel} />
            <InfoRow
              label="Visibility"
              value={product.status === "Active" ? "Published" : product.status}
            />
          </Card>
        </div>
      </div>

      {/* Variant Image Assignment Modal */}
      <BaseDialog.Root
        open={!!imagePickerVariantId}
        onOpenChange={(open) => !open && setImagePickerVariantId(null)}
      >
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
        <BaseDialog.Portal>
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/80 bg-card p-6 shadow-2xl focus:outline-hidden">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <BaseDialog.Title className="text-lg font-bold text-foreground">
                  Assign Variant Image
                </BaseDialog.Title>
                <BaseDialog.Description className="text-xs text-muted-foreground">
                  Select a photo for variant:{" "}
                  <span className="font-semibold text-foreground">
                    {currentVariantForImage?.attributes}
                  </span>
                </BaseDialog.Description>
              </div>
              <BaseDialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </BaseDialog.Close>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                {galleryImages.map((img, idx) => {
                  const isSelected = currentVariantForImage?.image === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAssignImageToVariant(img)}
                      className={`group relative aspect-square rounded-lg border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary"
                          : "border-border/80 hover:border-primary/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Pick ${idx + 1}`} className="h-full w-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {currentVariantForImage?.image && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Bulk shortcut for this attribute:
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyToAllMatching(currentVariantForImage.image!)}
                    className="text-xs cursor-pointer"
                  >
                    Apply to all &quot;{currentVariantForImage.attributes.split("/")[0].trim()}&quot; variants
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                variant="outline"
                onClick={() => setImagePickerVariantId(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>

      {/* Edit Product Details Modal */}
      <BaseDialog.Root open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
        <BaseDialog.Portal>
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/80 bg-card p-6 shadow-2xl focus:outline-hidden">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <BaseDialog.Title className="text-lg font-bold text-foreground">
                Edit Product Template
              </BaseDialog.Title>
              <BaseDialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </BaseDialog.Close>
            </div>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Product Title</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Base Sales Price (৳)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground cursor-pointer"
                  >
                    <option value="Active">Active (Published)</option>
                    <option value="Draft">Draft (Hidden)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Reorder Point</label>
                  <input
                    type="number"
                    value={editReorderPoint}
                    onChange={(e) => setEditReorderPoint(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                variant="outline"
                onClick={() => setIsEditProductOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEditProduct} className="cursor-pointer">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>

      {/* Add / Edit Variant Modal */}
      <BaseDialog.Root open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
        <BaseDialog.Portal>
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border/80 bg-card p-6 shadow-2xl focus:outline-hidden">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <BaseDialog.Title className="text-lg font-bold text-foreground">
                {editingVariant ? `Edit Variant (${editingVariant.sku})` : "Add New Variant"}
              </BaseDialog.Title>
              <BaseDialog.Close className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </BaseDialog.Close>
            </div>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Attribute Values (e.g. Color / Storage / Finish)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Titanium Blue / 1TB"
                  value={variantFormAttributes}
                  onChange={(e) => setVariantFormAttributes(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">SKU Identifier</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cat = (product?.category || "CAT").slice(0, 3).toUpperCase();
                        const tag = variantFormAttributes
                          .replace(/[^a-zA-Z0-9]/g, "-")
                          .toUpperCase()
                          .slice(0, 10);
                        setVariantFormSku(`VM-${cat}-${tag || Date.now().toString().slice(-4)}`);
                      }}
                      className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Auto SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    value={variantFormSku}
                    onChange={(e) => setVariantFormSku(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">GS1 Barcode</label>
                    <button
                      type="button"
                      onClick={() => setVariantFormBarcode(generateGtin13Barcode())}
                      className="text-[10px] text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Auto GTIN
                    </button>
                  </div>
                  <input
                    type="text"
                    value={variantFormBarcode}
                    onChange={(e) => setVariantFormBarcode(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Variant Price (৳)</label>
                  <input
                    type="number"
                    value={variantFormPrice}
                    onChange={(e) => setVariantFormPrice(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Initial Stock</label>
                  <input
                    type="number"
                    value={variantFormStock}
                    onChange={(e) => setVariantFormStock(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Variant Photo</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVariantFormImage(img)}
                      className={`h-12 w-12 rounded-md border overflow-hidden shrink-0 cursor-pointer transition-all ${
                        variantFormImage === img
                          ? "border-primary ring-2 ring-primary"
                          : "border-border/80 hover:border-primary/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Select" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                variant="outline"
                onClick={() => setIsAddVariantOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveVariant} className="cursor-pointer">
                <Save className="mr-2 h-4 w-4" /> Save Variant
              </Button>
            </div>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    </div>
  );
}
