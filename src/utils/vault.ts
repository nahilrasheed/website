import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

export type VaultEntry = CollectionEntry<'vault'>
const VAULT_CONTENT_PATH = './src/content/vault'
const DEFAULT_VAULT_ORDER = Number.POSITIVE_INFINITY

interface GetEnrichedVaultCollectionOptions {
  includeUnlinkable?: boolean
  type?: string | string[]
}

export interface EnrichedVaultEntry extends VaultEntry {
  slug: string
  isFolderNote: boolean
  isMetadataOnlyFolderNote: boolean
  isLinkable: boolean
}

export const prod = import.meta.env.PROD

function buildMetadataOnlyFolderNoteSlugSet(basePath: string, prefix = ''): Set<string> {
  const slugs = new Set<string>()

  try {
    const items = readdirSync(basePath)
    const folderNote = items.find((item) => /^(index|readme)\.(md|mdx)$/i.test(item))

    if (folderNote) {
      const source = readFileSync(join(basePath, folderNote), 'utf8')
      if (getMarkdownContentWithoutFrontmatter(source).length === 0 && prefix) {
        slugs.add(prefix)
      }
    }

    for (const item of items) {
      if (item.startsWith('.')) continue

      const fullPath = join(basePath, item)
      const stat = statSync(fullPath)

      if (!stat.isDirectory()) continue

      const nextPrefix = prefix ? `${prefix}/${sanitizeSlugPart(item)}` : sanitizeSlugPart(item)
      const nestedSlugs = buildMetadataOnlyFolderNoteSlugSet(fullPath, nextPrefix)

      for (const slug of nestedSlugs) slugs.add(slug)
    }
  } catch (error) {
    console.error('Error reading folder note metadata:', error)
  }

  return slugs
}

function getMarkdownContentWithoutFrontmatter(source: string | undefined): string {
  if (!source) return ''

  return source.replace(/^---\s*\n[\s\S]*?\n---\s*(\n|$)/, '').trim()
}

export interface VaultNode {
  title: string
  slug?: string
  children: VaultNode[]
  order: number
  entry?: EnrichedVaultEntry
  showLink?: boolean
  active?: boolean
  isOpen?: boolean
}

interface VaultTreeBranch {
  title: string
  children: Record<string, VaultTreeBranch>
  order: number
  entry?: EnrichedVaultEntry
  showLink?: boolean
}

function getVaultNodeSortOrder(order: number | undefined): number {
  return typeof order === 'number' && Number.isFinite(order) ? order : DEFAULT_VAULT_ORDER
}

function isFolderNode(node: Pick<VaultNode, 'children'>): boolean {
  return node.children.length > 0
}

function compareVaultNodes(a: VaultNode, b: VaultNode): number {
  const orderDiff = getVaultNodeSortOrder(a.order) - getVaultNodeSortOrder(b.order)
  if (orderDiff !== 0) return orderDiff

  const aIsFolder = isFolderNode(a)
  const bIsFolder = isFolderNode(b)

  if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1

  return a.title.localeCompare(b.title)
}

function getFallbackTitle(value: string): string {
  return value.replace(/[-_]/g, ' ')
}

