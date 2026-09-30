"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  X,
  Command as CommandIcon,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "@/components/notifications-popover";
import { useAdminLayout } from "@/components/admin-shell";

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  className?: string;
}

export function AdminHeader({
  onMobileMenuToggle,
  sidebarCollapsed = false,
  onToggleSidebar,
  searchQuery = "",
  onSearchChange,
  className,
}: AdminHeaderProps) {
  const { openCommand } = useAdminLayout();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-18 w-full items-center gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl transition-all duration-300 font-sans md:gap-4 md:px-6 lg:px-8",
        className
      )}
    >
      {/* ── Left: Navigation toggles ─────────────────── */}
      <div className="flex shrink-0 items-center gap-2.5 md:gap-3">
        {/* Mobile hamburger */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer shrink-0 active:scale-[0.98] transition-all"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="size-[19px]" />
        </Button>

        {/* Desktop sidebar collapse / expand toggle */}
        {onToggleSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hidden lg:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer shrink-0 active:scale-[0.98] transition-all"
            title={sidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="size-[19px]" />
            ) : (
              <PanelLeftClose className="size-[19px]" />
            )}
          </Button>
        )}
      </div>

      {/* ── Center: Hero global search that flexes to fill the header ─ */}
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <input
          id="admin-global-search"
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search orders, customers, SKUs, invoices…"
          className={cn(
            "h-11 w-full rounded-xl border border-border/80 bg-muted/40 pl-10 pr-24 text-sm text-foreground shadow-xs outline-none transition-all duration-200",
            "placeholder:text-muted-foreground/80",
            "focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/25",
            "hover:border-border"
          )}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange && onSearchChange("")}
            className="absolute right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.98]"
            aria-label="Clear search query"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <div className="pointer-events-none absolute right-3 hidden items-center gap-1 md:flex">
            <span className="flex items-center gap-0.5 rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
              <CommandIcon className="h-3 w-3" />K
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Command, Theme, Notifications, Profile cluster ────── */}
      <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
        {/* Command palette trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={openCommand}
          className="hidden h-11 items-center gap-2 rounded-xl border-border/80 bg-muted/30 px-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-primary/40 cursor-pointer transition-all active:scale-[0.98] lg:inline-flex"
          title="Command bar (⌘K)"
          aria-label="Open command bar"
        >
          <CommandIcon className="h-4 w-4" />
          <span>Commands</span>
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationsPopover />

        {/* Divider between utilities and profile */}
        <div className="hidden h-8 w-px bg-border/70 md:block" />

        {/* Admin profile chip */}
        <Link
          href="/profile"
          className={cn(
            "group flex h-11 items-center gap-2.5 rounded-xl border border-transparent px-1.5 pr-1.5 transition-all duration-200 cursor-pointer",
            "hover:border-border/80 hover:bg-muted/50 active:scale-[0.98]",
            "md:pr-2.5"
          )}
          aria-label="Go to profile"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground shadow-xs ring-2 ring-transparent transition-all group-hover:ring-primary/25">
            AS
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="hidden flex-col items-start leading-none xl:flex">
            <span className="text-[13px] font-semibold text-foreground">
              Abdullah Al Sakib
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              Super Administrator
            </span>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-y-0.5 xl:block" />
        </Link>
      </div>
    </header>
  );
}
