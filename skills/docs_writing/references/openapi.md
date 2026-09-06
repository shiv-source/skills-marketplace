# OpenAPI

Quick-reference for authoring OpenAPI 3.x REST contracts: structure, schemas, paths, and error semantics. Use only the section relevant to the code in front of you.

## Document Structure

- An OpenAPI document has `openapi: 3.0.x`/`3.1.x`, `info`, `servers`, `paths`, and `components`. The document IS the contract — keep it in sync with the implementation.
- `info.title`, `info.version` are required; describe the API's purpose in `info.description`.
- Reuse shape definitions in `components.schemas`; reference with `$ref: '#/components/schemas/User'`.
- Keep the spec machine-validatable: run it through a linter (e.g. spectral) and `openapi` CLI before merging.

## Paths & Operations

- `paths` map URL patterns to operations: `get`, `put`, `post`, `delete`, `patch`, `options`, `head`, `trace`.
- Every operation needs a `summary`, optional `description`, a `responses` block, and the `operationId` (unique, camelCase) for SDK generation.
- Restful naming: plural resources (`/users`, `/users/{id}`); actions that don't fit a resource use a subresource or explicit verb.
- Path parameters are required and defined in `parameters` with `in: path`; query/header parameters marked optional unless documented otherwise.
- `requestBody` declares `content` with `application/json` and a `$ref` schema; use `required: true` only when the body is always needed.

## Schemas

- Model JSON shapes with `type`, `properties`, `required`, `enum`, `format`, and constraints (`minimum`, `maxLength`, `pattern`).
- Name schemas by domain noun; keep them flat enough to reuse (`Page<User>` for a paginated envelope).
- `additionalProperties: false` for strict payloads; document optional vs required explicitly.
- Use `oneOf`/`anyOf`/`allOf` deliberately for unions and composition; avoid `allOf` for simple inheritance where a flat schema suffices.
- Dates and times: `type: string` + `format: date`/`date-time` (RFC 3339); money as a string or integer of minor units, never float.

## Error Semantics

- Define a reusable `Error` schema: `code`, `message`, and optional `details`/`field` for validation failures; reference it from every error response.
- Meaningful status codes: `200` success, `201` created, `400` invalid input, `401` unauthenticated, `403` unauthorized, `404` missing, `409` conflict, `429` rate limit, `422` validation, `5xx` server failure.
- Document each error response the operation can actually produce; don't blanket `default` and call it done.
- Keep the error envelope consistent across the API — consumers write one parser, not one per endpoint.
- Never expose stack traces or internal identifiers in error bodies.

## Validation & Versioning

- Validate at the boundary: enforce schema constraints, reject unknown fields, return which field failed and why.
- Version with the path (`/v1/users`) or a media-type/header strategy; pick one and document it. Prefer additive, backward-compatible changes.
- `Deprecated: true` marks operations/schemas that are going away; keep them working until the documented removal date.
- Idempotency: document `Idempotency-Key` headers on retryable mutations and the behavior on repeat.

## Pagination

- Cursor-based for large, hot lists; page-based for smaller, stable sets. Return `items` plus `next_cursor`/`has_more` metadata.
- Define a shared paginated envelope schema and reuse it; don't re-invent per endpoint.
- Document default page size and hard maximum; enforce server-side so one bad client can't request a million rows.
