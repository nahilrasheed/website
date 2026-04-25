import type { APIRoute } from 'astro'
import { getVaultGraphData } from '@/utils/graph'

export const prerender = true

export const GET: APIRoute = async () => {
  const { nodes, links } = await getVaultGraphData()
  return new Response(JSON.stringify({ nodes, links }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
