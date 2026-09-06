---
name: api-design
description: Design consistent, validated, well-documented API contracts
references: [openapi, graphql]
tags: [api, rest, backend]
tools: [bash]
effort: medium
---
# API Design

## Purpose

Design and implement APIs that are consistent, predictable, and safe for consumers to adopt. Every contract is explicit, validated, and documented.

## When to use

- A task adds, changes, or extends an HTTP endpoint or request/response contract.
- A task introduces or modifies validation, error handling, pagination, or versioning.
- A task designs an API for a new feature or integrates with an existing one.
- A task touches REST routes, GraphQL schemas, or OpenAPI documents.

## Procedure

1. Read the existing API surface with `grep`/`read_file`: find the route layout, handler pattern, error envelope, and validation helpers. Match them exactly.
2. Define the contract first — path, method, request body, response shape, error cases — then implement to it.
3. Validate at the boundary: reject unknown or malformed fields and return which field failed and why.
4. Read the relevant reference before writing contract code:
   - `references/openapi.md` for REST contract authoring and error semantics
   - `references/graphql.md` for schemas, resolvers, and mutations
5. Make mutating operations safe to retry; support idempotency keys where a retry could duplicate.
6. Update or add tests covering success, validation failure, and error paths; keep the docs in the same change.

## References

- `references/openapi.md` — OpenAPI contract authoring and error semantics
- `references/graphql.md` — GraphQL schemas, resolvers, and mutations

## Guardrails

- Never expose internal identifiers or stack traces in error responses.
- Keep request and response shapes explicit; avoid overly generic envelope types.
- Name resources and fields from the consumer's perspective, not the database's.
- Favor additive, backward-compatible changes; document any breaking change explicitly.

## Done when

- Every endpoint has a documented contract: path, method, request, response, error cases.
- Validation and error paths are tested; idempotency is handled where it matters.
- The implementation and its docs are in the same change.
