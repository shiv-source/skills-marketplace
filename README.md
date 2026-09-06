# Skills Marketplace

Community skill catalog for CodePilot. Each skill is a directory under
`skills/<slug>/` following the `SKILL.md` convention used by CodePilot agents at
runtime.

## Adding a skill

```
skills/<slug>/
  SKILL.md            # YAML front-matter + markdown instructions (required)
  references/*.md     # optional reference docs loadable via load_reference
```

`SKILL.md` front-matter fields:

```yaml
---
name: Code Review
description: One-line summary shown in the marketplace
icon: 🔍
version: 1.0.0
references: [owasp]       # optional reference slugs (files under references/)
tools: [git, bash]        # tools the skill expects available
tags: [review, quality]   # optional classification
effort: medium            # optional: low | medium | high
---
```

Then add an entry to `catalog.json` so the marketplace can list the skill in a
single request:

```json
{
  "skills": [
    { "slug": "code_review", "name": "Code Review", "description": "…", "icon": "🔍", "version": "1.0.0", "path": "skills/code_review" }
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
