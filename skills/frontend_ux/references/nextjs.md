# Next.js

Quick-reference for idiomatic Next.js App Router: server/client components, data fetching, and rendering modes. Use only the section relevant to the code in front of you.

## App Router

- The App Router (`app/` directory) uses filesystem routing: `app/route/page.tsx` is a route; `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` are route segment files.
- `page.tsx` exports the default component for a URL; `layout.tsx` wraps children and persists across navigations (don't put `use client` state you want preserved in a layout that changes).
- Dynamic segments use `[slug]` folders; access via `params` in the page/`generateStaticParams`.
- Route handlers live in `route.ts` files (GET/POST/…) under a segment and are the equivalent of API routes.
- `middleware.ts` at the app root runs before routing for auth/redirects.

## Server vs Client Components

- Server Components (default, no directive) run on the server: direct DB access, no state, no browser APIs. They reduce JS shipped to the client.
- Client Components start with `"use client"`: interactive (hooks, event handlers, `useState`). They are still pre-rendered on the server but hydrated.
- Rule of thumb: default to server; push interactivity down to small client leaves. Pass serializable props only from server to client.
- A client component cannot import a server component; compose by passing server-rendered children as props.

## Data Fetching

- Server Components can `await fetch()` directly or call the database/ORM inline; the result is rendered server-side.
- Cache/revalidate: `fetch(url, { cache: 'force-cache' | 'no-store' })` and `{ next: { revalidate: 60 } }` for ISR-style time-based invalidation.
- `generateStaticParams` with `dynamicParams` controls static generation of dynamic routes.
- Client-side data fetching: use the existing data layer (react-query/SWR) if present; otherwise `useEffect` + state with loading/error handling.
- Never fetch the same data twice unnecessarily; prefer server-side fetch and pass the result down.

## Rendering Modes

- Static (SSG): output at build time — fast, cacheable. Default for pages without dynamic data.
- Dynamic (SSR): rendered per request when the page uses `cookies()`, `headers()`, searchParams, or opts into `export const dynamic = 'force-dynamic'`.
- Streaming: `loading.tsx` + `Suspense` stream shell before slow async children finish; place `<Suspense>` around the slow parts.
- ISR: static with `revalidate` — serve cached HTML, regenerate in the background.

## Routing & Navigation

- Link between pages with the built-in `Link` component (`<Link href="/about">`) — never a plain `<a>` for internal navigation.
- Read dynamic data client-side with `usePathname`, `useSearchParams`, `useRouter` from `next/navigation` (all require client components).
- Handle `searchParams` in server pages: the prop is a Promise in Next 15+ — await it before use.
- Error boundaries: `error.tsx` (client) catches errors in a segment; `not-found.tsx` for 404s; `global-error.tsx` only for root.

## Caching & Revalidation

- Understand the default fetch cache; be explicit with `cache`/`next.revalidate` rather than relying on implicit behavior.
- Revalidate on demand with `revalidatePath(path)` / `revalidateTag(tag)` (in route handlers or server actions) after mutations.
- Tag responses with `{ next: { tags: [...] } }` so targeted invalidation works.
- `redirect()` and `notFound()` throw and should be called outside try/catch in server actions/pages.

## Images & Fonts

- Use `next/image` for automatic optimization, lazy loading, and correct `sizes`; set explicit `width`/`height` to avoid layout shift.
- Use `next/font` for self-hosted, zero-layout-shift fonts; match the repo's existing setup.
