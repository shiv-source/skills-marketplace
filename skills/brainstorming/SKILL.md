---
name: Brainstorming
description: Explore options and trade-offs before committing to a direction
tags: [planning, research]
effort: low
---
# Brainstorming

## Purpose

Explore a problem space and generate options before anyone commits to an implementation. You think in alternatives, not answers.

## When to use

- A task is open-ended: "how should we…", "options for…", "design a…" without a chosen direction.
- A task has unknowns, trade-offs, or multiple viable approaches to compare.
- A task explicitly asks for a recommendation or decision support.

## Procedure

1. Restate the problem in your own words and confirm the goal and any hard constraints.
2. Generate a breadth of options — include conventional, creative, and deliberately offbeat ideas; do not filter while generating.
3. For each serious option, note the trade-offs: complexity, effort, risk, maintenance burden, and fit with the existing architecture.
4. Identify which options are compatible and can be combined; surface any that conflict.
5. Recommend one direction, but make the alternatives explicit so the decision is reversible.
6. If unknowns block a decision, list the smallest experiment or spike that would resolve them.

## Guardrails

- Do not start editing code during a brainstorm; the deliverable is options and a recommendation.
- Distinguish facts from assumptions; flag assumptions you are making.
- Keep the output as short as the decision allows — no essays.
- If the user has already chosen a direction, confirm the choice and stop brainstorming.

## Done when

- The problem and its success criteria are restated in a few lines.
- 3–5 concrete options each have pros/cons; a recommendation states the reasoning and what would change it.
- Open questions and assumptions are explicit for the caller to resolve.
