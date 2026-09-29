"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Tag,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Boxes,
  Layers,
  Sparkles,
  Radio,
  ExternalLink,
  Menu,
  X,
  CreditCard,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: "default" | "emerald" | "amber" | "blue";
  external?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
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
        badge: "LIVE",
        badgeTone: "emerald",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        badge: "12",
        badgeTone: "blue",
      },
      {
        title: "Fulfillment",
        href: "/fulfillment",
        icon: Truck,
      },
      {
        title: "Transactions",
        href: "/transactions",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Products",
        href: "/products",
        icon: Package,
      },
      {
        title: "Categories",
        href: "/categories",
        icon: Layers,
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: Boxes,
        badge: "Alert",
        badgeTone: "amber",
      },
    ],
  },
  {
    label: "Customers & Growth",
    items: [
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Discounts & Vouchers",
        href: "/discounts",
        icon: Tag,
      },
    ],
  },
  {
    label: "Saleor Backend",
    items: [
      {
        title: "Sales Channels",
        href: "/channels",
        icon: Store,
      },
      {
        title: "GraphQL Playground",
        href: "http://localhost:8081/graphql/",
        icon: Radio,
        external: true,
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  className?: string;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const getBadgeClass = (tone?: "default" | "emerald" | "amber" | "blue") => {
    switch (tone) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto overflow-x-hidden p-4">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold tracking-tight text-foreground transition-all hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg shadow-xs">
              V
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight truncate">
                  VoltMart
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
                  Enterprise Admin
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile close button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMobileClose}
            className="lg:hidden h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Live System Indicator */}
        {!collapsed && (
          <div className="mx-2 rounded-lg border border-border/80 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  Saleor Core v3.23
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                PORT 8081
              </span>
            </div>
          </div>
        )}

        {/* Nav Groups */}
        <nav className="space-y-6 pt-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed && (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return item.external ? (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all duration-150 cursor-pointer",
                        "hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/60" />
                        </>
                      )}
                    </a>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => onMobileClose()}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-bold border",
                                isActive
                                  ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                                  : getBadgeClass(item.badgeTone)
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile Chip */}
      <div className="pt-4 border-t border-border/80">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-border/70 p-2.5 bg-muted/20 transition-all hover:bg-muted/40 cursor-pointer",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            AD
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-foreground truncate">
                admin@example.com
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                Super Administrator
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 z-40 h-screen flex-col border-r border-border/80 bg-card transition-all duration-300 ease-in-out select-none",
          collapsed ? "w-18" : "w-64",
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
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border/80 bg-card shadow-lg animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
