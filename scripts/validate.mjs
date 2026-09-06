import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { pathToFileURL } from 'node:url'
import { ROOT, SKILLS_DIR, CATALOG_PATH, buildCatalog, discoverSlugs, listReferenceSlugs } from './generate.mjs'
import { readSkillAttrs, splitFrontmatter } from './frontmatter.mjs'

const SCHEMA_PATH = join(ROOT, 'catalog.schema.json')

const errors = []
const warn = []

function fail(message) {
  errors.push(message)
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function validateValue(data, schema, path, rootSchema) {
  if (schema == null || typeof schema !== 'object') return

  if (schema.$ref) {
    const target = resolveRef(schema.$ref, rootSchema)
    if (!target) {
      fail(`${path}: unresolvable $ref ${schema.$ref}`)
      return
    }
    return validateValue(data, target, path, rootSchema)
  }

  const typeOk =
    schema.type === undefined ||
    (schema.type === 'array'
      ? Array.isArray(data)
      : schema.type === 'object'
        ? data !== null && typeof data === 'object' && !Array.isArray(data)
        : schema.type === 'null'
          ? data === null
          : typeof data === schema.type)

  if (!typeOk) {
    fail(`${path}: expected ${schema.type}, got ${data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data}`)
    return
  }

  if (schema.enum && !schema.enum.includes(data)) {
    fail(`${path}: must be one of ${schema.enum.join(', ')}`)
  }
  if (schema.const !== undefined && data !== schema.const) {
    fail(`${path}: must equal ${JSON.stringify(schema.const)}`)
  }

  if (typeof data === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      fail(`${path}: "${data}" does not match pattern ${schema.pattern}`)
    }
    if (schema.minLength != null && data.length < schema.minLength) {
      fail(`${path}: shorter than minLength ${schema.minLength}`)
    }
    if (schema.maxLength != null && data.length > schema.maxLength) {
      fail(`${path}: longer than maxLength ${schema.maxLength}`)
    }
  }

  if (Array.isArray(data)) {
    if (schema.uniqueItems && new Set(data).size !== data.length) {
      fail(`${path}: contains duplicates`)
    }
    if (schema.items) {
      data.forEach((item, index) => validateValue(item, schema.items, `${path}[${index}]`, rootSchema))
    }
  }

  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in data)) fail(`${path}: missing required property "${key}"`)
      }
    }
    if (schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        if (key in data) {
          validateValue(data[key], schema.properties[key], `${path}.${key}`, rootSchema)
        }
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!schema.properties || !(key in schema.properties)) {
          fail(`${path}: unexpected property "${key}"`)
        }
      }
    }
  }
}

function resolveRef(ref, rootSchema) {
  if (!ref.startsWith('#/')) return null
  let node = rootSchema
  for (const segment of ref.slice(2).split('/')) {
    if (node == null || typeof node !== 'object') return null
    node = node[segment]
  }
  return node
}

function loadJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    fail(`${label}: invalid JSON (${err.message})`)
    return null
  }
}

function validateCatalogSchema(catalog, schema) {
  if (!schema || !catalog) return
  validateValue(catalog, schema, 'catalog', schema)

  const seen = new Set()
  for (const skill of catalog.skills) {
    if (seen.has(skill.slug)) fail(`catalog: duplicate skill slug "${skill.slug}"`)
    seen.add(skill.slug)
  }
}

