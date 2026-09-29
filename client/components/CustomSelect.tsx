"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { SfIconExpandMore, SfIconCheck } from "@storefront-ui/react";
import { classNames } from "@/lib/format";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  className?: string;
  size?: "sm" | "base";
  disabled?: boolean;
  align?: "left" | "right";
  ariaLabel?: string;
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  label,
  className = "",
  size = "sm",
  disabled = false,
  align = "left",
  ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uniqueId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div
      ref={containerRef}
      className={classNames("relative inline-block text-left", className)}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          id={`${uniqueId}-label`}
          className="mb-1 block text-xs font-semibold text-neutral-600"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={`${uniqueId}-button`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${uniqueId}-label ${uniqueId}-button` : undefined}
        aria-label={ariaLabel || label || placeholder}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={classNames(
          "group flex w-full items-center justify-between gap-2 rounded-md border border-neutral-200/90 bg-white font-medium text-neutral-800 transition-all duration-150 select-none",
          size === "sm" ? "px-2.5 py-1.5 text-xs sm:text-sm" : "px-3 py-2 text-sm",
          disabled
            ? "cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-60"
            : "hover:border-primary-400 hover:bg-neutral-50/60 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-50",
          isOpen && "border-primary-500 ring-2 ring-primary-500/20",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-neutral-500">{selectedOption.icon}</span>
          )}
          <span className={classNames("truncate", !selectedOption && "text-neutral-400")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <span
          className={classNames(
            "shrink-0 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-600",
            isOpen && "rotate-180 text-primary-600",
          )}
        >
          <SfIconExpandMore size="xs" />
        </span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={classNames(
            "absolute z-50 mt-1 max-h-60 min-w-full overflow-y-auto rounded-md border border-neutral-200/90 bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${uniqueId}-opt-${highlightedIndex}` : undefined
            }
            className="flex flex-col gap-0.5"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={opt.value}
                  id={`${uniqueId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={classNames(
                    "flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-xs sm:text-sm cursor-pointer transition-colors duration-150 select-none",
                    isSelected
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : isHighlighted
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="ml-1 text-[11px] font-normal text-neutral-400">
                        {opt.description}
                      </span>
                    )}
                  </span>

                  {isSelected && (
                    <span className="shrink-0 text-primary-600">
                      <SfIconCheck size="xs" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
