"use client";

import React from "react";
import Link from "next/link";
import {
  Radio,
  Database,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Terminal,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "w-full border-t border-border/80 bg-card/40 px-8 md:px-12 py-6 text-xs text-muted-foreground transition-all",
        className
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between w-full">
        {/* Left: Backend Services Telemetry Status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-foreground">
              Saleor Core API:
            </span>
            <span className="text-muted-foreground">Connected (v3.23.36)</span>
          </div>

          <span className="hidden sm:inline text-border">•</span>

          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span>PostgreSQL 15 & Valkey Active</span>
          </div>

          <span className="hidden sm:inline text-border">•</span>

          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[11px] text-foreground font-medium">
              Latency: 18ms
            </span>
          </div>
        </div>

        {/* Center: Keyboard Shortcuts Legend */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] text-muted-foreground/80">
          <span>Shortcuts:</span>
          <span className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
            ⌘K
          </span>
          <span>Quick search</span>
          <span className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
            Tab
          </span>
          <span>Filter toggle</span>
        </div>

        {/* Right: Quick Links & Documentation */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href="http://localhost:8081/graphql/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium hover:text-foreground transition-colors cursor-pointer"
          >
            <span>GraphQL Playground</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <a
            href="https://docs.saleor.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium hover:text-foreground transition-colors cursor-pointer"
          >
            <span>Documentation</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <span className="text-border">•</span>

          <span className="font-medium text-foreground">
            © 2026 VoltMart Platform
          </span>
        </div>
      </div>
    </footer>
  );
}
