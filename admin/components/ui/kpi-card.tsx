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
import { Skeleton } from "@/components/ui/skeleton";

export type KpiTone =
  | "default"
  | "emerald"
  | "blue"
  | "violet"
  | "amber"
  | "rose"
  | "indigo"
  | "cyan";

export type KpiVariant = "default" | "accent" | "subtle" | "compact";

export interface KpiCardProps {
  /** The metric label or heading (e.g., "Total Revenue", "Cart Abandonment") */
  title: string;
  /** The main stat display value (e.g., "$124,592" or "1,420") */
  value: string | number;
  /** Optional value prefix (e.g., "$", "€") */
  prefix?: string;
  /** Optional value suffix (e.g., "/mo", "items", "hrs") */
  suffix?: string;
  /** Percentage or difference change string (e.g., "+18.2%", "-3.4%") */
  change?: string | number;
  /** Direction of the trend: "up" | "down" | "neutral" */
  trend?: "up" | "down" | "neutral";
  /** If true, downward trend is treated as positive (e.g., for bounce rate, churn, cart abandonment) */
  trendInverse?: boolean;
  /** Descriptive timeframe for the trend (e.g., "vs last month", "vs yesterday") */
  period?: string;
  /** Lucide icon component or custom ReactNode */
  icon?: LucideIcon | React.ReactNode;
  /** Color tone for icon badge, accents, and sparklines */
  tone?: KpiTone;
  /** Card visual style variant */
  variant?: KpiVariant;
  /** Optional badge chip text (e.g., "LIVE", "GOAL REACHED") */
  badge?: string;
  /** Array of numeric data points to render a smooth inline SVG sparkline trend */
  sparkline?: number[];
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

const TONE_ICON_STYLES: Record<KpiTone, string> = {
  default: "bg-muted text-foreground",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

const TONE_ACCENT_BORDERS: Record<KpiTone, string> = {
  default: "border-t-2 border-t-foreground/40",
  emerald: "border-t-2 border-t-emerald-500",
  blue: "border-t-2 border-t-blue-500",
  violet: "border-t-2 border-t-violet-500",
  amber: "border-t-2 border-t-amber-500",
  rose: "border-t-2 border-t-rose-500",
  indigo: "border-t-2 border-t-indigo-500",
  cyan: "border-t-2 border-t-cyan-500",
};

const TONE_SUBTLE_BGS: Record<KpiTone, string> = {
  default: "bg-muted/40",
  emerald: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40",
  blue: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/40",
  violet: "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-900/40",
  amber: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/40",
  rose: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/40",
  indigo: "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/40",
  cyan: "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200/50 dark:border-cyan-900/40",
};

const SPARKLINE_STROKES: Record<KpiTone, string> = {
  default: "stroke-foreground/60",
  emerald: "stroke-emerald-500",
  blue: "stroke-blue-500",
  violet: "stroke-violet-500",
  amber: "stroke-amber-500",
  rose: "stroke-rose-500",
  indigo: "stroke-indigo-500",
  cyan: "stroke-cyan-500",
};

const SPARKLINE_FILLS: Record<KpiTone, string> = {
  default: "fill-foreground/10",
  emerald: "fill-emerald-500/15",
  blue: "fill-blue-500/15",
  violet: "fill-violet-500/15",
  amber: "fill-amber-500/15",
  rose: "fill-rose-500/15",
  indigo: "fill-indigo-500/15",
  cyan: "fill-cyan-500/15",
};

/**
 * Pure SVG Smooth Sparkline Generator
 */
function KpiSparkline({
  data,
  tone = "default",
  height = 36,
  width = 120,
}: {
  data: number[];
  tone?: KpiTone;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const availableH = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * availableH;
    return [x, y];
  });

  const lineD = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const [prevX, prevY] = points[i - 1];
    const midX = (prevX + x) / 2;
    return `${acc} C ${midX.toFixed(1)} ${prevY.toFixed(1)}, ${midX.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, "");

  const first = points[0];
  const last = points[points.length - 1];
  const areaD = `${lineD} L ${last[0].toFixed(1)} ${height} L ${first[0].toFixed(1)} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-9 overflow-visible"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={areaD}
        className={cn(SPARKLINE_FILLS[tone])}
      />
      <path
        d={lineD}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(SPARKLINE_STROKES[tone])}
      />
    </svg>
  );
}

