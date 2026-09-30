/**
 * Catalog depth data layer
 * ------------------------------------------------------------------
 * Types + mock resolvers for the deeper Catalog pages: product detail
 * (variants), categories, attributes, collections and brands.
 *
 * Mirrors Odoo `product.product` (variants) / `product.public.category`
 * / `product.attribute` and Saleor's `Collection` / `Category` /
 * `ProductVariant` / `Attribute`. Swap resolvers for a real API later.
 */

/** A concrete variant under a product template. */
export interface VariantRow {
  id: string;
  sku: string;
  barcode: string;
  /** Human-readable attribute combination, e.g. "Black / 256GB". */
  attributes: string;
  price: string;
  stock: number;
  image?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  parent: string;
  products: number;
  /** Whether the category is visible in the storefront menu. */
  showInMenu: boolean;
}

export interface AttributeRow {
  id: string;
  name: string;
  /** How variants are produced from this attribute. */
  variantCreation: "Instantly" | "Dynamically" | "Never";
  values: string[];
  productTypes: number;
}

export interface CollectionRow {
  id: string;
  name: string;
  channel: string;
  products: number;
  published: boolean;
  /** Automatic (rule-based) vs manual curation. */
  type: "Automatic" | "Manual";
}

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  products: number;
  /** Total catalog value attributed to the brand. */
  revenue: number;
}

import { listAdded } from "./ops";

export async function getVariantsFor(productId: string): Promise<VariantRow[]> {
  // Check if variants were created with this product via UI
  if (typeof window !== "undefined") {
    const addedProducts = (listAdded("product.template") as any[]) || [];
    const matchedProduct = addedProducts.find((p) => p.id === productId);
    if (matchedProduct && Array.isArray(matchedProduct.variants) && matchedProduct.variants.length > 0) {
      return matchedProduct.variants.map((v: any, idx: number) => ({
        id: v.id || `V-${idx + 1}`,
        sku: v.sku || `${matchedProduct.sku}-${idx + 1}`,
        barcode: v.barcode || "",
        attributes: v.title || Object.values(v.options || {}).join(" / ") || "Standard",
        price: `৳${Number(v.price || matchedProduct.price || 0).toLocaleString("en-BD")}`,
        stock: Number(v.stock ?? 0),
        image: v.image || (matchedProduct.images && matchedProduct.images[0]) || "",
      }));
    }
  }

  // Demo variants keyed by a stable template id with real studio images
  const map: Record<string, VariantRow[]> = {
    "P-1001": [
      { id: "V1", sku: "MOB-S24U-512-BLK", barcode: "8806095309421", attributes: "Titanium Black / 512GB", price: "৳1,70,280", stock: 18, image: "/products/galaxy-s24-ultra.jpg" },
      { id: "V2", sku: "MOB-S24U-512-GRY", barcode: "8806095309438", attributes: "Titanium Grey / 512GB", price: "৳1,70,280", stock: 14, image: "/products/galaxy-s24-ultra.jpg" },
      { id: "V3", sku: "MOB-S24U-256-BLK", barcode: "8806095309407", attributes: "Titanium Black / 256GB", price: "৳1,43,880", stock: 10, image: "/products/galaxy-s24-ultra.jpg" },
    ],
    "P-1002": [
      { id: "V1", sku: "MOB-IP15P-256-NAT", barcode: "194253306721", attributes: "Natural Titanium / 256GB", price: "৳1,43,880", stock: 8, image: "/products/iphone-15-pro.jpg" },
      { id: "V2", sku: "MOB-IP15P-512-NAT", barcode: "194253306738", attributes: "Natural Titanium / 512GB", price: "৳1,65,880", stock: 5, image: "/products/iphone-15-pro.jpg" },
      { id: "V3", sku: "MOB-IP15P-256-BLU", barcode: "194253306745", attributes: "Blue Titanium / 256GB", price: "৳1,43,880", stock: 12, image: "/products/iphone-15-pro.jpg" },
      { id: "V4", sku: "MOB-IP15P-1TB-BLK", barcode: "194253306752", attributes: "Black Titanium / 1TB", price: "৳1,95,000", stock: 3, image: "/products/iphone-15-pro.jpg" },
    ],
    "P-1003": [
      { id: "V1", sku: "LAP-MBP14-M3-512", barcode: "950575505109", attributes: "Space Black / 512GB SSD / 18GB RAM", price: "৳2,63,880", stock: 6, image: "/products/macbook-pro-14.jpg" },
      { id: "V2", sku: "LAP-MBP14-M3-1TB", barcode: "950575505116", attributes: "Silver / 1TB SSD / 36GB RAM", price: "৳3,15,000", stock: 4, image: "/products/macbook-pro-14.jpg" },
    ],
    "P-1004": [
      { id: "V1", sku: "AUD-XM5-BLK", barcode: "4548736135063", attributes: "Midnight Black", price: "৳41,999", stock: 9, image: "/products/sony-wh-1000xm5.jpg" },
      { id: "V2", sku: "AUD-XM5-SLV", barcode: "4548736135070", attributes: "Platinum Silver", price: "৳41,999", stock: 14, image: "/products/sony-wh-1000xm5.jpg" },
    ],
    "P-1005": [
      { id: "V1", sku: "GAM-PS5-SLIM-DIG", barcode: "071171957726", attributes: "Digital Edition / 1TB SSD", price: "৳58,880", stock: 15, image: "/products/sony-ps5.jpg" },
      { id: "V2", sku: "GAM-PS5-SLIM-DSK", barcode: "071171957733", attributes: "Disc Edition / 1TB SSD", price: "৳65,880", stock: 12, image: "/products/sony-ps5.jpg" },
    ],
  };

  return map[productId] ?? [
    { id: "V1", sku: `${productId}-STD`, barcode: "8940001000018", attributes: "Standard Variant", price: "৳0", stock: 0, image: "/products/galaxy-s24-ultra.jpg" },
  ];
}

