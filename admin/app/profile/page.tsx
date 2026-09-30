"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Bell,
  Camera,
  Save,
  LogOut,
  Activity,
  Clock,
  ShoppingCart,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  Monitor,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import {
  CentralForm,
  CentralFormSection,
  CentralFormField,
  CentralFormInput,
  CentralFormTextarea,
} from "@/components/ui/central-form";
import { useConfirm, useToast } from "@/components/app-feedback";

/* ─── Mock profile data ──────────────────────────────────────────── */
const PROFILE = {
  name: "Abdullah Al Sakib",
  role: "Super Administrator",
  email: "abdullah@voltmart.io",
  phone: "+880 1700-000000",
  location: "Dhaka, Bangladesh",
  timezone: "Asia/Dhaka (UTC+6)",
  bio: "Platform owner and lead developer of VoltMart. Manages store configuration, order pipelines, and catalog operations.",
  joinedAt: "March 2024",
  lastLogin: "Today at 10:47 AM",
  avatar: "AS",
};

const RECENT_ACTIVITY = [
  { icon: ShoppingCart, label: "Processed 12 orders", time: "2 mins ago", tone: "emerald" as const },
  { icon: Settings, label: "Updated shipping rates", time: "1 hr ago", tone: "blue" as const },
  { icon: Bell, label: "Cleared 5 notifications", time: "3 hrs ago", tone: "amber" as const },
  { icon: Shield, label: "Changed admin password", time: "2 days ago", tone: "violet" as const },
];

const ACTIVE_SESSIONS = [
  { device: "Chrome on macOS", location: "Dhaka, BD", icon: Monitor, current: true, time: "Now" },
  { device: "Safari on iPhone", location: "Dhaka, BD", icon: Smartphone, current: false, time: "2 hrs ago" },
];