/**
 * Universal KPI Card Component
 * Designed for full-website consistency across admin panels, analytics, and customer portals.
 */
export function KpiCard({
  title,
  value,
  prefix,
  suffix,
  change,
  trend = "up",
  trendInverse = false,
  period,
  icon: IconOrNode,
  tone = "default",
  variant = "default",
  badge,
  sparkline,
  tooltip,
  href,
  onClick,
  loading = false,
  className,
}: KpiCardProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col justify-between rounded-lg border border-border/80 bg-card p-5 shadow-xs space-y-3",
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

  // Calculate positive / negative trend taking inverse metrics into account
  const isPositive = trendInverse ? trend === "down" : trend === "up";
  const isNegative = trendInverse ? trend === "up" : trend === "down";

  // Render Icon safely whether it's a Component (function or forwardRef object) or JSX element
  const renderIcon = (sizeClass = "h-4.5 w-4.5") => {
    if (!IconOrNode) return null;
    if (React.isValidElement(IconOrNode)) {
      return IconOrNode;
    }
    const IconComponent = IconOrNode as React.ComponentType<{ className?: string }>;
    return <IconComponent className={sizeClass} />;
  };

  // Compact variant layout
  if (variant === "compact") {
    const compactContent = (
      <div
        className={cn(
          "group relative flex items-center justify-between rounded-lg border border-border/80 bg-card px-5 py-4 shadow-xs transition-all duration-200",
          isClickable &&
            "cursor-pointer hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {IconOrNode && (
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
                TONE_ICON_STYLES[tone]
              )}
            >
              {renderIcon()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground truncate">
              {title}
            </div>
            <div className="text-xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
              {prefix && <span className="text-sm font-semibold text-muted-foreground">{prefix}</span>}
              <span>{value}</span>
              {suffix && <span className="text-xs font-normal text-muted-foreground">{suffix}</span>}
            </div>
          </div>
        </div>

        {change !== undefined && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-bold shrink-0",
              isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block no-underline">
          {compactContent}
        </Link>
      );
    }
    return compactContent;
  }

  // Standard, Accent, and Subtle variants
  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-lg border border-border/80 bg-card p-4 shadow-xs transition-all duration-200",
        variant === "accent" && TONE_ACCENT_BORDERS[tone],
        variant === "subtle" && TONE_SUBTLE_BGS[tone],
        isClickable &&
          "cursor-pointer hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm",
        className
      )}
      onClick={onClick}
    >
      {/* Top Header: Title, Info Tooltip, Optional Badge, and Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-muted-foreground tracking-tight">
            {title}
          </span>

          {tooltip && (
            <Tooltip>
              <TooltipTrigger
                className="text-muted-foreground/60 hover:text-muted-foreground cursor-help inline-flex items-center"
                aria-label="More information"
              >
                <HelpCircle className="h-3.5 w-3.5" />
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
              TONE_ICON_STYLES[tone]
            )}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      {/* Main Metric Value & Optional Sparkline */}
      <div className="my-1.5 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-1">
          {prefix && (
            <span className="text-lg font-bold text-muted-foreground">
              {prefix}
            </span>
          )}
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>

        {sparkline && sparkline.length >= 2 && (
          <div className="w-24 shrink-0">
            <KpiSparkline data={sparkline} tone={tone} />
          </div>
        )}
      </div>

      {/* Footer / Trend Indicator */}
      {(change !== undefined || period) && (
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-bold",
                isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
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
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClass = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }[columns];

  return (
    <div className={cn("grid grid-cols-1 items-start gap-5", colClass, className)}>
      {children}
    </div>
  );
}
