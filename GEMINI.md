# UI Design System & Architecture Rules

This document establishes the mandatory UI rules, layout standards, and component conventions for all AI coding agents (Gemini, Antigravity, Claude, Cursor, Copilot) and human developers.

---

## 1. Layout & Width Rules (STRICT: ZERO MAX-W)
- **NEVER use `max-w-*`** (`max-w-7xl`, `max-w-6xl`, `max-w-5xl`, etc.) on page containers, main content views, dashboard wrappers, headers, or tables.
- All layouts must span **100% full width (`w-full`)** edge-to-edge.
- The UI must look panoramic and spacious on both ultrawide monitors and laptop screens.

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

## 3. Typography & Legibility Scaling
- **Root Scale**: Scaled up to 18px base in `globals.css` (`html { font-size: 18px; }`).
- **Hierarchy**:
  - Page Titles: `text-3xl font-bold tracking-tight`
  - Section Headings: `text-xl font-bold tracking-tight`
  - Card Titles: `text-sm font-semibold text-muted-foreground uppercase tracking-wider`
  - Main Metric Values: `text-3xl font-extrabold tracking-tight`
  - Table Cell Text: `text-sm font-medium` or `font-normal`
  - Helper & Metadata: `text-xs text-muted-foreground`
- **Semantic Contrast**: Always use `text-foreground` and `text-muted-foreground`. Never hardcode raw grays.

---

## 4. Balanced Borders & Radius
- **DO NOT** use thick, harsh black borders (`border-2`, `border-black`, etc.).
- **DO NOT** remove all borders to leave the UI looking unstyled, broken, and flat.
- **DO** use subtle hairline borders: `border border-border/80` (or `border-border/60` for row dividers).
- **DO** use clean, modern 6px to 8px radius (`rounded-md` or `rounded-lg`).
- **DO** use soft micro-shadows (`shadow-xs`).

---

## 5. Theme Support (Dark & Light Mode)
- Dark and light modes are powered by `next-themes` with `@custom-variant dark (&:is(.dark, .dark *));`.
- `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` wraps the entire application.
- **NEVER** hardcode hex colors (`#fff`, `#000`, `#333`) or raw Tailwind classes like `bg-white` or `bg-black`.
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
- **Features**:
  - Responsive grid wrapper: `<KpiGrid columns={3 | 4}>`
  - Focused, uncluttered card structure: Title, primary Metric Value, and Icon.
  - Tones: `emerald`, `blue`, `violet`, `amber`, `rose`, `cyan`, `indigo`, `default`
  - Clean trend indicators: `trend="up" | "down"`, `change="+12.4%"`
  - Variants: `default`, `accent`, `subtle`, `compact`
- **STRICT ANTI-CLUTTER RULE (Zero Extra Bloat)**:
  - **NEVER** add large progress bars (`progress={...}`), progress labels (`progressLabel={...}`), or fake telemetry cards (e.g. "Operational 100%").
  - KPI cards must ALWAYS remain clean, compact, uniform, and simple.
  - Never add bulky secondary footers or bloated telemetry meters that disrupt visual harmony.

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

