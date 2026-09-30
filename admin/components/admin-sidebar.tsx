"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
  X,
  Store,
  Boxes,
  Truck,
  Wallet,
  Ticket,
  Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SubNavItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubNavItem[];
}

export interface NavGroup {
  items: NavItem[];
}

/**
 * Boundary-aware route matching: "/orders" matches "/orders" and "/orders/S-1"
 * but never "/orders-archive". "/" only matches the exact root.
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Collect every navigable href and resolve the single href that best matches
 * the current pathname (longest prefix wins). Only that exact href is allowed
 * to render as active, which prevents sibling/parent items like "/customers"
 * and "/customers/tags" from lighting up together.
 */
function computeActiveHrefs(groups: NavGroup[], pathname: string): { active: string | null; parents: Set<string> } {
  const hrefs: string[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (item.href) hrefs.push(item.href);
      for (const child of item.children ?? []) hrefs.push(child.href);
    }
  }
  let active: string | null = null;
  for (const href of hrefs) {
    if (isActiveRoute(pathname, href) && (active === null || href.length > active.length)) {
      active = href;
    }
  }
  const parents = new Set<string>();
  if (active !== null) {
    for (const group of groups) {
      for (const item of group.items) {
        for (const child of item.children ?? []) {
          if (child.href === active) parents.add(item.title);
        }
      }
    }
  }
  return { active, parents };
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    items: [
      {
        title: "Orders",
        icon: ShoppingCart,
        children: [{ title: "All Orders", href: "/orders" }],
      },
      {
        title: "Purchasing",
        icon: Store,
        children: [
          { title: "Requests (RFQs)", href: "/purchases/rfqs" },
          { title: "Purchase Orders", href: "/purchases/orders" },
          { title: "Vendors", href: "/vendors" },
        ],
      },
      {
        title: "Warehouse",
        icon: Boxes,
        children: [
          { title: "Receipts", href: "/inventory/receipts" },
          { title: "Deliveries", href: "/inventory/deliveries" },
          { title: "Transfers", href: "/inventory/transfers" },
          { title: "Replenishment", href: "/inventory/replenishment" },
          { title: "Stock Levels", href: "/inventory" },
        ],
      },
      {
        title: "Manufacturing",
        icon: Factory,
        children: [
          { title: "Manufacturing Orders", href: "/manufacturing" },
          { title: "Bills of Materials", href: "/manufacturing/bom" },
          { title: "Work Centres", href: "/manufacturing/workcenters" },
        ],
      },
      {
        title: "Catalog",
        icon: Package,
        children: [
          { title: "Products", href: "/products" },
          { title: "Categories", href: "/categories" },
          { title: "Attributes", href: "/attributes" },
          { title: "Collections", href: "/collections" },
          { title: "Brands", href: "/brands" },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: "Customers",
        icon: Users,
        children: [
          { title: "Directory", href: "/customers" },
          { title: "Customer Tags", href: "/customers/tags" },
        ],
      },
      {
        title: "Marketing",
        icon: Ticket,
        children: [
          { title: "Discounts & Vouchers", href: "/discounts" },
          { title: "Pricelists", href: "/pricelists" },
          { title: "Promotions", href: "/promotions" },
        ],
      },
      {
        title: "Shipping",
        icon: Truck,
        children: [
          { title: "Shipping Methods", href: "/shipping/methods" },
          { title: "Shipping Zones", href: "/shipping/zones" },
          { title: "Shipping Rates", href: "/shipping/rates" },
        ],
      },
      {
        title: "Finance",
        icon: Wallet,
        children: [
          { title: "Invoices", href: "/invoices" },
          { title: "Bills", href: "/bills" },
          { title: "Payments", href: "/payments" },
          { title: "Journal Entries", href: "/accounting/journals" },
                    { title: "Bank Reconciliation", href: "/accounting/reconciliation" },
          { title: "Chart of Accounts", href: "/accounting/chart-of-accounts" },
          { title: "Credit Notes", href: "/accounting/credit-notes" },
          { title: "Financial Reports", href: "/accounting/reports" },
          { title: "Fiscal Positions", href: "/accounting/fiscal" },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: "Settings",
        icon: Settings,
        children: [
          { title: "General", href: "/settings/general" },
          { title: "Sales Channels", href: "/settings/channels" },
          { title: "Warehouses", href: "/settings/warehouses" },
          { title: "Locations", href: "/settings/locations" },
          { title: "Taxes", href: "/settings/taxes" },
          { title: "Payment Providers", href: "/settings/payments" },
          { title: "Staff & Roles", href: "/settings/staff" },
        ],
      },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  className?: string;
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Single source of truth: exactly one href is active (longest, boundary-aware
  // match) and the parent dropdown titles that contain it.
  const { active: activeHref, parents: activeParentTitles } = useMemo(
    () => computeActiveHrefs(NAV_GROUPS, pathname),
    [pathname],
  );

  // Auto-derived active dropdown based on current route
  const activeDropdown = useMemo(() => {
    if (collapsed) return null;
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.children && activeParentTitles.has(item.title)) {
          return item.title;
        }
      }
    }
    return null;
  }, [collapsed, activeParentTitles]);

  // Track explicit user toggle overrides
  const [userDropdownOverride, setUserDropdownOverride] = useState<{
    pathname: string;
    dropdown: string | null;
  } | null>(null);

  const [collapsedFlyout, setCollapsedFlyout] = useState<string | null>(null);

  const openDropdown =
    !collapsed && userDropdownOverride && userDropdownOverride.pathname === pathname
      ? userDropdownOverride.dropdown
      : activeDropdown;

  const handleToggleDropdown = (title: string) => {
    if (collapsed) {
      setCollapsedFlyout((prev) => (prev === title ? null : title));
    } else {
      setUserDropdownOverride({
        pathname,
        dropdown: openDropdown === title ? null : title,
      });
    }
  };

  // Close collapsed flyout menus on click outside
  useEffect(() => {
    if (!collapsed) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsedFlyout(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed]);

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden p-3 md:p-4"
    >
      {/* Brand Header & Navigation */}
      <div className="space-y-4">
        {collapsed ? (
          /* Collapsed Header: Clean Centered Logo */
          <div className="flex flex-col items-center py-1">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg shadow-xs hover:scale-105 transition-transform cursor-pointer"
              title="VoltMart"
            >
              V
            </Link>
          </div>
        ) : (
          /* Expanded Header: Brand Title and Mobile Close Action */
          <div className="flex items-center justify-between px-2 pt-1">
            <Link
              href="/"
              className="flex items-center gap-3 font-bold tracking-tight text-foreground transition-all hover:opacity-90 cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg shadow-xs">
                V
              </div>
              <span className="text-base font-bold tracking-tight truncate">
                VoltMart
              </span>
            </Link>

            {/* Mobile close button (only visible inside mobile drawer) */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMobileClose}
              className="lg:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Close mobile navigation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Nav Groups */}
        <nav className="space-y-3 pt-1">
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {groupIdx > 0 && (
                <div className="h-px bg-border/60 my-2 mx-1" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isOpen = collapsed
                  ? collapsedFlyout === item.title
                  : openDropdown === item.title;

                // Check if any child is active
                const isChildActive = hasChildren
                  ? item.children!.some((child) => child.href === activeHref)
                  : false;

                // Check if direct link is active
                const isDirectActive = item.href ? item.href === activeHref : false;

                const isItemActive = isDirectActive || isChildActive;

                // Case 1: Dropdown Menu Item (with children)
                if (hasChildren) {
                  return (
                    <div key={item.title} className="relative">
                      {collapsed ? (
                        /* Collapsed Dropdown Button & Floating Flyout */
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleDropdown(item.title)}
                            aria-expanded={isOpen}
                            className={cn(
                              "flex h-10 w-10 mx-auto items-center justify-center rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer",
                              isItemActive
                                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
                              isOpen && !isItemActive && "bg-muted text-foreground"
                            )}
                            title={item.title}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                          </button>

                          {/* Floating Popover in Collapsed Rail */}
                          {isOpen && (
                            <div className="absolute left-full top-0 ml-2 z-50 min-w-44 rounded-lg border border-border/80 bg-popover p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
                              <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                                {item.title}
                              </div>
                              <div className="space-y-0.5">
                                {item.children!.map((child) => {
                                  const isSubActive = child.href === activeHref;

                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={() => {
                                        setCollapsedFlyout(null);
                                        onMobileClose();
                                      }}
                                      className={cn(
                                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
                                        isSubActive
                                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]"
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
                                          isSubActive
                                            ? "bg-primary-foreground"
                                            : "bg-muted-foreground/50"
                                        )}
                                      />
                                      <span className="truncate">{child.title}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Expanded Dropdown Accordion */
                        <div>
                          <button
                            type="button"
                            onClick={() => handleToggleDropdown(item.title)}
                            aria-expanded={isOpen}
                            className={cn(
                              "group flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer",
                              isChildActive
                                ? "bg-muted/60 text-foreground font-bold"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
                              isOpen && "bg-muted/40 text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-colors",
                                  isChildActive || isOpen
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )}
                              />
                              <span className="truncate">{item.title}</span>
                            </div>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/70 group-hover:text-foreground",
                                isOpen && "rotate-90 text-foreground"
                              )}
                            />
                          </button>

                          {/* Accordion Sub-options Tray */}
                          {isOpen && (
                            <div className="mt-1 space-y-0.5 border-l border-border/70 ml-5 pl-2.5 animate-in slide-in-from-top-1 fade-in-0 duration-150">
                              {item.children!.map((child) => {
                                const isSubActive = child.href === activeHref;

                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => onMobileClose()}
                                    className={cn(
                                      "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
                                      isSubActive
                                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
                                        isSubActive
                                          ? "bg-primary-foreground"
                                          : "bg-muted-foreground/40 group-hover:bg-foreground"
                                      )}
                                    />
                                    <span className="truncate">{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Case 2: Direct Single Link Item
                return (
                  <Link
                    key={item.title}
                    href={item.href!}
                    onClick={() => onMobileClose()}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer",
                      isDirectActive
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
                      collapsed && "justify-center px-0 h-10 w-10 mx-auto"
                    )}
                    title={item.title}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isDirectActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.title}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile Chip */}
      <div className="pt-3 border-t border-border/80">
        {collapsed ? (
          <div
            className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            title="admin@example.com"
          >
            AD
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 p-2.5 bg-muted/20 transition-all hover:bg-muted/40 cursor-pointer">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              AD
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate">
                admin@example.com
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Sleek space-efficient rail */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-border/80 bg-card transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-16" : "w-56",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in-0"
          onClick={onMobileClose}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/80 bg-card shadow-lg animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
