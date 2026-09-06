# Skills Marketplace

Enterprise-standard skill catalog for opencode/Claude agents. Each skill lives in
`skills/<slug>/SKILL.md` following the [opencode Agent Skills](https://opencode.ai/docs/skills)
convention. The catalog is machine-readable, schema-validated, and generated from
a single source of truth.

## Repository layout

```
skills-marketplace/
├── .github/workflows/ci.yml  # check on PRs; regenerate+commit catalog on main
├── .husky/pre-commit         # git hook: block main commits + npm run check
├── skills/<slug>/
│   ├── SKILL.md              # skill instructions (name == slug == dir)
│   └── references/*.md       # bundled reference docs (self-contained skill)
├── catalog.json              # GENERATED — committed to main by CI
├── catalog.schema.json       # JSON Schema contract for catalog.json
├── scripts/
│   ├── protect-branches.sh   # branch-protection guard used by the git hook
│   ├── frontmatter.mjs       # YAML frontmatter parser (js-yaml)
│   ├── generate.mjs          # catalog.json generator (reads SKILL.md frontmatter)
│   └── validate.mjs          # full conformance + drift validator
└── package.json              # npm run generate / validate
```

## Skill format

A skill is a directory whose name is its **slug** — lowercase letters, numbers,
and hyphens only (`^[a-z0-9]+(-[a-z0-9]+)*$`, max 64 chars). It contains exactly
one `SKILL.md`:

```markdown
---
name: code-review
description: Use when reviewing a diff, pull request, or code change before it merges — check correctness, security, and maintainability
---
```

Frontmatter fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | Must equal the slug and the directory name. |
| `description` | yes | One sentence, third-person ("Use when…"), front-loading trigger keywords. opencode filters out skills without one. |

These two fields are the full opencode skill contract — nothing else is needed.
The `SKILL.md` body follows a consistent structure — `Purpose`, `When to use`,
`Procedure`, `References`, `Guardrails`, `Done when`.

## Skill references

A skill is **self-contained**: any reference docs it needs are bundled inside the
skill directory as `skills/<slug>/references/*.md` and linked relatively from the
SKILL.md body (`references/owasp.md`). Copying the skill folder anywhere keeps it
fully working — nothing points outside the skill.

The `references` list in `catalog.json` is derived from these files (a sorted
list of `*.md` basenames), so the frontmatter does not need to repeat it.

When the same reference is useful to several skills (e.g. `owasp.md` for both
`security-hardening` and `code-review`), each skill keeps its own copy. Keep such
copies byte-identical; `npm run validate` warns if copies of a reference that
exist in multiple skills diverge, so a shared edit is never silently lost.

## catalog.json

`catalog.json` lists the whole marketplace in one request and is **generated**
from the SKILL.md files — it is not a source of truth, but it is committed to
`main` so the repo always serves a ready-to-use catalog. Generate it locally
with:

```
npm run generate
```

On every push to `main`, CI regenerates it and commits any change back to
`main`, so a stale catalog is corrected automatically. The catalog carries
marketplace-level metadata (`schemaVersion`, `description`, `homepage`,
`repository`, `license`, `updatedAt`) plus a record per skill (`slug`, `name`,
`description`, `references`, `path`). The contract is defined by
`catalog.schema.json` (JSON Schema 2020-12).

## Validation

`catalog.schema.json` and `scripts/validate.mjs` enforce the contract. The
validator exits non-zero on any violation:

- `catalog.json` is valid JSON and satisfies `catalog.schema.json`
- slug is kebab-case, ≤ 64 chars, and equals `name` and the directory name
- every skill has a non-empty `description` (opencode requirement)
- the frontmatter contains only the supported `name` and `description` fields
- the `references` list matches the `*.md` files bundled in `skills/<slug>/references/`
- every `references/*.md` linked from a SKILL.md body actually exists in that skill
- every `skills/<slug>/` directory is registered in the catalog and vice versa
- the generated `catalog.json` is in sync with the SKILL.md files (no drift)

The validator expects a generated `catalog.json` to exist, so run the full
check (generate first):

```
npm run check
```

### CI (`.github/workflows/ci.yml`, Node 24)

- **Pull requests** — `npm run check` (generate + validate) runs to prove the
  branch's skills are well-formed. You don't need to run `npm run generate`
  locally before pushing.
- **Push to `main`** — the `sync-catalog` job regenerates `catalog.json`,
  validates it, and commits + pushes the result back to `main` (as
  `github-actions[bot]`) whenever the catalog actually changed, so the published
  catalog is never stale.

### Local git hooks (Husky)

Husky installs a `pre-commit` hook on `npm install` (see `prepare`). The hook:

1. Blocks direct commits to `main`/`master` (via `scripts/protect-branches.sh`) — use a
   feature branch and open a PR instead.
2. Runs `npm run check` so a commit can never break the catalog build, then
   stages the regenerated `catalog.json`.

## Adding or updating a skill

1. Create `skills/<slug>/SKILL.md` (or edit an existing one) with the `name` +
   `description` frontmatter and body above. Bundle any reference docs the skill
   needs under `skills/<slug>/references/` and link them relatively from the
   body. If the content already exists in another skill's `references/`, copy it
   verbatim.
2. Open a pull request. CI checks it; after merge the catalog is regenerated and
   committed to `main` automatically. To preview locally, run `npm run check`.

## Install URL

The marketplace (and its `catalog.json`) is served from this repository:

```
https://github.com/shiv-source/skills-marketplace
```
