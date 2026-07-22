import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { APIRoute, GetStaticPaths } from 'astro'
import { createVaultLinkIndex } from '@/utils/vault-link-index'

const index = createVaultLinkIndex()
const CONTENT_ROOT = path.join(process.cwd(), 'src/content/vault')
const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
}

export const getStaticPaths: GetStaticPaths = () =>
  index.files
    .filter((file) => index.getAsset(file))
    .map((file) => ({ params: { path: file } }))

export const GET: APIRoute = ({ params }) => {
  const sourcePath = params.path?.split('/').map(decodeURIComponent).join('/') ?? ''
  const asset = index.getAsset(sourcePath)
  if (!asset) return new Response('Not Found', { status: 404 })

  const extension = path.extname(asset.sourcePath).toLowerCase()
  return new Response(new Uint8Array(readFileSync(path.join(CONTENT_ROOT, asset.sourcePath))), {
    headers: { 'Content-Type': MIME_TYPES[extension] ?? 'application/octet-stream' }
  })
}
