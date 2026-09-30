"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminFooter } from "@/components/admin-footer";
import { NotificationsProvider } from "@/lib/notifications-context";
import { AppFeedbackProvider } from "@/components/app-feedback";
import { CommandPalette } from "@/components/command-palette";

const SIDEBAR_KEY = "voltmart_sidebar_collapsed";
const sidebarListeners = new Set<() => void>();

function subscribeSidebar(cb: () => void) {
  sidebarListeners.add(cb);
  return () => {
    sidebarListeners.delete(cb);
  };
}

// Client snapshot reads the persisted boolean; server snapshot is always the
// default so SSR and the first hydration paint match (no hydration warning).
function getSidebarSnapshot() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  } catch {
    return false;
  }
}

function getSidebarServerSnapshot() {
  return false;
}

function writeSidebar(next: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, String(next));
  } catch {
    // Ignore localStorage write failures (SSR/sandbox/private mode)
  }
  sidebarListeners.forEach((l) => l());
}

interface AdminLayoutContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (next: boolean) => void;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openCommand: () => void;
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
  const sidebarCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const setSidebarCollapsed = writeSidebar;
  const handleToggleSidebar = () => writeSidebar(!sidebarCollapsed);

  // Close the mobile drawer whenever the route changes — adjusted during
  // render (the React-recommended "reset state on prop change" pattern)
  // instead of a cascading setState effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Global keyboard shortcuts:
  // - ⌘K / Ctrl+K: open the global command bar
  // - ⌘B / Ctrl+B: toggle sidebar collapse
  // - Escape: close mobile drawer or blur search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
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
        openCommand: () => setPaletteOpen(true),
      }}
    >
      <NotificationsProvider>
        <AppFeedbackProvider>
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

          {/* Global ⌘K command bar (search + create + apps) */}
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </div>
        </AppFeedbackProvider>
      </NotificationsProvider>
    </AdminLayoutContext.Provider>
  );
}
