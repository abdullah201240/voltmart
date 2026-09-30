"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Scale, Save } from "lucide-react";
import { getGeneralSettings, GENERAL_SETTINGS, GENERAL_SETTINGS_REF, type GeneralSettings } from "@/lib/data/settings";
import { patchFields, addHistory } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";
import { ThemeColorPicker } from "@/components/theme-color-picker";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="h-11" />
    </div>
  );
}

export default function SettingsGeneralPage() {
  const appToast = useToast();
  const [settings, setSettings] = useState<GeneralSettings | undefined>();
  const [draft, setDraft] = useState<GeneralSettings | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getGeneralSettings().then((s) => {
      if (alive) {
        setSettings(s);
        setDraft(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const dirty =
    draft !== undefined &&
    settings !== undefined &&
    JSON.stringify(draft) !== JSON.stringify(settings);

  const set = (key: keyof GeneralSettings) => (v: string) =>
    setDraft((prev) => (prev ? { ...prev, [key]: v } : prev));

  const save = () => {
    if (!draft) return;
    patchFields(GENERAL_SETTINGS, GENERAL_SETTINGS_REF, draft as unknown as Record<string, unknown>);
    addHistory(GENERAL_SETTINGS, GENERAL_SETTINGS_REF, "General settings updated");
    setSettings(draft);
    appToast.success("Settings saved", "General store settings were persisted.");
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-sm text-muted-foreground">Store identity and unit-of-measure preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
            </span>
          )}
          <Button
            className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
            onClick={save}
            disabled={!dirty}
          >
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Brand Theme & Appearance Customizer */}
      <Card className="p-6 shadow-xs border-border/80 w-full">
        <ThemeColorPicker />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 shadow-xs border-border/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Building2 className="h-4 w-4" /> Store Information
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="h-11 animate-pulse rounded-md bg-muted" />
              <div className="h-11 animate-pulse rounded-md bg-muted" />
              <div className="h-11 animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <>
              <Field label="Store name" value={draft?.storeName} onChange={set("storeName")} />
              <Field label="Contact email" value={draft?.email} onChange={set("email")} />
              <Field label="Phone" value={draft?.phone} onChange={set("phone")} />
              <Field label="Address" value={draft?.address} onChange={set("address")} />
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Scale className="h-4 w-4" /> Localization
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Default currency" value={draft?.currency} onChange={set("currency")} />
              <Field label="Timezone" value={draft?.timezone} onChange={set("timezone")} />
            </div>
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" /> Units of Measure
              </div>
              <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold cursor-pointer">
                <Link href="/settings/units">
                  Configure Units (UoM) &rarr;
                </Link>
              </Button>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Weight unit" value={draft?.weightUnit} onChange={set("weightUnit")} />
              <Field label="Length unit" value={draft?.lengthUnit} onChange={set("lengthUnit")} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
