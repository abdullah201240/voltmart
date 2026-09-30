"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { THEME_PRESETS, DEFAULT_THEME_PRESET, generateThemeCss, ThemePreset } from "./color-presets";

interface ThemeColorContextType {
  themeColor: string;
  customHex: string;
  presets: ThemePreset[];
  setThemeColor: (presetId: string, hex?: string) => void;
  resetThemeColor: () => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

const STORAGE_PRESET_KEY = "vm_theme_color";
const STORAGE_HEX_KEY = "vm_theme_hex";

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<string>(DEFAULT_THEME_PRESET);
  const [customHex, setCustomHexState] = useState<string>("#2563eb");

  // Apply style tag into document head
  const applyStyles = useCallback((presetId: string, hex: string) => {
    if (typeof document === "undefined") return;

    let styleTag = document.getElementById("vm-theme-color-vars");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "vm-theme-color-vars";
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = generateThemeCss(presetId, hex);
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem(STORAGE_PRESET_KEY);
      const savedHex = localStorage.getItem(STORAGE_HEX_KEY);
      const effectivePreset = savedPreset || DEFAULT_THEME_PRESET;
      const effectiveHex = savedHex || "#2563eb";

      if (savedPreset) {
        setThemeColorState(savedPreset);
      }
      if (savedHex) {
        setCustomHexState(savedHex);
      }
      applyStyles(effectivePreset, effectiveHex);
    } catch {
      applyStyles(DEFAULT_THEME_PRESET, "#2563eb");
    }
  }, [applyStyles]);


  const setThemeColor = useCallback(
    (presetId: string, hex?: string) => {
      setThemeColorState(presetId);
      const effectiveHex = hex || customHex;
      if (hex) {
        setCustomHexState(hex);
      }

      try {
        localStorage.setItem(STORAGE_PRESET_KEY, presetId);
        if (hex) {
          localStorage.setItem(STORAGE_HEX_KEY, hex);
        }
      } catch {
        /* ignore localStorage quota/disabled */
      }

      applyStyles(presetId, effectiveHex);
    },
    [customHex, applyStyles]
  );

  const resetThemeColor = useCallback(() => {
    setThemeColor(DEFAULT_THEME_PRESET, "#2563eb");
  }, [setThemeColor]);

  return (
    <ThemeColorContext.Provider
      value={{
        themeColor,
        customHex,
        presets: THEME_PRESETS,
        setThemeColor,
        resetThemeColor,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const ctx = useContext(ThemeColorContext);
  if (!ctx) {
    throw new Error("useThemeColor must be used within ThemeColorProvider");
  }
  return ctx;
}