//  Sanitize a path segment for URLs
function sanitizeSlugPart(part: string): string {
  return part
    .toLowerCase()
    .replace(/[&()[\]{}]/g, '') // Remove &, brackets, parens
    .replace(/[,;:!?@#$%^*+=|\\/<>"'`~]/g, '') // Remove punctuation
    .replace(/\s+/g, '-') // Spaces → dashes
    .replace(/--+/g, '-') // Multiple dashes → single
    .replace(/^-+|-+$/g, '') // Trim edge dashes
}

// Build map of normalized paths to original names with casing/symbols preserved
function buildOriginalNameMap(basePath: string, prefix = ''): Record<string, string> {
  const map: Record<string, string> = {}

  try {
    const items = readdirSync(basePath)

    for (const item of items) {
      if (item.startsWith('.')) continue

      const fullPath = join(basePath, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        const normalized = sanitizeSlugPart(item)
        const key = prefix ? `${prefix}/${normalized}` : normalized
        map[key] = item
        Object.assign(map, buildOriginalNameMap(fullPath, key))
      } else if (item.match(/\.(md|mdx)$/)) {
        const withoutExt = item.replace(/\.(md|mdx)$/, '')
        const normalized = sanitizeSlugPart(withoutExt)
        const key = prefix ? `${prefix}/${normalized}` : normalized
        map[key] = withoutExt
      }
    }
  } catch (error) {
    console.error('Error reading vault directory:', error)
  }

  return map
}

// Build the map once at module load for performance
let originalNameMap = buildOriginalNameMap(VAULT_CONTENT_PATH)
let metadataOnlyFolderNoteSlugs = buildMetadataOnlyFolderNoteSlugSet(VAULT_CONTENT_PATH)

function getOriginalVaultPath(entryId: string): string {
  const parts = entryId.split('/')
  const originalParts: string[] = []
  const normalizedParts: string[] = []

  for (const part of parts) {
    normalizedParts.push(sanitizeSlugPart(part))
    const lookupKey = normalizedParts.join('/')
    originalParts.push(originalNameMap[lookupKey] ?? part)
  }

  return originalParts.join('/')
}

function getVaultSourceCandidates(entryId: string): string[] {
  const originalPath = getOriginalVaultPath(entryId)
  const basePaths = [...new Set([entryId, originalPath])]

  return basePaths.flatMap((path) => [
    `${VAULT_CONTENT_PATH}/${path}/index.md`,
    `${VAULT_CONTENT_PATH}/${path}/index.mdx`,
    `${VAULT_CONTENT_PATH}/${path}/README.md`,
    `${VAULT_CONTENT_PATH}/${path}/README.mdx`,
    `${VAULT_CONTENT_PATH}/${path}`,
    `${VAULT_CONTENT_PATH}/${path}.md`,
    `${VAULT_CONTENT_PATH}/${path}.mdx`
  ])
}

function resolveVaultEntrySourcePath(entryId: string): string | null {
  for (const candidate of getVaultSourceCandidates(entryId)) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }

  return null
}

function isFolderNote(entryId: string): boolean {
  const sourcePath = resolveVaultEntrySourcePath(entryId)
  return sourcePath ? /\/(index|README)\.(md|mdx)$/i.test(sourcePath) : false
}

//  Convert entry ID to URL-safe slug
export function normalizeVaultSlug(id: string): string {
  return id
    .replace(/\.(md|mdx)$/, '')
    .split('/')
    .map(sanitizeSlugPart)
    .join('/')
}

/**
 * Get a human-readable folder path from a vault entry id.
 * Uses the original name map when available to preserve casing/symbols.
 */
export function getVaultFolderDisplayPathFromEntryId(entryId: string): string {
  const parts = entryId.split('/')
  const folderParts = parts.slice(0, -1)

  if (folderParts.length === 0) return 'Root'

  const displayParts: string[] = []
  const normalizedPathParts: string[] = []

  for (const part of folderParts) {
    const normalizedPart = sanitizeSlugPart(part)
    normalizedPathParts.push(normalizedPart)
    const lookupKey = normalizedPathParts.join('/')
    const original = originalNameMap[lookupKey]

    displayParts.push(
      original ??
        part
          .replace(/[-_]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/\b\w/g, (char) => char.toUpperCase())
    )
  }

  return displayParts.join(' / ')
}

/**
 * Get vault entries with normalized slugs and auto-generated titles
 * - Adds `slug` property (for URLs)
 * - Auto-generates `title` from filename if missing in frontmatter
 * - Preserves original casing/symbols in titles via originalNameMap
 * - Filters out unpublished notes in production (publish: false)
 */
export async function getEnrichedVaultCollection(
  options: GetEnrichedVaultCollectionOptions = {}
): Promise<EnrichedVaultEntry[]> {
  if (!prod) {
    originalNameMap = buildOriginalNameMap(VAULT_CONTENT_PATH)
    metadataOnlyFolderNoteSlugs = buildMetadataOnlyFolderNoteSlugSet(VAULT_CONTENT_PATH)
  }
  const { includeUnlinkable = false, type } = options
  const vault = await getCollection('vault', ({ data }) => {
    // In production, filter out unpublished notes
    const published = prod ? data.publish !== false : true
    if (!published) return false

    if (type) {
      const typeArray = Array.isArray(type) ? type : [type]
      return typeArray.some(t => data.type.includes(t))
    }

    return true
  })

  const enriched = vault.map((entry): EnrichedVaultEntry => {
    const slug = normalizeVaultSlug(entry.id)
    const isFolder = isFolderNote(entry.id)
    const isMetadataOnly = metadataOnlyFolderNoteSlugs.has(slug)

    // Auto-generate title if missing
    if (!entry.data.title) {
      entry.data.title =
        originalNameMap[slug] ||
        entry.id
          .split('/')
          .pop()
          ?.replace(/\.(md|mdx)$/, '')
          .replace(/[-_]/g, ' ') ||
        slug
    }

    return {
      ...entry,
      slug,
      isFolderNote: isFolder,
      isMetadataOnlyFolderNote: isMetadataOnly,
      isLinkable: !isMetadataOnly
    }
  })

  return includeUnlinkable ? enriched : enriched.filter((entry) => entry.isLinkable)
}

/**
 * Build hierarchical tree structure from flat vault entries
 * - Handles folder notes (index.md/README.md)
 * - Preserves original names for display
 * - Sorts by order, then folders first, then alphabetically
 */
export async function getVaultTree(): Promise<VaultNode[]> {
  const entries = await getEnrichedVaultCollection({ includeUnlinkable: true, type: 'vault' })
  const root: VaultTreeBranch = {
    title: 'Root',
    children: Object.create(null),
    order: DEFAULT_VAULT_ORDER
  }

  for (const entry of entries) {
    const parts = entry.id.split('/')
    const filename = parts[parts.length - 1]
    const isIndex = entry.isFolderNote
    const hasBodyContent = !entry.isMetadataOnlyFolderNote
    const pathParts = isIndex ? parts : [...parts.slice(0, -1), filename.replace(/\.(md|mdx)$/, '')]

    let current = root
    let accumulatedPath: string[] = []

    for (const part of pathParts) {
      const normalizedPart = sanitizeSlugPart(part)
      accumulatedPath.push(normalizedPart)

      if (!current.children[part]) {
        const lookupKey = accumulatedPath.join('/')
        current.children[part] = {
          title: originalNameMap[lookupKey] || getFallbackTitle(part),
          children: Object.create(null),
          order: DEFAULT_VAULT_ORDER
        }
      }
      current = current.children[part]
    }

    current.entry = entry
    current.showLink = !isIndex || hasBodyContent
    if (entry.data.title) current.title = entry.data.title
    if (entry.data.order !== undefined) current.order = entry.data.order
  }

  const buildList = (childrenMap: Record<string, VaultTreeBranch>): VaultNode[] => {
    return Object.values(childrenMap)
      .map((node) => ({
        title: node.title,
        slug: node.entry?.slug,
        children: buildList(node.children),
        order: node.order,
        entry: node.entry,
        showLink: node.showLink ?? true
      }))
      .sort(compareVaultNodes)
  }

  return buildList(root.children)
}

/**
 * Get flattened list of all vault entries for pagination
 * Returns only entries with slugs (actual documents, not just folders)
 */
export async function getVaultFlatList(): Promise<{ title: string; slug: string }[]> {
  const tree = await getVaultTree()
  const list: { title: string; slug: string }[] = []

  const traverse = (nodes: VaultNode[]) => {
    for (const node of nodes) {
      if (node.slug && node.showLink !== false) list.push({ title: node.title, slug: node.slug })
      if (node.children.length > 0) traverse(node.children)
    }
  }

  traverse(tree)
  return list
}

/**
 * Get all unique tags from vault entries
 */
export async function getUniqueVaultTags(): Promise<string[]> {
  const vault = await getEnrichedVaultCollection()
  const allTags = vault.flatMap((entry) => entry.data.tags ?? []).map((tag) => tag.toLowerCase())
  return [...new Set(allTags)]
}

/**
 * Get unique tags with their count from vault entries
 */
export async function getUniqueVaultTagsWithCount(options?: GetEnrichedVaultCollectionOptions): Promise<[string, number][]> {
  const vault = await getEnrichedVaultCollection(options)
  const tagMap = new Map<string, number>()

  for (const entry of vault) {
    if (entry.data.tags) {
      for (const tag of entry.data.tags) {
        const normalizedTag = tag.toLowerCase()
        tagMap.set(normalizedTag, (tagMap.get(normalizedTag) || 0) + 1)
      }
    }
  }

  return [...tagMap.entries()].sort((a, b) => b[1] - a[1])
}

function getYearFromCollection(collection: EnrichedVaultEntry): number | undefined {
  const dateStr = collection.data.updatedDate ?? collection.data.publishDate
  return dateStr ? new Date(dateStr).getFullYear() : undefined
}

export function groupCollectionsByYear(
  collections: EnrichedVaultEntry[]
): [number, EnrichedVaultEntry[]][] {
  const collectionsByYear = collections.reduce((acc, collection) => {
    const year = getYearFromCollection(collection)
    if (year !== undefined) {
      if (!acc.has(year)) {
        acc.set(year, [])
      }
      acc.get(year)?.push(collection)
    }
    return acc
  }, new Map<number, EnrichedVaultEntry[]>())

  return Array.from(collectionsByYear.entries()).sort((a, b) => b[0] - a[0])
}

export function sortMDByDate(collections: EnrichedVaultEntry[]): EnrichedVaultEntry[] {
  return collections.sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.publishDate ?? 0).valueOf()
    const bDate = new Date(b.data.updatedDate ?? b.data.publishDate ?? 0).valueOf()
    return bDate - aDate
  })
}
