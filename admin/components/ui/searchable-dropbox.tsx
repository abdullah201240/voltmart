"use client";

import React, { useState, useRef, useEffect, useId, useMemo } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropboxOption {
  value: string;
  label: string;
  category?: string;
  badge?: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SearchableDropboxProps {
  options: DropboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableDropbox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  label,
  className,
  disabled = false,
}: SearchableDropboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q) ||
        opt.category?.toLowerCase().includes(q) ||
        opt.badge?.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col text-left", className)}
    >
      {label && (
        <label
          htmlFor={uniqueId}
          className="mb-1.5 text-sm font-semibold text-foreground/80"
        >
          {label}
        </label>
      )}

      {/* Trigger Button - Balanced, sleek hairline border, subtle rounded-md */}
      <button
        id={uniqueId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-md border border-input/80 bg-background px-4 py-2.5 text-sm font-medium transition-colors",
          "hover:bg-muted/40 hover:border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-primary/60 ring-1 ring-ring/30"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-muted-foreground">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-muted-foreground font-normal"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu Panel with Search */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-2 w-full min-w-[300px] rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95"
          )}
        >
          {/* Search Box inside Dropdown */}
          <div className="border-b border-border/70 p-3">
            <div className="relative flex items-center rounded-md bg-muted/60 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto p-2 text-sm">
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No matching results found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex flex-col gap-0.5 truncate">
                      <div className="flex items-center gap-2">
                        {opt.icon && (
                          <span className="shrink-0 text-muted-foreground">
                            {opt.icon}
                          </span>
                        )}
                        <span className="truncate font-medium">{opt.label}</span>
                        {opt.badge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
