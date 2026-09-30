"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";
import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";
import { useAdminLayout } from "@/components/admin-shell";
import { FolderTree, Layers, Eye, RotateCcw } from "lucide-react";
import { getCategories, type CategoryNode } from "@/lib/data/catalog";
import { CreateFlow } from "@/components/ui/create-flow";

const CATEGORY_COLUMNS: CentralTableColumn<CategoryNode>[] = [
  {
    accessorKey: "name",
    header: "Category",
    sortable: true,
    cell: ({ value }) => (
      <div className="flex items-center gap-2 min-w-0">
        <FolderTree className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-semibold text-sm text-foreground truncate">{value}</span>
      </div>
    ),
  },
  {
    accessorKey: "parent",
    header: "Parent",
    sortable: true,
    cell: ({ value }) => (
      <span className="text-sm text-muted-foreground">{value}</span>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    sortable: true,
    align: "center",
    cell: ({ value }) => (
      <Badge variant="outline" className="text-xs font-semibold tabular-nums">
        {value}
      </Badge>
    ),
  },
  {
    accessorKey: "showInMenu",
    header: "In Menu",
    sortable: true,
    align: "center",
    cell: ({ value }) =>
      value ? (
        <Badge variant="default" className="text-xs font-semibold gap-1">
          <Eye className="h-3 w-3" /> Visible
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground/60 italic">Hidden</span>
      ),
  },
];

export default function CategoriesPage() {
  const { searchQuery } = useAdminLayout();
  const [rows, setRows] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTableQuery, setSearchTableQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getCategories().then((d) => {
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

  const stats = useMemo(
    () => ({
      total: rows.length,
      roots: rows.filter((r) => r.parent === "—").length,
      products: rows.reduce((s, r) => s + r.products, 0),
      visible: rows.filter((r) => r.showInMenu).length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!effectiveQuery) return rows;
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(effectiveQuery) ||
        c.parent.toLowerCase().includes(effectiveQuery)
    );
  }, [rows, effectiveQuery]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Storefront category tree — organize products into browsable menu sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateFlow<CategoryNode>
            model="product.category"
            buttonLabel="Add Category"
            drawerTitle="New Category"
            drawerDescription="Add a node to the storefront category tree."
            fields={[
              { key: "name", label: "Category Name", required: true, placeholder: "e.g. Audio" },
              {
                key: "parent",
                label: "Parent Category",
                type: "select",
                options: [{ value: "", label: "— Top level —" }, ...rows.map((c) => ({ value: c.name, label: c.name }))],
                helper: "Leave empty to create a top-level category.",
              },
              { key: "showInMenu", label: "Show in Storefront Menu", type: "switch", defaultChecked: true },
            ]}
            validate={(v) => (rows.some((c) => c.name.toLowerCase() === v.name.trim().toLowerCase()) ? "That category name already exists." : null)}
            build={(v) => ({
              id: `CAT-${Date.now().toString(36)}`,
              name: v.name.trim(),
              parent: v.parent || "—",
              products: 0,
              showInMenu: v.showInMenu === "true",
            })}
            onCreated={(row) => setRows((prev) => [...prev, row])}
            successMessage="Category created"
          />
        </div>
      </div>

      <KpiGrid columns={4}>
        <KpiCard title="Total Categories" value={String(stats.total)} icon={FolderTree} tone="blue" />
        <KpiCard title="Root Categories" value={String(stats.roots)} icon={Layers} tone="violet" tooltip="Top-level categories in the menu" />
        <KpiCard title="Products Mapped" value={String(stats.products)} icon={Layers} tone="emerald" tooltip="Products assigned to a category" />
        <KpiCard title="Visible in Menu" value={String(stats.visible)} icon={Eye} tone="amber" tooltip="Categories shown in the storefront" />
      </KpiGrid>

      <CentralTable
        data={filteredRows}
        columns={CATEGORY_COLUMNS}
        loading={loading}
        loadingRows={6}
        searchable
        searchPlaceholder="Search category or parent..."
        title="Category Tree"
        description={`${filteredRows.length} of ${rows.length} categories`}
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
