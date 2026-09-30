/**
 * VoltMart Theme Color Preset Engine
 * ------------------------------------------------------------------
 * Supports preset palettes + custom hex brand colors.
 * Injects dynamic CSS variables for both Light Mode and Dark Mode.
 */

export interface ThemePreset {
  id: string;
  name: string;
  label: string;
  hex: string;
  lightPrimary: string;
  lightPrimaryForeground: string;
  darkPrimary: string;
  darkPrimaryForeground: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "electric-blue",
    name: "Volt Electric Blue",
    label: "Electric Blue",
    hex: "#2563eb",
    lightPrimary: "oklch(0.55 0.22 255)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.65 0.22 255)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    label: "Emerald",
    hex: "#059669",
    lightPrimary: "oklch(0.55 0.19 155)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.68 0.19 155)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "royal-violet",
    name: "Royal Violet",
    label: "Royal Violet",
    hex: "#7c3aed",
    lightPrimary: "oklch(0.53 0.24 290)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.68 0.24 290)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "cyber-amber",
    name: "Cyber Amber",
    label: "Cyber Amber",
    hex: "#d97706",
    lightPrimary: "oklch(0.60 0.18 70)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.75 0.18 70)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "sunset-rose",
    name: "Sunset Rose",
    label: "Sunset Rose",
    hex: "#e11d48",
    lightPrimary: "oklch(0.55 0.23 15)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.68 0.23 15)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "ocean-cyan",
    name: "Ocean Cyan",
    label: "Ocean Cyan",
    hex: "#0891b2",
    lightPrimary: "oklch(0.58 0.16 215)",
    lightPrimaryForeground: "oklch(0.99 0 0)",
    darkPrimary: "oklch(0.70 0.16 215)",
    darkPrimaryForeground: "oklch(0.12 0 0)",
  },
  {
    id: "monochrome",
    name: "Minimal Monochrome",
    label: "Monochrome",
    hex: "#171717",
    lightPrimary: "oklch(0.205 0 0)",
    lightPrimaryForeground: "oklch(0.985 0 0)",
    darkPrimary: "oklch(0.985 0 0)",
    darkPrimaryForeground: "oklch(0.145 0 0)",
  },
];

export const DEFAULT_THEME_PRESET = "electric-blue";

/**
 * Generate CSS variable block for any hex color
 */
export function generateThemeCss(presetId: string, customHex?: string): string {
  let lightPrimary = "oklch(0.55 0.22 255)";
  let lightFg = "oklch(0.99 0 0)";
  let darkPrimary = "oklch(0.65 0.22 255)";
  let darkFg = "oklch(0.12 0 0)";

  if (presetId === "custom" && customHex) {
    // Direct CSS hex calculation
    lightPrimary = customHex;
    darkPrimary = customHex;
    lightFg = "#ffffff";
    darkFg = "#000000";
  } else {
    const found = THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0];
    lightPrimary = found.lightPrimary;
    lightFg = found.lightPrimaryForeground;
    darkPrimary = found.darkPrimary;
    darkFg = found.darkPrimaryForeground;
  }

  return `
:root {
  --primary: ${lightPrimary} !important;
  --primary-foreground: ${lightFg} !important;
  --ring: ${lightPrimary} !important;
  --sidebar-primary: ${lightPrimary} !important;
  --sidebar-primary-foreground: ${lightFg} !important;
  --sidebar-ring: ${lightPrimary} !important;
  --chart-1: ${lightPrimary} !important;
}
.dark {
  --primary: ${darkPrimary} !important;
  --primary-foreground: ${darkFg} !important;
  --ring: ${darkPrimary} !important;
  --sidebar-primary: ${darkPrimary} !important;
  --sidebar-primary-foreground: ${darkFg} !important;
  --sidebar-ring: ${darkPrimary} !important;
  --chart-1: ${darkPrimary} !important;
}
`;
}
