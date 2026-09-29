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

export async function getVariantsFor(productId: string): Promise<VariantRow[]> {
  // Demo variants keyed by a stable template id; real resolver = one query.
  const map: Record<string, VariantRow[]> = {
    "P-1001": [
      { id: "V1", sku: "MOB-S24U-512-BLK", barcode: "8806095309421", attributes: "Titanium Black / 512GB", price: "৳1,70,280", stock: 18 },
      { id: "V2", sku: "MOB-S24U-512-GRY", barcode: "8806095309438", attributes: "Titanium Grey / 512GB", price: "৳1,70,280", stock: 14 },
      { id: "V3", sku: "MOB-S24U-256-BLK", barcode: "8806095309407", attributes: "Titanium Black / 256GB", price: "৳1,43,880", stock: 10 },
    ],
  };
  return map[productId] ?? [
    { id: "V1", sku: `${productId}-STD`, barcode: "0000000000000", attributes: "Default", price: "৳0", stock: 0 },
  ];
}

export async function getCategories(): Promise<CategoryNode[]> {
  return [
    { id: "C1", name: "Mobiles & Tablets", parent: "—", products: 18, showInMenu: true },
    { id: "C2", name: "Smartphones", parent: "Mobiles & Tablets", products: 12, showInMenu: true },
    { id: "C3", name: "Tablets", parent: "Mobiles & Tablets", products: 6, showInMenu: true },
    { id: "C4", name: "Computing", parent: "—", products: 22, showInMenu: true },
    { id: "C5", name: "Laptops", parent: "Computing", products: 14, showInMenu: true },
    { id: "C6", name: "Audio", parent: "—", products: 9, showInMenu: true },
    { id: "C7", name: "Gaming", parent: "—", products: 15, showInMenu: true },
    { id: "C8", name: "Wearables", parent: "—", products: 7, showInMenu: false },
  ];
}

export async function getAttributes(): Promise<AttributeRow[]> {
  return [
    { id: "A1", name: "Color", variantCreation: "Instantly", values: ["Black", "Grey", "Silver", "Blue"], productTypes: 24 },
    { id: "A2", name: "Storage", variantCreation: "Instantly", values: ["128GB", "256GB", "512GB", "1TB"], productTypes: 16 },
    { id: "A3", name: "Size", variantCreation: "Dynamically", values: ["S", "M", "L", "XL"], productTypes: 8 },
    { id: "A4", name: "Material", variantCreation: "Never", values: ["Aluminium", "Titanium", "Plastic"], productTypes: 11 },
    { id: "A5", name: "Connectivity", variantCreation: "Never", values: ["Wi-Fi", "5G", "LTE"], productTypes: 9 },
  ];
}

export async function getCollections(): Promise<CollectionRow[]> {
  return [
    { id: "CL1", name: "Flagship Smartphones", channel: "Default Channel (BDT)", products: 8, published: true, type: "Automatic" },
    { id: "CL2", name: "Back to School", channel: "Dhaka Store (BDT)", products: 15, published: true, type: "Manual" },
    { id: "CL3", name: "Gaming Zone", channel: "Default Channel (BDT)", products: 12, published: true, type: "Automatic" },
    { id: "CL4", name: "Clearance", channel: "Chattogram Store (BDT)", products: 21, published: false, type: "Automatic" },
  ];
}

export async function getBrands(): Promise<BrandRow[]> {
  return [
    { id: "B1", name: "Samsung", slug: "samsung", products: 24, revenue: 22140000 },
    { id: "B2", name: "Apple", slug: "apple", products: 19, revenue: 38448000 },
    { id: "B3", name: "Sony", slug: "sony", products: 14, revenue: 11544000 },
    { id: "B4", name: "LG", slug: "lg", products: 8, revenue: 8892000 },
    { id: "B5", name: "Logitech", slug: "logitech", products: 11, revenue: 6156000 },
    { id: "B6", name: "OnePlus", slug: "oneplus", products: 6, revenue: 4668000 },
  ];
}
