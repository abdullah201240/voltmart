"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  // SSR-safe mount detection: server + first hydration render `false`,
  // client renders after mount render `true` (no setState-in-effect).
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        aria-label="Toggle theme"
      >
        <Sun size={20} className="size-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors outline-none cursor-pointer"
        aria-label="Select theme"
      >
        {isDark ? (
          <Moon size={20} className="size-5 text-sky-400" />
        ) : (
          <Sun size={20} className="size-5 text-amber-500" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs font-sans">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun size={15} className="size-3.5 text-amber-500" />
          <span>Light Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon size={15} className="size-3.5 text-sky-400" />
          <span>Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Laptop size={15} className="size-3.5 text-muted-foreground" />
          <span>System Default</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
