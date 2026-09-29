"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function AdminFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "w-full shrink-0 border-t border-border/80 bg-card/95 backdrop-blur px-4 md:px-6 lg:px-8 py-3.5 text-xs text-muted-foreground transition-all z-20",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span>© 2026 VoltMart. All rights reserved.</span>
      </div>
    </footer>
  );
}
