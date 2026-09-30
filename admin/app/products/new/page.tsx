"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Banknote,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Truck,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Barcode,
  Info,
  Globe,
  Save,
} from "lucide-react";
import {
  CentralForm,
  CentralFormSection,
  CentralFormField,
  CentralFormInput,
  CentralFormTextarea,
  CentralFormSwitch,
  CentralFormDropzone,
  CentralFormActions,
  type UploadedFileItem,
} from "@/components/ui/central-form";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";

const CATEGORY_OPTIONS: DropboxOption[] = [
  { value: "smartphones", label: "Smartphones & Mobile", description: "Flagship & 5G devices" },
  { value: "tablets", label: "Tablets & E-Readers", description: "iOS & Android slates" },
  { value: "laptops", label: "Laptops & Workstations", description: "Ultrabooks & creator machines" },
  { value: "audio", label: "Audio & Acoustics", description: "Noise-canceling & studio gear" },
  { value: "chargers", label: "Charging & Power", description: "GaN chargers, powerbanks, cables" },
  { value: "wearables", label: "Smartwatches & Bands", description: "Fitness trackers & health monitors" },
  { value: "accessories", label: "Peripherals & Hubs", description: "Docks, keyboards, mice, adapters" },
];

const BRAND_OPTIONS: DropboxOption[] = [
  { value: "apple", label: "Apple", description: "Official Authorised Channel" },
  { value: "samsung", label: "Samsung", description: "National Distributor Warranty" },
  { value: "sony", label: "Sony", description: "Official Hi-Res Audio" },
  { value: "anker", label: "Anker", description: "Charging & Soundcore" },
  { value: "ugreen", label: "Ugreen", description: "Cables & Connectivity" },
  { value: "generic", label: "VoltMart Essentials", description: "Private Label Quality" },
];

const CHANNEL_OPTIONS: DropboxOption[] = [
  { value: "default-channel", label: "Default Channel (BDT)", badge: "Primary" },
  { value: "pos-dhanmondi", label: "POS Retail Dhanmondi", badge: "Physical" },
  { value: "daraz-mall", label: "Daraz Flagship Mall API", badge: "Marketplace" },
  { value: "b2b-wholesale", label: "B2B Corporate Wholesale", badge: "Tiered" },
];

const WARRANTY_TYPE_OPTIONS: DropboxOption[] = [
  { value: "brand-official", label: "Official Brand Warranty", description: "Service center claims" },
  { value: "voltmart-replacement", label: "VoltMart 1-to-1 Replacement", description: "Instant replacement warranty" },
  { value: "seller-parts", label: "Seller Service & Parts", description: "Internal repair facility" },
  { value: "no-warranty", label: "Testing Warranty (7 Days)", description: "Dead-on-arrival return window only" },
];

export interface VariantRow {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  priceDelta: string;
  stock: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const appToast = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Tab 1: General & Identifiers (GS1)
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [brand, setBrand] = useState("apple");
  const [sku, setSku] = useState("");
  const [gtin, setGtin] = useState("");
  const [mpn, setMpn] = useState("");
  const [description, setDescription] = useState("");
  const [warrantyType, setWarrantyType] = useState("brand-official");
  const [warrantyMonths, setWarrantyMonths] = useState("12");

  // Tab 2: Pricing & Margins
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [vatRate, setVatRate] = useState("15");
  const [priceIncludesVat, setPriceIncludesVat] = useState(true);

  // Tab 3: Categorization & Channels
  const [category, setCategory] = useState("audio");
  const [channel, setChannel] = useState("default-channel");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [lowStockAlert, setLowStockAlert] = useState("10");
  const [rackBinLocation, setRackBinLocation] = useState("ZONE-A-04-12");

  // Tab 4: Variants Matrix
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([
    { id: "1", name: "Space Gray / 256GB", sku: "VM-ELEC-001-GRY", barcode: "8941234567891", priceDelta: "0", stock: "25" },
    { id: "2", name: "Silver / 512GB", sku: "VM-ELEC-001-SLV", barcode: "8941234567892", priceDelta: "15000", stock: "25" },
  ]);

