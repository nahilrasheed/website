import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { getEnrichedVaultCollection } from '@/utils/vault'
import { createVaultLinkIndex } from '@/utils/vault-link-index'
import type { VaultLinkIndex } from '@/utils/vault-link-index'

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|#)/i

export interface GraphNode {
  id: string
  name: string
  val: number
  group: string
}

export interface GraphLink {
  source: string
  target: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  backlinksMap: Record<string, string[]> // targetSlug -> array of sourceSlugs
  linksMap: Record<string, string[]> // sourceSlug -> array of targetSlugs
}

// Cache in-memory for static builds
let cachedGraphData: GraphData | null = null
let vaultIndex: VaultLinkIndex | null = null

function getVaultIndex(): VaultLinkIndex {
  if (!vaultIndex) vaultIndex = createVaultLinkIndex()
  return vaultIndex
}

function resolveLink(source: string, target: string, kind: 'note' | 'media'): string | undefined {
  try {
    const resolution = getVaultIndex().resolve({ source, target, kind })
    return resolution.url.replace(/^\/vault\//, '')
  } catch {
    return undefined
  }
}

export async function getVaultGraphData(): Promise<GraphData> {
  if (cachedGraphData && import.meta.env.PROD) return cachedGraphData

  const entries = await getEnrichedVaultCollection()
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  const backlinksMap: Record<string, Set<string>> = {}
  const linksMap: Record<string, Set<string>> = {}

  // Helper to init sets and add links
  const addLink = (source: string, target: string) => {
    if (!linksMap[source]) linksMap[source] = new Set()
    if (!backlinksMap[target]) backlinksMap[target] = new Set()
    linksMap[source].add(target)
    backlinksMap[target].add(source)
  }

  const parser = unified().use(remarkParse)

  for (const entry of entries) {
    const sourceSlug = entry.slug

    nodes.push({
      id: sourceSlug,
      name: entry.data.title || sourceSlug,
      group: (entry.data.tags?.length
        ? (entry.data.tags[0]?.toLowerCase() ?? 'note')
        : sourceSlug.split('/')[0] || 'note') as string,
      val: 2
    })

    if (!entry.body) continue

    const tree = parser.parse(entry.body)

    visit(tree, (node: any) => {
      let target: string | undefined

      if (node.type === 'link' || node.type === 'image') {
        if (!node.url || EXTERNAL.test(node.url)) return
        target = node.url.split('#')[0].split('?')[0]
        if (!target) return
      } else if (node.type === 'wikiLink' || node.type === 'embed') {
        const inner = String(node.value ?? '')
        target = inner.split('|')[0].split('#')[0].trim()
        if (!target) return
      } else {
        return
      }

      const kind = node.type === 'image' || node.type === 'embed' ? 'media' : 'note'
      const resolved = resolveLink(sourceSlug, target, kind)
      if (resolved) addLink(sourceSlug, resolved)
    })
  }

  // Compile final arrays
  for (const source in linksMap) {
    for (const target of linksMap[source]) {
      links.push({ source, target })
    }
  }

  const finalLinksMap: Record<string, string[]> = {}
  const finalBacklinksMap: Record<string, string[]> = {}

  for (const k in linksMap) finalLinksMap[k] = Array.from(linksMap[k])
  for (const k in backlinksMap) finalBacklinksMap[k] = Array.from(backlinksMap[k])

  // Increase node value based on backlink count to make heavily linked nodes bigger
  for (const node of nodes) {
    node.val = 2 + (finalBacklinksMap[node.id]?.length || 0) * 0.5
  }

  cachedGraphData = {
    nodes,
    links,
    backlinksMap: finalBacklinksMap,
    linksMap: finalLinksMap
  }

  return cachedGraphData
}
