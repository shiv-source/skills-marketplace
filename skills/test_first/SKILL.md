---
name: Test-Driven Implementation
description: Write a failing test first and drive the change through red-green-refactor
references: [testing-library]
tags: [testing, tdd]
tools: [bash]
effort: medium
---
# Test-Driven Implementation

## Purpose

Drive changes through a red-green-refactor loop. Tests are the specification; code exists to make them pass.

## When to use

- A task adds or changes behavior that can be observed and asserted.
- A task fixes a bug — a test that reproduces the bug should come first.
- A task involves logic with branches, boundaries, or error paths.

## Procedure

1. Understand the requirement and identify the observable behavior to test at the boundary.
2. Write a failing test first that describes that behavior.
3. Run the test with `bash` and confirm it fails for the right reason — missing behavior, not a broken harness.
4. Implement the minimal code to make the test pass.
5. Run the full suite: all tests pass, no regressions.
6. Refactor for clarity while keeping tests green; read `references/testing-library.md` before writing component tests.

## References

- `references/testing-library.md` when the behavior under test is a UI component

## Guardrails

- Never delete or weaken existing tests to make new code pass.
- Never add tests that always pass (no assertions) or assert implementation details.
- Cover the happy path, error path, and boundary conditions — not just the success case.
- If a test is flaky, fix the nondeterminism; do not retry or sleep it green.

## Done when

- A test exists for the new behavior and fails without the implementation.
- The full suite passes with no new flakiness.
- Tests are deterministic, fast, and assert user-observable outcomes.
