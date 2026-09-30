"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface KanbanStage {
  key: string;
  label: string;
  /** Tailwind classes for the column accent bar / count pill. */
  accent?: string;
}

export interface KanbanBoardProps<T> {
  data: T[];
  stages: KanbanStage[];
  /** Which stage key a row currently belongs to. */
  stageOf: (row: T) => string;
  /** Stable id used for drag payloads. */
  idOf: (row: T) => string;
  /** Render the card body. Drag + click are handled by the board. */
  renderCard: (row: T) => React.ReactNode;
  /** Called when a card is dropped into a different stage. */
  onMove?: (row: T, toStageKey: string) => void;
  loading?: boolean;
  emptyLabel?: string;
}

/**
 * Generic Odoo-style Kanban. Cards are draggable between stage columns;
 * dropping into a new column fires `onMove`. Column totals are summarised
 * in the footer, matching Odoo's grouped board affordance.
 */
export function KanbanBoard<T>({
  data,
  stages,
  stageOf,
  idOf,
  renderCard,
  onMove,
  loading,
  emptyLabel = "Nothing here",
}: KanbanBoardProps<T>) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const byStage = new Map<string, T[]>();
  stages.forEach((s) => byStage.set(s.key, []));
  data.forEach((row) => {
    const k = stageOf(row);
    if (!byStage.has(k)) byStage.set(k, []);
    byStage.get(k)!.push(row);
  });

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stages.map((s) => (
          <div key={s.key} className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
            <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  const handleDrop = (stageKey: string) => {
    setOverStage(null);
    if (!dragId || !onMove) return;
    const row = data.find((r) => idOf(r) === dragId);
    setDragId(null);
    if (!row || stageOf(row) === stageKey) return;
    onMove(row, stageKey);
  };

  return (
    <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stages.map((stage) => {
        const rows = byStage.get(stage.key) ?? [];
        const isOver = overStage === stage.key;
        return (
          <div
            key={stage.key}
            onDragOver={(e) => {
              e.preventDefault();
              if (onMove) setOverStage(stage.key);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
            onDrop={() => handleDrop(stage.key)}
            className={cn(
              "flex flex-col rounded-lg border bg-muted/30 transition-colors",
              isOver ? "border-primary/50 bg-primary/5" : "border-border/70",
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                {stage.accent && <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", stage.accent)} />}
                <span className="truncate text-sm font-bold tracking-tight text-foreground">{stage.label}</span>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                {rows.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 p-2.5 min-h-[120px]">
              {rows.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>
              ) : (
                rows.map((row) => (
                  <div
                    key={idOf(row)}
                    draggable={Boolean(onMove)}
                    onDragStart={() => setDragId(idOf(row))}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverStage(null);
                    }}
                    className={cn(
                      "group rounded-md border border-border/80 bg-card p-3 shadow-xs transition-all duration-200",
                      onMove && "cursor-grab active:cursor-grabbing",
                      dragId === idOf(row) && "opacity-40",
                      "hover:border-primary/40",
                    )}
                  >
                    {renderCard(row)}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
