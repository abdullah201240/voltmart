"use client";

import * as React from "react";
import Link from "next/link";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeColor } from "@/lib/theme/theme-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const { themeColor, presets, setThemeColor } = useThemeColor();
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
      <DropdownMenuContent align="end" className="text-xs font-sans w-56 p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance Mode
        </div>
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

        <div className="border-t border-border/60 my-1 pt-1.5 px-2">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            <span>Accent Color</span>
            <Link href="/settings/general" className="hover:text-primary transition-colors cursor-pointer">
              Settings &rarr;
            </Link>
          </div>
          <div className="flex items-center justify-between gap-1 pb-1">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setThemeColor(p.id)}
                title={p.name}
                className={`h-5 w-5 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                  themeColor === p.id ? "ring-2 ring-foreground ring-offset-1" : "opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
