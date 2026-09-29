"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Scale, Save } from "lucide-react";
import { getGeneralSettings, type GeneralSettings } from "@/lib/data/settings";

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="h-11" />
    </div>
  );
}

export default function SettingsGeneralPage() {
  const [settings, setSettings] = useState<GeneralSettings | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getGeneralSettings().then((s) => {
      if (alive) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
          <p className="text-sm text-muted-foreground">Store identity and unit-of-measure preferences.</p>
        </div>
        <Button className="h-11 px-5 text-sm font-medium cursor-pointer">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

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
              <Field label="Store name" value={settings?.storeName} />
              <Field label="Contact email" value={settings?.email} />
              <Field label="Phone" value={settings?.phone} />
              <Field label="Address" value={settings?.address} />
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6 shadow-xs border-border/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Scale className="h-4 w-4" /> Localization
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Default currency" value={settings?.currency} />
              <Field label="Timezone" value={settings?.timezone} />
            </div>
          </Card>

          <Card className="p-6 shadow-xs border-border/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Scale className="h-4 w-4" /> Units of Measure
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Weight unit" value={settings?.weightUnit} />
              <Field label="Length unit" value={settings?.lengthUnit} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
