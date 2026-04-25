import { getEnrichedVaultCollection, normalizeVaultSlug } from '@/utils/vault'

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

export async function getVaultGraphData(): Promise<GraphData> {
  if (cachedGraphData && import.meta.env.PROD) return cachedGraphData

  // Only include vault-type entries; blog posts are served under /blog and have their own route
  const entries = await getEnrichedVaultCollection({ type: 'note' })
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  
  const backlinksMap: Record<string, Set<string>> = {}
  const linksMap: Record<string, Set<string>> = {}

  // 1. Create a set of all valid slugs we can link to
  const validSlugs = new Set(entries.map(e => e.slug))

  // Precompute basename -> matching slugs map for O(1) fallback lookups
  const basenameMap = new Map<string, string[]>()
  for (const slug of validSlugs) {
    const basename = slug.split('/').pop()
    if (!basename) continue
    const existing = basenameMap.get(basename)
    if (existing) existing.push(slug)
    else basenameMap.set(basename, [slug])
  }

  // Helper to init sets and add links
  const addLink = (source: string, target: string) => {
    if (!linksMap[source]) linksMap[source] = new Set()
    if (!backlinksMap[target]) backlinksMap[target] = new Set()
    linksMap[source].add(target)
    backlinksMap[target].add(source)
  }

  // 2. Extract links
  for (const entry of entries) {
    const sourceSlug = entry.slug
    
    nodes.push({
      id: sourceSlug,
      name: entry.data.title || sourceSlug,
      group: (entry.data.tags?.length ? (entry.data.tags[0]?.toLowerCase() ?? 'note') : (sourceSlug.split('/')[0] || 'note')) as string,
      val: 2
    })

    if (!entry.body) continue

    // Find wikilinks [[Link]] or [[Link|Alias]]
    const wikiLinkRegex = /\[\[(.*?)\]\]/g
    let match
    while ((match = wikiLinkRegex.exec(entry.body)) !== null) {
      const inner = match[1]
      const target = inner.split('|')[0].trim() // use actual target, ignore alias
      const targetSlug = normalizeVaultSlug(target)
      
      // If it's a valid targeted file
      if (validSlugs.has(targetSlug)) {
        addLink(sourceSlug, targetSlug)
      } else {
        // Wikilinks sometimes omit the folder path; use precomputed map for O(1) basename lookup
        const possibleTargets = basenameMap.get(targetSlug)
        if (possibleTargets?.length === 1) {
           addLink(sourceSlug, possibleTargets[0])
        }
      }
    }

    // Find standard markdown links [text](./path/to/note)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)"]+)(?: "[^"]*")?\)/g
    let mdMatch
    while ((mdMatch = mdLinkRegex.exec(entry.body)) !== null) {
      const href = mdMatch[2].trim()
      // Skip external links and anchors
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) continue
      
      const cleanHref = href.split('#')[0].split('?')[0]
      if (!cleanHref) continue
      
      // Clean relative paths
      const resolved = normalizeVaultSlug(cleanHref.replace(/^(?:\.\.\/)+|^(?:\.\/)+/, ''))
      if (validSlugs.has(resolved)) {
        addLink(sourceSlug, resolved)
      } else {
        // Try to match just the base name; use precomputed map for O(1) lookup
        const baseName = cleanHref.split('/').pop() || ''
        const baseSlug = normalizeVaultSlug(baseName)
        const possibleTargets = basenameMap.get(baseSlug)
        if (possibleTargets?.length === 1) {
           addLink(sourceSlug, possibleTargets[0])
        }
      }
    }
  }

  // 3. Compile final arrays
  for (const source in linksMap) {
    for (const target of linksMap[source]) {
      links.push({ source, target })
    }
  }

  // Convert Sets to Arrays
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
