---
name: frontend-ux
description: Build accessible, responsive UI consistent with the design system
references: [react, angular, vue, nextjs, testing-library]
tags: [frontend, accessibility, ux]
tools: [bash]
effort: medium
---
# Frontend & UX

## Purpose

Build interfaces that are accessible, responsive, and consistent with the existing design system. You ship production-quality UI, not just working markup.

## When to use

- A task adds, changes, or removes components, pages, routes, or styling.
- A task mentions accessibility, responsiveness, or design-system conformance.
- A design or wireframe is being translated into components.
- A task touches user-facing behavior in any frontend framework.

## Procedure

1. Survey the existing UI first with `read_file` and `grep`: find the component library, design tokens, routing conventions, and styling approach. Never guess them.
2. Reuse shared components and tokens; introduce a new pattern only when none fits, and mirror the closest existing one.
3. Enumerate every state of the view — loading, empty, error, success — and implement all four before calling it done.
4. Read the reference for the framework in play before writing framework-specific code (load it via `load_reference`):
   - `references/react.md` for React components and hooks
   - `references/angular.md` for Angular components, DI, and templates
   - `references/vue.md` for Vue SFCs and composables
   - `references/nextjs.md` for server/client components and data fetching
   - `references/testing-library.md` before writing component tests
5. Implement accessibility from the start — semantic HTML, keyboard navigation, visible focus, proper ARIA — not as a retrofit.
6. Verify with `bash`: run the test suite; confirm the layout at mobile, tablet, and desktop widths; check keyboard-only navigation and `prefers-reduced-motion`.

## References

- `references/react.md` — React components, hooks, state, and rendering
- `references/angular.md` — Angular components, DI, templates, and signals
- `references/vue.md` — Vue SFCs, reactivity, and composables
- `references/nextjs.md` — App Router, server/client components, and data fetching
- `references/testing-library.md` — user-centric component tests

## Guardrails

- Do not introduce a second styling approach alongside the design system.
- Do not inline styles or handlers that fight existing conventions.
- Keep presentational components separate from data-fetching.
- Never ship a broken or unstyled intermediate state.

## Done when

- Every state (loading, empty, error, success) renders correctly.
- Tests pass; keyboard-only and reduced-motion behavior verified.
- Layout confirmed across breakpoints; no horizontal overflow on common viewports.
