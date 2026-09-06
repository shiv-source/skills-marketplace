import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { splitFrontmatter } from './frontmatter.mjs'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const SKILLS_DIR = join(ROOT, 'skills')
export const CATALOG_PATH = join(ROOT, 'catalog.json')

const SCHEMA_VERSION = '1.0.0'
const CATALOG_NAME = 'skills-marketplace'
const CATALOG_DESCRIPTION = 'Community skill catalog for opencode/Claude agents'
const HOMEPAGE = 'https://github.com/shiv-source/skills-marketplace'
const REPOSITORY = 'https://github.com/shiv-source/skills-marketplace'
const CATALOG_LICENSE = 'MIT'

export function discoverSlugs() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
}

export function listReferenceSlugs(slug) {
  const dir = join(SKILLS_DIR, slug, 'references')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md') && !file.startsWith('.'))
    .map((file) => file.slice(0, -3))
    .sort()
}

export function readSkill(slug) {
  const skillPath = join(SKILLS_DIR, slug, 'SKILL.md')
  const content = readFileSync(skillPath, 'utf8')
  const parsed = splitFrontmatter(content)
  if (!parsed) {
    throw new Error(`skills/${slug}/SKILL.md: missing YAML frontmatter block`)
  }

  const { attrs } = parsed

  return {
    slug,
    name: attrs.name ?? slug,
    description: attrs.description ?? '',
    references: listReferenceSlugs(slug),
    path: `skills/${slug}`,
  }
}

export function buildCatalog({ updatedAt = new Date().toISOString() } = {}) {
  const skills = discoverSlugs().map(readSkill)

  return {
    $schema: './catalog.schema.json',
    schemaVersion: SCHEMA_VERSION,
    name: CATALOG_NAME,
    description: CATALOG_DESCRIPTION,
    homepage: HOMEPAGE,
    repository: REPOSITORY,
    license: CATALOG_LICENSE,
    updatedAt,
    skills,
  }
}

function main() {
  try {
    const catalog = buildCatalog()

    let upToDate = false
    if (existsSync(CATALOG_PATH)) {
      try {
        const existing = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'))
        const { updatedAt: _old, ...oldContent } = existing
        const { updatedAt: _new, ...newContent } = catalog
        upToDate = JSON.stringify(oldContent) === JSON.stringify(newContent)
      } catch {
        upToDate = false
      }
    }

    if (upToDate) {
      console.log('catalog.json is up to date; nothing to write.')
      return
    }

    writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`)
    console.log(`Generated catalog.json with ${catalog.skills.length} skills.`)
  } catch (err) {
    console.error(`generate error: ${err.message}`)
    process.exitCode = 1
  }
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main()
}
