"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UserPlus,
  Shield,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { USER, type StaffRow } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

const ROLES: { id: StaffRow["role"]; title: string; desc: string; badge: string }[] = [
  {
    id: "Admin",
    title: "Administrator",
    desc: "Full permissions across orders, catalogs, finance, integrations and ERP settings.",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    id: "Manager",
    title: "Store Operations Manager",
    desc: "Manage products, stock adjustments, purchase orders and customer support queues.",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "Staff",
    title: "Fulfillment & Dispatch Staff",
    desc: "Process pick, pack, Steadfast/Pathao courier handovers and stock counts.",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "Merchant",
    title: "Marketplace Vendor Merchant",
    desc: "Self-service seller portal for managing merchant-assigned products and payouts.",
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
];

export default function NewStaffPage() {
  const router = useRouter();
  const appToast = useToast();

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 17");
  const [role, setRole] = useState<StaffRow["role"]>("Manager");
  const [department, setDepartment] = useState("Operations & Logistics");
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [active, setActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      appToast.error("Validation error", "Team member name is required.");
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      appToast.error("Validation error", "Please provide a valid work email address.");
      return;
    }

    setSaving(true);
    try {
      const generatedId = `U-${Date.now().toString(36).toUpperCase()}`;
      const newStaff: StaffRow = {
        id: generatedId,
        name: name.trim(),
        email: cleanEmail,
        role,
        channels: 0,
        active,
        lastActive: "Just now",
      };

      addRecord(USER, newStaff as unknown as Record<string, unknown>);
      appToast.success("Team member invited", `${newStaff.name} has been granted ${role} access.`);
      router.push("/settings/staff");
    } catch {
      appToast.error("Failed to add member", "Could not complete user registration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="space-y-1">
          <Link
            href="/settings/staff"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Staff & Roles
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Invite Team Member</h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/10 text-primary border-primary/20">
              Access Control
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Onboard staff members, assign security roles, and enforce channel-level data segregation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/staff")}
            className="h-11 px-5 cursor-pointer"
          >
            Discard
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="h-11 px-6 font-semibold cursor-pointer active:scale-[0.98] transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {saving ? "Granting Access..." : "Send Invitation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">User Identity</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Legal Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hasan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Work Email Address <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="tanvir@voltmart.com.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-9 pr-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department / Team</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Warehouse Dispatch, Procurement"
                  className="w-full h-11 px-3.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Role & Permissions Selector */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Security Role &amp; Access Level</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "p-4 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between gap-3",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border/80 hover:bg-muted/40"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-foreground">{r.title}</span>
                        <Badge variant="outline" className={cn("text-[10px] font-semibold", r.badge)}>
                          {r.id}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Selected Role</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Click to select</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold tracking-tight">Activation & Delivery</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendInviteEmail}
                  onChange={(e) => setSendInviteEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <div>
                  <span className="font-medium">Send Welcome Email</span>
                  <p className="text-xs text-muted-foreground">Deliver account activation link with password setup instructions.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-sm text-foreground cursor-pointer pt-2 border-t border-border/60">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <div>
                  <span className="font-medium">Immediate Active Status</span>
                  <p className="text-xs text-muted-foreground">Permit dashboard login immediately once credentials are set.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-md bg-muted/40 border border-border/80 p-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Two-Factor Authentication (2FA)</span>
            </div>
            <p>
              Admins and Managers will be prompted to enroll an authenticator app (TOTP) upon their first dashboard sign-in.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
