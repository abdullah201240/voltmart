"use client";

import React, { useState, useId, forwardRef } from "react";
import {
  AlertCircle,
  HelpCircle,
  UploadCloud,
  X,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";

/* =========================================================================
   1. CentralForm Root Component
   ========================================================================= */

export interface CentralFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  badge?: React.ReactNode;
  variant?: "card" | "plain" | "sheet";
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CentralForm({
  title,
  description,
  badge,
  variant = "plain",
  actions,
  children,
  className,
  onSubmit,
  ...props
}: CentralFormProps) {
  const isCard = variant === "card";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn(
        "w-full space-y-6",
        isCard && "rounded-lg border border-border/80 bg-card p-6 md:p-8 shadow-xs",
        className
      )}
      {...props}
    >
      {(title || description || badge) && (
        <div className="flex flex-col gap-1.5 border-b border-border/70 pb-5">
          <div className="flex items-center justify-between gap-3">
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      <div className="space-y-6 w-full">{children}</div>

      {actions && (
        <div className="pt-4 border-t border-border/70 w-full">{actions}</div>
      )}
    </form>
  );
}

/* =========================================================================
   2. CentralFormSection: Responsive multi-column section
   ========================================================================= */

export interface CentralFormSectionProps {
  title?: string;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  columns?: 1 | 2 | 3 | 4;
  bordered?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function CentralFormSection({
  title,
  description,
  badge,
  icon: Icon,
  columns = 2,
  bordered = true,
  className,
  children,
}: CentralFormSectionProps) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        "w-full space-y-4",
        bordered && "rounded-lg border border-border/80 bg-card/60 p-5 md:p-6 shadow-xs",
        className
      )}
    >
      {(title || description || Icon || badge) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
              {title && (
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  {title}
                </h3>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}

      <div className={cn("grid gap-4 md:gap-5 w-full", gridColsClass)}>
        {children}
      </div>
    </div>
  );
}

/* =========================================================================
   3. CentralFormField: Standardized Field Wrapper
   ========================================================================= */

export interface CentralFormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: string;
  colSpan?: 1 | 2 | 3 | 4 | "full";
  className?: string;
  children: React.ReactNode;
}

