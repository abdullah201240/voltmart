"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export interface KpiCardProps {
  /** The metric label or heading (e.g., "Total Revenue") */
  title: string;
  /** The main stat display value (e.g., "$124,592" or "1,420") */
  value: string | number;
  /** Percentage or difference change string (e.g., "+18.2%", "-3.4%") */
  change?: string | number;
  /** Direction of the trend: "up" | "down" | "neutral" */
  trend?: "up" | "down" | "neutral";
  /** Descriptive timeframe for the trend (e.g., "vs last month", "vs yesterday") */
  period?: string;
  /** Lucide icon component or custom ReactNode */
  icon?: LucideIcon | React.ReactNode;
  /** Optional custom color tone for icon badge ("default" | "emerald" | "blue" | "violet" | "amber" | "rose") */
  tone?: "default" | "emerald" | "blue" | "violet" | "amber" | "rose";
  /** Optional badge chip text (e.g., "LIVE", "GOAL REACHED") */
  badge?: string;
  /** Optional progress percentage towards a goal (0-100) */
  progress?: number;
  /** Optional progress target label (e.g., "Goal: $50,000") */
  progressLabel?: string;
  /** Optional tooltip explaining what this KPI measures */
  tooltip?: string;
  /** Optional URL link to navigate on click */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Skeleton loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const TONE_STYLES = {
  default: "bg-muted/80 text-foreground",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function KpiCard({
  title,
  value,
  change,
  trend = "up",
  period,
  icon: IconOrNode,
  tone = "default",
  badge,
  progress,
  progressLabel,
  tooltip,
  href,
  onClick,
  loading = false,
  className,
}: KpiCardProps) {
  // Render loading skeleton
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col justify-between rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
    );
  }

  const isClickable = Boolean(href || onClick);

  // Render Icon safely whether it's a LucideIcon component or custom ReactNode
  const renderIcon = () => {
    if (!IconOrNode) return null;
    if (typeof IconOrNode === "function") {
      const IconComponent = IconOrNode as LucideIcon;
      return <IconComponent className="h-4 w-4" />;
    }
    return IconOrNode;
  };

  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-6 shadow-xs transition-all duration-200",
        isClickable &&
          "cursor-pointer hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
        className
      )}
      onClick={onClick}
    >
      {/* Header: Title, Info Tooltip, Optional Badge, and Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground tracking-tight">
            {title}
          </span>

          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/60 hover:text-muted-foreground cursor-help"
                  aria-label="More information"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}

          {badge && (
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/80 tracking-wide uppercase">
              {badge}
            </span>
          )}
        </div>

        {IconOrNode && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
              TONE_STYLES[tone]
            )}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </div>
      </div>

      {/* Footer: Trend, Change, and Period */}
      {(change !== undefined || period) && (
        <div className="flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-bold",
                trend === "up" &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                trend === "down" &&
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                trend === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
              {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
              {change}
            </span>
          )}

          {period && (
            <span className="text-muted-foreground font-medium truncate">
              {period}
            </span>
          )}
        </div>
      )}

      {/* Optional Progress Bar toward Goal */}
      {typeof progress === "number" && (
        <div className="mt-3.5 pt-3 border-t border-border/60 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">
              {progressLabel || "Progress"}
            </span>
            <span className="font-bold text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Clickable indicator chevron */}
      {isClickable && (
        <div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/**
 * Grid layout wrapper for multiple KPI cards
 */
export function KpiGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  }[columns];

  return (
    <div className={cn("grid gap-5 grid-cols-1", colClass, className)}>
      {children}
    </div>
  );
}
