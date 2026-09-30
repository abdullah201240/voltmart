"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "@/components/notifications-popover";

interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
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
  "/channels": { section: "System", page: "Sales Channels" },
  "/settings": { section: "System", page: "Store Settings" },
  "/notifications": { section: "System", page: "Notifications Center" },
  "/profile": { section: "Account", page: "My Profile" },
};

export function AdminHeader({
  onMobileMenuToggle,
  sidebarCollapsed = false,
  onToggleSidebar,
  searchQuery = "",
  onSearchChange,
  className,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const breadcrumb = BREADCRUMB_MAP[pathname] || {
    section: "Admin",
    page: pathname.replace("/", "").replace("-", " ").toUpperCase() || "Overview",
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur px-2 md:px-4 lg:px-4 transition-all font-sans",
        className
      )}
    >
      {/* Left: Sidebar Toggle & Dynamic Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer shrink-0"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={19} className="size-[19px]" />
        </Button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleSidebar && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hidden lg:flex h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors shrink-0"
            title={sidebarCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={19} className="size-[19px]" />
            ) : (
              <PanelLeftClose size={19} className="size-[19px]" />
            )}
          </Button>
        )}

        {/* Breadcrumb Trail */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground ml-1"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors cursor-pointer text-xs font-medium"
          >
            Admin
          </Link>
          <ChevronRight size={14} className="size-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-foreground font-semibold text-xs">{breadcrumb.section}</span>
          <ChevronRight size={14} className="size-3.5 text-muted-foreground/40 shrink-0" />
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {breadcrumb.page}
          </span>
        </nav>
      </div>

      {/* Right: Global Search, Theme Toggle, Notification Bell, Admin Profile */}
      <div className="flex items-center gap-2.5">
        {/* Global Quick Search Input with ⌘K Badge */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <Search size={16} className="absolute left-3 top-3 size-4 text-muted-foreground pointer-events-none" />
          <input
            id="admin-global-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search orders, customers, SKUs..."
            className="h-10 w-full rounded-md border border-input/80 bg-muted/30 pl-9 pr-12 text-xs placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer rounded"
              aria-label="Clear search query"
            >
              <X size={15} className="size-3.5" />
            </button>
          ) : (
            <div className="absolute right-2.5 top-2.5 hidden lg:flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground pointer-events-none">
              <span>⌘</span>
              <span>K</span>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Interactive Notifications Popover */}
        <NotificationsPopover />

        {/* Admin Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 pl-1.5 hover:opacity-85 transition-opacity cursor-pointer"
          aria-label="Go to profile"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs ring-2 ring-transparent hover:ring-primary/30 transition-all">
            AS
          </div>
          <span className="hidden xl:inline text-xs font-semibold text-foreground">
            Abdullah Al Sakib
          </span>
        </Link>
      </div>
    </header>
  );
}
