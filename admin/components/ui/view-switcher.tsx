"use client";

import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ViewTabDef {
  /** Stable key for the view mode (e.g. "list" | "kanban" | "graph" | "pivot"). */
  key: string;
  /** Tab label (hidden on small screens; the icon remains). */
  label: string;
  /** Leading lucide icon element. */
  icon: ReactNode;
}

export interface ViewSwitcherProps {
  tabs: ViewTabDef[];
  active: string;
  onChange: (key: string) => void;
  /** Right-aligned summary, e.g. "12 of 40 orders". */
  meta?: ReactNode;
  className?: string;
}

/**
 * Odoo-style segmented view switcher (List · Kanban · Graph · Pivot).
 * Shared across every model list page so the ergonomics stay identical.
 */
export function ViewSwitcher({ tabs, active, onChange, meta, className }: ViewSwitcherProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-card p-1 shadow-xs">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 h-9 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>
      {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  );
}
