import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export type VaultEntry = CollectionEntry<'vault'>

export const prod = import.meta.env.PROD

export interface VaultNode {
  title: string
  slug?: string
  children: VaultNode[]
  order: number
  entry?: VaultEntry
  active?: boolean
  isOpen?: boolean
}

//  Sanitize a path segment for URLs
function sanitizeSlugPart(part: string): string {
  return part
    .toLowerCase()
    .replace(/[&()[\]{}]/g, '')                       // Remove &, brackets, parens
    .replace(/[,;:!?@#$%^*+=|\\/<>"'`~]/g, '')        // Remove punctuation
    .replace(/\s+/g, '-')                             // Spaces → dashes
    .replace(/--+/g, '-')                             // Multiple dashes → single
    .replace(/^-+|-+$/g, '')                          // Trim edge dashes
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
const originalNameMap = buildOriginalNameMap('./src/content/vault')

//  Convert entry ID to URL-safe slug
export function normalizeVaultSlug(id: string): string {
  return id
    .replace(/\.(md|mdx)$/, '')
    .split('/')
    .map(sanitizeSlugPart)
    .join('/')
}

/**
 * Get vault entries with normalized slugs and auto-generated titles
 * - Adds `slug` property (for URLs)
 * - Auto-generates `title` from filename if missing in frontmatter
 * - Preserves original casing/symbols in titles via originalNameMap
 * - Filters out unpublished notes in production (publish: false)
 */
export async function getEnrichedVaultCollection() {
  const vault = await getCollection('vault', ({ data }) => {
    // In production, filter out unpublished notes
    return prod ? data.publish !== false : true
  })
  return vault
    .map(entry => {
        const slug = normalizeVaultSlug(entry.id)
        
        // Auto-generate title if missing
        if (!entry.data.title) {
            entry.data.title = originalNameMap[slug] || 
                               entry.id.split('/').pop()?.replace(/\.(md|mdx)$/, '').replace(/[-_]/g, ' ') ||
                               slug
        }
        
        return { ...entry, slug }
    })
}

/**
 * Build hierarchical tree structure from flat vault entries
 * - Handles folder notes (index.md/README.md)
 * - Preserves original names for display
 * - Sorts by order, then folders first, then alphabetically
 */
export async function getVaultTree(): Promise<VaultNode[]> {
  const entries = await getEnrichedVaultCollection()
  const root: any = { children: {} }

  for (const entry of entries) {
    const parts = entry.id.split('/')
    const filename = parts[parts.length - 1]
    
    // Check for folder note pattern (index.md or README.md)
    const isIndex = /^(index|readme)\.(md|mdx)$/i.test(filename)
    
    // Build path: "foo/bar/index.md" → ["foo", "bar"], "foo/bar.md" → ["foo", "bar"]
    const pathParts = isIndex 
      ? parts.slice(0, -1)
      : [...parts.slice(0, -1), filename.replace(/\.(md|mdx)$/, '')]

    let current = root
    let accumulatedPath: string[] = []
    
    // Traverse/create tree nodes
    for (const part of pathParts) {
      const normalizedPart = sanitizeSlugPart(part)
      accumulatedPath.push(normalizedPart)
      
      if (!current.children[part]) {
        const lookupKey = accumulatedPath.join('/')
        current.children[part] = {
          title: originalNameMap[lookupKey] || part.replace(/[-_]/g, ' '),
          children: {},
          order: 999
        }
      }
      current = current.children[part]
    }
    
    // Attach entry data to leaf node
    current.entry = entry
    if (entry.data.title) current.title = entry.data.title
    if (entry.data.order !== undefined) current.order = entry.data.order
  }

  // Convert nested object to sorted array structure
  const buildList = (childrenMap: Record<string, any>): VaultNode[] => {
    return Object.values(childrenMap).map((node: any) => ({
       title: node.title,
       slug: node.entry?.slug,
       children: buildList(node.children),
       order: node.order,
       entry: node.entry
    })).sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        const aIsFolder = a.children.length > 0
        const bIsFolder = b.children.length > 0
        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1
        return a.title.localeCompare(b.title)
    })
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
      if (node.slug) list.push({ title: node.title, slug: node.slug })
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
  const allTags = vault
    .flatMap(entry => entry.data.tags ?? [])
    .map(tag => tag.toLowerCase())
  return [...new Set(allTags)]
}

/**
 * Get unique tags with their count from vault entries
 */
export async function getUniqueVaultTagsWithCount(): Promise<[string, number][]> {
  const vault = await getEnrichedVaultCollection()
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
