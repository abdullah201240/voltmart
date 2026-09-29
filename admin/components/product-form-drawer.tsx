"use client";

import React, { useState } from "react";
import {
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import {
  CentralForm,
  CentralFormDrawer,
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

const CATEGORY_OPTIONS: DropboxOption[] = [
  { value: "smartphones", label: "Smartphones & Mobile", description: "Flagship & budget phones" },
  { value: "tablets", label: "Tablets & E-Readers", description: "iOS & Android slates" },
  { value: "laptops", label: "Laptops & Workstations", description: "Ultrabooks & creators" },
  { value: "audio", label: "Audio & Acoustics", description: "Noise-canceling & studio gear" },
  { value: "gaming", label: "Gaming Gear", description: "Consoles, handhelds, peripherals" },
  { value: "accessories", label: "Peripherals & Cables", description: "Chargers, hubs, adapters" },
];

const CHANNEL_OPTIONS: DropboxOption[] = [
  { value: "default-channel", label: "Default Channel (USD)", badge: "Primary" },
  { value: "global-channel", label: "Global Cross-Border (EUR)", badge: "Active" },
  { value: "b2b-wholesale", label: "B2B Wholesale (USD)", badge: "Tiered" },
];

export interface ProductFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated?: (product: { title: string; price: string }) => void;
}

export function ProductFormDrawer({
  open,
  onOpenChange,
  onProductCreated,
}: ProductFormDrawerProps) {
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [category, setCategory] = useState("smartphones");
  const [channel, setChannel] = useState("default-channel");
  const [stockQuantity, setStockQuantity] = useState("50");
  const [lowStockAlert, setLowStockAlert] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [isTaxable, setIsTaxable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [files, setFiles] = useState<UploadedFileItem[]>([
    {
      id: "1",
      name: "product-cover.webp",
      size: "245 KB",
      url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=120&auto=format&fit=crop&q=80",
    },
  ]);

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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Product title is required";
    if (!sku.trim()) errs.sku = "SKU is required";
    if (!price.trim()) {
      errs.price = "Price is required";
    } else if (isNaN(Number(price))) {
      errs.price = "Price must be a valid number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      if (onProductCreated) {
        onProductCreated({ title, price: `$${Number(price).toFixed(2)}` });
      }
      setTimeout(() => {
        setSubmitted(false);
        onOpenChange(false);
        // Reset form
        setTitle("");
        setSku("");
        setPrice("");
        setDescription("");
      }, 900);
    }, 800);
  };

  return (
    <CentralFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Product"
      description="Add a new catalog item with pricing, inventory tracking, and channel rules."
      badge={
        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
          Catalog v2
        </span>
      }
      width="wide"
    >
      {submitted ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 animate-in fade-in-0 zoom-in-95">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Product Created Successfully!
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            &ldquo;{title}&rdquo; is now active and published across the selected sales channels.
          </p>
        </div>
      ) : (
        <CentralForm onSubmit={handleSubmit} variant="plain">
          {/* Section 1: Basic Information */}
          <CentralFormSection
            title="General Information"
            description="Core identifiers and customer-facing descriptions."
            icon={Package}
            columns={2}
          >
            <CentralFormField
              label="Product Title"
              htmlFor="prod-title"
              required
              error={errors.title}
              colSpan="full"
              helperText="Give your product a clear, descriptive name"
            >
              <CentralFormInput
                id="prod-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ultra Pro Wireless Noise-Canceling Headphones"
                error={Boolean(errors.title)}
              />
            </CentralFormField>

            <CentralFormField
              label="Stock Keeping Unit (SKU)"
              htmlFor="prod-sku"
              required
              error={errors.sku}
              colSpan={1}
            >
              <CentralFormInput
                id="prod-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. HDPH-PRO-BLK"
                error={Boolean(errors.sku)}
              />
            </CentralFormField>

            <CentralFormField
              label="Barcode / UPC / EAN"
              htmlFor="prod-barcode"
              colSpan={1}
            >
              <CentralFormInput
                id="prod-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 194252000000"
              />
            </CentralFormField>

            <CentralFormField
              label="Product Description"
              htmlFor="prod-desc"
              colSpan="full"
              helperText="Describe key features, specs, and package contents."
            >
              <CentralFormTextarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a rich summary of the product..."
                rows={4}
                maxLength={500}
                showCount
              />
            </CentralFormField>
          </CentralFormSection>

          {/* Section 2: Pricing & Finance */}
          <CentralFormSection
            title="Pricing & Margins"
            description="Set customer price, discount baseline, and internal unit cost."
            icon={DollarSign}
            columns={3}
          >
            <CentralFormField
              label="Selling Price"
              htmlFor="prod-price"
              required
              error={errors.price}
              colSpan={1}
            >
              <CentralFormInput
                id="prod-price"
                type="number"
                step="0.01"
                prefixText="$"
                suffixText="USD"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="299.00"
                error={Boolean(errors.price)}
              />
            </CentralFormField>

            <CentralFormField
              label="Compare-at Price"
              htmlFor="prod-compare-price"
              colSpan={1}
              tooltip="Original price before discount for crossed-out display"
            >
              <CentralFormInput
                id="prod-compare-price"
                type="number"
                step="0.01"
                prefixText="$"
                suffixText="USD"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                placeholder="349.00"
              />
            </CentralFormField>

            <CentralFormField
              label="Cost per item"
              htmlFor="prod-cost"
              colSpan={1}
              tooltip="Internal cost price for margin calculation (customers won't see this)"
            >
              <CentralFormInput
                id="prod-cost"
                type="number"
                step="0.01"
                prefixText="$"
                suffixText="USD"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="145.00"
              />
            </CentralFormField>
          </CentralFormSection>

          {/* Section 3: Organization & Category */}
          <CentralFormSection
            title="Categorization & Channels"
            description="Map product into catalog taxonomy and active sales channels."
            icon={Layers}
            columns={2}
          >
            <CentralFormField label="Primary Category" colSpan={1}>
              <SearchableDropbox
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={setCategory}
                placeholder="Select category"
                searchPlaceholder="Search product categories..."
              />
            </CentralFormField>

            <CentralFormField label="Sales Channel Availability" colSpan={1}>
              <SearchableDropbox
                options={CHANNEL_OPTIONS}
                value={channel}
                onChange={setChannel}
                placeholder="Select sales channel"
                searchPlaceholder="Search channels..."
              />
            </CentralFormField>

            <CentralFormField
              label="Stock Available"
              htmlFor="prod-stock"
              colSpan={1}
            >
              <CentralFormInput
                id="prod-stock"
                type="number"
                suffixText="units"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </CentralFormField>

            <CentralFormField
              label="Low Stock Warning Limit"
              htmlFor="prod-low-stock"
              colSpan={1}
            >
              <CentralFormInput
                id="prod-low-stock"
                type="number"
                suffixText="units"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
              />
            </CentralFormField>
          </CentralFormSection>

          {/* Section 4: Media Uploads */}
          <CentralFormSection
            title="Product Media"
            description="Upload high-resolution photography and packaging renders."
            icon={ImageIcon}
            columns={1}
          >
            <CentralFormField colSpan="full">
              <CentralFormDropzone
                files={files}
                onRemoveFile={handleRemoveFile}
                onUploadMock={handleUploadMock}
                label="Click or drop images here to upload"
                description="Supports PNG, JPG, WebP up to 10MB per image."
              />
            </CentralFormField>
          </CentralFormSection>

          {/* Section 5: Status & Rules Switches */}
          <CentralFormSection
            title="Publishing & Inventory Rules"
            description="Control storefront visibility, stock tracking, and taxation."
            columns={1}
            bordered={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <CentralFormSwitch
                label="Publish Storefront Live"
                description="Make immediately visible to buyers"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <CentralFormSwitch
                label="Track Inventory Stock"
                description="Automatically decrement on checkout"
                checked={trackQuantity}
                onCheckedChange={setTrackQuantity}
              />
              <CentralFormSwitch
                label="Charge Taxes"
                description="Apply regional sales tax rates"
                checked={isTaxable}
                onCheckedChange={setIsTaxable}
              />
            </div>
          </CentralFormSection>

          {/* Action Bar */}
          <CentralFormActions
            submitLabel="Create & Publish Product"
            cancelLabel="Discard"
            onCancel={() => onOpenChange(false)}
            loading={loading}
            dirty={Boolean(title || price || sku)}
          />
        </CentralForm>
      )}
    </CentralFormDrawer>
  );
}
