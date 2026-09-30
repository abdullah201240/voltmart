"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { Sparkles, CheckCircle2, CalendarClock, RotateCcw } from "lucide-react";
import { getPromotions, promotionStats, type PromotionRow } from "@/lib/data/discounts";
import { CreateFlow } from "@/components/ui/create-flow";

const STATUS_CLASS: Record<PromotionRow["status"], "default" | "secondary" | "outline"> = {
  Active: "default",
  Scheduled: "secondary",
  Expired: "outline",
};

const PROMOTION_COLUMNS: CentralTableColumn<PromotionRow>[] = [
  {
    accessorKey: "name",
    header: "Promotion",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{value}</span>
      </div>
    ),
  },
  {
    accessorKey: "rule",
    header: "Trigger Rule",
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "channel",
    header: "Channel",
    sortable: true,
    cell: ({ value }) => <span className="text-sm text-muted-foreground">{value}</span>,
  },
  {
    accessorKey: "discount",
    header: "Reward",
    align: "right",
    cell: ({ value }) => <span className="font-mono text-sm font-bold text-foreground">{value}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    sortable: true,
    cell: ({ value }) => <Badge variant={STATUS_CLASS[value as PromotionRow["status"]]} className="text-xs font-semibold px-3 py-1">{value}</Badge>,
  },
];

export default function PromotionsPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getPromotions().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const effectiveQuery = (searchTableQuery || searchQuery).trim().toLowerCase();
  const stats = useMemo(() => promotionStats(rows), [rows]);

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(effectiveQuery) ||
        p.rule.toLowerCase().includes(effectiveQuery) ||
        p.channel.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Rule-based automatic discounts applied at checkout — no code required.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateFlow<PromotionRow>
            model="promotion.program"
            buttonLabel="Create Promotion"
            drawerTitle="New Promotion"
            drawerDescription="Define an automatic checkout discount rule."
            submitLabel="Create Promotion"
            fields={[
              { key: "name", label: "Promotion Name", required: true, placeholder: "e.g. Weekend Flash Sale" },
              { key: "rule", label: "Trigger Rule", required: true, colSpan: 2, placeholder: "e.g. Min. order ৳5,000 on Electronics" },
              {
                key: "channel",
                label: "Channel",
                type: "select",
                required: true,
                defaultValue: "Default Channel",
                options: [
                  { value: "Default Channel", label: "Default Channel" },
                  { value: "Dhaka Store", label: "Dhaka Store" },
                  { value: "Online Marketplace", label: "Online Marketplace" },
                ],
              },
              { key: "discount", label: "Reward", required: true, placeholder: "e.g. 10% off" },
            ]}
            validate={(v) => (rows.some((p) => p.name.toLowerCase() === v.name.trim().toLowerCase()) ? "That promotion already exists." : null)}
            build={(v) => ({
              id: `PRO-${Date.now().toString(36)}`,
              name: v.name.trim(),
              rule: v.rule.trim(),
              channel: v.channel,
              discount: v.discount.trim(),
              status: "Active",
            })}
            onCreated={(row) => setRows((prev) => [row, ...prev])}
            successMessage="Promotion created"
          />
        </div>
      </div>

      <KpiGrid columns={3}>
        <KpiCard title="Promotions" value={String(stats.total)} icon={Sparkles} tone="blue" />
        <KpiCard title="Active" value={String(stats.active)} icon={CheckCircle2} tone="emerald" badge="LIVE" />
        <KpiCard title="Scheduled" value={String(stats.scheduled)} icon={CalendarClock} tone="amber" tooltip="Set to start later" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={PROMOTION_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search promotion, rule or channel..."
        title="Promotions"
        description={`${filteredRows.length} of ${rows.length} promotions`}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
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