export async function getCategories(): Promise<CategoryNode[]> {
  const added = (typeof window !== "undefined" ? listAdded("product.category") : []) as unknown as CategoryNode[];
  const base: CategoryNode[] = [
    { id: "C1", name: "Mobiles & Tablets", parent: "—", products: 18, showInMenu: true },
    { id: "C2", name: "Smartphones", parent: "Mobiles & Tablets", products: 12, showInMenu: true },
    { id: "C3", name: "Tablets", parent: "Mobiles & Tablets", products: 6, showInMenu: true },
    { id: "C4", name: "Computing", parent: "—", products: 22, showInMenu: true },
    { id: "C5", name: "Laptops", parent: "Computing", products: 14, showInMenu: true },
    { id: "C6", name: "Audio", parent: "—", products: 9, showInMenu: true },
    { id: "C7", name: "Gaming", parent: "—", products: 15, showInMenu: true },
    { id: "C8", name: "Wearables", parent: "—", products: 7, showInMenu: false },
  ];
  return [...added, ...base];
}

export async function getAttributes(): Promise<AttributeRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("product.attribute") : []) as unknown as AttributeRow[];
  const base: AttributeRow[] = [
    { id: "A1", name: "Color", variantCreation: "Instantly", values: ["Black", "Grey", "Silver", "Blue"], productTypes: 24 },
    { id: "A2", name: "Storage", variantCreation: "Instantly", values: ["128GB", "256GB", "512GB", "1TB"], productTypes: 16 },
    { id: "A3", name: "Size", variantCreation: "Dynamically", values: ["S", "M", "L", "XL"], productTypes: 8 },
    { id: "A4", name: "Material", variantCreation: "Never", values: ["Aluminium", "Titanium", "Plastic"], productTypes: 11 },
    { id: "A5", name: "Connectivity", variantCreation: "Never", values: ["Wi-Fi", "5G", "LTE"], productTypes: 9 },
  ];
  return [...added, ...base];
}

export async function getCollections(): Promise<CollectionRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("product.collection") : []) as unknown as CollectionRow[];
  const base: CollectionRow[] = [
    { id: "CL1", name: "Flagship Smartphones", channel: "Default Channel (BDT)", products: 8, published: true, type: "Automatic" },
    { id: "CL2", name: "Back to School", channel: "Dhaka Store (BDT)", products: 15, published: true, type: "Manual" },
    { id: "CL3", name: "Gaming Zone", channel: "Default Channel (BDT)", products: 12, published: true, type: "Automatic" },
    { id: "CL4", name: "Clearance", channel: "Chattogram Store (BDT)", products: 21, published: false, type: "Automatic" },
  ];
  return [...added, ...base];
}

export async function getBrands(): Promise<BrandRow[]> {
  const added = (typeof window !== "undefined" ? listAdded("product.brand") : []) as unknown as BrandRow[];
  const base: BrandRow[] = [
    { id: "B1", name: "Samsung", slug: "samsung", products: 24, revenue: 22140000 },
    { id: "B2", name: "Apple", slug: "apple", products: 19, revenue: 38448000 },
    { id: "B3", name: "Sony", slug: "sony", products: 14, revenue: 11544000 },
    { id: "B4", name: "LG", slug: "lg", products: 8, revenue: 8892000 },
    { id: "B5", name: "Logitech", slug: "logitech", products: 11, revenue: 6156000 },
    { id: "B6", name: "OnePlus", slug: "oneplus", products: 6, revenue: 4668000 },
  ];
  return [...added, ...base];
}
