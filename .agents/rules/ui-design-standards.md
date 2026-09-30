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

## 5. Mandatory Create Flows (NO DEAD "ADD / CREATE" BUTTONS)
Every table / list view that supports record creation MUST render a working create affordance — never a `<Button>Add X</Button>` with no `onClick`.
- Use the shared wrapper: `import { CreateFlow } from "@/components/ui/create-flow";`
- Signature: `<CreateFlow<RowType> model="res.model" buttonLabel="Add Brand" drawerTitle="New Brand" fields={[...]} build={(v)=>({...v, id:`X-${Date.now()}`})} onCreated={(row)=>setRows(prev=>[row,...prev])} />`
- `CreateFlow` already handles: Plus button, drawer open/close, `addRecord(model, row)` persistence, success toast, and validation error string.
- Pre-existing `RecordCreateDrawer` call sites MUST call `useToast().success(...)` immediately after `addRecord(...)` before `return null;`.

## 6. Mandatory Confirmation On Destructive / Important Actions
Every action that mutates state irreversibly or has operational impact MUST `await confirm(...)` first:
- Import: `import { useConfirm, useToast } from "@/components/app-feedback";`
- Usage: `const confirm = useConfirm(); const appToast = useToast();`
- Then in the handler:
  ```tsx
  const allowed = await confirm({
    title: `Cancel ${row.id}?`,
    description: "Optional context line.",
    tone: "destructive",           // use "destructive" for delete/cancel/archive/reset/sign-out
    confirmLabel: "Cancel Order",   // verb-first, explicit — never "OK"
  });
  if (!allowed) return;
  // ... actual mutation ...
  ```
- Required for: delete, archive, cancel, void, unpost, reset-to-base, bulk state transitions, sign-out, deactivating a live record, clearing all notifications, password changes.
- NOT required for: closing a drawer, discarding an untouched form, purely navigational buttons.

## 7. Mandatory Success Toast On Every Completed Mutation
Any handler that changes persisted state MUST fire a toast before returning control:
- `appToast.success(title, description?)` on success.
- `appToast.error(title, description)` on validation / workflow failure.
- `appToast.info(title, description)` on non-mutating helpful actions (e.g. demo stubs).
- Local `{feedback, setFeedback}` state and inline toast JSX at the bottom of a page are BANNED — use the global `AppFeedbackProvider` mounted in `admin-shell.tsx`.
- Never use `alert()`, `console.log()`, or silent success as user feedback.

