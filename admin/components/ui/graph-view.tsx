"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GraphDatum {
  label: string;
  value: number;
  /** Tailwind text/bg tone for the bar + label. */
  color?: string;
}

export interface GraphViewProps {
  data: GraphDatum[];
  /** Format the numeric value (e.g. currency). */
  formatValue?: (v: number) => string;
  /** Bar click navigation. */
  onSelect?: (d: GraphDatum) => void;
  className?: string;
}

const DEFAULT_TONE = "bg-primary/70";

/**
 * Dependency-free bar chart for the Odoo "Graph" view. Bars scale to the max
 * value; each shows its formatted total on top and the group label below.
 */
export function GraphView({ data, formatValue = (v) => String(v), onSelect, className }: GraphViewProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className={cn("rounded-lg border border-border/80 bg-card p-5 sm:p-6 shadow-xs", className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Graph</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{data.length} groups · total {formatValue(total)}</p>
        </div>
      </div>

      <div className="flex h-64 items-end gap-3 sm:gap-4">
        {data.map((d) => {
          const pct = Math.round((d.value / max) * 100);
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => onSelect?.(d)}
              className={cn("group flex h-full flex-1 flex-col items-center justify-end gap-2", onSelect && "cursor-pointer")}
            >
              <span className="text-xs font-bold tabular-nums text-foreground">{formatValue(d.value)}</span>
              <div
                className={cn(
                  "w-full max-w-[64px] rounded-t-md transition-all duration-300 group-hover:opacity-80",
                  d.color ?? DEFAULT_TONE,
                )}
                style={{ height: `${Math.max(2, pct)}%` }}
              />
              <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface PivotColumn<T> {
  key: string;
  label: string;
  /** Aggregate a numeric measure across rows in a group. */
  measure: (rows: T[]) => number;
  format?: (v: number) => string;
}

export interface PivotViewProps<T> {
  rows: T[];
  /** Value -> column label accessor for grouping. */
  groupOf: (row: T) => string;
  groupLabel?: (key: string) => string;
  columns: PivotColumn<T>[];
  formatValue?: (v: number) => string;
  title?: string;
}

/**
 * Pivot table: rows grouped by a single dimension with one or more numeric
 * measures per group, plus a totals row — the Odoo "Pivot" reading view.
 */
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
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  });
  const keys = [...groups.keys()].sort();

  return (
    <div className="rounded-lg border border-border/80 bg-card shadow-xs overflow-hidden">
      <div className="border-b border-border/70 px-5 py-3.5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 text-right text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-left font-semibold">Group</th>
              {columns.map((c) => (
                <th key={c.key} className="px-5 py-3 font-semibold">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {keys.map((k) => {
              const gr = groups.get(k)!;
              return (
                <tr key={k} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{groupLabel ? groupLabel(k) : k}</td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-3 text-right tabular-nums font-mono text-foreground">
                      {(c.format ?? formatValue)(c.measure(gr))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/80 bg-muted/40 font-bold">
              <td className="px-5 py-3 text-foreground">Total</td>
              {columns.map((c) => (
                <td key={c.key} className="px-5 py-3 text-right tabular-nums font-mono text-foreground">
                  {(c.format ?? formatValue)(c.measure(rows))}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
