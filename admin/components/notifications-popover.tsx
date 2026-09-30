"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ArrowRight,
  ShoppingCart,
  AlertTriangle,
  Users,
  ShieldAlert,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useNotifications,
  type NotificationType,
  type NotificationPriority,
} from "@/lib/notifications-context";

export function NotificationsPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const getTypeIcon = (type: NotificationType, priority: NotificationPriority) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
      case "inventory":
        return (
          <AlertTriangle
            className={cn(
              "h-4 w-4",
              priority === "urgent" ? "text-rose-500" : "text-amber-500"
            )}
          />
        );
      case "customer":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "security":
        return <ShieldAlert className="h-4 w-4 text-violet-500" />;
      default:
        return <Sliders className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityBadgeClass = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const previewItems = notifications.slice(0, 5);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      router.push(actionUrl);
    }
  };

  return (
    <div ref={popoverRef} className="relative">
      {/* Bell Trigger Button with Unread Badge */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="View notifications"
        suppressHydrationWarning
        className={cn(
          "relative h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors",
          isOpen && "bg-muted/70 text-foreground"
        )}
      >
        <Bell size={19} className="size-[19px]" />

        {unreadCount > 0 && (
          <>
            <span
              suppressHydrationWarning
              className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs pointer-events-none"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
            <span className="absolute top-2 right-2 flex h-2 w-2 pointer-events-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            </span>
          </>
        )}
      </Button>

      {/* Floating Notifications Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 z-50 w-84 sm:w-96 rounded-lg border border-border/80 bg-popover/98 backdrop-blur shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] font-bold px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                >
                  {unreadCount} new
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground">All caught up</span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => markAllAsRead()}
                className="h-7 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {previewItems.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-semibold text-foreground">No notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  You are all caught up on system and storefront alerts.
                </p>
              </div>
            ) : (
              previewItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item.id, item.actionUrl)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-xs transition-colors cursor-pointer select-none",
                    item.read
                      ? "hover:bg-muted/40 opacity-75"
                      : "bg-muted/30 hover:bg-muted/60 opacity-100 font-medium"
                  )}
                >
                  {/* Category Indicator Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background shadow-2xs mt-0.5">
                    {getTypeIcon(item.type, item.priority)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-xs",
                          item.read
                            ? "text-foreground font-medium"
                            : "text-foreground font-bold"
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={cn(
                          "inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-bold border uppercase tracking-wider",
                          getPriorityBadgeClass(item.priority)
                        )}
                      >
                        {item.priority}
                      </span>

                      {item.actionLabel && (
                        <span className="text-[11px] font-semibold text-primary inline-flex items-center gap-1 hover:underline">
                          {item.actionLabel}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread blue dot */}
                  {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Popover Footer: Link to Full Page */}
          <div className="border-t border-border/70 p-2.5 bg-muted/20 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1 cursor-pointer"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
