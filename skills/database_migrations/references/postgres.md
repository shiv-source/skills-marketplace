# PostgreSQL

Quick-reference for idiomatic Postgres: schema, indexing, queries, transactions, and performance. Use only the section relevant to the code in front of you.

## Types & Schema

- Prefer native types: `BIGINT`/`UUID` for keys, `TIMESTAMPTZ` for times, `NUMERIC` for money, `TEXT` for strings, `JSONB` for document-shaped data.
- Make nullability explicit; a `NOT NULL` with a default beats a nullable column that callers must remember to handle.
- Use `GENERATED ALWAYS AS IDENTITY` for surrogate keys over legacy `SERIAL`; natural keys (unique business values) when they exist and are stable.
- Enforce invariants in the schema, not just the app: `CHECK`, `UNIQUE`, `NOT NULL`, foreign keys with the right `ON DELETE` (RESTRICT/CASCADE/SET NULL).
- `CREATE EXTENSION` only what you need (`pgcrypto` for gen_random_uuid, `pg_trgm` for fuzzy search).

## Indexing

- Index columns used in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY`; a B-tree index on the leading column of a composite is the common case.
- Composite indexes: order columns by equality-then-range (`WHERE a = ? AND b > ?` → `(a, b)`). Query a plan rather than guessing.
- Only index what queries actually run — every index slows writes and grows the table. Drop unused indexes.
- `EXPLAIN ANALYZE` before/after: look for sequential scans on large tables, index-only scans as the target, and correct row estimates.
- Partial (`WHERE ...`) and `INCLUDE` (covering) indexes for hot, narrow lookups; `CREATE INDEX CONCURRENTLY` on live large tables.

## Queries

- Parameterize everything; never concatenate user input into SQL. Use `$1, $2` placeholders.
- Use `RETURNING` to fetch inserted/updated rows in one round trip instead of a follow-up `SELECT`.
- Prefer set-based operations over row-by-row loops; a single `INSERT ... ON CONFLICT ...` or bulk statement beats N statements.
- `ON CONFLICT (col) DO UPDATE` for upserts; `DO NOTHING` when the existing row should win.
- Use `CTE`s (`WITH ...`) for readability of multi-step queries; they are not automatic performance wins — check the plan.
- Paginate with keyset (`WHERE id > $1 ORDER BY id LIMIT 50`) for large tables; `OFFSET` gets slow as the offset grows.

## Transactions

- Wrap multi-statement atomic operations in a transaction; commit once at the end, rollback on any error (defer rollback).
- Keep transactions short — hold locks for as little time as possible; long transactions block vacuum and other writers.
- Choose isolation deliberately: `READ COMMITTED` (default) for most, `REPEATABLE READ`/`SERIALIZABLE` only when a real anomaly must be prevented.
- Handle the 40001 serialization failure with a bounded retry when using stricter isolation or `ON CONFLICT`.
- Beware lock ordering: consistent ordering across transactions avoids deadlocks.

## Performance

- `EXPLAIN (ANALYZE, BUFFERS)` to see actual rows vs estimates; stale statistics mean `ANALYZE`.
- N+1 in the app: batch loads with `WHERE id = ANY($1)` or a single join instead of one query per row.
- `JSONB` can be indexed with GIN for containment queries (`@>`); use `->>` vs `->` correctly (text vs jsonb).
- Avoid functions around indexed columns in `WHERE` (`WHERE lower(email) = $1` can't use a plain index — use an expression index).
- Prefer `count(*)` approximations or maintained counters over `COUNT` on huge tables when exactness isn't required.

## Migrations

- One migration per logical change, numbered and paired (up/down); never edit an already-applied migration.
- Adding a `NOT NULL` column to a large table needs a default or a staged backfill, not a synchronous rewrite.
- `ADD COLUMN ... DEFAULT ...` backfills with a fast metadata-only change (from PG 11 for constant defaults).
- Backfills on large tables should be batched (`WHERE id > last_id LIMIT 1000`) to avoid long locks.
- Test both the up and down migration; down migrations must restore the prior shape exactly.
