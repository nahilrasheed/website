import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import AstroPureIntegration from 'astro-pure'
import { defineConfig, fontProviders } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import rehypeCallouts from 'rehype-callouts'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import remarkWikiLink from '@flowershow/remark-wiki-link'
import { globSync } from 'glob'

// Local integrations
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'
import { remarkNormalizeLinks } from './src/plugins/remark-normalize-links.ts'

const vaultFiles = globSync('./src/content/vault/**/*.{md,mdx,jpg,jpeg,png,webp,gif,svg}')
const contentFiles = vaultFiles.map((f) => f.replace(/\\/g, '/'))

/**
 * Sanitize a path segment for use in URLs - must match vault.ts sanitization
 */
function sanitizeSlugPart(part: string): string {
  return part
    .toLowerCase()
    // Remove special characters
    .replace(/[&()[\]{}]/g, '')        // Remove &, brackets, parens
    .replace(/[,;:!?@#$%^*+=|\\/<>"'`~]/g, '') // Remove punctuation
    .replace(/\s+/g, '-')             // Spaces → dashes
    .replace(/--+/g, '-')             // Multiple dashes → single
    .replace(/^-+|-+$/g, '')          // Trim dashes from ends
}

const permalinks = Object.fromEntries(
  contentFiles.map((file) => {
    // Use /vault/ prefix for markdown paths
    const relativePath = file.replace(/^src\/content\/vault\//, '')
    if (file.match(/\.(md|mdx)$/)) {
      const slug = relativePath
        .replace(/\.(md|mdx)$/, '')
        .split('/')
        .map(sanitizeSlugPart)
        .join('/')
      return [file, `/vault/${slug}`]
    }
    // For images/assets, use the dynamic vault attachment route
    return [file, `/vault/${relativePath}`] 
  })
)
// Shiki
import {
  addCollapse,
  addCopyButton,
  addLanguage,
  addTitle,
  updateStyle
} from './src/plugins/shiki-custom-transformers.ts'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from './src/plugins/shiki-official/transformers.ts'
import config from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // [Basic]
  site: process.env.SITE_URL || 'http://localhost:4321',
  // Deploy to a sub path
  // https://astro-pure.js.org/docs/setup/deployment#platform-with-base-path
  // base: '/astro-pure/',
  trailingSlash: 'never',
  // root: './my-project-directory',
  server: { host: true },

  // [Adapter]
  // https://docs.astro.build/en/guides/deploy/
  // Cloudflare Workers
  // adapter: cloudflare({
  //   imageService: 'compile',
  //   platformProxy: {
  //     enabled: true
  //   }
  // }),
  output: 'static',

  // [Assets]
  image: {
    responsiveStyles: true,
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  // [Markdown]
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkBreaks,
      remarkNormalizeLinks,
      [
        remarkWikiLink,
        {
          format: 'shortestPossible',
          files: vaultFiles,
          permalinks,
        }
      ]
    ],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ],
      rehypeCallouts
    ],
    // https://docs.astro.build/en/guides/syntax-highlighting/
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      transformers: [
        // Two copies of @shikijs/types (one under node_modules
        // and another nested under @astrojs/markdown-remark → shiki).
        // Official transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationDiff(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationHighlight(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerRemoveNotationEscape(),
        // Custom transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        updateStyle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addTitle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addLanguage(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addCopyButton(2000), // timeout in ms
        // @ts-ignore this happens due to multiple versions of shiki types
        addCollapse(15) // max lines that needs to collapse
      ]
    }
  },

  // [Integrations]
  integrations: [
    // astro-pure will automatically add sitemap, mdx & unocss
    // sitemap(),
    // mdx(),
    AstroPureIntegration(config)
  ],

  // [Experimental]
  experimental: {
    // Allow compatible editors to support intellisense features for content collection entries
    // https://docs.astro.build/en/reference/experimental-flags/content-intellisense/
    contentIntellisense: true,
    // Enable SVGO optimization for SVG assets
    // https://docs.astro.build/en/reference/experimental-flags/svg-optimization/
    svgo: true,
    // Enable font preloading and optimization
    // https://docs.astro.build/en/reference/experimental-flags/fonts/
    fonts: [
      {
        provider: fontProviders.fontshare(),
        name: 'Satoshi',
        cssVariable: '--font-satoshi',
        // Default included:
        // weights: [400],
        // styles: ["normal", "italics"],
        // subsets: ["cyrillic-ext", "cyrillic", "greek-ext", "greek", "vietnamese", "latin-ext", "latin"],
        // fallbacks: ["sans-serif"],
        styles: ['normal', 'italic'],
        weights: [400, 500],
        subsets: ['latin']
      }
    ]
  }
})
