---
name: best-practices
description: Use as the default baseline when writing or changing production code that has no more specific skill attached — readable, correct, testable, maintainable code
---
# Engineering Best Practices

## Purpose

Apply a consistent quality bar to every change: readable, correct, testable, and maintainable code that follows the repository's conventions.

## When to use

- A task has no more specific skill attached and involves writing or changing production code.
- A task is a general implementation, fix, or improvement without a specialized procedure.
- Use as the default baseline whenever you write code; more specific skills override it.

## Procedure

1. Survey the surrounding code with `grep`/`read_file` and mirror its patterns, structure, and naming.
2. Implement the smallest coherent change that meets the requirement — no speculative generality.
3. Handle every failure path: no swallowed or ignored errors; log with context.
4. Re-read the diff as a reviewer: remove leftovers, tighten names, verify error paths.
5. Run the relevant tests and linters with `bash` before calling the work done.

## Guardrails

- Do not change behavior you were not asked to change.
- Do not introduce dependencies or abstractions the codebase does not already use.
- Reuse existing utilities and helpers instead of reinventing them.
- Keep the change focused: no unrelated edits, dead code, or commented-out code.

## Done when

- Code reads top to bottom and names say what things are.
- Behavior changes come with tests; new logic is testable without brittle mocks.
- The relevant tests and linters pass.
