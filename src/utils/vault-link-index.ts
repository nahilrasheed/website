import { readFileSync } from 'node:fs'
import path from 'node:path'
import GithubSlugger from 'github-slugger'
import { globSync } from 'glob'
import { toString } from 'mdast-util-to-string'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

const NOTE_EXTENSION = /\.(md|mdx)$/i
const CONTENT_ROOT = 'src/content/vault'

export interface VaultResolution {
  sourcePath: string
  url: string
  kind: 'note' | 'media'
  headingId?: string
}

export interface VaultLinkIndex {
  files: string[]
  permalinks: Record<string, string>
  resolve(input: { source: string; target: string; kind: 'note' | 'media' | 'auto' }): VaultResolution
  resolveNoteReference(source: string, target: string): VaultResolution | undefined
  getAsset(sourcePath: string): VaultResolution | undefined
}

interface Entry extends VaultResolution {
  lookupPath: string
  headings: Map<string, string>
}

export function normalizeVaultSlug(id: string): string {
  const withoutExtension = id.replace(NOTE_EXTENSION, '')
  const withoutFolderNote = withoutExtension.replace(/\/(index|readme)$/i, '')

  return withoutFolderNote
    .split('/')
    .filter(Boolean)
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[&()[\]{}]/g, '')
        .replace(/[,;:!?@#$%^*+=|\\/<>'"`~]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .join('/')
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

function resolveRelative(source: string, target: string): string {
  const resolved = target.startsWith('/')
    ? target.slice(1)
    : path.posix.join(path.posix.dirname(source), target)
  const normalized = path.posix.normalize(resolved)
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`Vault link escapes the vault: ${target}`)
  }
  return normalizePath(normalized)
}

function headingsFor(sourcePath: string, root: string): Map<string, string> {
  const headings = new Map<string, string>()
  const tree = unified().use(remarkParse).parse(readFileSync(path.join(root, sourcePath), 'utf8'))
  const slugger = new GithubSlugger()

  visit(tree, 'heading', (node) => {
    const text = toString(node).trim()
    headings.set(text.toLocaleLowerCase(), slugger.slug(text))
  })

  return headings
}

export function createVaultLinkIndex({ contentRoot = CONTENT_ROOT }: { contentRoot?: string } = {}): VaultLinkIndex {
  const sourcePaths = globSync('**/*.{md,mdx,avif,bmp,gif,jpeg,jpg,png,svg,webp}', {
    cwd: contentRoot,
    nodir: true
  }).map(normalizePath)
  const entries = sourcePaths.map<Entry>((sourcePath) => {
    const kind = NOTE_EXTENSION.test(sourcePath) ? 'note' : 'media'
    const url =
      kind === 'note'
        ? `/vault/${normalizeVaultSlug(sourcePath)}`
        : `/vault/assets/${sourcePath.split('/').map(encodeURIComponent).join('/')}`
    return {
      sourcePath,
      url,
      kind,
      lookupPath: kind === 'note' ? sourcePath.replace(NOTE_EXTENSION, '') : sourcePath,
      headings: kind === 'note' ? headingsFor(sourcePath, contentRoot) : new Map()
    }
  })
  const byPath = new Map(entries.map((entry) => [entry.lookupPath.toLocaleLowerCase(), entry]))
  const byBasename = new Map<string, Entry[]>()
  for (const entry of entries) {
    const basename = path.posix.basename(entry.lookupPath).toLocaleLowerCase()
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), entry])
  }

  function find(source: string, rawTarget: string, kind: 'note' | 'media' | 'auto'): Entry | undefined {
    const target = decodeURI(rawTarget)
    const candidates = kind === 'auto' ? entries : entries.filter((entry) => entry.kind === kind)
    const pathTarget = target.startsWith('/') || target.startsWith('./') || target.startsWith('../')
      ? resolveRelative(source, target)
      : normalizePath(target)
    const lookup = (kind === 'media' ? pathTarget : pathTarget.replace(NOTE_EXTENSION, '')).toLocaleLowerCase()
    const exact = byPath.get(lookup)
    if (exact && candidates.includes(exact)) return exact
    if (pathTarget.includes('/')) return undefined
    const matches = (byBasename.get(lookup) ?? []).filter((entry) => candidates.includes(entry))
    if (matches.length > 1) {
      throw new Error(`Ambiguous vault link "${rawTarget}": ${matches.map((entry) => entry.sourcePath).join(', ')}`)
    }
    return matches[0]
  }

  function resolve(input: { source: string; target: string; kind: 'note' | 'media' | 'auto' }): VaultResolution {
    const [target, fragment] = input.target.split('#', 2)
    const entry = find(normalizePath(input.source), target, input.kind)
    if (!entry) throw new Error(`Unresolved vault link "${input.target}" from ${input.source}`)
    if (fragment) {
      if (entry.kind !== 'note') throw new Error(`Media links cannot target a heading: ${input.target}`)
      const headingId = entry.headings.get(decodeURI(fragment).trim().toLocaleLowerCase())
      if (!headingId) throw new Error(`Unresolved heading "${fragment}" in ${entry.sourcePath}`)
      return { sourcePath: entry.sourcePath, kind: entry.kind, url: `${entry.url}#${headingId}`, headingId }
    }
    return { sourcePath: entry.sourcePath, kind: entry.kind, url: entry.url }
  }

  return {
    files: sourcePaths,
    permalinks: Object.fromEntries(entries.map((entry) => [entry.sourcePath, entry.url])),
    resolve,
    resolveNoteReference: (source, target) => {
      try {
        return resolve({ source, target, kind: 'note' })
      } catch {
        return undefined
      }
    },
    getAsset: (sourcePath) => entries.find((entry) => entry.kind === 'media' && entry.sourcePath === sourcePath)
  }
}
