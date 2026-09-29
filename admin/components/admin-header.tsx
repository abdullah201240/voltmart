"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Store,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  className?: string;
}

const BREADCRUMB_MAP: Record<string, { section: string; page: string }> = {
  "/": { section: "Dashboard", page: "Live Overview" },
  "/orders": { section: "Commerce", page: "Orders Pipeline" },
  "/fulfillment": { section: "Commerce", page: "Fulfillment" },
  "/transactions": { section: "Commerce", page: "Transactions" },
  "/products": { section: "Catalog", page: "Product Management" },
  "/categories": { section: "Catalog", page: "Categories" },
  "/inventory": { section: "Catalog", page: "Inventory Stock" },
  "/customers": { section: "Growth", page: "Customer Directory" },
  "/discounts": { section: "Growth", page: "Discounts & Vouchers" },
  "/channels": { section: "Saleor Backend", page: "Sales Channels" },
  "/settings": { section: "System", page: "Store Settings" },
};

export function AdminHeader({
  onMobileMenuToggle,
  searchQuery = "",
  onSearchChange,
  className,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const breadcrumb = BREADCRUMB_MAP[pathname] || {
    section: "Admin",
    page: pathname.replace("/", "").replace("-", " ").toUpperCase() || "Overview",
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur px-8 md:px-12 transition-all",
        className
      )}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden h-10 w-10 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Dynamic Breadcrumb Trail */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Admin
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-semibold">{breadcrumb.section}</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="rounded bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            {breadcrumb.page}
          </span>
        </nav>

        {/* Active Channel Status Badge */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs">
          <Store className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold text-foreground">USD Channel</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-muted-foreground">Store Live</span>
        </div>
      </div>

      {/* Right: Quick Search, System Status, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3.5">
        {/* Global Quick Search Input with ⌘K Badge */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            id="admin-global-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search orders, customers, SKUs..."
            className="h-11 w-full rounded-md border border-input/80 bg-muted/30 pl-10 pr-14 text-sm placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange("")}
              className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="absolute right-3 top-3 hidden lg:flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>

        {/* System Health Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Operational</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell with Unread Badge */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setHasUnreadAlerts(false)}
          className="relative h-11 w-11 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {hasUnreadAlerts && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          )}
        </Button>

        {/* Admin Avatar Chip */}
        <div className="flex items-center gap-2 rounded-full border border-border/70 p-1 pl-1.5 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
            AD
          </div>
          <span className="hidden xl:inline text-xs font-semibold text-foreground pr-2">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
}
