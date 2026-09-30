"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  SlidersHorizontal,
  Palette,
  Layers,
  Plus,
  Trash2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { AttributeRow } from "@/lib/data/catalog";

export default function NewAttributePage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [displayType, setDisplayType] = useState<"pills" | "color" | "select">("pills");
  const [variantCreation, setVariantCreation] = useState<"Instantly" | "Dynamically" | "Never">(
    "Instantly"
  );
  const [newValueInput, setNewValueInput] = useState("");
  const [values, setValues] = useState<string[]>(["Space Gray", "Silver", "Midnight Black"]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddValue = () => {
    const trimmed = newValueInput.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      appToast.error("Duplicate", "This attribute value already exists in the list.");
      return;
    }
    setValues((prev) => [...prev, trimmed]);
    setNewValueInput("");
  };

  const handleRemoveValue = (val: string) => {
    if (values.length <= 1) {
      appToast.error("Required", "An attribute must have at least one value.");
      return;
    }
    setValues((prev) => prev.filter((v) => v !== val));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Attribute name is required.");
      return;
    }

    if (values.length === 0) {
      appToast.error("Missing Values", "Add at least one attribute value.");
      return;
    }

    setIsSubmitting(true);
    const attrId = `ATT-${Math.floor(100 + Math.random() * 900)}`;

    const newAttr: AttributeRow = {
      id: attrId,
      name: name.trim(),
      values,
      variantCreation,
      productTypes: 0,
    };

    addRecord("product.attribute", {
      ...newAttr,
      displayType,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Attribute created",
      `"${name.trim()}" with ${values.length} value(s) added to catalog.`
    );

    setTimeout(() => {
      router.push("/attributes");
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
            <Link href="/attributes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/attributes"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Attributes
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Product Variant Attribute
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/attributes">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Attribute
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Attribute Details & Values */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Creation Mode */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Attribute Definition</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Attribute Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Storage Capacity / Color"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Variant Creation Policy</label>
                <select
                  value={variantCreation}
                  onChange={(e) => setVariantCreation(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Instantly">Instantly (Generate full SKU variant matrix)</option>
                  <option value="Dynamically">Dynamically (Create when first ordered)</option>
                  <option value="Never">Never (Custom specifications only, no SKU split)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Storefront Display Style</label>
                <select
                  value={displayType}
                  onChange={(e) => setDisplayType(e.target.value as any)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="pills">Pill Badges (Sizes, Memory, Storage)</option>
                  <option value="color">Color Swatch Circles (Finishes)</option>
                  <option value="select">Dropdown Menu Select Box</option>
                </select>
              </div>
            </div>
          </div>

          {/* Values List Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Attribute Option Values</h2>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type value (e.g. 256GB / Graphite) and click Add..."
                value={newValueInput}
                onChange={(e) => setNewValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                className="flex-1 h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <Button
                type="button"
                onClick={handleAddValue}
                className="h-10 px-4 cursor-pointer"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Value
              </Button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {values.map((val) => (
                <div
                  key={val}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-muted/40 text-sm font-semibold text-foreground shadow-2xs"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(val)}
                    className="text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Notes & Info */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Variant Matrix Rule</h2>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              When attached to a Product Template, each value above multiplies the total variant
              combinations. Each generated variant will track its own barcode, stock inventory, and
              cost price.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <h2 className="text-base font-semibold text-foreground">Internal Notes</h2>
            <textarea
              rows={4}
              placeholder="Internal taxonomy conventions or supplier mapping..."
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
