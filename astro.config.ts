import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import remarkWikiLink from '@flowershow/remark-wiki-link'
import { defineConfig, fontProviders } from 'astro/config'
import rehypeCallouts from 'rehype-callouts'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'

// Local integrations
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'
import rehypeExternalLinks from './src/plugins/rehype-external-links.ts'
import rehypeTable from './src/plugins/rehype-table.ts'
import { remarkResolveVaultLinks } from './src/plugins/remark-resolve-vault-links.ts'
import { remarkAddZoomable, remarkReadingTime } from './src/plugins/remark-plugins.ts'
import { createVaultLinkIndex } from './src/utils/vault-link-index.ts'
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

const vaultLinkIndex = createVaultLinkIndex()
const vaultFiles = vaultLinkIndex.files

const permalinks = vaultLinkIndex.permalinks

// https://astro.build/config
export default defineConfig({
  // [Basic]
  site: 'https://nahil.xyz/',
  // Deploy to a sub path
  // base: '/website/',
  trailingSlash: 'ignore',
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

  // [Fonts]
  fonts: [
    {
      provider: fontProviders.fontshare(),
      name: 'Satoshi',
      cssVariable: '--font-satoshi',
      styles: ['normal', 'italic'],
      weights: [400, 500],
      subsets: ['latin']
    }
  ],

  // [Markdown]
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkMath,
        remarkBreaks,
        [
          remarkWikiLink,
          {
            format: 'shortestPossible',
            files: vaultFiles,
            permalinks,
            wikiLinkClassName: 'internal',
            newClassName: 'new'
          }
        ],
        remarkResolveVaultLinks(vaultLinkIndex),
        [remarkAddZoomable, config.integ.mediumZoom.options],
        remarkReadingTime
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
        rehypeCallouts,
        [
          rehypeExternalLinks,
          {
            content: { type: 'text', value: config.content.externalLinks.content },
            contentProperties: config.content.externalLinks.properties
          }
        ],
        rehypeTable
      ]
    }),
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
  integrations: [mdx({ optimize: true }), sitemap(), UnoCSS({ injectReset: true })]
})
