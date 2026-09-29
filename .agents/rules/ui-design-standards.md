# UI Design Standards & Anti-Regression Rules

## 1. Full-Width Constraint Policy
- No `max-w-*` on page layouts.
- Full viewport coverage (`w-full`) across all pages.

## 2. Generous Padding Standards
- Navbar: `px-8 md:px-12`
- Main Page: `px-8 md:px-12 py-8 md:py-10`
- Cards: `p-6` or `p-6 md:p-8`
- Table cells: `py-4.5 px-6`

## 3. Core Central Components
Always reuse the established components:
- `admin/components/ui/central-table.tsx` -> `CentralTable`
- `admin/components/ui/kpi-card.tsx` -> `KpiCard`, `KpiGrid`
- `admin/components/ui/searchable-dropbox.tsx` -> `SearchableDropbox`
- `admin/components/ui/button.tsx` -> `Button`
- `admin/components/theme-toggle.tsx` -> `ThemeToggle`

## 4. Theme & Color Tokens
- Always use CSS variables: `bg-background`, `text-foreground`, `border-border`, etc.
- Support both Light and Dark mode.
