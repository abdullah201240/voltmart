"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  SlidersHorizontal,
  Tags,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export interface BulkChoice {
  value: string;
  label: string;
}

export interface BulkFieldDef {
  id: string;
  label: string;
  options: BulkChoice[];
}

export type BulkApplyKind = "field" | "tag" | "assign";

export interface BulkActionsProps<T> {
  /** Currently selected rows (provided by CentralTable's selectedActions). */
  rows: T[];
  /** Clear the selection once an action has been applied. */
  clearSelection: () => void;
  /** "Set field" cascade — each field expands to its list of values. */
  fields?: BulkFieldDef[];
  /** "Label / Tag" options. */
  tags?: BulkChoice[];
  /** "Assign owner" options. */
  assignees?: BulkChoice[];
  /** Fired for every applied bulk action. */
  onApply: (
    kind: BulkApplyKind,
    fieldId: string | null,
    value: string,
    rows: T[],
  ) => void;
}

/**
 * Odoo-style "Action ▾" bulk toolbar for selected rows, exposing the three
 * canonical list operations — Set a field, add a Tag, Assign an owner — as a
 * reusable cascade. Drop it into `CentralTable`'s `selectedActions` slot; it
 * stays presentation-only and delegates every mutation to `onApply` so the
 * hosting page decides how the change is persisted (e.g. through the ops
 * overlay workflow engine).
 */
export function BulkActionBar<T>({
  rows,
  clearSelection,
  fields = [],
  tags = [],
  assignees = [],
  onApply,
}: BulkActionsProps<T>) {
  const [open, setOpen] = useState(false);

  if (fields.length === 0 && tags.length === 0 && assignees.length === 0) {
    return null;
  }

  const apply = (kind: BulkApplyKind, fieldId: string | null, value: string) => {
    onApply(kind, fieldId, value, rows);
    setOpen(false);
    clearSelection();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            size="sm"
            variant="secondary"
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold active:scale-[0.98] transition-all"
          />
        }
      >
        <MoreHorizontal className="h-3.5 w-3.5" /> Action
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuLabel>{rows.length} record(s) selected</DropdownMenuLabel>

        {fields.length > 0 && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" /> Set a field
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {fields.map((f) => (
                  <DropdownMenuSub key={f.id}>
                    <DropdownMenuSubTrigger>{f.label}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {f.options.map((o) => (
                        <DropdownMenuItem key={o.value} onClick={() => apply("field", f.id, o.value)}>
                          {o.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
          </>
        )}

        {tags.length > 0 && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tags className="h-4 w-4 text-muted-foreground" /> Add a tag
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {tags.map((t) => (
                  <DropdownMenuItem key={t.value} onClick={() => apply("tag", null, t.value)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
          </>
        )}

        {assignees.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserCog className="h-4 w-4 text-muted-foreground" /> Assign owner
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {assignees.map((a) => (
                <DropdownMenuItem key={a.value} onClick={() => apply("assign", null, a.value)}>
                  {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