  // Tab 5: Logistics, Physical Dimensions & Weight
  const [weightKg, setWeightKg] = useState("0.45");
  const [lengthCm, setLengthCm] = useState("18");
  const [widthCm, setWidthCm] = useState("14");
  const [heightCm, setHeightCm] = useState("6");

  // Tab 6: Compliance & BTRC
  const [countryOfOrigin, setCountryOfOrigin] = useState("Vietnam");
  const [hsCode, setHsCode] = useState("8518.30.00");
  const [isWireless, setIsWireless] = useState(true);
  const [btrcApprovalNumber, setBtrcApprovalNumber] = useState("BTRC/ELEC/2026/8941");
  const [isRoHsCompliant, setIsRoHsCompliant] = useState(true);

  // Tab 7: SEO & Merchant Center
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Common switches
  const [isActive, setIsActive] = useState(true);
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: "1",
      name: "product-primary.webp",
      size: "245 KB",
      url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=120&auto=format&fit=crop&q=80",
    },
  ]);

  const marginStats = useMemo(() => {
    const p = parseFloat(price) || 0;
    const c = parseFloat(costPrice) || 0;
    if (p <= 0 || c <= 0) return { profit: 0, marginPercent: 0 };
    const profit = p - c;
    const marginPercent = ((profit / p) * 100).toFixed(1);
    return { profit, marginPercent: Number(marginPercent) };
  }, [price, costPrice]);

  const volumetricWeightKg = useMemo(() => {
    const l = parseFloat(lengthCm) || 0;
    const w = parseFloat(widthCm) || 0;
    const h = parseFloat(heightCm) || 0;
    return ((l * w * h) / 5000).toFixed(2);
  }, [lengthCm, widthCm, heightCm]);

  const handleUploadMock = () => {
    const newFile: UploadedFileItem = {
      id: String(Date.now()),
      name: `asset-${files.length + 1}.webp`,
      size: "320 KB",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop&q=80",
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleGenerateSku = () => {
    const prefix = "VM";
    const catCode = category.slice(0, 4).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${catCode}-${rand}`);
  };

  const handleGenerateGtin = () => {
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    setGtin(`894${rand}`);
  };

  const handleAddVariant = () => {
    const newVar: VariantRow = {
      id: String(Date.now()),
      name: "New Variant Option",
      sku: `${sku || "VM-ELEC"}-V${variants.length + 1}`,
      barcode: "",
      priceDelta: "0",
      stock: "10",
    };
    setVariants((prev) => [...prev, newVar]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Product title is required";
    if (!sku.trim()) errs.sku = "Stock Keeping Unit (SKU) is required";
    if (!price.trim()) {
      errs.price = "Selling price is required";
    } else if (isNaN(Number(price))) {
      errs.price = "Selling price must be a valid number";
    }
    if (isWireless && !btrcApprovalNumber.trim()) {
      errs.btrc = "BTRC approval certificate is required for wireless equipment";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.title || errors.sku) setActiveTab("general");
      else if (errors.price) setActiveTab("pricing");
      else if (errors.btrc) setActiveTab("compliance");
      appToast.error("Validation Error", "Please fill in all required fields highlighted in red.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Persist to operations store
      addRecord("product.template", {
        id: `PROD-${Date.now()}`,
        name: title,
        sku,
        gtin,
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        category,
        brand,
        stock: Number(stockQuantity) || 0,
        isActive,
      });

      appToast.success(
        "Product Published",
        `“${title}” (${sku}) has been successfully saved to catalog.`
      );
      router.push("/products");
    }, 700);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Page Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Create New Product</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
          <p className="text-sm text-muted-foreground">
            Register a new catalog item with international GS1 identifiers, 15% VAT pricing, and BTRC compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all gap-2">
              <ArrowLeft className="h-4 w-4" /> Discard
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-11 px-6 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all gap-2 bg-primary text-primary-foreground"
          >
            <Save className="h-4 w-4" /> {loading ? "Publishing..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      {/* Main Panoramic Form Structure */}
      <div className="w-full space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border/80 pb-3">
            <TabsList className="h-11 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger value="general" className="text-sm font-semibold px-4 cursor-pointer">
                General & Identifiers
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-sm font-semibold px-4 cursor-pointer">
                Pricing & 15% VAT
              </TabsTrigger>
              <TabsTrigger value="variants" className="text-sm font-semibold px-4 cursor-pointer">
                Variants Matrix ({hasVariants ? variants.length : "Single"})
              </TabsTrigger>
              <TabsTrigger value="dimensions" className="text-sm font-semibold px-4 cursor-pointer">
                Warehouse & Shipping
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-sm font-semibold px-4 cursor-pointer">
                BTRC & Compliance
              </TabsTrigger>
              <TabsTrigger value="media" className="text-sm font-semibold px-4 cursor-pointer">
                Media & Photography ({files.length})
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-sm font-semibold px-4 cursor-pointer">
                SEO & Google Merchant
              </TabsTrigger>
            </TabsList>
          </div>

          <CentralForm onSubmit={handleSubmit} variant="plain">
            {/* TAB 1: General & GS1 Identifiers */}
            <TabsContent value="general" className="space-y-6 mt-4">
              <CentralFormSection
                title="General Product Identifiers"
                description="Core title, brand ownership, and international barcode standards."
                icon={Package}
                columns={2}
              >
                <CentralFormField
                  label="Product Title"
                  htmlFor="prod-title"
                  required
                  error={errors.title}
                  colSpan="full"
                  helperText="Include Brand + Model + Form Factor + Key Specification"
                >
                  <CentralFormInput
                    id="prod-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                    error={Boolean(errors.title)}
                  />
                </CentralFormField>

                <CentralFormField
                  label="Product Subtitle / Tagline"
                  htmlFor="prod-subtitle"
                  colSpan="full"
                >
                  <CentralFormInput
                    id="prod-subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Industry-Leading ANC with Auto NC Optimizer and 30-Hour Battery"
                  />
                </CentralFormField>

                <CentralFormField label="Brand / Manufacturer" colSpan={1} required>
                  <SearchableDropbox
                    options={BRAND_OPTIONS}
                    value={brand}
                    onChange={setBrand}
                    placeholder="Select brand"
                  />
                </CentralFormField>

                <CentralFormField label="Primary Category" colSpan={1} required>
                  <SearchableDropbox
                    options={CATEGORY_OPTIONS}
                    value={category}
                    onChange={setCategory}
                    placeholder="Select product category"
                  />
                </CentralFormField>

                {/* SKU with Auto-Generator */}
                <CentralFormField
                  label="Stock Keeping Unit (SKU)"
                  htmlFor="prod-sku"
                  required
                  error={errors.sku}
                  colSpan={1}
                  helperText="VoltMart format: VM-[CAT]-[NUMBER]"
                >
                  <div className="flex gap-2">
                    <CentralFormInput
                      id="prod-sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value.toUpperCase())}
                      placeholder="e.g. VM-AUDI-1042"
                      error={Boolean(errors.sku)}
                      className="font-mono uppercase font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSku}
                      className="h-10 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all shrink-0 gap-1.5"
                      title="Auto-generate standardized SKU"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Auto
                    </Button>
                  </div>
                </CentralFormField>

                {/* GS1 GTIN-13 Barcode */}
                <CentralFormField
                  label="GS1 Barcode / GTIN-13 / EAN"
                  htmlFor="prod-gtin"
                  colSpan={1}
                  helperText="13-digit standard EAN starting with 894 for Bangladesh"
                >
                  <div className="flex gap-2">
                    <CentralFormInput
                      id="prod-gtin"
                      value={gtin}
                      onChange={(e) => setGtin(e.target.value)}
                      placeholder="e.g. 8941234567890"
                      className="font-mono font-medium"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateGtin}
                      className="h-10 px-3.5 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all shrink-0 gap-1.5"
                    >
                      <Barcode className="h-3.5 w-3.5 text-muted-foreground" /> EAN-13
                    </Button>
                  </div>
                </CentralFormField>

                <CentralFormField
                  label="Manufacturer Part Number (MPN)"
                  htmlFor="prod-mpn"
                  colSpan={1}
                >
                  <CentralFormInput
                    id="prod-mpn"
                    value={mpn}
                    onChange={(e) => setMpn(e.target.value)}
                    placeholder="e.g. WH1000XM5/B"
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField label="Warranty Coverage" colSpan={1}>
                  <SearchableDropbox
                    options={WARRANTY_TYPE_OPTIONS}
                    value={warrantyType}
                    onChange={setWarrantyType}
                  />
                </CentralFormField>

                <CentralFormField
                  label="Detailed Product Description"
                  htmlFor="prod-desc"
                  colSpan="full"
                  helperText="Supports customer purchasing decisions and search crawling."
                >
                  <CentralFormTextarea
                    id="prod-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Highlight key technological features, package contents, and compatibility..."
                    rows={5}
                    maxLength={1000}
                    showCount
                  />
                </CentralFormField>
              </CentralFormSection>
            </TabsContent>

            {/* TAB 2: Pricing & 15% VAT */}
            <TabsContent value="pricing" className="space-y-6 mt-4">
              <CentralFormSection
                title="Pricing, Margins & 15% VAT"
                description="Set selling prices, compare-at baselines, internal landing costs, and NBR VAT rules."
                icon={Banknote}
                columns={3}
              >
                <CentralFormField
                  label="Selling Price (Customer)"
                  htmlFor="prod-price"
                  required
                  error={errors.price}
                  colSpan={1}
                >
                  <CentralFormInput
                    id="prod-price"
                    type="number"
                    step="0.01"
                    prefixText="৳"
                    suffixText="BDT"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="35000.00"
                    error={Boolean(errors.price)}
                    className="font-mono font-bold"
                  />
                </CentralFormField>

                <CentralFormField
                  label="Compare-at Price (Strikethrough)"
                  htmlFor="prod-compare-price"
                  colSpan={1}
                  tooltip="Displayed crossed out on the storefront to show savings"
                >
                  <CentralFormInput
                    id="prod-compare-price"
                    type="number"
                    step="0.01"
                    prefixText="৳"
                    suffixText="BDT"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="42000.00"
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField
                  label="Cost Price per Item"
                  htmlFor="prod-cost"
                  colSpan={1}
                  tooltip="Internal landing cost (purchase + freight + customs duty). Never visible to customers."
                >
                  <CentralFormInput
                    id="prod-cost"
                    type="number"
                    step="0.01"
                    prefixText="৳"
                    suffixText="BDT"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="26000.00"
                    className="font-mono"
                  />
                </CentralFormField>

                {/* Profit & Margin Calculator Display */}
                <div className="col-span-full rounded-lg border border-border/80 p-5 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Estimated Gross Profit & Margin
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Calculated automatically: Selling Price minus Internal Landing Cost
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                      <div className="text-xs text-muted-foreground">Unit Profit</div>
                      <div className="text-xl font-mono font-bold text-foreground">
                        ৳{marginStats.profit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Gross Margin</div>
                      <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {marginStats.marginPercent}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* VAT Details */}
                <CentralFormField
                  label="VAT Rate (%)"
                  htmlFor="prod-vat"
                  colSpan={1}
                  helperText="Standard Bangladesh retail VAT is 15%"
                >
                  <CentralFormInput
                    id="prod-vat"
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    suffixText="%"
                    className="font-mono"
                  />
                </CentralFormField>

                <div className="col-span-2 flex items-center pt-6">
                  <CentralFormSwitch
                    label="Prices Include 15% VAT"
                    description="Display tax-inclusive prices to retail consumers as per Consumer Rights Act"
                    checked={priceIncludesVat}
                    onCheckedChange={setPriceIncludesVat}
                  />
                </div>
              </CentralFormSection>
            </TabsContent>

            {/* TAB 3: Variants Matrix */}
            <TabsContent value="variants" className="space-y-6 mt-4">
              <CentralFormSection
                title="Product Variants & Options"
                description="Manage SKUs with multiple colors, storage sizes, or regional plugs."
                icon={Layers}
                columns={1}
              >
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/80 bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground">Enable Multiple Variants</div>
                    <div className="text-xs text-muted-foreground">
                      Toggle on if this product has combinations like Colors or Storage capacity.
                    </div>
                  </div>
                  <CentralFormSwitch
                    label=""
                    checked={hasVariants}
                    onCheckedChange={setHasVariants}
                  />
                </div>

                {hasVariants && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Configured Variant Combinations ({variants.length})
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddVariant}
                        className="h-8 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Option
                      </Button>
                    </div>

                    <div className="border border-border/80 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold text-left">
                          <tr>
                            <th className="py-3 px-4">Option Name</th>
                            <th className="py-3 px-4">Variant SKU</th>
                            <th className="py-3 px-4">Price Adjustment</th>
                            <th className="py-3 px-4">Stock Units</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {variants.map((v) => (
                            <tr key={v.id} className="hover:bg-muted/20">
                              <td className="py-2.5 px-4 font-medium text-foreground">{v.name}</td>
                              <td className="py-2.5 px-4 font-mono text-muted-foreground">{v.sku}</td>
                              <td className="py-2.5 px-4 font-mono text-foreground">
                                {Number(v.priceDelta) > 0 ? `+৳${v.priceDelta}` : "Base Price"}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-foreground">{v.stock} units</td>
                              <td className="py-2.5 px-4 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVariant(v.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CentralFormSection>
            </TabsContent>

            {/* TAB 4: Warehouse & Dimensions */}
            <TabsContent value="dimensions" className="space-y-6 mt-4">
              <CentralFormSection
                title="Warehouse Storage & Parcel Dimensions"
                description="Accurate dimensions ensure automated courier shipping rate calculations."
                icon={Truck}
                columns={4}
              >
                <CentralFormField label="Gross Weight (kg)" htmlFor="prod-weight" colSpan={1}>
                  <CentralFormInput
                    id="prod-weight"
                    type="number"
                    step="0.01"
                    suffixText="kg"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField label="Length (cm)" htmlFor="prod-len" colSpan={1}>
                  <CentralFormInput
                    id="prod-len"
                    type="number"
                    suffixText="cm"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField label="Width (cm)" htmlFor="prod-wid" colSpan={1}>
                  <CentralFormInput
                    id="prod-wid"
                    type="number"
                    suffixText="cm"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField label="Height (cm)" htmlFor="prod-hgt" colSpan={1}>
                  <CentralFormInput
                    id="prod-hgt"
                    type="number"
                    suffixText="cm"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="font-mono"
                  />
                </CentralFormField>

                {/* Volumetric Weight Banner */}
                <div className="col-span-full rounded-lg border border-border/80 p-4 bg-muted/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>Volumetric Weight (Courier Standard Divisor 5000):</span>
                  </div>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {volumetricWeightKg} kg
                  </span>
                </div>

                <CentralFormField label="Rack / Bin Location" htmlFor="prod-bin" colSpan={2}>
                  <CentralFormInput
                    id="prod-bin"
                    value={rackBinLocation}
                    onChange={(e) => setRackBinLocation(e.target.value.toUpperCase())}
                    placeholder="e.g. ZONE-A-RACK-04-BIN-12"
                    className="font-mono uppercase font-semibold"
                  />
                </CentralFormField>

                <CentralFormField label="Low Stock Safety Threshold" htmlFor="prod-reorder" colSpan={2}>
                  <CentralFormInput
                    id="prod-reorder"
                    type="number"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value)}
                    suffixText="units"
                    className="font-mono"
                  />
                </CentralFormField>

                <CentralFormField label="Initial Stock Quantity" htmlFor="prod-stock" colSpan={2}>
                  <CentralFormInput
                    id="prod-stock"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    suffixText="units"
                    className="font-mono"
                  />
                </CentralFormField>

                <div className="col-span-2 flex items-center pt-6">
                  <CentralFormSwitch
                    label="Track Inventory Stock"
                    description="Automatically decrement on customer checkout"
                    checked={trackQuantity}
                    onCheckedChange={setTrackQuantity}
                  />
                </div>
              </CentralFormSection>
            </TabsContent>

            {/* TAB 5: BTRC & Compliance */}
            <TabsContent value="compliance" className="space-y-6 mt-4">
              <CentralFormSection
                title="Regulatory Compliance & BTRC Type Approval"
                description="Comply with Bangladesh Telecommunication Regulatory Commission guidelines for wireless electronics."
                icon={ShieldCheck}
                columns={2}
              >
                <CentralFormField label="Country of Origin" htmlFor="prod-origin" colSpan={1}>
                  <CentralFormInput
                    id="prod-origin"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    placeholder="e.g. Vietnam, China, Japan"
                  />
                </CentralFormField>

                <CentralFormField label="Customs HS Code (Tariff Code)" htmlFor="prod-hs" colSpan={1}>
                  <CentralFormInput
                    id="prod-hs"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    placeholder="e.g. 8518.30.00"
                    className="font-mono"
                  />
                </CentralFormField>

                <div className="col-span-full p-4 rounded-lg border border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">Wireless / Radio Frequency Equipment</div>
                      <div className="text-xs text-muted-foreground">
                        Devices emitting Wi-Fi, Bluetooth, or Cellular frequencies require BTRC Type Approval.
                      </div>
                    </div>
                    <CentralFormSwitch
                      label=""
                      checked={isWireless}
                      onCheckedChange={setIsWireless}
                    />
                  </div>

                  {isWireless && (
                    <div className="pt-2">
                      <CentralFormField
                        label="BTRC Type Approval Certificate Number"
                        htmlFor="prod-btrc"
                        required
                        error={errors.btrc}
                        helperText="Enter certificate issued by BTRC (Spectrum Management Division)"
                      >
                        <CentralFormInput
                          id="prod-btrc"
                          value={btrcApprovalNumber}
                          onChange={(e) => setBtrcApprovalNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. BTRC/ELEC/2026/8941"
                          error={Boolean(errors.btrc)}
                          className="font-mono uppercase font-bold"
                        />
                      </CentralFormField>
                    </div>
                  )}
                </div>

                <div className="col-span-full">
                  <CentralFormSwitch
                    label="RoHS & CE Certified"
                    description="Complies with Restriction of Hazardous Substances standards"
                    checked={isRoHsCompliant}
                    onCheckedChange={setIsRoHsCompliant}
                  />
                </div>
              </CentralFormSection>
            </TabsContent>

            {/* TAB 6: Media Uploads */}
            <TabsContent value="media" className="space-y-6 mt-4">
              <CentralFormSection
                title="Product Photography & Media"
                description="Upload primary cover images, gallery views, and package renders."
                icon={ImageIcon}
                columns={1}
              >
                <CentralFormField colSpan="full">
                  <CentralFormDropzone
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    onUploadMock={handleUploadMock}
                    label="Click or drop 1:1 product images here to upload"
                    description="Supports PNG, JPG, WebP up to 10MB per image. Converted automatically to AVIF/WebP on Cloudinary CDN."
                  />
                </CentralFormField>
              </CentralFormSection>
            </TabsContent>

            {/* TAB 7: SEO & Google Merchant */}
            <TabsContent value="seo" className="space-y-6 mt-4">
              <CentralFormSection
                title="Search Engine Optimization & Google Shopping"
                description="Customize search snippets, OpenGraph previews, and Google Merchant Center feeds."
                icon={Globe}
                columns={1}
              >
                <CentralFormField
                  label="Search Meta Title"
                  htmlFor="prod-meta-title"
                  helperText="Recommended length: 50-60 characters"
                >
                  <CentralFormInput
                    id="prod-meta-title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "e.g. Buy Sony WH-1000XM5 Wireless Headphones in Bangladesh | VoltMart"}
                  />
                </CentralFormField>

                <CentralFormField
                  label="Search Meta Description"
                  htmlFor="prod-meta-desc"
                  helperText="Recommended length: 150-160 characters"
                >
                  <CentralFormTextarea
                    id="prod-meta-desc"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={subtitle || "Get the best price on Sony WH-1000XM5 ANC headphones with official warranty, fast Dhaka delivery, and bKash cashback at VoltMart."}
                    rows={3}
                  />
                </CentralFormField>

                <CentralFormSwitch
                  label="Visible in Search Engines"
                  description="Include in XML sitemap and allow Googlebot indexing"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </CentralFormSection>
            </TabsContent>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border/80 flex items-center justify-between">
              <Link href="/products">
                <Button variant="outline" type="button" className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-6 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all gap-2 bg-primary text-primary-foreground"
              >
                <Save className="h-4 w-4" /> {loading ? "Publishing..." : "Save & Publish"}
              </Button>
            </div>
          </CentralForm>
        </Tabs>
      </div>
    </div>
  );
}
