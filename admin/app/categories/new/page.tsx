"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  FolderTree,
  Globe,
  Tag,
  Eye,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CategoryNode } from "@/lib/data/catalog";

const DEFAULT_PARENTS = [
  "Smartphones & Tablets",
  "Audio & Sound",
  "Computing & Laptops",
  "Smart Wearables",
  "Power & Charging",
  "Gaming Gear",
  "Smart Home & IoT",
];

export default function NewCategoryPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("—");
  const [gpcCode, setGpcCode] = useState("");
  const [vatRate, setVatRate] = useState(15);
  const [showInMenu, setShowInMenu] = useState(true);
  const [description, setDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Category name is required.");
      return;
    }

    setIsSubmitting(true);
    const categoryId = `CAT-${Math.floor(100 + Math.random() * 900)}`;

    const newCategory: CategoryNode = {
      id: categoryId,
      name: name.trim(),
      parent: parent || "—",
      products: 0,
      showInMenu,
    };

    addRecord("product.category", {
      ...newCategory,
      slug: slug.trim() || undefined,
      gpcCode: gpcCode.trim() || undefined,
      vatRate,
      description: description.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    });

    appToast.success(
      "Category created",
      `"${name.trim()}" added under parent "${parent === "—" ? "Top Level" : parent}".`
    );

    setTimeout(() => {
      router.push("/categories");
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
            <Link href="/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/categories"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Categories
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Product Category
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/categories">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Category
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category General Info */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FolderTree className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Category Hierarchy & Metadata</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">URL Slug</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="wireless-noise-cancelling-headphones"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Parent Category</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="—">— Top Level Root Category —</option>
                  {DEFAULT_PARENTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">GS1 GPC Category Code</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="10000234 (Audio Peripheral)"
                    value={gpcCode}
                    onChange={(e) => setGpcCode(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Description & Overview</label>
              <textarea
                rows={4}
                placeholder="Category summary shown at the top of the storefront listing page..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Search Engine Optimization */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Search Engine Optimization (SEO)</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Title</label>
                <input
                  type="text"
                  placeholder={name ? `${name} | VoltMart Bangladesh` : "Category Meta Title"}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Buy genuine products in Bangladesh at best prices with official brand warranty..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Storefront Visibility & VAT */}
        <div className="space-y-6">
          {/* Navigation & Visibility */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Storefront Display</h2>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showInMenu}
                onChange={(e) => setShowInMenu(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">Show in Main Nav Menu</span>
                <p className="text-xs text-muted-foreground">
                  Display this category in the top navigation bar and mobile drawer.
                </p>
              </div>
            </label>
          </div>

          {/* Statutory VAT Classification */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Percent className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Default VAT Rate</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">NBR Statutory VAT</label>
              <select
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value={15}>15% Standard VAT (Electronics & Appliances)</option>
                <option value={7.5}>7.5% Retail Trade Margin VAT</option>
                <option value={5}>5% Special Reduced Rate</option>
                <option value={0}>0% Statutory Exempt / Essential Goods</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                All newly created products assigned to this category will inherit this VAT rule by
                default.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
