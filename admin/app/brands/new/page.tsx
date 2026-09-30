"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Award,
  Globe,
  Image as ImageIcon,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { BrandRow } from "@/lib/data/catalog";

const COUNTRIES = [
  "Japan",
  "United States",
  "South Korea",
  "China",
  "Germany",
  "Bangladesh",
  "Taiwan",
  "United Kingdom",
  "Sweden",
  "Switzerland",
];

export default function NewBrandPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [logoUrl, setLogoUrl] = useState("");
  const [authorizedDistributor, setAuthorizedDistributor] = useState("VoltMart Authorized Direct Importer");
  const [warrantySupport, setWarrantySupport] = useState("Official Service Center Dhaka");
  const [description, setDescription] = useState("");
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
      appToast.error("Missing Name", "Brand name is required.");
      return;
    }

    setIsSubmitting(true);
    const brandId = `BR-${Math.floor(100 + Math.random() * 900)}`;

    const newBrand: BrandRow = {
      id: brandId,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, "-"),
      products: 0,
      revenue: 0,
    };

    addRecord("product.brand", {
      ...newBrand,
      website: website.trim() || undefined,
      country,
      logoUrl: logoUrl.trim() || undefined,
      authorizedDistributor,
      warrantySupport,
      description: description.trim() || undefined,
    });

    appToast.success(
      "Brand created",
      `"${name.trim()}" registered into brand catalog.`
    );

    setTimeout(() => {
      router.push("/brands");
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
            <Link href="/brands">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/brands"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Brands
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Brand / Manufacturer
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/brands">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Brand
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Brand Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Brand Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sennheiser"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Brand URL Slug</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="sennheiser"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Official Global Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://www.sennheiser.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Country of Headquarters</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Brand Logo Asset URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://images.voltmart.com/brands/sennheiser-logo.svg"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">About the Brand</label>
              <textarea
                rows={4}
                placeholder="Heritage, sound signature, acoustic engineering highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Warranty & Representation */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Warranty & Bangladesh Rights</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Authorized Channel Status</label>
              <input
                type="text"
                value={authorizedDistributor}
                onChange={(e) => setAuthorizedDistributor(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Official RMA / Service Hub</label>
              <input
                type="text"
                value={warrantySupport}
                onChange={(e) => setWarrantySupport(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Displayed on product specifications for customer assurance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
