"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Landmark,
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { FISCAL_POSITION, type FiscalPositionRow } from "@/lib/data/settings";

interface TaxMapItem {
  id: string;
  source: string;
  dest: string;
}

export default function NewFiscalPositionPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [appliesTo, setAppliesTo] = useState("Export / Zero-Rated Markets");
  const [note, setNote] = useState("");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [active, setActive] = useState(true);
  const [taxMaps, setTaxMaps] = useState<TaxMapItem[]>([
    { id: "1", source: "VAT 15%", dest: "Zero-Rated 0%" },
  ]);

  const addMapping = () => {
    setTaxMaps((prev) => [
      ...prev,
      { id: Date.now().toString(), source: "VAT 15%", dest: "Zero-Rated 0%" },
    ]);
  };

  const removeMapping = (id: string) => {
    setTaxMaps((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMapping = (id: string, field: "source" | "dest", value: string) => {
    setTaxMaps((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Fiscal position name is required.");
      return;
    }
    if (!appliesTo.trim()) {
      appToast.error("Validation error", "Target country or partner group is required.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `FP-${Date.now().toString(36).toUpperCase()}`;
      const newFp: FiscalPositionRow = {
        id: generatedId,
        name: name.trim(),
        appliesTo: appliesTo.trim(),
        note: note.trim() || "Configured via admin panel — tax substitutions active.",
        reverseCharge,
        active,
        taxMaps: taxMaps.map((m) => ({ source: m.source, dest: m.dest })),
      };

      addRecord(FISCAL_POSITION, newFp as unknown as Record<string, unknown>);
      appToast.success("Fiscal position created", `“${newFp.name}” is now active.`);
      router.push("/accounting/fiscal");
    } catch {
      appToast.error("Failed to save", "Could not register fiscal position.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <Link
            href="/accounting/fiscal"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Fiscal Positions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Create Fiscal Position</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Tax Substitution
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Define statutory tax substitutions and reverse-charge rules for specific customer tiers, export orders, or EPZ deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/accounting/fiscal")}
            className="h-11 px-5 cursor-pointer"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-6 font-semibold cursor-pointer active:scale-[0.98] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Registering..." : "Save Position"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Position Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Position Identity &amp; Target</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Fiscal Position Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export 0% VAT, EPZ Enterprise Zero-Rating"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Applies To (Jurisdiction or Segment) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Foreign Buyers, EPZ Companies, Embassies & Diplomatic Missions"
                  value={appliesTo}
                  onChange={(e) => setAppliesTo(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">When an invoice matches this partner criterion, default catalog taxes will be substituted.</p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Internal Operational Note</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Legal rationale, Mushak certificate requirements, or statutory circular number."
                  className="w-full p-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>

          {/* Tax Mapping Matrix */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Tax Substitution Rules</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMapping}
                className="cursor-pointer gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Mapping
              </Button>
            </div>

            <div className="space-y-3">
              {taxMaps.map((map) => (
                <div
                  key={map.id}
                  className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-lg border border-border/80 bg-muted/20"
                >
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs text-muted-foreground">Original Catalog Tax</label>
                    <input
                      type="text"
                      value={map.source}
                      onChange={(e) => updateMapping(map.id, "source", e.target.value)}
                      placeholder="e.g. VAT 15%"
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block mt-4" />

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-xs text-muted-foreground">Substituted Tax</label>
                    <input
                      type="text"
                      value={map.dest}
                      onChange={(e) => updateMapping(map.id, "dest", e.target.value)}
                      placeholder="e.g. Zero-Rated 0%"
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMapping(map.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive cursor-pointer sm:mt-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {taxMaps.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border/80 rounded-lg text-sm text-muted-foreground">
                  No tax substitutions configured. Invoices will retain default catalog rates.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          {/* Reverse Charge Mechanism */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Special Fiscal Protocols</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <div>
                  <span className="font-semibold text-foreground">Reverse Charge (VDS)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Buyer withholds tax at source and deposits directly to the NBR treasury on behalf of the transaction.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer pt-3 border-t border-border/60">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <span className="font-medium">Active Position</span>
              </label>
            </div>
          </div>

          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Applied fiscal positions ensure Mushak 6.3 invoices and financial vouchers strictly match NBR tax exemptions.
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
