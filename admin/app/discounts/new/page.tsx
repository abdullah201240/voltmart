"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Ticket,
  Calendar,
  Sparkles,
  Users,
  Package,
  Layers,
  Search,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { VoucherRow, DiscountScope } from "@/lib/data/discounts";
import { getProducts, type ProductRow, CATEGORY_OPTIONS } from "@/lib/data/products";

export default function NewDiscountPage() {
  const router = useRouter();
  const appToast = useToast();

  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed" | "Shipping">("Percentage");
  const [value, setValue] = useState(15);
  const [minSpend, setMinSpend] = useState(1000);
  const [usageLimit, setUsageLimit] = useState(250);
  const [oncePerCustomer, setOncePerCustomer] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Entitlement / Scope State (Entire Order vs Specific Products vs Categories)
  const [appliesTo, setAppliesTo] = useState<DiscountScope>("order");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let alive = true;
    getProducts().then((prods) => {
      if (alive) {
        setAllProducts(prods);
        setLoadingProducts(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Filter products for the interactive picker
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return allProducts;
    const q = productSearchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [allProducts, productSearchQuery]);

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const selectAllFiltered = () => {
    const idsToAdd = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const clearSelectedProducts = () => {
    setSelectedProductIds([]);
  };

  const generateRandomCode = () => {
    const prefixes = ["EID", "FLASH", "VOLT", "SAVE", "DEAL"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      appToast.error("Missing Code", "Please specify a coupon promo code.");
      return;
    }

    if (type !== "Shipping" && (!value || value <= 0)) {
      appToast.error("Invalid Value", "Discount value must be greater than zero.");
      return;
    }

    if (appliesTo === "products" && selectedProductIds.length === 0) {
      appToast.error(
        "No Products Selected",
        "Please select at least one specific product for this discount to apply to."
      );
      return;
    }

    if (appliesTo === "categories" && selectedCategories.length === 0) {
      appToast.error(
        "No Categories Selected",
        "Please select at least one product category for this discount."
      );
      return;
    }

    setIsSubmitting(true);
    const voucherId = `VC-${Date.now().toString(36).toUpperCase()}`;

    const discountLabel =
      type === "Percentage"
        ? `${value}% off`
        : type === "Shipping"
        ? "Free shipping"
        : `৳${value.toLocaleString("en-IN")} off`;

    // Extract names of selected products for quick display in listings
    const selectedProductNames =
      appliesTo === "products"
        ? allProducts.filter((p) => selectedProductIds.includes(p.id)).map((p) => p.name)
        : undefined;

    const newVoucher: VoucherRow = {
      id: voucherId,
      code: cleanCode,
      type,
      value: type === "Shipping" ? 0 : value,
      discount: discountLabel,
      usageLimit: Number(usageLimit) || 0,
      used: 0,
      startsAt: new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      expiresAt: new Date(expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Active",
      appliesTo,
      selectedProductIds: appliesTo === "products" ? selectedProductIds : undefined,
      selectedProductNames,
      selectedCategories: appliesTo === "categories" ? selectedCategories : undefined,
    };

    addRecord("discount.voucher", {
      ...newVoucher,
      minSpend,
      oncePerCustomer,
      notes: notes.trim() || undefined,
    });

    const targetDesc =
      appliesTo === "products"
        ? `applied to ${selectedProductIds.length} specific product(s)`
        : appliesTo === "categories"
        ? `applied to ${selectedCategories.join(", ")}`
        : "applied to entire order";

    appToast.success(
      "Voucher code created",
      `Coupon ${cleanCode} (${discountLabel}, ${targetDesc}) is now active.`
    );

    setTimeout(() => {
      router.push("/discounts");
    }, 400);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 cursor-pointer hover:bg-muted"
          >
            <Link href="/discounts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/discounts"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Discounts & Vouchers
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Promotional Voucher
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/discounts">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Voucher
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Voucher Code, Type, Applies To Scope & Values */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coupon Code Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Voucher Code & Mechanism</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomCode}
                className="h-9 px-3 text-xs font-medium cursor-pointer"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Random Code
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Promo Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLASH20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono font-bold tracking-wider uppercase focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Percentage">Percentage Discount (%)</option>
                  <option value="Fixed">Fixed Amount Discount (৳ BDT)</option>
                  <option value="Shipping">Free Delivery / Shipping</option>
                </select>
              </div>

              {type !== "Shipping" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {type === "Percentage" ? "Discount Percentage (%)" : "Fixed Discount Amount (৳)"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={type === "Percentage" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Minimum Cart Subtotal (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* APPLIES TO (ENTITLEMENT SCOPE) CARD — SHOPIFY / SALEOR STYLE */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Applies To (Target Scope)</h2>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {appliesTo === "order"
                  ? "Entire Order"
                  : appliesTo === "products"
                  ? `${selectedProductIds.length} Products Selected`
                  : `${selectedCategories.length} Categories Selected`}
              </Badge>
            </div>

            {/* Scope Selection Radios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setAppliesTo("order")}
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  appliesTo === "order"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xs"
                    : "border-border/80 hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">All Products</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${appliesTo === "order" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {appliesTo === "order" && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Applies to the entire cart subtotal at checkout.</p>
              </label>

              <label
                onClick={() => setAppliesTo("products")}
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  appliesTo === "products"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xs"
                    : "border-border/80 hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">Specific Products</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${appliesTo === "products" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {appliesTo === "products" && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Applies only to selected designated items or SKUs.</p>
              </label>

              <label
                onClick={() => setAppliesTo("categories")}
                className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                  appliesTo === "categories"
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-2xs"
                    : "border-border/80 hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">Specific Categories</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${appliesTo === "categories" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                    {appliesTo === "categories" && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Applies to any product within selected categories.</p>
              </label>
            </div>

            {/* CONDITIONAL SECTION 1: SPECIFIC PRODUCTS PICKER */}
            {appliesTo === "products" && (
              <div className="space-y-4 pt-2 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products by title, SKU, or category..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllFiltered}
                      className="h-9 text-xs font-semibold cursor-pointer"
                    >
                      <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                      Select Filtered ({filteredProducts.length})
                    </Button>
                    {selectedProductIds.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedProducts}
                        className="h-9 text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" /> Clear All ({selectedProductIds.length})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Selected Product Chips */}
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/60 max-h-28 overflow-y-auto">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">
                      Active Targets ({selectedProductIds.length}):
                    </span>
                    {selectedProductIds.map((id) => {
                      const prod = allProducts.find((p) => p.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border/80 text-xs font-medium text-foreground shadow-2xs"
                        >
                          <span className="truncate max-w-[200px]">{prod ? prod.name : id}</span>
                          <button
                            type="button"
                            onClick={() => toggleProduct(id)}
                            className="text-muted-foreground hover:text-rose-500 cursor-pointer ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Scrollable Product Table / List */}
                <div className="border border-border/80 rounded-lg max-h-72 overflow-y-auto divide-y divide-border/60 bg-card">
                  {loadingProducts ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Loading catalog products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No matching products found for &ldquo;{productSearchQuery}&rdquo;
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isChecked = selectedProductIds.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProduct(product.id)}
                          className={`flex items-center justify-between p-3.5 text-sm transition-colors cursor-pointer select-none ${
                            isChecked
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 text-primary">
                              {isChecked ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-foreground truncate">{product.name}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="font-mono">{product.sku}</span>
                                <span>•</span>
                                <span>{product.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <span className="font-mono font-bold text-sm text-foreground">{product.price}</span>
                            <Badge variant={product.stock > 0 ? "outline" : "secondary"} className="text-[10px]">
                              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* CONDITIONAL SECTION 2: SPECIFIC CATEGORIES */}
            {appliesTo === "categories" && (
              <div className="space-y-3 pt-2 border-t border-border/60">
                <label className="text-xs font-semibold text-foreground">
                  Select Applicable Categories <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORY_OPTIONS.filter((c) => c.value !== "all").map((cat) => {
                    const isSelected = selectedCategories.includes(cat.label);
                    return (
                      <div
                        key={cat.value}
                        onClick={() => toggleCategory(cat.label)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/40 font-semibold"
                            : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="shrink-0">
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs truncate">{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Usage & Redemptions Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Usage Limits & Eligibility</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Total Redemption Limit (Global)
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Coupon automatically expires after this number of successful checkouts.
                </p>
              </div>

              <div className="space-y-3 pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oncePerCustomer}
                    onChange={(e) => setOncePerCustomer(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Limit 1 Per Customer</span>
                    <p className="text-xs text-muted-foreground">
                      Tracked by customer phone number and checkout email address.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Validity & Notes */}
        <div className="space-y-6">
          {/* Validity Period */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Active Validity Window</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Campaign Notes</h2>
            <textarea
              rows={4}
              placeholder="Marketing campaign source (e.g. Facebook Ads, Influencer affiliate code)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
