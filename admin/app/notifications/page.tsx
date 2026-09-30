"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  ShoppingCart,
  AlertTriangle,
  Users,
  ShieldAlert,
  Sliders,
  ExternalLink,
  PlusCircle,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import {
  useNotifications,
  type NotificationType,
  type NotificationPriority,
} from "@/lib/notifications-context";
import { useConfirm, useToast } from "@/components/app-feedback";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  } = useNotifications();
  const appToast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Filtered notifications calculation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "unread" && item.read) return false;
      if (activeTab === "order" && item.type !== "order") return false;
      if (activeTab === "inventory" && item.type !== "inventory") return false;
      if (
        activeTab === "security_system" &&
        item.type !== "security" &&
        item.type !== "system"
      ) {
        return false;
      }

      // Priority dropdown filter
      if (priorityFilter !== "all" && item.priority !== priorityFilter) {
        return false;
      }

      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMsg = item.message.toLowerCase().includes(query);
        const matchesAction = item.actionLabel?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMsg && !matchesAction) return false;
      }

      return true;
    });
  }, [notifications, activeTab, priorityFilter, searchQuery]);

  // Counts for tabs
  const urgentCount = notifications.filter(
    (n) => n.priority === "urgent" || n.priority === "high"
  ).length;

  const orderCount = notifications.filter((n) => n.type === "order").length;
  const inventoryCount = notifications.filter((n) => n.type === "inventory").length;
  const securityCount = notifications.filter(
    (n) => n.type === "security" || n.type === "system"
  ).length;

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

  const handleCreateTestNotification = () => {
    addNotification({
      title: "Real-Time Flash Sale Triggered",
      message: "Automated promo banner published for 'Weekend Audio Deals' across USD Channel.",
      type: "order",
      priority: "medium",
      actionUrl: "/discounts",
      actionLabel: "View Promotion",
    });
    appToast.success("Test alert dispatched", "A sample notification was added to the center.");
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    appToast.success("All notifications marked read", `${unreadCount} alert(s) acknowledged.`);
  };

  const handleClearAll = async () => {
    const allowed = await confirm({
      title: "Clear all notifications?",
      description: `This permanently removes ${notifications.length} alert(s) from the center.`,
      tone: "destructive",
      confirmLabel: "Clear All",
    });
    if (!allowed) return;
    clearAll();
    appToast.success("Notifications cleared", "The center is now empty.");
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    appToast.success("Alert dismissed", `Notification ${id} was removed.`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Notifications Center
            </h1>
            {unreadCount > 0 ? (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 font-bold text-xs px-2.5 py-0.5"
              >
                {unreadCount} unread
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-muted-foreground font-semibold text-xs px-2.5 py-0.5"
              >
                All caught up
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage operational alerts, fulfillment flags, stock warnings, and security updates.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateTestNotification}
            className="h-10 px-4 text-xs font-semibold cursor-pointer"
          >
            <PlusCircle className="mr-1.5 h-4 w-4 text-primary" />
            Send Test Alert
          </Button>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleMarkAllRead}
              className="h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              <CheckCheck className="mr-1.5 h-4 w-4 text-emerald-500" />
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClearAll}
              className="h-10 px-3.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Centralized KPI Metric Grid */}
      <KpiGrid columns={3}>
        <KpiCard
          title="Total Notifications"
          value={String(notifications.length)}
          icon={Bell}
          tone="default"
        />
        <KpiCard
          title="Unread Alerts"
          value={String(unreadCount)}
          icon={AlertTriangle}
          tone="rose"
        />
        <KpiCard
          title="Urgent & High Priority"
          value={String(urgentCount)}
          icon={ShieldAlert}
          tone="amber"
        />
      </KpiGrid>

      {/* Filter Toolbar & Tab Switcher */}
      <Card className="p-4 md:p-5 shadow-xs border-border/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-muted/60 p-1 flex-wrap h-auto">
              <TabsTrigger value="all" className="cursor-pointer text-xs font-semibold">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="cursor-pointer text-xs font-semibold"
              >
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger
                value="order"
                className="cursor-pointer text-xs font-semibold"
              >
                Orders ({orderCount})
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="cursor-pointer text-xs font-semibold"
              >
                Inventory ({inventoryCount})
              </TabsTrigger>
              <TabsTrigger
                value="security_system"
                className="cursor-pointer text-xs font-semibold"
              >
                Security & System ({securityCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Priority Dropdown */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by title or keyword..."
                className="h-10 w-full rounded-md border border-input/90 bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-colors"
              />
            </div>

            {/* Priority Selector */}
            <div className="relative shrink-0">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by priority"
                className="h-10 rounded-md border border-input/90 bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2.5 w-full">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center border-border/80 shadow-xs space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              No matching notifications
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              There are no alerts matching your current filter criteria or search query.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab("all");
                  setPriorityFilter("all");
                  setSearchQuery("");
                }}
                className="cursor-pointer text-xs"
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "p-4 md:p-5 transition-all duration-150 border-border/80 shadow-xs",
                item.read
                  ? "bg-card/70 opacity-80 hover:opacity-100 hover:bg-card"
                  : "bg-card border-l-4 border-l-primary hover:border-primary/80"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Left: Icon & Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40 shadow-2xs mt-0.5">
                    {getTypeIcon(item.type, item.priority)}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-bold tracking-tight",
                          item.read ? "text-foreground" : "text-foreground"
                        )}
                      >
                        {item.title}
                      </span>

                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider",
                          getPriorityBadgeClass(item.priority)
                        )}
                      >
                        {item.priority}
                      </span>

                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/60 px-2 py-0.5 rounded">
                        {item.type}
                      </span>

                      {!item.read && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Unread
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="font-mono">{item.id}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      onClick={() => markAsRead(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                      <span>{item.actionLabel || "View"}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  )}

                  {item.read ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsUnread(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Mark as unread"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(item.id)}
                      className="h-8 w-8 p-0 text-primary hover:bg-primary/10 cursor-pointer"
                      title="Mark as read"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="Dismiss alert"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
