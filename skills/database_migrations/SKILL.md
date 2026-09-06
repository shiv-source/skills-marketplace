---
name: Database Migrations
description: Design safe, reversible schemas and migrations with the right indexes
references: [postgres]
tags: [database, sql, migrations]
tools: [bash]
effort: medium
---
# Database Migrations

## Purpose

Design schemas and migrations that are safe, reversible, and performant — no lost data, no long locks, no broken deploy.

## When to use

- A task adds, changes, or removes tables, columns, constraints, or indexes.
- A task introduces a new query, backfill, or data transformation.
- A task touches a migration file, the store layer, or schema definitions.

## Procedure

1. Understand the read/write patterns the requirement implies before designing the schema.
2. Design with correct types, explicit nullability, sensible defaults, and constraints that enforce invariants in the database.
3. Write a forward migration and a matching backward migration that restores the prior shape exactly.
4. Plan data backfills for existing rows; on large tables, batch the backfill and avoid long locks.
5. Read `references/postgres.md` before writing SQL, indexes, or transaction logic.
6. Verify with `bash`: apply the up migration, run the suite, then apply down and confirm the rollback works.

## References

- `references/postgres.md` — types, indexing, transactions, and query performance

## Guardrails

- Never drop a column or table without a down migration that restores it.
- Avoid default values that are expensive or non-deterministic on large tables.
- Adding an index is safe; adding a lock-heavy constraint needs a plan and a test.
- Follow the repository's migration numbering and directory layout exactly.

## Done when

- Up and down migrations both apply cleanly and are tested.
- Existing rows remain valid after the change; backfills are batched where the table is large.
- Queries the change implies have an appropriate index (verified via the query plan).
