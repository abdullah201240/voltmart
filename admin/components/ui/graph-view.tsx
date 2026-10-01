"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Filter, RotateCcw } from "lucide-react";

export interface GraphDatum {
  label: string;
  value: number;
  count?: number;
  /** Explicit CSS background/gradient or hex. Guaranteed to render. */
  color?: string;
  dotColor?: string;
}

export interface GraphViewProps {
  data: GraphDatum[];
  /** Format the numeric value (e.g. currency). */
  formatValue?: (v: number) => string;
  /** Bar click navigation / selection. */
  onSelect?: (d: GraphDatum) => void;
  selectedLabel?: string;
  onClearSelection?: () => void;
  title?: string;
  className?: string;
}

const DEFAULT_GRADIENTS: Record<string, string> = {
  Quotation: "linear-gradient(180deg, #94a3b8 0%, #475569 100%)",
  Confirmed: "linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%)",
  Fulfilled: "linear-gradient(180deg, #34d399 0%, #059669 100%)",
  Invoiced: "linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%)",
  Cancelled: "linear-gradient(180deg, #fb7185 0%, #e11d48 100%)",
};

const DEFAULT_DOTS: Record<string, string> = {
  Quotation: "#64748b",
  Confirmed: "#2563eb",
  Fulfilled: "#10b981",
  Invoiced: "#7c3aed",
  Cancelled: "#e11d48",
};

/**
 * Modern high-contrast interactive bar chart for ERP Graph analytics.
 * Renders guaranteed visible background tracks, real CSS gradients,
 * Y-axis guidelines, and interactive drill-downs.
 */
export function GraphView({
  data,
  formatValue = (v) => String(v),
  onSelect,
  selectedLabel,
  onClearSelection,
  title = "Pipeline Revenue Breakdown",
  className,
}: GraphViewProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);

  // Y-axis grid markers
  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-6 w-full",
        className
      )}
    >
      {/* Header with Title and Filter Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {title}
            </h3>
            {selectedLabel && selectedLabel !== "all" && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 text-xs gap-1"
              >
                <Filter className="h-3 w-3" />
                Filtered: {selectedLabel}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.length} pipeline groups · Total Volume:{" "}
            <strong className="text-foreground font-semibold">
              {formatValue(total)}
            </strong>
          </p>
        </div>

        {selectedLabel && selectedLabel !== "all" && onClearSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="cursor-pointer text-xs h-8 gap-1.5 border-border hover:bg-muted/50"
          >
            <RotateCcw className="h-3 w-3" />
            Show All Stages
          </Button>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="relative pt-6 pb-2 w-full">
        {/* Horizontal Background Reference Lines */}
        <div className="absolute inset-x-0 top-6 bottom-16 flex flex-col justify-between pointer-events-none opacity-40">
          {yTicks.map((tick, idx) => (
            <div key={idx} className="w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-16 text-right shrink-0">
                {formatValue(Math.round(max * tick))}
              </span>
              <div className="w-full border-b border-dashed border-border" />
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative ml-18 flex h-72 items-end justify-around gap-2 sm:gap-6 z-10">
          {data.map((d, idx) => {
            const pct = max > 0 ? Math.round((d.value / max) * 100) : 0;
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedLabel === d.label;
            const barGradient =
              d.color ??
              DEFAULT_GRADIENTS[d.label] ??
              "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)";
            const dotColor =
              d.dotColor ?? DEFAULT_DOTS[d.label] ?? "#3b82f6";

            return (
              <div
                key={d.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelect?.(d)}
                className={cn(
                  "group flex flex-col items-center justify-end h-full flex-1 max-w-[96px] cursor-pointer transition-all duration-200 select-none",
                  onSelect && "active:scale-[0.98]"
                )}
              >
                {/* Metric Value Label on Top */}
                <div
                  className={cn(
                    "mb-2 text-center transition-all duration-200",
                    isHovered || isSelected ? "scale-105" : ""
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-mono font-bold block",
                      d.value > 0
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {formatValue(d.value)}
                  </span>
                  {d.count !== undefined && (
                    <span className="text-[10px] text-muted-foreground block">
                      {d.count} {d.count === 1 ? "order" : "orders"}
                    </span>
                  )}
                </div>

                {/* Vertical Bar Container (Transparent, No Background) */}
                <div className="w-full h-52 flex flex-col justify-end items-center relative">
                  {/* The Vibrant Filled Bar */}
                  {d.value > 0 ? (
                    <div
                      className={cn(
                        "w-full max-w-[64px] rounded-t-md transition-all duration-500 ease-out shadow-xs relative",
                        isHovered && "opacity-90 scale-[1.02]",
                        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                      style={{
                        height: `${Math.max(4, pct)}%`,
                        background: barGradient,
                      }}
                    >
                      {/* Top highlight cap */}
                      <div className="w-full h-0.5 bg-white/30 rounded-t-md" />
                    </div>
                  ) : (
                    /* Minimal zero indicator */
                    <div className="w-full max-w-[64px] h-0.5 bg-border/60 rounded-full" />
                  )}
                </div>

                {/* Bottom Label and Indicator Dot */}
                <div className="mt-3 flex items-center gap-1.5 text-center">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold truncate transition-colors",
                      isSelected
                        ? "text-primary font-bold"
                        : isHovered
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {d.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface PivotColumn<T> {
  key: string;
  label: string;
  measure: (rows: T[]) => number;
  format?: (v: number) => string;
}

export interface PivotViewProps<T> {
  rows: T[];
  groupOf: (row: T) => string;
  groupLabel?: (key: string) => string;
  columns: PivotColumn<T>[];
  formatValue?: (v: number) => string;
  title?: string;
}

export function PivotView<T>({
  rows,
  groupOf,
  groupLabel,
  columns,
  formatValue = (v) => String(v),
  title = "Pivot",
}: PivotViewProps<T>) {
  const groups = new Map<string, T[]>();
  rows.forEach((r) => {
    const k = groupOf(r);
    const existing = groups.get(k) || [];
    existing.push(r);
    groups.set(k, existing);
  });

  const totals = columns.map((c) => c.measure(rows));

  return (
    <div className="rounded-lg border border-border/80 bg-card shadow-xs overflow-hidden w-full">
      <div className="border-b border-border/80 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4 text-left">Group</th>
              {columns.map((c) => (
                <th key={c.key} className="py-3 px-4 text-right">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(groups.entries()).map(([k, groupRows]) => (
              <tr
                key={k}
                className="border-b border-border/60 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4 font-semibold text-foreground">
                  {groupLabel ? groupLabel(k) : k}
                </td>
                {columns.map((c) => {
                  const val = c.measure(groupRows);
                  return (
                    <td
                      key={c.key}
                      className="py-3 px-4 text-right font-mono text-muted-foreground"
                    >
                      {c.format ? c.format(val) : formatValue(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-muted/60 font-bold border-t-2 border-border/80">
              <td className="py-3 px-4 text-foreground">Total</td>
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  className="py-3 px-4 text-right font-mono text-foreground"
                >
                  {c.format ? c.format(totals[i]) : formatValue(totals[i])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
