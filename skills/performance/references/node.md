# Node.js

Quick-reference for idiomatic Node: modules, async, streams, and error handling. Use only the section relevant to the code in front of you.

## Modules

- ESM (`import`/`export`) is the default and preferred for new code; CommonJS (`require`/`module.exports`) only where the repo or a dependency requires it.
- Use named exports over default exports for tree-shaking and consistent imports; a single `export default` for the primary value if the style calls for it.
- Import `node:` prefixed core modules explicitly (`import { readFile } from 'node:fs/promises'`) — it signals built-ins and avoids shadowing by npm packages.
- Keep modules small and single-purpose; a file that needs `/* eslint-disable */` at the top is a smell.

## Async & The Event Loop

- Always use the promise/async forms of I/O (`fs/promises`, `node:stream/promises`) — never blocking sync calls in a server request path.
- Never block the event loop: avoid heavy synchronous CPU work and long loops in hot paths; offload to a worker thread or child process when needed.
- Understand microtasks vs macrotasks: `await` inside loops, `Promise.all` for parallel independent work, `Promise.allSettled` when failures are acceptable.
- Backpressure: `for await...of` on streams, or pipe with `stream.pipeline` — buffering everything into memory at once defeats streaming.
- Use `AbortController`/`AbortSignal` to cancel long-running or network work; surface cancellations as handled errors, not crashes.

## Error Handling

- Async errors surface via rejected promises: `try/catch` around `await`, `.catch` on promise chains — never leave unhandled rejections.
- Wrap low-level errors with context (`throw new Error('read config: ' + err.message)`) preserving the cause via `{ cause: err }`.
- Distinguish expected failures (validation, 404) from unexpected bugs; expected failures are normal control flow.
- Express/Fastify: send errors through the framework's error handler; never `console.log` a stack and continue.
- Fail fast on startup: invalid config or unreachable dependency should abort with a clear message, not degrade silently.

## Streams

- Read/write with async iteration or `pipeline()` — `pipeline` propagates errors and handles cleanup for you.
- `stream.pipeline(src, transform, dest, cb)` or the promise form; never hand-rolled `.pipe().on('error', ...)` chains that swallow errors.
- Respect backpressure when writing: await drain or let `pipeline` manage it.
- Transform streams for line-by-line or chunk transformations; watch memory with high-water marks for huge inputs.

## Concurrency & Clusters

- Node is single-threaded; use `worker_threads` for CPU-bound work and `child_process` for external commands — each isolates and prevents event-loop stalls.
- Bounded parallelism: limit concurrent async operations (e.g. a small semaphore/pool) instead of firing unbounded `Promise.all` over large lists.
- For multi-core HTTP serving, use the built-in cluster module or PM2 only if the deployment needs it; one process is often enough behind a load balancer.

## Testing

- Node's built-in test runner (`node:test`) or the repo's framework (Vitest/Jest) — follow the existing convention.
- Test through the public API: HTTP via supertest against the real router, units via direct function calls.
- Mock `fetch`/`http` at the boundary (e.g. `nock`/MSW or injected client); stub timers with fake timers, never real sleeps.
- Cover error and rejection paths explicitly — a handler that only works on the happy path is untested.
