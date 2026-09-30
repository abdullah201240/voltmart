"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  CentralForm,
  CentralFormActions,
  CentralFormDrawer,
  CentralFormField,
  CentralFormInput,
  CentralFormSection,
  CentralFormSelect,
  CentralFormSwitch,
} from "@/components/ui/central-form";
import type { DropboxOption } from "@/components/ui/searchable-dropbox";

/** One input inside a generic create drawer. */
export interface CreateFieldDef {
  /** Stable key the page reads the value back by in `onSubmit`. */
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "switch";
  options?: DropboxOption[];
  placeholder?: string;
  required?: boolean;
  helper?: string;
  /** Switch fields only: initial state (defaults off). */
  defaultChecked?: boolean;
  /** Text/number initial value. */
  defaultValue?: string;
  colSpan?: 1 | 2;
}

export interface RecordCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  fields: CreateFieldDef[];
  /**
   * Receives every field value as a string ("true"/"false" for switches).
   * Return an error message to keep the drawer open, or null on success —
   * the caller is responsible for persisting the record and refreshing its list.
   */
  onSubmit: (values: Record<string, string>) => string | null;
}

function defaults(fields: CreateFieldDef[]): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of fields) v[f.key] = f.type === "switch" ? (f.defaultChecked ? "true" : "false") : f.defaultValue ?? "";
  return v;
}

/**
 * Schema-driven "New record" slide-over shared by the configuration screens.
 * Mirrors the Odoo create form ergonomics (required validation, helper text,
 * searchable selects) without each page hand-rolling its own drawer.
 */
export function RecordCreateDrawer({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "Create",
  fields,
  onSubmit,
}: RecordCreateDrawerProps) {
  const [values, setValues] = useState<Record<string, string>>(() => defaults(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Fresh form every time the drawer opens (render-time state adjustment,
  // not an effect, per the react-hooks/set-state-in-effect rule).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) {
      setValues(defaults(fields));
      setErrors({});
      setFormError(null);
    }
  }

  const set = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && f.type !== "switch" && !String(values[f.key] ?? "").trim()) {
        nextErrors[f.key] = `${f.label} is required`;
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please fill in the highlighted fields.");
      return;
    }
    const err = onSubmit(values);
    if (err) {
      setFormError(err);
      return;
    }
    onOpenChange(false);
  };

  return (
    <CentralFormDrawer open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <CentralForm onSubmit={submit} variant="sheet">
        <CentralFormSection title={title} description={description} columns={2}>
          {fields.map((f) => (
            <CentralFormField
              key={f.key}
              label={f.label}
              required={f.required}
              helperText={f.helper}
              error={errors[f.key]}
              colSpan={f.colSpan === 2 ? 2 : 1}
            >
              {f.type === "select" ? (
                <CentralFormSelect
                  options={f.options ?? []}
                  value={values[f.key] ?? ""}
                  onChange={(v) => set(f.key, v)}
                  placeholder={f.placeholder ?? "Select..."}
                />
              ) : f.type === "switch" ? (
                <CentralFormSwitch
                  label={f.label}
                  description={f.helper}
                  checked={values[f.key] === "true"}
                  onCheckedChange={(c) => set(f.key, c ? "true" : "false")}
                />
              ) : (
                <CentralFormInput
                  type={f.type === "number" ? "number" : "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  error={Boolean(errors[f.key])}
                />
              )}
            </CentralFormField>
          ))}
        </CentralFormSection>

        {formError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {formError}
          </div>
        )}

        <CentralFormActions submitLabel={submitLabel} onCancel={() => onOpenChange(false)} />
      </CentralForm>
    </CentralFormDrawer>
  );
}
