"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Library,
  Globe,
  Sliders,
  Eye,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CollectionRow } from "@/lib/data/catalog";

const CHANNELS = [
  "Default Channel (BDT)",
  "Dhaka Store (BDT)",
  "Chattogram Store (BDT)",
  "Online Marketplace",
];

export default function NewCollectionPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [type, setType] = useState<"Manual" | "Automatic">("Manual");
  const [ruleCondition, setRuleCondition] = useState("all");
  const [ruleTag, setRuleTag] = useState("Featured");
  const [published, setPublished] = useState(true);
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
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
      appToast.error("Missing Name", "Collection name is required.");
      return;
    }

    setIsSubmitting(true);
    const colId = `COL-${Math.floor(100 + Math.random() * 900)}`;

    const newCollection: CollectionRow = {
      id: colId,
      name: name.trim(),
      channel,
      products: 0,
      published,
      type,
    };

    addRecord("product.collection", {
      ...newCollection,
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      ruleCondition: type === "Automatic" ? ruleCondition : undefined,
      ruleTag: type === "Automatic" ? ruleTag : undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    });

    appToast.success(
      "Collection created",
      `"${name.trim()}" published to channel "${channel}".`
    );

    setTimeout(() => {
      router.push("/collections");
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
            <Link href="/collections">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/collections"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Collections
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Curated Collection
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/collections">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Collection
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Details & Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Library className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Collection Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Collection Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eid Mega Sale / Flagship Audio"
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
                    placeholder="eid-mega-sale"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Sales Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Banner Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://images.voltmart.com/banners/eid-sale.jpg"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Editorial Description</label>
              <textarea
                rows={4}
                placeholder="Storytelling copy displayed on the collection hero banner..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Curation Mechanism (Manual vs Smart Rules) */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Curation Method</h2>
              </div>
              <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setType("Manual")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer ${
                    type === "Manual"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Manual Pick
                </button>
                <button
                  type="button"
                  onClick={() => setType("Automatic")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer ${
                    type === "Automatic"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Automated Rules
                </button>
              </div>
            </div>

            {type === "Manual" ? (
              <div className="rounded-md border border-dashed border-border/80 p-6 text-center space-y-2">
                <Tag className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">Hand-picked curation mode</p>
                <p className="text-xs text-muted-foreground">
                  You can add individual products into this collection from the product edit screen
                  or via the bulk assign menu in the main catalog.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Products matching the automated rules below will dynamically join or leave this
                  collection.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Rule Match Condition</label>
                    <select
                      value={ruleCondition}
                      onChange={(e) => setRuleCondition(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    >
                      <option value="all">Match all conditions (AND)</option>
                      <option value="any">Match any condition (OR)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Product Must Have Tag</label>
                    <select
                      value={ruleTag}
                      onChange={(e) => setRuleTag(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                    >
                      <option value="Featured">Tag equals "Featured"</option>
                      <option value="New">Tag equals "New arrival"</option>
                      <option value="Best seller">Tag equals "Best seller"</option>
                      <option value="Sale">Tag equals "On Clearance"</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Publishing & SEO */}
        <div className="space-y-6">
          {/* Publication State */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Publishing Status</h2>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-foreground">Publish Immediately</span>
                <p className="text-xs text-muted-foreground">
                  Make this collection visible to storefront buyers upon saving.
                </p>
              </div>
            </label>
          </div>

          {/* SEO Metadata */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">SEO Metadata</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Title</label>
                <input
                  type="text"
                  placeholder={name ? `${name} | VoltMart Bangladesh` : "Collection Title"}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Browse handpicked electronics with guaranteed official brand warranties..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
