"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminFooter } from "@/components/admin-footer";

interface AdminLayoutContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function useAdminLayout(): AdminLayoutContextValue {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error(
      "useAdminLayout must be used within an AdminShell or AdminLayoutProvider"
    );
  }
  return context;
}

interface AdminShellProps {
  children: ReactNode;
  className?: string;
}

export function AdminShell({ children, className }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Persist sidebar state in localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voltmart_sidebar_collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage read failures in SSR/sandbox
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("voltmart_sidebar_collapsed", String(next));
      } catch {
        // Ignore localStorage write failures
      }
      return next;
    });
  };

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Global keyboard shortcuts:
  // - ⌘K / Ctrl+K: focus global search
  // - ⌘B / Ctrl+B: toggle sidebar collapse
  // - Escape: close mobile drawer or blur search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById(
          "admin-global-search"
        ) as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleSidebar();
      } else if (e.key === "Escape") {
        if (mobileOpen) {
          setMobileOpen(false);
        } else {
          const searchInput = document.getElementById(
            "admin-global-search"
          ) as HTMLInputElement | null;
          if (document.activeElement === searchInput) {
            searchInput?.blur();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar: handleToggleSidebar,
        mobileOpen,
        setMobileOpen,
        searchQuery,
        setSearchQuery,
      }}
    >
      <div
        className={cn(
          "relative h-dvh w-full overflow-hidden bg-background text-foreground flex selection:bg-primary/20",
          className
        )}
      >
        {/* Desktop & Mobile Responsive Admin Sidebar (Fixed inset-y-0) */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Dynamic Edge-to-Edge Main Panel Layout (Fixed Header at top, Fixed Footer at bottom) */}
        <div
          className={cn(
            "flex flex-col flex-1 w-full min-w-0 h-dvh overflow-hidden transition-[padding] duration-300 ease-in-out",
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-56"
          )}
        >
          {/* Permanently Fixed Top Header */}
          <AdminHeader
            className="shrink-0"
            onMobileMenuToggle={() => setMobileOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Smooth Scrollable Middle Content Viewport with Global Page Layout */}
          <main className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden px-2 md:px-4 lg:px-4 py-5 md:py-6 space-y-4">
            {children}
          </main>

          {/* Permanently Fixed Bottom Telemetry Footer */}
          <AdminFooter className="shrink-0" />
        </div>
      </div>
    </AdminLayoutContext.Provider>
  );
}
