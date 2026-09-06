---
name: docs-writing
description: Write reader-first docs that stay in sync with the implementation
references: [openapi]
tags: [documentation, writing]
effort: low
---
# Documentation

## Purpose

Write documentation that follows repository conventions and serves its readers: lead with the most important information, prefer concrete examples over abstractions.

## When to use

- A task adds or updates a README, API docs, inline docs, or operational runbooks.
- A task changes behavior or contracts and the docs must stay in sync.
- A task asks to document a feature, endpoint, or procedure.

## Procedure

1. Find the existing docs structure with `read_file`/`glob` and match its tone, formatting, and layout.
2. Lead with the most important information: what, then how.
3. Write concrete, copy-pasteable examples; mark placeholders clearly.
4. Cross-reference canonical sources instead of duplicating them — e.g. read `references/openapi.md` for API contracts.
5. Update documentation in the same change that changes behavior — never in a follow-up that can be forgotten.

## References

- `references/openapi.md` when documenting REST API contracts

## Guardrails

- Do not restructure existing docs without reason.
- Avoid marketing language; be precise and concise.
- Never document secrets or internal credentials.
- Link to canonical sources instead of duplicating them.

## Done when

- The doc answers what, why, and how for its intended reader.
- Examples are accurate and verified against the implementation.
- The doc is part of the same change as the behavior it describes.
