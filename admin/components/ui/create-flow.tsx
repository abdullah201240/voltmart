"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecordCreateDrawer,
  type CreateFieldDef,
} from "@/components/ui/record-create-drawer";
import { addRecord } from "@/lib/data/ops";
import { toast } from "@/components/app-feedback";

export interface CreateFlowProps<T> {
  /** Ops-overlay model key the new record is persisted under. */
  model: string;
  /** Label on the trigger button (renders with a leading Plus icon). */
  buttonLabel: string;
  buttonClassName?: string;
  drawerTitle: string;
  drawerDescription?: string;
  submitLabel?: string;
  fields: CreateFieldDef[];
  /** Optional extra validation. Return an error message to keep the drawer open. */
  validate?: (values: Record<string, string>) => string | null;
  /** Turn validated form values into the row object for this table. */
  build: (values: Record<string, string>) => T;
  /** Called after the record is persisted — prepend it into local table state. */
  onCreated: (row: T) => void;
  /** Toast title on success. */
  successMessage?: string;
}

/**
 * Standardized "create record" affordance for admin tables.
 *
 * Bundles the trigger button, the schema-driven slide-over drawer, required
 * validation, persistence via the ops overlay, and a success toast — so every
 * table ships a working, consistent create flow instead of a dead button.
 */
export function CreateFlow<T extends { id: string }>({
  model,
  buttonLabel,
  buttonClassName = "h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all",
  drawerTitle,
  drawerDescription,
  submitLabel = "Create",
  fields,
  validate,
  build,
  onCreated,
  successMessage = "Record created",
}: CreateFlowProps<T>) {
  const [open, setOpen] = useState(false);

  const submit = (values: Record<string, string>) => {
    const err = validate?.(values);
    if (err) return err;
    const row = build(values);
    addRecord(model, row as unknown as Record<string, unknown>);
    onCreated(row);
    toast.success(successMessage, `${buttonLabel.replace(/^Add\s+|^Create\s+|^New\s+/i, "")} “${(values.name ?? values.title ?? row.id) as string}” was saved.`);
    return null;
  };

  return (
    <>
      <Button className={buttonClassName} onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> {buttonLabel}
      </Button>
      <RecordCreateDrawer
        open={open}
        onOpenChange={setOpen}
        title={drawerTitle}
        description={drawerDescription}
        submitLabel={submitLabel}
        fields={fields}
        onSubmit={submit}
      />
    </>
  );
}