const TONE_ICON: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function ProfilePage() {
  const appToast = useToast();
  const confirm = useConfirm();
  const [saving, setSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  /* Notification preferences */
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    stockAlerts: true,
    securityAlerts: true,
    marketingReports: false,
    weeklyDigest: true,
    emailNotifs: true,
    browserNotifs: false,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    appToast.success("Profile saved", "Your account details and preferences were updated.");
  };

  const handleSignOut = async () => {
    const allowed = await confirm({
      title: "Sign out of the admin console?",
      description: "You'll need to re-enter your credentials to resume work.",
      tone: "destructive",
      confirmLabel: "Sign Out",
    });
    if (!allowed) return;
    appToast.info("Signed out", "Session terminated. (Demo — no auth backend.)");
  };

  const handleUpdatePassword = async () => {
    const allowed = await confirm({
      title: "Update admin password?",
      description: "All other active sessions will be signed out immediately.",
      confirmLabel: "Update Password",
    });
    if (!allowed) return;
    appToast.success("Password updated", "Other sessions were signed out for safety.");
  };

  const toggle = (key: keyof typeof notifPrefs) =>
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account information, security, and notification preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="h-11 px-5 text-sm font-medium cursor-pointer text-rose-600 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <Button
            className="h-11 px-5 text-sm font-medium cursor-pointer"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className={cn("mr-2 h-4 w-4", saving && "animate-spin")} />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* ── Activity KPI strip ────────────────────────────────── */}
      <KpiGrid columns={4}>
        <KpiCard
          title="Member Since"
          value={PROFILE.joinedAt}
          icon={User}
          tone="blue"
          period="Account created"
        />
        <KpiCard
          title="Last Login"
          value="Today"
          icon={Clock}
          tone="emerald"
          period="10:47 AM"
        />
        <KpiCard
          title="Orders Managed"
          value="1,284"
          icon={ShoppingCart}
          tone="violet"
          change="+38"
          trend="up"
          period="this month"
        />
        <KpiCard
          title="Active Sessions"
          value={String(ACTIVE_SESSIONS.length)}
          icon={Activity}
          tone="amber"
          period="Across devices"
        />
      </KpiGrid>

      {/* ── Main 2-col grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ── Left col: Avatar card ─────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Avatar card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs flex flex-col items-center gap-5">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-3xl shadow-md ring-4 ring-primary/20">
                {PROFILE.avatar}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/80 shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
                aria-label="Upload avatar"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-center space-y-1">
              <div className="text-lg font-bold tracking-tight text-foreground">{PROFILE.name}</div>
              <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                {PROFILE.role}
              </Badge>
            </div>
            <div className="w-full space-y-2.5 pt-1 border-t border-border/60">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{PROFILE.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{PROFILE.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{PROFILE.timezone}</span>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-lg border border-border/80 bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </span>
            </div>
            <ul className="divide-y divide-border/60">
              {RECENT_ACTIVITY.map((item, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", TONE_ICON[item.tone])}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Active sessions */}
          <div className="rounded-lg border border-border/80 bg-card shadow-xs overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/60">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Active Sessions
              </span>
            </div>
            <ul className="divide-y divide-border/60">
              {ACTIVE_SESSIONS.map((s, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {s.device}
                      {s.current && (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{s.location} · {s.time}</p>
                  </div>
                  {!s.current && (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right cols: Forms ─────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Personal information */}
          <CentralForm
            variant="card"
            title="Personal Information"
            description="Update your name, contact details, and public profile."
          >
            <CentralFormSection columns={2}>
              <CentralFormField label="Full Name" htmlFor="full-name" required>
                <CentralFormInput
                  id="full-name"
                  defaultValue={PROFILE.name}
                  prefixIcon={<User className="h-3.5 w-3.5" />}
                  placeholder="Your full name"
                />
              </CentralFormField>
              <CentralFormField label="Email Address" htmlFor="email" required>
                <CentralFormInput
                  id="email"
                  type="email"
                  defaultValue={PROFILE.email}
                  prefixIcon={<Mail className="h-3.5 w-3.5" />}
                  placeholder="email@example.com"
                />
              </CentralFormField>
              <CentralFormField label="Phone Number" htmlFor="phone">
                <CentralFormInput
                  id="phone"
                  type="tel"
                  defaultValue={PROFILE.phone}
                  prefixIcon={<Phone className="h-3.5 w-3.5" />}
                  placeholder="+880 1700-000000"
                />
              </CentralFormField>
              <CentralFormField label="Location" htmlFor="location">
                <CentralFormInput
                  id="location"
                  defaultValue={PROFILE.location}
                  placeholder="City, Country"
                />
              </CentralFormField>
              <CentralFormField label="Bio" htmlFor="bio" colSpan="full">
                <CentralFormTextarea
                  id="bio"
                  defaultValue={PROFILE.bio}
                  rows={3}
                  placeholder="Write a short bio about yourself…"
                />
              </CentralFormField>
            </CentralFormSection>
          </CentralForm>

          {/* Change password */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-xl font-bold tracking-tight">Change Password</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Use a strong, unique password to protect your account.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Current password */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="current-pw" className="text-xs font-semibold text-foreground">
                  Current Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="current-pw"
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Enter current password"
                    className="h-11 w-full rounded-md border border-input bg-background px-3.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-pw" className="text-xs font-semibold text-foreground">
                  New Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="new-pw"
                    type={showNewPw ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="h-11 w-full rounded-md border border-input bg-background px-3.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-pw" className="text-xs font-semibold text-foreground">
                  Confirm New Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm-pw"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Repeat new password"
                    className="h-11 w-full rounded-md border border-input bg-background px-3.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 px-3.5 py-2.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                You will be signed out of all other sessions after changing your password.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleUpdatePassword} className="h-10 px-5 text-sm font-medium cursor-pointer">
                <Key className="mr-2 h-3.5 w-3.5" />
                Update Password
              </Button>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-xl font-bold tracking-tight">Notification Preferences</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose what events notify you and through which channels.
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Event Alerts
              </p>
              {[
                { key: "orderUpdates" as const, label: "Order updates", desc: "New orders, status changes, and cancellations" },
                { key: "stockAlerts" as const, label: "Stock alerts", desc: "Low inventory and out-of-stock warnings" },
                { key: "securityAlerts" as const, label: "Security alerts", desc: "Login attempts and suspicious account activity" },
                { key: "marketingReports" as const, label: "Marketing reports", desc: "Promotion performance and campaign summaries" },
                { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of key metrics every Monday morning" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-md px-4 py-3.5 hover:bg-muted/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[key]}
                    onCheckedChange={() => toggle(key)}
                    className="cursor-pointer shrink-0"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border/60 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Delivery Channels
              </p>
              {[
                { key: "emailNotifs" as const, label: "Email notifications", desc: `Sent to ${PROFILE.email}` },
                { key: "browserNotifs" as const, label: "Browser push notifications", desc: "In-browser alerts while you're signed in" },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-md px-4 py-3.5 hover:bg-muted/30 transition-colors border border-transparent hover:border-border/60"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifPrefs[key]}
                    onCheckedChange={() => toggle(key)}
                    className="cursor-pointer shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
