import type { RemarkPlugin } from '@astrojs/markdown-remark'
import path from 'node:path'
import { visit } from 'unist-util-visit'
import type { VaultLinkIndex } from '@/utils/vault-link-index'

const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|#)/i

function getSourcePath(filePath: string | undefined): string {
  const marker = '/src/content/vault/'
  const normalized = filePath?.replace(/\\/g, '/') ?? ''
  const index = normalized.indexOf(marker)
  return index === -1 ? '' : normalized.slice(index + marker.length)
}

function imageMetadata(value: string) {
  const [target, ...metadata] = value.split('|')
  const dimension = metadata.find((part) => /^\d+(?:x\d+)?$/.test(part))
  const [width, height] = dimension?.split('x').map(Number) ?? []
  return { alt: metadata.filter((part) => part !== dimension).join('|'), height, target, width }
}

export const remarkResolveVaultLinks = (index: VaultLinkIndex): RemarkPlugin => () => (tree, file) => {
  const source = getSourcePath(file.path)
  visit(tree, (node: any) => {
    if (node.type === 'link' || node.type === 'image') {
      if (!node.url || EXTERNAL.test(node.url)) return
      try {
        node.url = index.resolve({ source, target: node.url, kind: node.type === 'image' ? 'media' : 'note' }).url
      } catch {
        // Preserve unresolved authored links until their target exists.
      }
      return
    }
    if (node.type !== 'wikiLink' && node.type !== 'embed') return
    const metadata = imageMetadata(String(node.value ?? ''))
    let resolution
    try {
      resolution = index.resolve({ source, target: metadata.target, kind: node.type === 'embed' ? 'media' : 'note' })
    } catch {
      return
    }
    node.data ??= {}
    node.data.hProperties ??= {}
    if (node.type === 'embed') {
      node.data.hName = 'img'
      Object.assign(node.data.hProperties, {
        alt: metadata.alt || path.posix.basename(resolution.sourcePath).replace(/\.[^.]+$/, ''),
        height: metadata.height || undefined,
        src: resolution.url,
        width: metadata.width || undefined
      })
    } else {
      node.data.hName = 'a'
      node.data.hProperties.href = resolution.url
    }
  })
}
