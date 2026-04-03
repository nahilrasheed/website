import type { AstroGlobal, ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import type { CollectionEntry } from 'astro:content'
import rss from '@astrojs/rss'
import type { Root } from 'mdast'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { getEnrichedVaultCollection, sortMDByDate, getVaultFolderDisplayPathFromEntryId } from '@/utils/vault'
import type { EnrichedVaultEntry } from '@/utils/vault'
import config from '@/site.config'

// Get dynamic import of images as a map collection
const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/vault/**/*.{jpeg,jpg,png,gif,avif,webp}' // add more image formats if needed
)

const renderBlogContent = async (post: EnrichedVaultEntry, site: URL) => {
  // Replace image links with the correct path
  function remarkReplaceImageLink() {
    /**
     * @param {Root} tree
     */
    return async (tree: Root) => {
      const promises: Promise<void>[] = []
      visit(tree, 'image', (node) => {
        if (node.url.startsWith('/images')) {
          node.url = `${site}${node.url.replace('/', '')}`
        } else {
          const imagePathPrefix = `/src/content/vault/${post.id}/${node.url.replace('./', '')}`
          const promise = imagesGlob[imagePathPrefix]?.().then(async (res) => {
            const imagePath = res?.default
            if (imagePath) {
              node.url = `${site}${(await getImage({ src: imagePath })).src.replace('/', '')}`
            }
          })
          if (promise) promises.push(promise)
        }
      })
      await Promise.all(promises)
    }
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkReplaceImageLink)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(post.body)

  return String(file)
}

const renderVaultContent = async (entry: CollectionEntry<'vault'>) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(entry.body)

  return String(file)
}

interface FeedItem {
  title: string
  description?: string
  link: string
  pubDate?: Date
  content: string
  customData?: string
}

function sortFeedItemsByDate(items: FeedItem[]): FeedItem[] {
  return items.sort((a, b) => (b.pubDate?.valueOf() ?? 0) - (a.pubDate?.valueOf() ?? 0))
}

const GET = async (context: AstroGlobal) => {
  const allPostsByDate = sortMDByDate(await getEnrichedVaultCollection({ type: 'post' }))
  const allVaultEntries = await getEnrichedVaultCollection({ type: 'vault' })
  const siteUrl = context.site ?? new URL(import.meta.env.SITE)

  const blogItems: FeedItem[] = await Promise.all(
    allPostsByDate.map(async (post) => {
      const heroSrc =
        typeof post.data.heroImage?.src === 'string'
          ? post.data.heroImage.src
          : post.data.heroImage?.src.src

      return {
        title: `[Blog] ${post.data.title}`,
        description: post.data.description,
        pubDate: post.data.publishDate,
        link: `/blog/${post.slug || post.id}`,
        customData: heroSrc
          ? `<h:img src="${heroSrc}" /><enclosure url="${heroSrc}" />`
          : undefined,
        content: await renderBlogContent(post, siteUrl)
      }
    })
  )

  const vaultItems: FeedItem[] = await Promise.all(
    allVaultEntries.map(async (entry) => {
      const title = entry.data.title ?? entry.id.split('/').pop()?.replace(/\.(md|mdx)$/, '') ?? entry.id
      const folderPath = getVaultFolderDisplayPathFromEntryId(entry.id)
      return {
        title: `[Vault: ${folderPath}] ${title}`,
        description: entry.data.description ?? title,
        pubDate: entry.data.updatedDate ?? entry.data.publishDate,
        link: `/vault/${entry.slug}`,
        content: await renderVaultContent(entry)
      }
    })
  )

  const items = sortFeedItemsByDate([...blogItems, ...vaultItems])

  return rss({
    // Basic configs
    trailingSlash: false,
    xmlns: { h: 'http://www.w3.org/TR/html4/' },
    stylesheet: '/scripts/pretty-feed-v3.xsl',

    // Contents
    title: config.title,
    description: config.description,
    site: import.meta.env.SITE,
    items
  })
}

export { GET }
