import { readFileSync } from 'node:fs'
import * as yaml from 'js-yaml'

export function splitFrontmatter(content) {
  const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content
  if (!text.startsWith('---')) return null

  const lines = text.split(/\r?\n/)
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    throw new Error('unterminated frontmatter: missing closing ---')
  }

  const block = lines.slice(1, end).join('\n')

  let attrs
  try {
    const parsed = block.trim() === '' ? {} : yaml.load(block)
    attrs = parsed ?? {}
  } catch (err) {
    throw new Error(`invalid YAML frontmatter: ${err.message}`)
  }
  if (typeof attrs !== 'object' || Array.isArray(attrs)) {
    throw new Error('invalid YAML frontmatter: expected a mapping of key/value pairs')
  }

  const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '')
  return { attrs, body }
}

export function readSkillAttrs(skillPath) {
  const content = readFileSync(skillPath, 'utf8')
  const fm = splitFrontmatter(content)
  if (!fm) {
    throw new Error(`${skillPath}: missing YAML frontmatter block`)
  }
  return fm.attrs
}