function validateRepoIntegrity(catalog) {
  if (!catalog) return
  const slugs = catalog.skills.map((s) => s.slug)

  for (const skill of catalog.skills) {
    const { slug, name, references, description } = skill

    if (!SLUG_PATTERN.test(slug) || slug.length > 64) {
      fail(`skill "${slug}": slug must match ^[a-z0-9]+(-[a-z0-9]+)*$ and be <= 64 chars`)
    }
    if (name !== slug) {
      fail(`skill "${slug}": catalog name "${name}" does not equal slug`)
    }
    if (typeof description !== 'string' || description.trim() === '') {
      fail(`skill "${slug}": description is empty (opencode filters skills without one)`)
    }

    const skillDir = join(SKILLS_DIR, slug)
    const skillPath = join(skillDir, 'SKILL.md')
    if (!existsSync(skillPath)) {
      fail(`skill "${slug}": missing ${skillPath}`)
      continue
    }

    let attrs
    try {
      attrs = readSkillAttrs(skillPath)
    } catch (err) {
      fail(`skill "${slug}": ${err.message}`)
      continue
    }

    if (attrs.name !== slug) {
      fail(`skill "${slug}": frontmatter name "${attrs.name}" does not equal slug/directory`)
    }
    if (typeof attrs.description !== 'string' || attrs.description.trim() === '') {
      fail(`skill "${slug}": frontmatter description is empty`)
    }
    const unsupported = Object.keys(attrs).filter(
      (key) => key !== 'name' && key !== 'description'
    )
    if (unsupported.length) {
      fail(
        `skill "${slug}": unsupported frontmatter field(s) ${unsupported
          .map((key) => `"${key}"`)
          .join(', ')} — only name and description are supported`
      )
    }

    const refDir = join(skillDir, 'references')
    const onDiskRefs = listReferenceSlugs(slug)
    const catalogRefs = [...references].sort()

    if (!isDeepStrictEqual(catalogRefs, onDiskRefs)) {
      fail(
        `skill "${slug}": catalog references [${catalogRefs.join(', ')}] do not match files in ` +
          `skills/${slug}/references/ [${onDiskRefs.join(', ')}] — run \`npm run generate\``
      )
    }

    if (existsSync(refDir)) {
      const raw = readFileSync(skillPath, 'utf8')
      const parsed = splitFrontmatter(raw)
      const linkPattern = /`references\/([a-z0-9-]+\.md)`/g
      let match
      while ((match = linkPattern.exec(parsed ? parsed.body : ''))) {
        if (!existsSync(join(refDir, match[1]))) {
          fail(`skill "${slug}": SKILL.md links references/${match[1]} but no such file exists`)
        }
      }
      for (const file of readdirSync(refDir)) {
        if (!file.endsWith('.md')) {
          fail(`skill "${slug}": references/ contains non-markdown file "${file}"`)
        }
      }
    } else if (references.length) {
      fail(`skill "${slug}": catalog lists references but skills/${slug}/references/ is missing`)
    }
  }

  const onDisk = discoverSlugs()
  const missing = onDisk.filter((skillSlug) => !slugs.includes(skillSlug))
  const orphaned = slugs.filter((skillSlug) => !onDisk.includes(skillSlug))
  if (missing.length) {
    fail(`skills/ dirs not in catalog.json (run generate): ${missing.join(', ')}`)
  }
  if (orphaned.length) {
    fail(`catalog.json entries with no skills/<slug>/ dir: ${orphaned.join(', ')}`)
  }

  const byName = new Map()
  for (const skillSlug of slugs) {
    const refDir = join(SKILLS_DIR, skillSlug, 'references')
    if (!existsSync(refDir)) continue
    for (const file of readdirSync(refDir).filter((f) => f.endsWith('.md'))) {
      const content = readFileSync(join(refDir, file), 'utf8')
      if (!byName.has(file)) byName.set(file, [])
      byName.get(file).push({ slug: skillSlug, content })
    }
  }
  for (const [file, copies] of byName) {
    if (copies.length < 2) continue
    const first = copies[0].content
    const divergent = copies.filter((copy) => copy.content !== first)
    if (divergent.length) {
      const owners = copies.map((copy) => copy.slug).join(', ')
      warn.push(
        `reference "${file}" exists in multiple skills (${owners}) with differing content — ` +
          `keep shared copies identical or version them independently`
      )
    }
  }
}

function validateNoDrift() {
  const current = loadJson(CATALOG_PATH, 'catalog.json')
  if (!current) return
  const regenerated = buildCatalog()

  delete current.updatedAt
  delete regenerated.updatedAt

  if (!isDeepStrictEqual(current, regenerated)) {
    fail('catalog.json is out of sync with skills/*/SKILL.md — run `npm run generate`')
  }
}

function main() {
  try {
    const schema = loadJson(SCHEMA_PATH, 'catalog.schema.json')
    const catalog = loadJson(CATALOG_PATH, 'catalog.json')

    validateCatalogSchema(catalog, schema)
    validateRepoIntegrity(catalog)
    validateNoDrift()

    for (const message of warn) {
      console.log(`warning: ${message}`)
    }

    if (errors.length) {
      console.error(`\n${errors.length} validation error(s):`)
      for (const message of errors) {
        console.error(`  - ${message}`)
      }
      process.exitCode = 1
    } else {
      const count = catalog?.skills?.length ?? 0
      console.log(`catalog.json OK (${count} skills); all skills valid and in sync.`)
    }
  } catch (err) {
    console.error(`validation error: ${err.message}`)
    process.exitCode = 1
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main()
}
