"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { UserPlus, RotateCcw } from "lucide-react";
import { getStaff, USER, type StaffRow } from "@/lib/data/settings";
import { addRecord } from "@/lib/data/ops";
import { RecordCreateDrawer, type CreateFieldDef } from "@/components/ui/record-create-drawer";
import { useToast } from "@/components/app-feedback";

const CREATE_FIELDS: CreateFieldDef[] = [
  { key: "name", label: "Full Name", required: true, placeholder: "e.g. Nadia Islam" },
  { key: "email", label: "Email", required: true, placeholder: "name@voltmart.example", helper: "An invite email is simulated; no real mail is sent." },
  {
    key: "role",
    label: "Role",
    type: "select",
    required: true,
    defaultValue: "Staff",
    options: ["Owner", "Admin", "Manager", "Staff", "Merchant"].map((r) => ({ value: r, label: r })),
  },
];

const ROLE_CLASS: Record<StaffRow["role"], "default" | "secondary" | "outline"> = {
  Owner: "default",
  Admin: "default",
  Manager: "secondary",
  Staff: "outline",
  Merchant: "outline",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const STAFF_COLUMNS: CentralTableColumn<StaffRow>[] = [
  {
    accessorKey: "name",
    header: "Member",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs font-semibold bg-muted text-foreground">{initials(row.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-foreground truncate">{row.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    sortable: true,
    cell: ({ value }) => <Badge variant={ROLE_CLASS[value as StaffRow["role"]]} className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "channels",
    header: "Channels",
    align: "center",
    cell: ({ value }) => <span className="font-mono text-sm tabular-nums text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "active",
    header: "Status",
    align: "center",
    cell: ({ value }) =>
      value ? <Badge variant="default" className="text-xs font-semibold">Active</Badge> : <span className="text-xs text-muted-foreground/60 italic">Deactivated</span>,
  },
];

export default function SettingsStaffPage() {
  const appToast = useToast();
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    getStaff().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const createStaff = (v: Record<string, string>) => {
    const email = v.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (rows.some((s) => s.email.toLowerCase() === email)) return "That email is already on the team.";
    const row: StaffRow = {
      id: `U-${Date.now().toString(36)}`,
      name: v.name,
      email,
      role: v.role as StaffRow["role"],
      channels: 0,
      active: true,
      lastActive: "Just now",
    };
    addRecord(USER, row as unknown as Record<string, unknown>);
    setRows((prev) => [row, ...prev]);
    appToast.success("Team member created", `\u201C${row.name}\u201D is now available for admin console.`);
    return null;
  };

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (s) => s.name.toLowerCase().includes(effectiveQuery) || s.email.toLowerCase().includes(effectiveQuery) || s.role.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Staff &amp; Roles</h1>
          <p className="text-sm text-muted-foreground">Team members, their roles and channel access.</p>
        </div>
        <Button
          className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      <CentralTable
        data={filteredRows}
        columns={STAFF_COLUMNS}
        loading={loading}
        loadingRows={5}
        searchable
        searchPlaceholder="Search name, email or role..."
        title="Team"
        description={`${filteredRows.length} of ${rows.length} members`}
        pagination={false}
        emptyAction={
          effectiveQuery.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSearchTableQuery("")} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Clear Search
            </Button>
          )
        }
      />

      <RecordCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Invite Team Member"
        description="Add a user and assign their role."
        submitLabel="Send Invite"
        fields={CREATE_FIELDS}
        onSubmit={createStaff}
      />
    </>
  );
}
