# UI Design System & Architecture Rules

This repository enforces strict design rules across all subprojects (`admin/`, `client/`).

## 1. Full-Width Constraint Policy (STRICT: ZERO MAX-W)
- NEVER use `max-w-*` (`max-w-7xl`, `max-w-6xl`, etc.) on pages, main containers, dashboard wrappers, headers, or tables.
- All layouts must span 100% full width (`w-full`) edge-to-edge.

## 2. Generous Spacing & Padding
- Navbar / Header: `h-18 px-8 md:px-12 w-full`
- Main Page Content: `px-8 md:px-12 py-8 md:py-10 w-full space-y-8`
- Cards & Toolbars: `p-6` or `p-6 md:p-8`
- Table Cells & Headers: `py-4.5 px-6` (Never reduce to tiny 8px padding!)
- Buttons: Minimum `h-10 px-4` or `h-11 px-5`

## 3. Typography & Legibility Scaling
- Base HTML font size is enlarged to 18px (`html { font-size: 18px; }`).
- Semantic contrast tokens only: `text-foreground` and `text-muted-foreground`.

## 4. Balanced Borders & Radius
- No harsh heavy black borders; no flat zero-border unstyled look.
- Hairline subtle borders: `border border-border/80`.
- Modern 6px–8px radius: `rounded-md` or `rounded-lg`.
- Soft micro-shadows: `shadow-xs`.

## 5. Theme Tokens (Dark & Light Mode)
- Powered by `next-themes` with `@custom-variant dark (&:is(.dark, .dark *));`.
- NEVER hardcode hex colors (`#fff`, `#000`) or raw `bg-white` / `bg-black`.
- ALWAYS use semantic CSS theme variables (`bg-background`, `text-foreground`, `border-border`, etc.).

## 6. Tactile Micro-Interactions
- ALWAYS include `cursor-pointer` on clickable elements.
- Active feedback: `active:scale-[0.98] transition-all duration-200`.

## 7. Mandatory Centralized Components
- Table: `CentralTable` from `@/components/ui/central-table`
- Metric Cards: `KpiCard` & `KpiGrid` from `@/components/ui/kpi-card`
- Select/Dropdown: `SearchableDropbox` from `@/components/ui/searchable-dropbox`
- Theme Switcher: `ThemeToggle` from `@/components/theme-toggle`
