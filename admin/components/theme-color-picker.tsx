"use client";

import React, { useState } from "react";
import { Check, Sparkles, RotateCcw, Palette, Sun, Moon } from "lucide-react";
import { useThemeColor } from "@/lib/theme/theme-context";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";

export function ThemeColorPicker() {
  const { themeColor, customHex, presets, setThemeColor, resetThemeColor } = useThemeColor();
  const { resolvedTheme, setTheme } = useTheme();
  const appToast = useToast();

  const [hexInput, setHexInput] = useState(customHex);

  const handleSelectPreset = (presetId: string, presetName: string) => {
    setThemeColor(presetId);
    appToast.success("Theme Color Applied", `Switched theme accent to ${presetName}.`);
  };

  const handleApplyCustomHex = (colorVal: string) => {
    let clean = colorVal.trim();
    if (!clean.startsWith("#")) {
      clean = `#${clean}`;
    }
    // Validate 3 or 6 hex digits
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
      appToast.error("Invalid Hex Code", "Please enter a valid hex color code (e.g. #3b82f6).");
      return;
    }
    setHexInput(clean);
    setThemeColor("custom", clean);
    appToast.success("Custom Theme Applied", `Primary color set to ${clean.toUpperCase()}.`);
  };

  const handleReset = () => {
    resetThemeColor();
    setHexInput("#2563eb");
    appToast.info("Theme Reset", "Accent color returned to default Volt Electric Blue.");
  };

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="space-y-6 w-full">
      {/* Top Description & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Brand & Accent Palette
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a curated brand tone or pick a custom hex color to tailor the entire admin interface.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-9 px-3 text-xs font-medium cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Switch to Light
              </>
            ) : (
              <>
                <Moon className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Switch to Dark
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Preset Swatches Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Curated Brand Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {presets.map((preset) => {
            const isSelected = mounted && themeColor === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id, preset.name)}
                className={`group relative flex flex-col items-center gap-2.5 p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                {/* Swatch circle with checkmark */}
                <span
                  className="h-9 w-9 rounded-full shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: preset.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`h-4 w-4 stroke-[3] ${
                        preset.id === "cyber-amber" ? "text-neutral-950" : "text-white"
                      }`}
                    />
                  )}
                </span>

                <span className="block min-w-0">
                  <span className="block text-xs font-semibold text-foreground truncate">{preset.label}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground uppercase">{preset.hex}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Input Section */}
      <div className="p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Custom Brand Color</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Color picker input box */}
            <div className="relative h-10 w-12 rounded-lg border border-border overflow-hidden shrink-0 cursor-pointer">
              <input
                type="color"
                value={hexInput.startsWith("#") ? hexInput : "#2563eb"}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  handleApplyCustomHex(e.target.value);
                }}
                className="absolute -inset-2 h-14 w-16 cursor-pointer border-0 bg-transparent"
                title="Open color palette"
              />
            </div>

            <div className="relative flex-1 sm:w-44">
              <input
                type="text"
                placeholder="#2563eb"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCustomHex(hexInput);
                  }
                }}
                className="w-full h-10 px-3 text-sm font-mono rounded-lg border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => handleApplyCustomHex(hexInput)}
            className="w-full sm:w-auto h-10 px-4 text-xs font-semibold cursor-pointer active:scale-[0.98] transition-all"
          >
            Apply Custom Color
          </Button>

          {mounted && themeColor === "custom" && (
            <Badge variant="outline" className="border-primary/50 text-primary font-semibold text-xs py-1">
              Active: Custom Color ({(customHex || "#2563eb").toUpperCase()})
            </Badge>
          )}
        </div>
      </div>

      {/* Live Interactive Preview Card */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Interface Preview ({isDark ? "Dark Theme" : "Light Theme"})
          </span>
          <span className="text-[11px] text-muted-foreground">Changes take effect immediately across all pages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Sample 1: Primary Action Button */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Primary Button</span>
            <div>
              <Button className="w-full h-10 cursor-pointer shadow-xs active:scale-[0.98] transition-all">
                Publish Product
              </Button>
            </div>
          </div>

          {/* Sample 2: Outline Button with Hover Tints */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Outline with Tint</span>
            <div>
              <Button variant="outline" className="w-full h-10 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer">
                View Analytics
              </Button>
            </div>
          </div>

          {/* Sample 3: Metric Pill & Badges */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Badges & Accents</span>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                Live Store
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground shadow-2xs">
                Active
              </span>
            </div>
          </div>

          {/* Sample 4: Mini KPI block */}
          <div className="p-3 rounded-lg border border-border/80 bg-card shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
            <div className="text-lg font-extrabold tracking-tight text-primary font-mono">৳1,48,250</div>
          </div>
        </div>
      </div>
    </div>
  );
}
