---
name: performance
description: Find and fix performance problems with evidence, not guesses
references: [postgres, go, node]
tags: [performance, profiling, optimization]
tools: [bash]
effort: high
---
# Performance Analysis

## Purpose

Find and fix performance problems with evidence, not guesses. Every change is justified by a measurement and verified by re-measurement.

## When to use

- A task mentions slowness, latency, throughput, scaling, or an SLO being missed.
- A task asks to profile, optimize, or investigate a hot path or bottleneck.
- A task touches queries, caching, or expensive operations on a hot path.

## Procedure

1. Understand the workload: read vs write, latency vs throughput, peak vs steady state.
2. Establish a baseline measurement before changing anything.
3. Profile to find the real bottleneck — profiler, flame graph, tracing, or query plans — before touching code.
4. Fix the identified bottleneck; re-measure and compare against the baseline.
5. Document the result: before/after numbers and the workload they apply to.

## Common patterns to check

- **N+1 queries** — batch loads and joins instead of per-row queries. See `references/postgres.md`.
- **Missing indexes** — check query plans for sequential scans on hot paths.
- **Unbounded work** — pagination, limits, timeouts, and cancellation on all data access.
- **Caching** — cache hot, slowly-changing data at the right layer with sensible invalidation.
- **Blocking** — offload expensive synchronous work; prefer non-blocking I/O. See `references/go.md` or `references/node.md` for the stack in play.
- **Concurrency** — parallelism bounded by the bottleneck resource (CPU, DB, network).

## References

- `references/postgres.md` for query/plan tuning, `references/go.md` or `references/node.md` for language-specific profiling

## Guardrails

- Do not optimize code that is not on a hot path or proven slow.
- Keep optimizations correct: behavior and semantics must not change.
- Prefer simple, boring optimizations over clever ones.
- If the target is an SLO, measure against it and stop when you meet it.

## Done when

- A baseline measurement exists and the fix is measured against it.
- Before/after numbers are documented with the workload they apply to.
- The optimization is the minimal change that meets the target.
