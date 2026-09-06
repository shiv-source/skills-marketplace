# Skills Marketplace

Community skill catalog for CodePilot. Each skill is a directory under
`skills/<slug>/` following the `SKILL.md` convention used by CodePilot agents at
runtime.

## Naming rules

A skill's **slug is its directory name and its `name`** — lowercase letters,
numbers, and hyphens only. There is no separate human-facing name inside the
repo; pretty labels live in `catalog.json` under `title`.

## Adding a skill

```
skills/<slug>/
  SKILL.md            # YAML front-matter + markdown instructions (required)
  references/*.md     # optional reference docs loadable via load_reference
```

`SKILL.md` front-matter fields (`name` must equal the directory/slug):

```yaml
---
name: code-review
description: One-line summary shown in the marketplace
references: [owasp]       # optional reference slugs (files under references/)
tools: [git, bash]        # tools the skill expects available
tags: [review, quality]   # optional classification
effort: medium            # optional: low | medium | high
---
```

Then add an entry to `catalog.json` so the marketplace can list the skill in a
single request. `name` repeats the slug; `title` is the display name:

```json
{
  "skills": [
    { "slug": "code-review", "name": "code-review", "title": "Code Review", "description": "…", "icon": "🔍", "version": "1.0.0", "path": "skills/code-review" }
  ]
}
```

## Install URL

The CodePilot server reads this repository as its default marketplace:

```
https://github.com/shiv-source/skills-marketplace
```

Installing a skill from the CodePilot UI pulls `SKILL.md` plus its `references/`
files over the GitHub Contents API and stores them per user.
