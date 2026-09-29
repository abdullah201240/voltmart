"use client";

import React, { useState, useMemo, ReactNode } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Filter,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export interface CentralTableColumn<TData> {
  /** Unique column identifier (defaults to accessorKey if not provided) */
  id?: string;
  /** Header label or custom header React node */
  header: string | ReactNode;
  /** Direct key of TData to read the value from */
  accessorKey?: keyof TData;
  /** Custom extractor function to get value from row */
  accessorFn?: (row: TData) => any;
  /** Custom cell renderer receiving the row, extracted value, and row index */
  cell?: (info: { row: TData; value: any; index: number }) => ReactNode;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Alignment of header and cell contents */
  align?: "left" | "center" | "right";
  /** Custom CSS classes for data cells */
  className?: string;
  /** Custom CSS classes for header cell */
  headerClassName?: string;
  /** Specific width (e.g., "120px", "20%") */
  width?: string;
}

export interface CentralTableProps<TData> {
  /** Array of row data objects */
  data: TData[];
  /** Array of column configurations */
  columns: CentralTableColumn<TData>[];
  /** Unique key extractor for each row (defaults to row.id or row._id or index) */
  keyExtractor?: (row: TData, index: number) => string | number;
  /** Table title displayed in top toolbar */
  title?: string | ReactNode;
  /** Subtitle or description text */
  description?: string | ReactNode;
  /** Action buttons rendered on top right of toolbar */
  actions?: ReactNode;
  /** Enable global search filter input */
  searchable?: boolean;
  /** Custom placeholder for search input */
  searchPlaceholder?: string;
  /** Custom search filter predicate */
  searchFilter?: (row: TData, query: string) => boolean;
  /** Controlled search query */
  searchQuery?: string;
  /** Search query change handler */
  onSearchQueryChange?: (query: string) => void;
  /** Custom filter components rendered directly inside the table toolbar */
  filters?: ReactNode;
  /** Number of active filters applied (displays badge on filter toggle) */
  activeFiltersCount?: number;
  /** Reset / Clear all filters callback */
  onClearFilters?: () => void;
  /** Whether the integrated filter panel starts expanded (default: true) */
  defaultFiltersOpen?: boolean;
  /** Initial or default column sort */
  defaultSort?: { key: string; direction: "asc" | "desc" };
  /** Enable row selection checkboxes */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: (string | number)[];
  /** Selection change callback */
  onSelectionChange?: (selectedKeys: (string | number)[], selectedRows: TData[]) => void;
  /** Actions rendered when one or more rows are selected */
  selectedActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode;
  /** Enable pagination */
  pagination?: boolean;
  /** Rows displayed per page (default: 10) */
  pageSize?: number;
  /** Page size options (e.g., [5, 10, 20, 50]) */
  pageSizeOptions?: number[];
  /** Show loading skeleton state */
  loading?: boolean;
  /** Number of skeleton rows to display while loading */
  loadingRows?: number;
  /** Custom message when data is empty */
  emptyMessage?: string | ReactNode;
  /** Custom empty state title */
  emptyTitle?: string;
  /** Optional action button on empty state (e.g., "Reset Filters") */
  emptyAction?: ReactNode;
  /** Row click callback */
  onRowClick?: (row: TData, index: number) => void;
  /** Enable subtle zebra striping on alternating rows */
  striped?: boolean;
  /** Outer container className */
  className?: string;
}