export function CentralFormField({
  label,
  htmlFor,
  required,
  tooltip,
  helperText,
  error,
  colSpan = 1,
  className,
  children,
}: CentralFormFieldProps) {
  const colSpanClass = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-2 lg:col-span-3",
    4: "col-span-1 sm:col-span-2 lg:col-span-4",
    full: "col-span-full",
  }[colSpan];

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", colSpanClass, className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground select-none"
          >
            <span>{label}</span>
            {required && <span className="text-destructive font-bold">*</span>}
          </label>

          {tooltip && (
            <span
              className="text-muted-foreground hover:text-foreground transition-colors cursor-help"
              title={tooltip}
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      )}

      <div className="w-full">{children}</div>

      {error ? (
        <p className="flex items-center gap-1 text-[11px] font-medium text-destructive animate-in fade-in-0">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

/* =========================================================================
   4. CentralFormInput: Enhanced Input with prefix/suffix
   ========================================================================= */

export interface CentralFormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixText?: string;
  suffixText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  error?: boolean | string;
}

export const CentralFormInput = forwardRef<HTMLInputElement, CentralFormInputProps>(
  (
    {
      className,
      type = "text",
      prefixText,
      suffixText,
      prefixIcon,
      suffixIcon,
      error,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div
        className={cn(
          "relative flex items-center w-full rounded-md border border-input/90 bg-background text-foreground transition-all duration-150 shadow-2xs",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40",
          error && "border-destructive focus-within:border-destructive focus-within:ring-destructive/30",
          disabled && "opacity-50 cursor-not-allowed bg-muted/40",
          className
        )}
      >
        {prefixIcon && (
          <div className="pl-3 pr-1 text-muted-foreground flex items-center justify-center shrink-0">
            {prefixIcon}
          </div>
        )}

        {prefixText && (
          <span className="pl-3 pr-1 text-xs font-semibold text-muted-foreground select-none shrink-0">
            {prefixText}
          </span>
        )}

        <input
          ref={ref}
          type={actualType}
          disabled={disabled}
          className={cn(
            "h-10 w-full min-w-0 bg-transparent px-3 text-xs placeholder:text-muted-foreground/70 outline-none",
            prefixIcon && "pl-1.5",
            prefixText && "pl-1",
            (suffixIcon || suffixText || isPassword) && "pr-1"
          )}
          {...props}
        />

        {suffixText && (
          <span className="pr-3 pl-1 text-xs font-semibold text-muted-foreground select-none shrink-0">
            {suffixText}
          </span>
        )}

        {suffixIcon && !isPassword && (
          <div className="pr-3 pl-1 text-muted-foreground flex items-center justify-center shrink-0">
            {suffixIcon}
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="pr-3 pl-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);
CentralFormInput.displayName = "CentralFormInput";

/* =========================================================================
   5. CentralFormTextarea: Multi-line Input with Count
   ========================================================================= */

export interface CentralFormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  showCount?: boolean;
}

export const CentralFormTextarea = forwardRef<
  HTMLTextAreaElement,
  CentralFormTextareaProps
>(({ className, maxLength, showCount, value, error, disabled, ...props }, ref) => {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-input/90 bg-background p-3 text-xs placeholder:text-muted-foreground/70 outline-none transition-all duration-150 shadow-2xs resize-y min-h-[96px]",
          "focus:border-primary focus:ring-1 focus:ring-primary/40",
          error && "border-destructive focus:border-destructive focus:ring-destructive/30",
          disabled && "opacity-50 cursor-not-allowed bg-muted/40",
          className
        )}
        {...props}
      />
      {showCount && maxLength && (
        <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-muted-foreground/80 pointer-events-none">
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  );
});
CentralFormTextarea.displayName = "CentralFormTextarea";

/* =========================================================================
   6. CentralFormSelect: Searchable / Dropdown Select
   ========================================================================= */

export type { DropboxOption };

export interface CentralFormSelectProps {
  options: DropboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CentralFormSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  disabled,
  className,
}: CentralFormSelectProps) {
  return (
    <SearchableDropbox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      disabled={disabled}
      className={className}
    />
  );
}

/* =========================================================================
   7. CentralFormSwitch: Toggle Card
   ========================================================================= */

export interface CentralFormSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function CentralFormSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: CentralFormSwitchProps) {
  const id = useId();

  return (
    <div
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-muted/20 p-3.5 transition-all duration-150 cursor-pointer select-none",
        "hover:bg-muted/40 active:scale-[0.99]",
        checked && "border-primary/50 bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <div className="space-y-0.5">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-foreground cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>

      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

/* =========================================================================
   7. CentralFormDropzone: File / Media Uploader
   ========================================================================= */

export interface UploadedFileItem {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

export interface CentralFormDropzoneProps {
  label?: string;
  description?: string;
  files?: UploadedFileItem[];
  onRemoveFile?: (id: string) => void;
  onUploadMock?: () => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function CentralFormDropzone({
  label = "Upload media or documents",
  description = "PNG, JPG, WebP, SVG up to 10MB",
  files = [],
  onRemoveFile,
  onUploadMock,
  disabled,
  className,
}: CentralFormDropzoneProps) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      <div
        onClick={() => !disabled && onUploadMock && onUploadMock()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all duration-150 cursor-pointer select-none",
          "hover:border-primary/60 hover:bg-muted/40 active:scale-[0.99]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2.5">
          <UploadCloud className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative flex items-center gap-2 rounded-md border border-border/80 bg-card p-2 text-xs shadow-2xs"
            >
              {file.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-9 w-9 rounded object-cover border border-border/60 shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0 font-bold text-[10px] text-muted-foreground">
                  FILE
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate text-[11px]">
                  {file.name}
                </p>
                {file.size && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {file.size}
                  </p>
                )}
              </div>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.id);
                  }}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded cursor-pointer"
                  title="Remove file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   8. CentralFormActions: Standardized Action Bar
   ========================================================================= */

export interface CentralFormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  dirty?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
  sticky?: boolean;
  className?: string;
}

export function CentralFormActions({
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  onCancel,
  loading = false,
  dirty = false,
  onDelete,
  deleteLabel = "Delete",
  sticky = false,
  className,
}: CentralFormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 w-full",
        sticky &&
          "sticky bottom-0 z-20 border-t border-border/80 bg-card/95 backdrop-blur px-6 py-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={loading}
            className="cursor-pointer h-10 px-4 text-xs font-semibold"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {deleteLabel}
          </Button>
        )}

        {dirty && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer h-10 px-4 text-xs font-semibold"
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="cursor-pointer h-10 px-5 text-xs font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              <span>{submitLabel}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* =========================================================================
   9. CentralFormDrawer: Slide-over Drawer Wrapper for Forms
   ========================================================================= */

export interface CentralFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  width?: "default" | "wide" | "full";
  children: React.ReactNode;
}

export function CentralFormDrawer({
  open,
  onOpenChange,
  title,
  description,
  badge,
  width = "default",
  children,
}: CentralFormDrawerProps) {
  if (!open) return null;

  const widthClass = {
    default: "w-full sm:max-w-xl md:max-w-2xl",
    wide: "w-full sm:max-w-2xl md:max-w-4xl",
    full: "w-full",
  }[width];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col border-l border-border/80 bg-card shadow-2xl animate-in slide-in-from-right duration-300",
          widthClass
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4.5 bg-background/80 backdrop-blur">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {title}
              </h2>
              {badge && <div>{badge}</div>}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close form drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
