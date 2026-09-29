<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI Framework Rule

All UI in this project must use Storefront UI (`@storefront-ui/react`) exclusively — no other UI libraries or component kits (shadcn, MUI, Chakra, Radix, Headless UI, etc.). If a component doesn't exist in SFUI, compose it from existing `Sf*` base components and Tailwind utilities. Styling goes through the SFUI Tailwind v4 plugin already wired in `app/globals.css`; do not add a tailwind.config file or install another design system.
