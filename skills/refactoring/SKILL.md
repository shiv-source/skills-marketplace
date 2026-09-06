---
name: refactoring
description: Restructure code to improve design without changing observable behavior
tags: [refactoring, quality]
tools: [bash]
effort: medium
---
# Safe Refactoring

## Purpose

Restructure code to improve its design without changing its observable behavior. Every step keeps the code working and the diff reviewable.

## When to use

- A task asks to improve, clean up, simplify, or restructure existing code.
- A task mentions removing duplication, extracting helpers, or renaming for clarity.
- A task describes "tidying", "tightening", or "hardening" an existing implementation.

## Procedure

1. Identify the behavioral contract: what inputs are accepted, what outputs are produced, and what side effects occur.
2. Establish a safety net — run the existing test suite, or add characterization tests before changing code.
3. Make small, behavior-preserving steps: rename, extract, inline, move. One kind of change at a time.
4. Run the relevant tests after each step before proceeding to the next.
5. Stop when the structure is clean enough for the intended improvement; do not gold-plate.

## Guardrails

- Never mix refactoring with feature changes in the same step; do one or the other.
- Do not silently change formatting, ordering, or error messages unless it is part of the intent.
- If a step becomes large or risky, revert and break it into smaller steps.
- Keep the diff reviewable: prefer several small commits over one sprawling change.

## Done when

- Behavior is unchanged: the full suite passes before and after.
- The structure is clean enough for the intended improvement, no further.
- Each step is small enough to review and, if needed, revert independently.
