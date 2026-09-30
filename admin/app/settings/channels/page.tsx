"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Waypoints, Plus, RotateCcw } from "lucide-react";
import { getChannels, getWarehouses, type ChannelRow } from "@/lib/data/settings";
import { useToast } from "@/components/app-feedback";

const CHANNEL_COLUMNS: CentralTableColumn<ChannelRow>[] = [
  {
    accessorKey: "name",
    header: "Channel",
    sortable: true,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Waypoints className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">/{row.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: "currency",
    header: "Currency",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold">{value}</Badge>,
  },
  {
    accessorKey: "warehouse",
    header: "Default Warehouse",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "publishedProducts",
    header: "Published",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="secondary" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
  {
    accessorKey: "active",
    header: "Status",
    sortable: true,
    align: "center",
    cell: ({ value }) =>
      value ? <Badge variant="default" className="text-xs font-semibold">Active</Badge> : <span className="text-xs text-muted-foreground/60 italic">Disabled</span>,
  },
];

export default function SettingsChannelsPage() {
  const appToast = useToast();
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [whOptions, setWhOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let alive = true;
    getChannels().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    getWarehouses().then((w) => {
      if (alive) setWhOptions(w.filter((x) => x.active).map((x) => ({ value: x.name, label: x.name })));
    });
    return () => {
      alive = false;
    };
  }, []);



  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter((c) => c.name.toLowerCase().includes(effectiveQuery) || c.slug.includes(effectiveQuery));
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sales Channels</h1>
          <p className="text-sm text-muted-foreground">Storefronts and marketplaces — currency and warehouse per channel.</p>
        </div>
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/settings/channels/new">
            <Plus className="mr-2 h-4 w-4" /> Add Channel
          </Link>
        </Button>
      </div>

      <CentralTable
        data={filteredRows}
        columns={CHANNEL_COLUMNS}
        loading={loading}
        loadingRows={5}
        searchable
        searchPlaceholder="Search channel..."
        title="Channels"
        description={`${filteredRows.length} of ${rows.length} channels`}
        pagination={false}
        emptyAction={
          effectiveQuery.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSearchTableQuery("")} className="cursor-pointer text-xs font-semibold gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Clear Search
            </Button>
          )
        }
      />

    </>
  );
}
