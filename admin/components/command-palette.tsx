"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Plus,
  Moon,
  Sun,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_GROUPS } from "@/components/admin-sidebar";
import { clearAllOps } from "@/lib/data/ops";

/** A single runnable command in the palette. */
interface Cmd {
  label: string;
  /** Optional right-aligned hint (e.g. a keyboard chip or the app name). */
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}

/**
 * Odoo-style global command bar (⌘K): Applications navigation + quick Create
 * actions + utility commands, all keyboard-navigable in a single overlay.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const close = () => onOpenChange(false);
  const go = (href: string) => {
    close();
    router.push(href);
  };

  // Every navigable destination, grouped under its parent application.
  const navGroups = useMemo(() => {
    const groups: { heading: string; items: Cmd[] }[] = [];
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.href) {
          groups.push({
            heading: "Overview",
            items: [{ label: item.title, icon: item.icon, hint: "App", run: () => go(item.href!) }],
          });
        }
        if (item.children) {
          groups.push({
            heading: item.title,
            items: item.children.map((child) => ({
              label: child.title,
              icon: item.icon,
              run: () => go(child.href),
            })),
          });
        }
      }
    }
    // Collapse groups that share the same heading (e.g. two direct links).
    const merged = new Map<string, Cmd[]>();
    for (const g of groups) {
      merged.set(g.heading, [...(merged.get(g.heading) ?? []), ...g.items]);
    }
    return [...merged.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quick-create shortcuts (route to the record list where the create
  // drawer lives — mirrors how Odoo jumps you into the right model).
  const createCmds: Cmd[] = [
    { label: "Quotation / Sales Order", icon: Plus, run: () => go("/orders") },
    { label: "Product", icon: Plus, run: () => go("/products") },
    { label: "Customer", icon: Plus, run: () => go("/customers") },
    { label: "Purchase Order", icon: Plus, run: () => go("/purchases/orders") },
    { label: "Manufacturing Order", icon: Plus, run: () => go("/manufacturing") },
    { label: "Invoice", icon: Plus, run: () => go("/invoices") },
    { label: "Vendor", icon: Plus, run: () => go("/vendors") },
  ];

  const utilityCmds: Cmd[] = [
    {
      label: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      hint: "Theme",
      run: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        close();
      },
    },
    {
      label: "Reset all demo operations",
      icon: RotateCcw,
      hint: "Data",
      run: () => {
        clearAllOps();
        close();
      },
    },
  ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command bar"
      description="Search applications, create records and run actions"
      className="sm:max-w-lg"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading={<span className="inline-flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> Create</span>}>
          {createCmds.map((c) => (
            <CommandItem key={c.label} value={`create ${c.label}`} onSelect={c.run}>
              <c.icon className="text-primary" />
              <span>{c.label}</span>
              <CommandShortcut>New</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {navGroups.map(([heading, items]) => (
          <CommandGroup key={heading} heading={heading}>
            {items.map((c) => (
              <CommandItem key={heading + c.label} value={`${heading} ${c.label}`} onSelect={c.run}>
                <c.icon />
                <span>{c.label}</span>
                {c.hint && <CommandShortcut>{c.hint}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          {utilityCmds.map((c) => (
            <CommandItem key={c.label} value={`action ${c.label}`} onSelect={c.run}>
              <c.icon />
              <span>{c.label}</span>
              {c.hint && <CommandShortcut>{c.hint}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
