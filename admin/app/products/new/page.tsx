"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Banknote,
  Layers,
  Image as ImageIcon,
  Truck,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Barcode,
  Globe,
  Save,
  Upload,
  X,
  Check,
  CheckSquare,
  Square,
  Camera,
} from "lucide-react";
import {
  CentralFormSection,
  CentralFormField,
  CentralFormInput,
  CentralFormTextarea,
  CentralFormSwitch,
  CentralFormDropzone,
  type UploadedFileItem,
} from "@/components/ui/central-form";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

/**
 * Shopify / Saleor Option Definition (e.g. Color, Storage, Size)
 */
export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

/**
 * Shopify / Saleor Variant Matrix Row with Variant-Wise Image
 */
export interface ProductVariant {
  id: string;
  title: string; // e.g. "Midnight Black / 256GB"
  optionValues: Record<string, string>; // { "Color": "Midnight Black", "Storage": "256GB" }
  sku: string; // e.g. "VM-AUDI-BLK-256"
  barcode: string; // GS1 GTIN-13
  price: string; // e.g. "35000"
  comparePrice: string;
  costPrice: string;
  stock: string;
  weightKg: string;
  image?: string; // URL of variant-specific image
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

  // Tab 4: Shopify-style Options & Variants Matrix
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<ProductOption[]>([
    { id: "opt-1", name: "Color", values: ["Midnight Black", "Space Gray"] },
    { id: "opt-2", name: "Storage", values: ["128GB", "256GB"] },
  ]);
  const [optionInputValues, setOptionInputValues] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  // Variant Image Picker Dialog State
  const [imagePickerVariantId, setImagePickerVariantId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Bulk Edit Inputs
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

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

  // Common switches & gallery images
  const [isActive, setIsActive] = useState(true);
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: "img-1",
      name: "midnight-black-front.webp",
      size: "245 KB",
      url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "img-2",
      name: "space-gray-angle.webp",
      size: "310 KB",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: "img-3",
      name: "package-accessories.webp",
      size: "180 KB",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
    },
  ]);

  // Modulo-10 GS1 Check-Digit Calculator
  const computeGs1Barcode = (prefix = "894") => {
    const base12 = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(base12[i], 10);
      sum += i % 2 === 0 ? digit * 1 : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return `${base12}${checkDigit}`;
  };

  // Helper to generate concise abbreviation code from option value
  const makeCode = (val: string) => {
    return val
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase();
  };

  // Auto-generate Cartesian Product Variants whenever Options change
  useEffect(() => {
    if (!hasVariants) {
      setVariants([]);
      return;
    }

    const activeOptions = options.filter((o) => o.values.length > 0);
    if (activeOptions.length === 0) {
      setVariants([]);
      return;
    }

    // Cartesian product helper
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce(
        (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
        [[]] as string[][]
      );
    };

    const combinations = cartesian(activeOptions.map((o) => o.values));

    setVariants((prev) => {
      const existingMap = new Map(prev.map((v) => [v.title, v]));

      return combinations.map((combo, idx) => {
        const title = combo.join(" / ");
        const optValues: Record<string, string> = {};
        combo.forEach((val, i) => {
          optValues[activeOptions[i].name] = val;
        });

        const existing = existingMap.get(title);
        if (existing) {
          return {
            ...existing,
            optionValues: optValues,
          };
        }

        // Generate standardized SKU code
        const base = sku || "VM-ELEC";
        const suffix = combo.map(makeCode).join("-");
        const variantSku = `${base}-${suffix}`;

        // Assign default image if matching option value
        let defaultImage = files[0]?.url;
        const colorVal = optValues["Color"] || optValues["Colour"];
        if (colorVal) {
          const matchedFile = files.find((f) =>
            f.name.toLowerCase().includes(colorVal.toLowerCase().split(" ")[0])
          );
          if (matchedFile) defaultImage = matchedFile.url;
        }

        return {
          id: `var-${Date.now()}-${idx}`,
          title,
          optionValues: optValues,
          sku: variantSku,
          barcode: computeGs1Barcode(),
          price: price || "0",
          comparePrice: comparePrice || "",
          costPrice: costPrice || "",
          stock: "25",
          weightKg: weightKg || "0.5",
          image: defaultImage,
        };
      });
    });
  }, [hasVariants, options, sku, price, comparePrice, costPrice, weightKg, files]);

  // Options builder handlers
  const handleAddOption = () => {
    const nextNum = options.length + 1;
    const defaultNames = ["Color", "Storage", "Size", "Material", "Plug Type"];
    const name = defaultNames[options.length] || `Option ${nextNum}`;
    setOptions((prev) => [...prev, { id: `opt-${Date.now()}`, name, values: [] }]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleUpdateOptionName = (id: string, name: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, name } : o)));
  };

  const handleAddOptionValue = (optionId: string) => {
    const val = (optionInputValues[optionId] || "").trim();
    if (!val) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(val)) {
            appToast.error("Duplicate Option", `"${val}" is already an option value.`);
            return opt;
          }
          return { ...opt, values: [...opt.values, val] };
        }
        return opt;
      })
    );

    setOptionInputValues((prev) => ({ ...prev, [optionId]: "" }));
  };

  const handleRemoveOptionValue = (optionId: string, valToRemove: string) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, values: opt.values.filter((v) => v !== valToRemove) } : opt
      )
    );
  };

  // Bulk Operations
  const handleSelectAllVariants = () => {
    if (selectedVariantIds.length === variants.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(variants.map((v) => v.id));
    }
  };

  const handleToggleSelectVariant = (id: string) => {
    setSelectedVariantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyBulkPrice = () => {
    if (!bulkPrice || isNaN(Number(bulkPrice))) {
      appToast.error("Invalid Price", "Enter a valid numeric price.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => (selectedVariantIds.includes(v.id) ? { ...v, price: bulkPrice } : v))
    );
    appToast.success("Price Updated", `Set price to ৳${bulkPrice} on ${selectedVariantIds.length} variants.`);
    setBulkPrice("");
  };

  const handleApplyBulkStock = () => {
    if (!bulkStock || isNaN(Number(bulkStock))) {
      appToast.error("Invalid Stock", "Enter a valid integer quantity.");
      return;
    }
    setVariants((prev) =>
      prev.map((v) => (selectedVariantIds.includes(v.id) ? { ...v, stock: bulkStock } : v))
    );
    appToast.success("Stock Updated", `Set stock to ${bulkStock} on ${selectedVariantIds.length} variants.`);
    setBulkStock("");
  };

  const handleRegenerateAllSkus = () => {
    const base = sku || "VM-ELEC";
    setVariants((prev) =>
      prev.map((v) => {
        const parts = Object.values(v.optionValues).map(makeCode);
        return {
          ...v,
          sku: `${base}-${parts.join("-")}`,
          barcode: computeGs1Barcode(),
        };
      })
    );
    appToast.success("SKUs Regenerated", "All variant SKUs and GTIN-13 barcodes updated.");
  };

  // Variant Image Assignment
  const handleAssignVariantImage = (variantId: string, imageUrl: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, image: imageUrl } : v))
    );
    setImagePickerVariantId(null);
    appToast.success("Image Assigned", "Variant photo updated successfully.");
  };

  const handleApplyImageToMatchingColor = (variant: ProductVariant, imageUrl: string) => {
    const colorKey = Object.keys(variant.optionValues).find((k) =>
      k.toLowerCase().includes("color")
    );
    if (!colorKey) {
      handleAssignVariantImage(variant.id, imageUrl);
      return;
    }
    const colorVal = variant.optionValues[colorKey];
    setVariants((prev) =>
      prev.map((v) => (v.optionValues[colorKey] === colorVal ? { ...v, image: imageUrl } : v))
    );
    setImagePickerVariantId(null);
    appToast.success("Color Image Synced", `Assigned image to all ${colorVal} variants.`);
  };

  // Real File Upload Handler (FileReader / URL.createObjectURL)
  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const newFiles: UploadedFileItem[] = Array.from(uploaded).map((f) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: f.name,
      size: `${Math.round(f.size / 1024)} KB`,
      url: URL.createObjectURL(f),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    appToast.success("Media Uploaded", `Added ${newFiles.length} images to product media gallery.`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadMock = () => {
    const samplePool = [
      { name: "product-hero-front.webp", url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80" },
      { name: "product-angle-gray.webp", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80" },
      { name: "product-top-view.webp", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
      { name: "product-packaging-box.webp", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80" },
    ];
    const picked = samplePool[files.length % samplePool.length];
    const newFile: UploadedFileItem = {
      id: `mock-${Date.now()}`,
      name: picked.name,
      size: "285 KB",
      url: picked.url,
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
    setGtin(computeGs1Barcode("894"));
  };

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Product title is required";
    if (!sku.trim()) errs.sku = "Stock Keeping Unit (SKU) is required";
    if (!price.trim()) {
      errs.price = "Selling price is required";
    } else if (isNaN(Number(price))) {
      errs.price = "Selling price must be a valid number";
    }

    if (gtin.trim()) {
      if (gtin.length !== 13 || !/^\d{13}$/.test(gtin)) {
        errs.gtin = "GTIN must be a 13-digit number (GS1 EAN-13)";
      } else {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          sum += i % 2 === 0 ? parseInt(gtin[i], 10) * 1 : parseInt(gtin[i], 10) * 3;
        }
        const expectedCheck = (10 - (sum % 10)) % 10;
        if (parseInt(gtin[12], 10) !== expectedCheck) {
          errs.gtin = `Invalid GS1 check digit (expected ${expectedCheck})`;
        }
      }
    }

    if (isWireless && !btrcApprovalNumber.trim()) {
      errs.btrc = "BTRC approval certificate is required for wireless/RF equipment";
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
      // Persist to operations store with full variant matrix & image associations
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
        hasVariants,
        options: hasVariants ? options : [],
        variants: hasVariants ? variants : [],
        images: files,
      });

      appToast.success(
        "Product Published",
        `“${title}” (${sku}) has been successfully saved to catalog with ${
          hasVariants ? variants.length : 1
        } SKUs.`
      );
      router.push("/products");
    }, 700);
  };

  const currentVariantForImage = variants.find((v) => v.id === imagePickerVariantId);

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
            <span className="text-foreground font-medium">New Product</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Product</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/products")}
            className="cursor-pointer active:scale-[0.98] transition-all"
          >
            Discard
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="cursor-pointer active:scale-[0.98] transition-all gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Publishing..." : "Publish Product"}
          </Button>
        </div>
      </div>

      {/* Main Tabbed Enterprise Product Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          {/* Panoramic Navigation Tabs */}
          <TabsList className="w-full justify-start h-12 p-1 bg-muted/40 border border-border/80 rounded-lg overflow-x-auto">
            <TabsTrigger
              value="general"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <Package className="h-4 w-4" /> General & GS1
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <Banknote className="h-4 w-4" /> Pricing & VAT
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <Layers className="h-4 w-4" />
              Options & Variants
              {hasVariants && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {variants.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <ImageIcon className="h-4 w-4" /> Media Gallery ({files.length})
            </TabsTrigger>
            <TabsTrigger
              value="dimensions"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <Truck className="h-4 w-4" /> Warehouse & Weight
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> BTRC & Legal
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="text-xs font-semibold data-[state=active]:bg-card cursor-pointer px-4 gap-2"
            >
              <Globe className="h-4 w-4" /> SEO & Google
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: General & Identifiers (GS1) */}
          <TabsContent value="general" className="space-y-6 mt-4">
            <CentralFormSection
              title="Product Identity & Core GS1 Data"
              description="Standard international product identifiers compliant with GS1 Bangladesh and Saleor/Odoo catalog models."
              icon={Package}
              columns={3}
            >
              <CentralFormField
                label="Product Title / Name"
                htmlFor="prod-title"
                required
                error={errors.title}
                colSpan={2}
                helperText="Appears on storefront hero, search listings, and order invoices"
              >
                <CentralFormInput
                  id="prod-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                  error={Boolean(errors.title)}
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

              <CentralFormField
                label="Marketing Subtitle"
                htmlFor="prod-subtitle"
                colSpan={2}
                helperText="Short punchy highlight for the product detail page"
              >
                <CentralFormInput
                  id="prod-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Industry-leading 30-hour battery life with Dual Noise Sensor tech"
                />
              </CentralFormField>

              <CentralFormField label="Product Category" colSpan={1} required>
                <SearchableDropbox
                  options={CATEGORY_OPTIONS}
                  value={category}
                  onChange={setCategory}
                  placeholder="Select product category"
                />
              </CentralFormField>

              {/* SKU with Auto-Generator */}
              <CentralFormField
                label="Master Stock Keeping Unit (Base SKU)"
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
                error={errors.gtin}
                helperText="13-digit standard EAN with Modulo-10 check digit (Prefix: 894)"
              >
                <div className="flex gap-2">
                  <CentralFormInput
                    id="prod-gtin"
                    value={gtin}
                    onChange={(e) => setGtin(e.target.value)}
                    placeholder="e.g. 8941234567890"
                    error={Boolean(errors.gtin)}
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
                helperText="Exact manufacturer catalogue model number"
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
              description="Set base selling prices, compare-at baselines, internal landing costs, and NBR VAT rules."
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

          {/* TAB 3: SHOPIFY-STYLE OPTIONS & DYNAMIC VARIANTS MATRIX */}
          <TabsContent value="variants" className="space-y-6 mt-4">
            <CentralFormSection
              title="Options & Variant Matrix"
              description="Define options (Color, Storage, Size), auto-generate combinations, and assign photos to each variant."
              icon={Layers}
              columns={1}
            >
              {/* Variant Toggle Card */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/80 bg-muted/20">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-foreground">This product has multiple options</div>
                  <div className="text-xs text-muted-foreground">
                    Like different sizes, colors, storage capacities, or regional specifications.
                  </div>
                </div>
                <CentralFormSwitch
                  label=""
                  checked={hasVariants}
                  onCheckedChange={setHasVariants}
                />
              </div>

              {hasVariants && (
                <div className="space-y-6 pt-2">
                  {/* Option Definitions (Shopify Style) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Product Options
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="h-8 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Another Option
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {options.map((opt, optIndex) => (
                        <div
                          key={opt.id}
                          className="p-4 rounded-lg border border-border/80 bg-card space-y-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 w-64">
                              <span className="text-xs font-semibold text-muted-foreground">
                                Option {optIndex + 1}:
                              </span>
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) => handleUpdateOptionName(opt.id, e.target.value)}
                                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Option name (e.g. Color, Storage)"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="h-8 text-xs text-muted-foreground hover:text-rose-600 gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove Option
                            </Button>
                          </div>

                          {/* Value Chips */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {opt.values.map((val) => (
                                <Badge
                                  key={val}
                                  variant="secondary"
                                  className="text-xs font-medium pl-2.5 pr-1.5 py-1 gap-1.5 bg-muted hover:bg-muted/80"
                                >
                                  <span>{val}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionValue(opt.id, val)}
                                    className="h-3.5 w-3.5 rounded-full hover:bg-foreground/20 flex items-center justify-center cursor-pointer"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ))}

                              {/* Input for adding new value */}
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={optionInputValues[opt.id] || ""}
                                  onChange={(e) =>
                                    setOptionInputValues((prev) => ({
                                      ...prev,
                                      [opt.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddOptionValue(opt.id);
                                    }
                                  }}
                                  placeholder={`Add ${opt.name} value...`}
                                  className="h-7 w-36 rounded border border-dashed border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddOptionValue(opt.id)}
                                  className="h-7 px-2 text-[11px] font-semibold"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Type a value and press Enter (e.g. "Titanium Black", "256GB")
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Variants Matrix Table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border border-border/80">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleSelectAllVariants}
                          className="flex items-center gap-1.5 text-xs font-semibold text-foreground cursor-pointer"
                        >
                          {selectedVariantIds.length > 0 &&
                          selectedVariantIds.length === variants.length ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                          Select All ({variants.length} Variants)
                        </button>
                        {selectedVariantIds.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {selectedVariantIds.length} Selected
                          </Badge>
                        )}
                      </div>

                      {/* Bulk Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedVariantIds.length > 0 && (
                          <>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="Price ৳"
                                value={bulkPrice}
                                onChange={(e) => setBulkPrice(e.target.value)}
                                className="h-7 w-24 rounded border border-input bg-background px-2 text-xs font-mono"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleApplyBulkPrice}
                                className="h-7 text-xs px-2"
                              >
                                Set Price
                              </Button>
                            </div>

                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="Stock"
                                value={bulkStock}
                                onChange={(e) => setBulkStock(e.target.value)}
                                className="h-7 w-20 rounded border border-input bg-background px-2 text-xs font-mono"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleApplyBulkStock}
                                className="h-7 text-xs px-2"
                              >
                                Set Stock
                              </Button>
                            </div>
                          </>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerateAllSkus}
                          className="h-7 text-xs gap-1.5"
                          title="Generate standardized SKUs and GS1 GTIN barcodes"
                        >
                          <Sparkles className="h-3 w-3 text-primary" /> Auto SKUs & Barcodes
                        </Button>
                      </div>
                    </div>

                    {/* The Full Variant Matrix Table with Image Column */}
                    <div className="border border-border/80 rounded-lg overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60 border-b border-border/80 text-muted-foreground font-semibold text-left">
                          <tr>
                            <th className="py-2.5 px-3 w-8"></th>
                            <th className="py-2.5 px-3 w-16 text-center">Image</th>
                            <th className="py-2.5 px-3">Variant Title</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">GTIN-13 Barcode</th>
                            <th className="py-2.5 px-3 text-right">Price (BDT)</th>
                            <th className="py-2.5 px-3 text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {variants.map((v) => {
                            const isSelected = selectedVariantIds.includes(v.id);
                            return (
                              <tr
                                key={v.id}
                                className={`hover:bg-muted/20 transition-colors ${
                                  isSelected ? "bg-primary/5" : ""
                                }`}
                              >
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectVariant(v.id)}
                                    className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                                  />
                                </td>

                                {/* Variant-Wise Image Column */}
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setImagePickerVariantId(v.id)}
                                    className="group relative h-10 w-10 rounded-md border border-border overflow-hidden bg-muted/40 hover:border-primary transition-all flex items-center justify-center cursor-pointer"
                                    title="Click to assign variant-specific image"
                                  >
                                    {v.image ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={v.image}
                                        alt={v.title}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <ImageIcon className="h-3.5 w-3.5 text-white" />
                                    </div>
                                  </button>
                                </td>

                                <td className="py-2 px-3 font-semibold text-foreground">{v.title}</td>

                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.sku}
                                    onChange={(e) => {
                                      const next = e.target.value.toUpperCase();
                                      setVariants((prev) =>
                                        prev.map((item) =>
                                          item.id === v.id ? { ...item, sku: next } : item
                                        )
                                      );
                                    }}
                                    className="h-7 w-36 rounded border border-input bg-background px-2 font-mono uppercase text-xs"
                                  />
                                </td>

                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={v.barcode}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      setVariants((prev) =>
                                        prev.map((item) =>
                                          item.id === v.id ? { ...item, barcode: next } : item
                                        )
                                      );
                                    }}
                                    className="h-7 w-32 rounded border border-input bg-background px-2 font-mono text-xs"
                                  />
                                </td>

                                <td className="py-2 px-3 text-right">
                                  <div className="inline-flex items-center justify-end gap-1">
                                    <span className="text-muted-foreground font-mono">৳</span>
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={(e) => {
                                        const next = e.target.value;
                                        setVariants((prev) =>
                                          prev.map((item) =>
                                            item.id === v.id ? { ...item, price: next } : item
                                          )
                                        );
                                      }}
                                      className="h-7 w-24 rounded border border-input bg-background px-2 text-right font-mono font-bold text-xs"
                                    />
                                  </div>
                                </td>

                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => {
                                      const next = e.target.value;
                                      setVariants((prev) =>
                                        prev.map((item) =>
                                          item.id === v.id ? { ...item, stock: next } : item
                                        )
                                      );
                                    }}
                                    className="h-7 w-16 rounded border border-input bg-background px-2 text-right font-mono text-xs font-semibold"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CentralFormSection>
          </TabsContent>

          {/* TAB 4: MASTER MEDIA GALLERY */}
          <TabsContent value="media" className="space-y-6 mt-4">
            <CentralFormSection
              title="Product Media & Image Assets"
              description="Upload primary cover images, gallery views, and package renders. These images can be assigned to variants."
              icon={ImageIcon}
              columns={1}
            >
              {/* Hidden Real File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleRealFileUpload}
                className="hidden"
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Upload images from your device or use high-resolution studio presets.
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer active:scale-[0.98] transition-all gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5 text-primary" /> Browse Computer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUploadMock}
                      className="cursor-pointer text-xs"
                    >
                      + Add Sample Photo
                    </Button>
                  </div>
                </div>

                <CentralFormDropzone
                  files={files}
                  onRemoveFile={handleRemoveFile}
                  onUploadMock={() => fileInputRef.current?.click()}
                  label="Drag and drop product images here, or browse files"
                  description="Supports PNG, JPG, WebP up to 10MB per image. High-res 1:1 aspect ratio recommended."
                />
              </div>
            </CentralFormSection>
          </TabsContent>

          {/* TAB 5: Warehouse & Dimensions */}
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

              <CentralFormField label="Width (cm)" htmlFor="prod-width" colSpan={1}>
                <CentralFormInput
                  id="prod-width"
                  type="number"
                  suffixText="cm"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  className="font-mono"
                />
              </CentralFormField>

              <CentralFormField label="Height (cm)" htmlFor="prod-height" colSpan={1}>
                <CentralFormInput
                  id="prod-height"
                  type="number"
                  suffixText="cm"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="font-mono"
                />
              </CentralFormField>

              {/* Volumetric Calculation Card */}
              <div className="col-span-full rounded-lg border border-border/80 p-4 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">
                    Volumetric Weight:{" "}
                    <span className="font-mono font-bold text-primary">{volumetricWeightKg} kg</span>
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    IATA formula: (L × W × H) / 5000. Couriers (Pathao/Steadfast) bill on whichever is higher.
                  </div>
                </div>
                <Badge variant="outline" className="font-mono font-semibold">
                  Chargeable: {Math.max(Number(weightKg) || 0, Number(volumetricWeightKg) || 0)} kg
                </Badge>
              </div>

              <CentralFormField label="Warehouse Rack/Bin Location" htmlFor="prod-bin" colSpan={2}>
                <CentralFormInput
                  id="prod-bin"
                  value={rackBinLocation}
                  onChange={(e) => setRackBinLocation(e.target.value.toUpperCase())}
                  placeholder="e.g. AISLE-02-SHELF-B"
                  className="font-mono uppercase font-semibold"
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

          {/* TAB 6: BTRC & Compliance */}
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
                    <div className="text-sm font-semibold text-foreground">
                      Wireless / Radio Frequency Equipment
                    </div>
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
                      helperText="Issued by BTRC Spectrum Division for legal importation"
                    >
                      <CentralFormInput
                        id="prod-btrc"
                        value={btrcApprovalNumber}
                        onChange={(e) => setBtrcApprovalNumber(e.target.value)}
                        placeholder="e.g. BTRC/ELEC/2026/8941"
                        error={Boolean(errors.btrc)}
                        className="font-mono"
                      />
                    </CentralFormField>
                  </div>
                )}
              </div>
            </CentralFormSection>
          </TabsContent>

          {/* TAB 7: SEO & Google Merchant */}
          <TabsContent value="seo" className="space-y-6 mt-4">
            <CentralFormSection
              title="Search Engine Optimization (SEO) & Google Shopping"
              description="Configure titles and meta descriptions for search rankings and rich snippets."
              icon={Globe}
              columns={1}
            >
              <CentralFormField
                label="SEO Meta Title"
                htmlFor="seo-title"
                helperText="Recommended: 50-60 characters including primary brand keyword"
              >
                <CentralFormInput
                  id="seo-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "Sony WH-1000XM5 Wireless Headphones | VoltMart Bangladesh"}
                  maxLength={70}
                />
              </CentralFormField>

              <CentralFormField
                label="SEO Meta Description"
                htmlFor="seo-desc"
                helperText="Recommended: 120-160 characters summarizing price, key specs, and warranty"
              >
                <CentralFormTextarea
                  id="seo-desc"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Buy authentic Sony WH-1000XM5 with official warranty. Free express delivery in Dhaka, genuine BTRC approved."
                  rows={3}
                  maxLength={160}
                  showCount
                />
              </CentralFormField>
            </CentralFormSection>
          </TabsContent>
        </Tabs>
      </form>

      {/* SHOPIFY-STYLE VARIANT IMAGE SELECTION MODAL */}
      <Dialog
        open={Boolean(imagePickerVariantId)}
        onOpenChange={(open) => !open && setImagePickerVariantId(null)}
      >
        <DialogContent className="max-w-xl p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Select Image for Variant: {currentVariantForImage?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pick an existing image from the product gallery or upload a new photo for this specific variant.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Gallery Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
              {files.map((file) => {
                const isCurrent = currentVariantForImage?.image === file.url;
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => {
                      if (currentVariantForImage) {
                        handleAssignVariantImage(currentVariantForImage.id, file.url || "");
                      }
                    }}
                    className={`group relative aspect-square rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                      isCurrent
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-1 shadow-xs">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Upload New Photo
              </Button>

              <div className="flex items-center gap-2">
                {currentVariantForImage &&
                  currentVariantForImage.image &&
                  Object.keys(currentVariantForImage.optionValues).some((k) =>
                    k.toLowerCase().includes("color")
                  ) && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleApplyImageToMatchingColor(
                          currentVariantForImage,
                          currentVariantForImage.image!
                        )
                      }
                      className="text-xs"
                    >
                      Apply to All Matching Colors
                    </Button>
                  )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentVariantForImage) {
                      handleAssignVariantImage(currentVariantForImage.id, "");
                    }
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Clear Image
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
