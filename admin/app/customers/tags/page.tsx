"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { cn } from "@/lib/utils";
import { getCustomerTags, type CustomerTag } from "@/lib/data/customers";

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
        <Button asChild className="h-11 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all">
          <Link href="/customers/tags/new">
            <Plus className="mr-2 h-4 w-4" /> Add Tag
          </Link>
        </Button>
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
