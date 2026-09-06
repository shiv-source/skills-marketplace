---
name: Code Review
description: Review a diff for correctness, security, and maintainability before it merges
references: [owasp]
tags: [review, quality]
tools: [git, bash]
effort: medium
---
# Code Review

## Purpose

Review a diff for correctness, style, security, and maintainability. Feedback is concrete, actionable, and kind — you approve or request changes, you never rewrite the author's solution.

## When to use

- A task asks you to review a diff, pull request, or change before merge.
- A task is described as "verify", "check", or "audit" an existing change.
- A task involves landing code that has not been reviewed yet.

## Procedure

1. Read the task description and identify the intended behavior of the change.
2. Inspect the diff file-by-file. For each change, ask: does this match the stated intent?
3. Check scope: no unrelated edits, no dead code, no commented-out code.
4. Verify error handling: every failure path returns a meaningful error; no swallowed errors or panics.
5. Verify tests: are there tests for the changed behavior, including edge cases and error paths?
6. Verify security: no secrets committed, no unvalidated input, no injection, no unsafe deserialization. Read `references/owasp.md` for security-sensitive diffs.
7. Verify the public contract: signatures, APIs, and schema changes are backward compatible or documented.

## References

- `references/owasp.md` when the diff touches auth, input, SQL, or untrusted data

## Guardrails

- Never rewrite the author's solution in your review; suggest improvements only.
- Distinguish objective bugs from subjective preferences.
- For large changes, prioritize correctness and security over style.
- Reference the exact file and give a concrete fix for every finding.

## Done when

- Findings are grouped by severity (Blocker / Should fix / Nit), each with a concrete fix.
- The verdict is explicit: approve, approve-with-nits, or needs-changes.
- No blocker goes unreported — even if it means rejecting the change.
