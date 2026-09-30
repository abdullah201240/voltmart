"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { cn } from "@/lib/utils";
import { getCustomerTags, type CustomerTag } from "@/lib/data/customers";
import { CreateFlow } from "@/components/ui/create-flow";

const TAG_COLUMNS: CentralTableColumn<CustomerTag>[] = [
  {
    accessorKey: "name",
    header: "Tag",
    sortable: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("h-3 w-3 rounded-full shrink-0", row.color)} />
        <span className="font-semibold text-sm text-foreground truncate">{row.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "customers",
    header: "Customers",
    sortable: true,
    align: "center",
    cell: ({ value }) => <Badge variant="outline" className="text-xs font-semibold tabular-nums">{value}</Badge>,
  },
];

export default function CustomerTagsPage() {
  const [rows, setRows] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getCustomerTags().then((d) => {
      if (alive) {
        setRows(d);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Customer Tags</h1>
          <p className="text-sm text-muted-foreground">
            Segments and labels used to group customers for targeting and reporting.
          </p>
        </div>
        <CreateFlow<CustomerTag>
          model="customer.tag"
          buttonLabel="Add Tag"
          drawerTitle="New Customer Tag"
          drawerDescription="Create a segment label for grouping customers."
          fields={[
            { key: "name", label: "Tag Name", required: true, placeholder: "e.g. Corporate" },
            {
              key: "color",
              label: "Badge Color",
              type: "select",
              required: true,
              defaultValue: "bg-sky-500",
              options: [
                { value: "bg-violet-500", label: "Violet" },
                { value: "bg-amber-500", label: "Amber" },
                { value: "bg-emerald-500", label: "Emerald" },
                { value: "bg-sky-500", label: "Sky" },
                { value: "bg-rose-500", label: "Rose" },
                { value: "bg-cyan-500", label: "Cyan" },
              ],
            },
          ]}
          validate={(v) => (rows.some((t) => t.name.toLowerCase() === v.name.trim().toLowerCase()) ? "That tag already exists." : null)}
          build={(v) => ({
            id: `T-${Date.now().toString(36)}`,
            name: v.name.trim(),
            color: v.color,
            customers: 0,
          })}
          onCreated={(row) => setRows((prev) => [...prev, row])}
          successMessage="Tag created"
        />
      </div>

      <CentralTable
        data={rows}
        columns={TAG_COLUMNS}
        loading={loading}
        loadingRows={4}
        searchable={false}
        title="Tags"
        description={`${rows.length} tag(s)`}
        emptyAction={null}
      />
    </>
  );
}