export function CentralTable<TData>({
  data,
  columns,
  keyExtractor,
  title,
  description,
  actions,
  searchable = false,
  searchPlaceholder = "Search in table...",
  searchFilter,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  filters,
  activeFiltersCount,
  onClearFilters,
  defaultFiltersOpen = true,
  defaultSort,
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,
  selectedActions,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  loading = false,
  loadingRows = 5,
  emptyTitle = "No records found",
  emptyMessage = "There are no records matching your current filter criteria.",
  emptyAction,
  onRowClick,
  striped = false,
  className,
}: CentralTableProps<TData>) {
  // Filter drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(defaultFiltersOpen);

  // Search state (supports controlled or uncontrolled)
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const setSearchQuery = (val: string) => {
    if (onSearchQueryChange) onSearchQueryChange(val);
    else setInternalSearchQuery(val);
  };

  // Sort state
  const [sortState, setSortState] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    defaultSort || null
  );

  // Selection state (supports controlled or uncontrolled)
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>([]);
  const selectedKeys = controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Helper to get unique row ID
  const getRowKey = (row: TData, idx: number): string | number => {
    if (keyExtractor) return keyExtractor(row, idx);
    const r = row as any;
    if (r?.id !== undefined) return r.id;
    if (r?._id !== undefined) return r._id;
    return idx;
  };

  // Helper to extract cell value
  const getCellValue = (row: TData, col: CentralTableColumn<TData>) => {
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return (row as any)[col.accessorKey];
    return null;
  };

  // 1. Filtered Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    if (searchFilter) {
      return data.filter((row) => searchFilter(row, searchQuery));
    }

    const query = searchQuery.toLowerCase().trim();
    return data.filter((row) => {
      return columns.some((col) => {
        const val = getCellValue(row, col);
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFilter, columns]);

  // 2. Sorted Data
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;

    const targetColumn = columns.find(
      (c) => (c.id || String(c.accessorKey)) === sortState.key
    );
    if (!targetColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = getCellValue(a, targetColumn);
      const valB = getCellValue(b, targetColumn);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns]);

  // 3. Paginated Data
  const totalItems = sortedData.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

  // Auto-correct current page if out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  // Selection handlers
  const updateSelection = (newSelectedKeys: (string | number)[]) => {
    if (onSelectionChange) {
      const selectedRows = data.filter((row, idx) =>
        newSelectedKeys.includes(getRowKey(row, idx))
      );
      onSelectionChange(newSelectedKeys, selectedRows);
    } else {
      setInternalSelectedKeys(newSelectedKeys);
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) =>
      selectedKeys.includes(getRowKey(row, idx))
    );

  const isSomePageSelected =
    paginatedData.some((row, idx) =>
      selectedKeys.includes(getRowKey(row, idx))
    ) && !isAllPageSelected;

  const toggleSelectAll = () => {
    if (isAllPageSelected) {
      // Deselect all on current page
      const pageKeys = paginatedData.map((row, idx) => getRowKey(row, idx));
      updateSelection(selectedKeys.filter((k) => !pageKeys.includes(k)));
    } else {
      // Select all on current page
      const pageKeys = paginatedData.map((row, idx) => getRowKey(row, idx));
      const combined = Array.from(new Set([...selectedKeys, ...pageKeys]));
      updateSelection(combined);
    }
  };

  const toggleSelectRow = (key: string | number) => {
    if (selectedKeys.includes(key)) {
      updateSelection(selectedKeys.filter((k) => k !== key));
    } else {
      updateSelection([...selectedKeys, key]);
    }
  };

  const handleSort = (column: CentralTableColumn<TData>) => {
    if (!column.sortable) return;
    const colKey = column.id || String(column.accessorKey);
    if (!colKey) return;

    setSortState((prev) => {
      if (!prev || prev.key !== colKey) {
        return { key: colKey, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: colKey, direction: "desc" };
      }
      return null;
    });
  };

  const selectedRowsList = useMemo(() => {
    return data.filter((row, idx) => selectedKeys.includes(getRowKey(row, idx)));
  }, [data, selectedKeys]);

  const hasToolbar = Boolean(
    title ||
      description ||
      searchable ||
      actions ||
      filters ||
      (selectable && selectedKeys.length > 0)
  );

  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border/80 bg-card shadow-xs overflow-hidden transition-all",
        className
      )}
    >
      {/* Table Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col border-b border-border/80 bg-card">
          <div className="flex flex-col gap-4 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Title & Description or Selection Banner */}
            <div className="space-y-1">
              {selectable && selectedKeys.length > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {selectedKeys.length} selected
                  </span>
                  {selectedActions &&
                    selectedActions(selectedRowsList, () => updateSelection([]))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateSelection([])}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear selection
                  </Button>
                </div>
              ) : (
                <>
                  {title && (
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                  )}
                </>
              )}
            </div>

            {/* Right: Search Box, Filter Toggle & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {searchable && (
                <div className="relative w-full sm:w-64 md:w-80">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={searchPlaceholder}
                    className="h-10 w-full rounded-md border border-input/80 bg-muted/30 pl-10 pr-9 text-xs placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Filters Toggle Button */}
              {filters && (
                <Button
                  type="button"
                  variant={isFilterOpen ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="h-10 px-3.5 text-xs font-semibold gap-2 cursor-pointer transition-all shrink-0"
                  aria-expanded={isFilterOpen}
                >
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Filters</span>
                  {activeFiltersCount !== undefined && activeFiltersCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                  {isFilterOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              )}

              {actions && <div className="flex items-center gap-2.5">{actions}</div>}
            </div>
          </div>

          {/* Integrated Filters Section Inside Table */}
          {filters && isFilterOpen && (
            <div className="border-t border-border/70 bg-muted/20 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter Options</span>
                  {activeFiltersCount !== undefined && activeFiltersCount > 0 && (
                    <span className="text-[11px] font-medium text-foreground lowercase">
                      ({activeFiltersCount} active)
                    </span>
                  )}
                </div>
                {onClearFilters && activeFiltersCount !== undefined && activeFiltersCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 px-2.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset filters
                  </Button>
                )}
              </div>
              <div className="w-full">{filters}</div>
            </div>
          )}
        </div>
      )}

      {/* Main Table Scroll Container */}
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm border-collapse">
          {/* Header */}
          <thead className="bg-muted/40 border-b border-border/80">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-4 text-left align-middle">
                  <div className="flex items-center">
                    <Checkbox
                      checked={isAllPageSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all on this page"
                      className="cursor-pointer"
                    />
                  </div>
                </th>
              )}

              {columns.map((column, idx) => {
                const colKey = column.id || String(column.accessorKey) || `col-${idx}`;
                const isSorted = sortState?.key === colKey;
                const sortDirection = isSorted ? sortState.direction : null;

                return (
                  <th
                    key={colKey}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column)}
                    className={cn(
                      "py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none transition-colors",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      column.align === "left" || !column.align ? "text-left" : "",
                      column.sortable &&
                        "cursor-pointer hover:bg-muted/70 hover:text-foreground",
                      column.headerClassName
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        column.align === "right" && "justify-end w-full",
                        column.align === "center" && "justify-center w-full"
                      )}
                    >
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="shrink-0 text-muted-foreground/70">
                          {sortDirection === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-foreground" />
                          ) : sortDirection === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5 text-foreground" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border/60">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: loadingRows }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="border-b border-border/50">
                  {selectable && (
                    <td className="px-6 py-4.5">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`loading-col-${cIdx}`} className="py-4.5 px-6">
                      <Skeleton
                        className={cn(
                          "h-5 rounded",
                          cIdx === 0 ? "w-28" : cIdx === 1 ? "w-44" : "w-20",
                          col.align === "right" && "ml-auto"
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 px-6 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <Inbox className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-foreground">
                        {emptyTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {emptyMessage}
                      </p>
                    </div>
                    {emptyAction && <div className="pt-2">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              // Real data rows
              paginatedData.map((row, rowIdx) => {
                const rowKey = getRowKey(row, rowIdx);
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row, rowIdx)}
                    className={cn(
                      "group border-b border-border/60 transition-colors",
                      striped && rowIdx % 2 === 1 && "bg-muted/20",
                      isSelected && "bg-primary/5 hover:bg-primary/10",
                      !isSelected && "hover:bg-muted/40",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {selectable && (
                      <td
                        className="w-12 px-6 py-4.5 align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(rowKey)}
                          aria-label={`Select row ${rowKey}`}
                          className="cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((column, colIdx) => {
                      const value = getCellValue(row, column);
                      const colKey = column.id || String(column.accessorKey) || `col-${colIdx}`;

                      return (
                        <td
                          key={colKey}
                          className={cn(
                            "py-4.5 px-6 text-sm text-foreground align-middle font-normal whitespace-nowrap",
                            column.align === "right" && "text-right",
                            column.align === "center" && "text-center",
                            column.align === "left" || !column.align ? "text-left" : "",
                            column.className
                          )}
                        >
                          {column.cell
                            ? column.cell({ row, value, index: rowIdx })
                            : value !== null && value !== undefined
                            ? String(value)
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer with spacious enterprise controls */}
      {pagination && !loading && totalItems > 0 && (
        <div className="flex flex-col gap-4 border-t border-border/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between bg-card text-xs text-muted-foreground">
          {/* Left: Row counts & page size selector */}
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="font-semibold text-foreground">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="font-semibold text-foreground">
                {Math.min(currentPage * pageSize, totalItems)}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-foreground">
                {totalItems}
              </strong>{" "}
              entries
            </span>

            {pageSizeOptions.length > 1 && (
              <div className="flex items-center gap-1.5 ml-3">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 rounded-md border border-input/80 bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Page navigation buttons */}
          <div className="flex items-center gap-2">
            <span className="mr-2">
              Page{" "}
              <strong className="font-semibold text-foreground">
                {currentPage}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-foreground">
                {totalPages}
              </strong>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0 cursor-pointer disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0 cursor-pointer disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
