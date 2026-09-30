# Repository UI & Architecture Guidelines

All developers and AI agents working on this codebase MUST follow these strict rules to prevent UI regressions, ensure consistent aesthetic balance, and maintain architectural integrity.

---

## 1. Layout & Width Rules
- **NEVER use `max-w-*`** (such as `max-w-7xl`, `max-w-6xl`, `max-w-5xl`, etc.) on page containers, main views, dashboard sections, headers, or tables.
- All layouts must span **100% full width (`w-full`)** edge-to-edge.
- Keep the interface spacious and panoramic across both ultrawide monitors and laptop screens.

---

## 2. Spacing & Streamlined Padding Standards
The UI maximizes screen real estate with panoramic, clean spacing:
- **Global Page Layout**: Managed centrally by `AdminShell`. Individual pages (`app/**/page.tsx`) do NOT need manual `<main>` wrappers.
- **Main Content**: `px-2 md:px-4 lg:px-4 py-5 md:py-6 w-full space-y-4` (spacious panoramic layout).
- **Header & Footer**: `px-4 md:px-6 lg:px-8 w-full` (permanently fixed).
- **Sidebar Width**: `w-56` (expanded) / `w-16` (collapsed).
- **Cards & Toolbars**: `p-6` or `p-5 md:p-6`
- **Table Cells & Headers**: `py-4.5 px-6`
- **Buttons**: Minimum `h-10 px-4` or `h-11 px-5` for standard actions; `h-9 px-3` for compact action chips.

---

## 3. Typography & Legibility
- **Root Scale**: Root font size is enlarged to 18px (`html { font-size: 18px; }`).
- **Hierarchy**:
  - Page Titles: `text-3xl font-bold tracking-tight`
  - Section Headings: `text-xl font-bold tracking-tight`
  - Card Titles: `text-sm font-semibold text-muted-foreground uppercase tracking-wider`
  - Main Metric Values: `text-3xl font-extrabold tracking-tight`
  - Table Cell Text: `text-sm font-medium` or `font-normal`
  - Helper & Metadata: `text-xs text-muted-foreground`
- Always use semantic contrast tokens: `text-foreground` and `text-muted-foreground`.

---

## 4. Balanced Borders & Radius
- **DO NOT** use thick, harsh black borders.
- **DO NOT** remove all borders to leave the UI looking unstyled and broken.
- **DO** use subtle hairline borders: `border border-border/80` (or `border-border/60` for row dividers).
- **DO** use clean, modern 6px to 8px radius (`rounded-md` or `rounded-lg`).
- **DO** use soft micro-shadows (`shadow-xs`).

---

## 5. Theme Support (Dark & Light Mode)
- Dark and light modes are powered by `next-themes` with `@custom-variant dark (&:is(.dark, .dark *));`.
- **NEVER** hardcode hex colors (`#fff`, `#000`, `#333`) or raw Tailwind color classes like `bg-white` or `bg-black`.
- **ALWAYS** use semantic CSS theme variables:
  - Backgrounds: `bg-background`, `bg-card`, `bg-muted`, `bg-popover`
  - Foreground text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`
  - Borders: `border-border`, `border-input`
  - Accents: `bg-primary`, `text-primary-foreground`

---

## 6. Tactile Micro-Interactions & Cursors
- **ALWAYS** include `cursor-pointer` on clickable elements: buttons, dropdown triggers, table rows, checkboxes, tabs, and KPI cards.
- **Feedback**: Include active scale micro-interactions (`active:scale-[0.98] transition-all duration-200`).
- **Hover**: Subtle hover transitions (`hover:bg-muted/40`, `hover:border-primary/40`).

---

## 7. Mandatory Centralized Components (USE THESE EVERYWHERE)
Do NOT reinvent custom tables, stat blocks, or dropdowns. Always import and use the central design system components:

### A. Central Table (`CentralTable`)
- **Import**: `import { CentralTable, type CentralTableColumn } from "@/components/ui/central-table";`
- **Features**:
  - Generic typing `<TData>`
  - Sortable column headers with indicator arrows
  - Integrated global search input with clear button
  - Integrated filters tray inside the table with collapse/expand toggle, active count badge, and reset button
  - Row selection checkboxes with "Select All" and bulk action bar
  - Built-in pagination with configurable rows-per-page (5, 10, 20, 50)
  - Animated skeleton loading state (`loading={true}`)
  - Customizable empty state with action buttons
  - Row click handler (`onRowClick`)

### B. Central KPI Card (`KpiCard` & `KpiGrid`)
- **Import**: `import { KpiCard, KpiGrid } from "@/components/ui/kpi-card";`
- **Design Philosophy**: Simple, clean, glanceable metric cards across the entire website.
- **Features**:
  - Responsive grid wrapper: `<KpiGrid columns={3 | 4}>`
  - Focused, uncluttered card structure: Title, primary Metric Value, and Icon.
  - Tones: `emerald`, `blue`, `violet`, `amber`, `rose`, `cyan`, `indigo`, `default`
  - Clean trend indicators: `trend="up" | "down"`, `change="+12.4%"`
  - Variants: `default`, `accent`, `subtle`, `compact`
- **STRICT ANTI-CLUTTER RULE (Zero Extra Bloat across Full Website)**:
  - **NEVER** add large progress bars, progress percentage meters, or fake telemetry cards (e.g., "Operational 100%", health meters, or status bars) into KPI grids.
  - KPI cards must ALWAYS remain clean, compact, uniform, and simple: just Title, Value, Icon, and optional Trend.
  - Never add bulky secondary footers, progress tracks, or heavy auxiliary data that distract from primary metrics. All KPI cards across the entire website must follow this uniform simple design.

### C. Searchable Dropbox (`SearchableDropbox`)
- **Import**: `import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";`
- **Features**:
  - Auto-focused instant search filtering
  - Badge chips, category icons, sub-descriptions
  - Active checkmarks and one-click clear button
  - Full keyboard navigation and Base UI accessibility

### D. Theme Toggle (`ThemeToggle`)
- **Import**: `import { ThemeToggle } from "@/components/theme-toggle";`
- **Features**: Seamless switching between Light, Dark, and System theme.

### E. Central Form (`CentralForm`)
- **Import**:
  ```tsx
  import {
    CentralForm,
    CentralFormSection,
    CentralFormField,
    CentralFormInput,
    CentralFormTextarea,
    CentralFormSwitch,
    CentralFormDropzone,
    CentralFormActions,
    CentralFormDrawer,
  } from "@/components/ui/central-form";
  ```
- **Features**:
  - Full-width panoramic responsive layouts with zero `max-w-*`
  - Flexible multi-column sections (`columns={1 | 2 | 3 | 4}`) with icons and subtitles
  - Standardized field wrapper with labels, required asterisks, helper text, and validation errors
  - Enhanced inputs with prefix/suffix text & icons (currencies, units, passwords)
  - Integrated switch toggle cards, searchable selects, and media drag-and-drop dropzones
  - Standardized action bars with loading states, dirty indicators, and discard handlers
  - Slide-over drawer wrapper (`CentralFormDrawer`) for seamless creation flows from any view

