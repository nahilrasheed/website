import { getCollection } from 'astro:content'
import type { CollectionEntry } from 'astro:content'

export type VaultEntry = CollectionEntry<'vault'>

export interface VaultNode {
  title: string
  slug?: string
  children: VaultNode[]
  order: number
  entry?: VaultEntry
  active?: boolean // runtime state
  isOpen?: boolean // runtime state
}

export function normalizeVaultSlug(id: string): string {
  return id
    .replace(/\.(md|mdx)$/, '')
    .split('/')
    .map((part) => part.toLowerCase().replace(/\s+/g, '-').replace(/--+/g, '-'))
    .join('/')
}

export function formatVaultTitle(segment: string): string {
  // Remove extension
  const name = segment.replace(/\.(md|mdx)$/, '')
  
  // Split by separators
  return name.split(/[-_\s]+/)
    .map(word => {
        // Only capitalize if it's all lowercase (e.g. "ipad" -> "Ipad" is usually not desired if mixed, but "active" -> "Active" is)
        // Better heuristic: if it's all lower, Title Case it. If it has any upper, keep it as is.
        if (/^[a-z0-9]+$/.test(word)) {
            return word.charAt(0).toUpperCase() + word.slice(1)
        }
        return word
    })
    .join(' ')
}

/**
 * Helper to get vault collection with default titles applied from filenames
 */
export async function getEnrichedVaultCollection() {
  const vault = await getCollection('vault')
  return vault
    .filter(entry => entry.data.publish !== false)
    .map(entry => {
        if (!entry.data.title) {
            const fileName = entry.id.split('/').pop() || entry.id
            entry.data.title = formatVaultTitle(fileName)
        }
        return entry
    })
}

export async function getVaultTree(): Promise<VaultNode[]> {
  const entries = await getEnrichedVaultCollection()
  
  // Root node container
  const root: any = { children: {} }

  for (const entry of entries) {
    const parts = entry.id.split('/')
    const filename = parts[parts.length - 1]
    
    // Check for index/README pattern
    const isIndex = filename.match(/^(index|README)\.(md|mdx)$/i)
    
    // Determine the path needed to traverse to the node
    // If it's index, it belongs to the parent folder.
    // If it's regular file, it belongs to a node matching its name.
    
    // Example: "foo/bar.md" -> traverse "foo", then target "bar"
    // Example: "foo/bar/index.md" -> traverse "foo", target "bar"
    
    // So the path parts are the same either way, minus the extension for the file.
    // Except "index.md" should be stripped entirely?
    
    let pathParts: string[]
    if (isIndex) {
        pathParts = parts.slice(0, -1)
    } else {
        const nameWithoutExt = filename.replace(/\.(md|mdx)$/, '')
        pathParts = [...parts.slice(0, -1), nameWithoutExt]
    }

    let current = root
    
    for (const part of pathParts) {
      if (!current.children[part]) {
        current.children[part] = {
          title: formatVaultTitle(part), // Fallback title
          children: {},
          order: 999
        }
      }
      current = current.children[part]
    }
    
    // Now 'current' is the node. Assign data.
    current.entry = entry
    if (entry.data.title) {
        current.title = entry.data.title
    }
    if (entry.data.order !== undefined) {
        current.order = entry.data.order
    }
  }

  // Recursive converter
  const buildList = (childrenMap: Record<string, any>): VaultNode[] => {
    return Object.values(childrenMap).map((node: any) => {
       const slug = node.entry ? normalizeVaultSlug(node.entry.id) : undefined
       return {
         title: node.title,
         slug,
         children: buildList(node.children),
         order: node.order,
         entry: node.entry
       }
    }).sort((a, b) => {
        // Sort by order
        if (a.order !== b.order) return a.order - b.order
        
        // Sort folders first
        const aIsFolder = a.children.length > 0
        const bIsFolder = b.children.length > 0
        if (aIsFolder && !bIsFolder) return -1
        if (!aIsFolder && bIsFolder) return 1
        
        // Sort by title
        return a.title.localeCompare(b.title)
    })
  }

  return buildList(root.children)
}

export async function getVaultFlatList(): Promise<{ title: string; slug: string }[]> {
  const tree = await getVaultTree()
  const list: { title: string; slug: string }[] = []

  const traverse = (nodes: VaultNode[]) => {
    for (const node of nodes) {
      if (node.slug) {
        list.push({ title: node.title, slug: node.slug })
      }
      if (node.children.length > 0) {
        traverse(node.children)
      }
    }
  }

  traverse(tree)
  return list
}
