import { z } from 'astro/zod'
import { Icons } from '../libs/icons'

// ============================================
// Constants
// ============================================

export const socialLinks = [
  'github',
  'gitlab',
  'discord',
  'youtube',
  'instagram',
  'x',
  'linkedin',
  'telegram',
  'rss',
  'email',
  'reddit',
  'bluesky',
  'tiktok',
  'weibo',
  'steam',
  'bilibili',
  'zhihu',
  'coolapk',
  'netease'
] as const

export const shareList = ['weibo', 'x', 'bluesky'] as const

// ============================================
// Schemas
// ============================================

const faviconTypeMap = {
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
}

function getExtname(pathname: string): string {
  const index = pathname.lastIndexOf('.')
  return index === -1 ? '' : pathname.slice(index)
}

function isFaviconExt(ext: string): ext is keyof typeof faviconTypeMap {
  return ext in faviconTypeMap
}

export const FaviconSchema = () =>
  z
    .string()
    .default('/favicon/favicon.svg')
    .transform((favicon, ctx) => {
      // favicon can be absolute or relative url
      const { pathname } = new URL(favicon, 'https://example.com')
      const ext = getExtname(pathname).toLowerCase()

      if (!isFaviconExt(ext)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'favicon must be a .ico, .gif, .jpg, .png, or .svg file'
        })

        return z.NEVER
      }

      return {
        href: favicon,
        type: faviconTypeMap[ext]
      }
    })
    .describe(
      'The default favicon for your site which should be a path to an image in the `public/` directory.'
    )

export const HeadConfigSchema = () =>
  z
    .array(
      z.object({
        /** Name of the HTML tag to add to `<head>`, e.g. `'meta'`, `'link'`, or `'script'`. */
        tag: z.enum(['title', 'base', 'link', 'style', 'meta', 'script', 'noscript', 'template']),
        /** Attributes to set on the tag, e.g. `{ rel: 'stylesheet', href: '/custom.css' }`. */
        attrs: z.record(z.union([z.string(), z.boolean(), z.undefined()])).default({}),
        /** Content to place inside the tag (optional). */
        content: z.string().default('')
      })
    )
    .default([])

export const HeaderMenuSchema = () =>
  z
    .array(
      z.object({
        title: z.string(),
        link: z.string()
      })
    )
    .default([
      { title: 'Blog', link: '/blog' },
      { title: 'Projects', link: '/projects' },
      { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ])
    .describe('The header menu items for your site.')

export const LocaleConfigSchema = () =>
  z.object({
    /** Html lang attribute */
    lang: z.string().default('en-US'),
    /** Head og meta locale */
    attrs: z.string().default('en_US'),
    dateLocale: z.string().default('en-US'),
    dateOptions: z
      .object({
        localeMatcher: z.enum(['best fit', 'lookup']).optional(),
        weekday: z.enum(['narrow', 'short', 'long']).optional(),
        era: z.enum(['narrow', 'short', 'long']).optional(),
        year: z.enum(['numeric', '2-digit']).optional(),
        month: z.enum(['numeric', '2-digit', 'narrow', 'short', 'long']).optional(),
        day: z.enum(['numeric', '2-digit']).optional(),
        hour: z.enum(['numeric', '2-digit']).optional(),
        minute: z.enum(['numeric', '2-digit']).optional(),
        second: z.enum(['numeric', '2-digit']).optional(),
        timeZoneName: z.enum(['short', 'long']).optional(),
        formatMatcher: z.enum(['best fit', 'basic']).optional(),
        hour12: z.boolean().optional(),
        timeZone: z.string().optional()
      })
      .default({})
  })

export const LogoConfigSchema = () =>
  z.object({
    /** Source of the image file to use. */
    src: z.string(),
    /** Alternative text description of the logo. */
    alt: z.string().default('')
  })

export const ShareSchema = () =>
  z
    .array(z.enum(shareList))
    .default(['bluesky'])
    .describe('Options for sharing content on social media platforms.')

export const SocialLinksSchema = () =>
  z
    .record(
      z.enum(socialLinks),
      // Link to the respective social profile for this site
      z.string().url()
    )
    .transform((links) => {
      const labelledLinks: Partial<Record<keyof typeof links, { label: string; url: string }>> = {}
      for (const _k in links) {
        const key = _k as keyof typeof links
        const url = links[key]
        if (!url) continue
        const label = {
          github: 'GitHub',
          gitlab: 'GitLab',
          discord: 'Discord',
          youtube: 'YouTube',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          x: 'X',
          telegram: 'Telegram',
          rss: 'RSS',
          email: 'Email',
          reddit: 'Reddit',
          bluesky: 'BlueSky',
          tiktok: 'TikTok',
          weibo: 'Weibo',
          steam: 'Steam',
          bilibili: 'Bilibili',
          zhihu: 'Zhihu',
          coolapk: 'Coolapk',
          netease: 'NetEase'
        }[key]
        labelledLinks[key] = { label, url }
      }
      return labelledLinks
    })
    .optional()

export const FriendLinksSchema = () =>
  z
    .object({
      logbook: z.array(
        z.object({
          date: z.string(),
          content: z.string()
        })
      ),
      applyTip: z.array(
        z.object({
          name: z.string(),
          val: z.string()
        })
      ),
      cacheAvatar: z.boolean().optional().default(false)
    })
    .default({
      logbook: [],
      applyTip: [
        { name: 'Name', val: 'Astro Pure' },
        { name: 'Desc', val: 'Null' },
        { name: 'Link', val: 'https://astro-pure.js.org/' },
        { name: 'Avatar', val: 'https://astro-pure.js.org/favicon/favicon.ico' }
      ],
      cacheAvatar: false
    })
    .describe('Friend links for your website.')

// ============================================
// Theme Config
// ============================================

export const ThemeConfigSchema = () =>
  z.object({
    /** Title for your website. Will be used in metadata and as browser tab title. */
    title: z
      .string()
      .describe('Title for your website. Will be used in metadata and as browser tab title.'),

    /** Will be used in index page & copyright declaration */
    author: z.string().describe('Will be used in index page & copyright declaration'),

    /** Description metadata for your website. Can be used in page metadata. */
    description: z
      .string()
      .default('Built with Astro-Pure')
      .describe('Description metadata for your website. Can be used in page metadata.'),

    /** The default favicon for your site which should be a path to an image in the `public/` directory. */
    favicon: FaviconSchema(),

    /** The default social card image for your site which should be a path to an image in the `public/` directory. */
    socialCard: z
      .string()
      .default('/images/social-card.png')
      .describe(
        'The default social card image for your site which should be a path to an image in the `public/` directory.'
      ),

    /** Set a logo image to show in the homepage. */
    logo: LogoConfigSchema(),

    /** The tagline for your website. */
    tagline: z.string().optional().describe('The tagline for your website.'),

    /**
     * Specify the default language for this site.
     *
     * The default locale will be used to provide fallback content where translations are missing.
     */
    locale: LocaleConfigSchema(),

    /**
     * Add extra tags to your site's `<head>`.
     *
     * Can also be set for a single page in a page's frontmatter.
     *
     * @example
     * // Add Fathom analytics to your site
     * starlight({
     *  head: [
     *    {
     *      tag: 'script',
     *      attrs: {
     *        src: 'https://cdn.usefathom.com/script.js',
     *        'data-site': 'MY-FATHOM-ID',
     *        defer: true,
     *      },
     *    },
     *  ],
     * })
     */
    head: HeadConfigSchema(),

    /**
     * Provide CSS files to customize the look and feel of your Starlight site.
     *
     * Supports local CSS files relative to the root of your project,
     * e.g. `'/src/custom.css'`, and CSS you installed as an npm
     * module, e.g. `'@fontsource/roboto'`.
     *
     * @example
     * starlight({
     *  customCss: ['/src/custom-styles.css', '@fontsource/roboto'],
     * })
     */
    customCss: z.string().array().optional().default([]),

    /** Will be used as title delimiter in the generated `<title>` tag. */
    titleDelimiter: z
      .string()
      .describe('Will be used as title delimiter in the generated `<title>` tag.')
      .default('•'),

    /**
     * Define whether Starlight pages should be prerendered or not.
     * Defaults to always prerender Starlight pages, even when the project is
     * set to "server" output mode.
     */
    prerender: z.boolean().default(true),

    /** The npm CDN to use for loading npm packages.
     * @example
     * npmCDN: 'https://cdn.jsdelivr.net/npm'
     * npmCDN: 'https://cdn.smartcis.cn/npm'
     * npmCDN: 'https://unkpg.com'
     * npmCDN: 'https://cdn.cbd.int'
     * npmCDN: 'https://esm.sh'
     */
    npmCDN: z
      .string()
      .default('https://esm.sh')
      .describe('The npm CDN to use for loading npm packages.'),

    /** Configure the header of your site. */
    header: z.object({
      /** The header menu items for your site.
       * @example
       * header: [
       *   { title: 'Home', link: '/' },
       *   { title: 'Blog', link: '/blog' }
       * ]
       */
      menu: HeaderMenuSchema()
    }),

    /** Configure the footer of your site. */
    footer: z.object({
      /** The footer content for your site. */
      year: z.string().describe('The footer content for your site.'),
      /** The footer links for your site. */
      links: z
        .array(
          z.object({
            /** Link title */
            title: z.string().describe('Link title'),
            /** Link URL */
            link: z.string().describe('Link URL'),
            /** Link style */
            style: z.string().optional().describe('Link style'),
            /** Link position */
            pos: z.number().default(1).describe('Link position')
          })
        )
        .optional()
        .describe('The footer links for your site.'),

      /** Enable displaying a "Astro & Pure theme powered" link in your site's footer. */
      credits: z
        .boolean()
        .default(true)
        .describe('Enable displaying a "Built with Starlight" link in your site\'s footer.'),

      /**
       * Optional details about the social media accounts for this site.
       *
       * @example
       * social: {
       *   discord: 'https://astro.build/chat',
       *   github: 'https://github.com/withastro/starlight',
       *   gitlab: 'https://gitlab.com/delucis',
       *   threads: 'https://www.threads.net/@nmoodev',
       *   twitch: 'https://www.twitch.tv/bholmesdev',
       *   twitter: 'https://twitter.com/astrodotbuild',
       *   youtube: 'https://youtube.com/@astrodotbuild',
       * }
       */
      social: SocialLinksSchema()
    }),

    content: z.object({
      externalLinks: z.object({
        /** Content to show for external links */
        content: z.string().optional().default(' ↗').describe('Content to show for external links'),
        /** Properties for the external links element */
        properties: z
          .record(z.string())
          .optional()
          .describe('Properties for the external links element')
      }),

      /** Blog page size for pagination */
      blogPageSize: z.number().optional().default(8),

      /** Share buttons to show */
      share: ShareSchema()
    })
  })

export type ThemeUserConfig = z.input<ReturnType<typeof ThemeConfigSchema>>
export type ThemeConfig = z.infer<ReturnType<typeof ThemeConfigSchema>>

// ============================================
// Integration Config
// ============================================

export const IntegrationConfigSchema = () =>
  z.object({
    links: FriendLinksSchema(),

    /**
     * Define whether default site search provider Pagefind is enabled.
     * Set to `false` to disable indexing your site with Pagefind.
     * This will also hide the default search UI if in use.
     */
    pagefind: z.boolean().optional(),

    /**
     * Add a random quote to the footer (default on homepage footer).
     * The quote will be fetched from the specified server and the target will be replaced with the quote.
     */
    quote: z.object({
      /** The server to fetch the quote from. */
      server: z.string(),
      /** target: string, but (data: unknown) => string */
      target: z.string()
    }),

    /** UnoCSS typography */
    typography: z.object({
      /** The class to apply to the typography. */
      class: z
        .string()
        .default('prose prose-pure dark:prose-invert dark:prose-pure prose-headings:font-medium'),
      /** The style of blockquote font, normal or italic. */
      blockquoteStyle: z.enum(['normal', 'italic']).default('italic'),
      /** The style of inline code block, code or modern. */
      inlineCodeBlockStyle: z.enum(['code', 'modern']).default('modern')
    }),

    /** A lightbox library that can add zoom effect */
    mediumZoom: z.object({
      /** Enable the medium zoom library. */
      enable: z.boolean().default(true),
      /** The selector to apply the zoom effect to. */
      selector: z.string().default('.prose .zoomable'),
      /** Options to pass to the medium zoom library. */
      options: z.record(z.string(), z.any()).default({ className: 'zoomable' })
    }),

    /** The Waline comment system */
    waline: z.object({
      /** Enable the Waline comment system. */
      enable: z.boolean().default(false),
      /** The server to use for the Waline comment system. */
      server: z.string().optional(),
      /** Show meta info for comments */
      showMeta: z.boolean().default(true),
      /** The emoji to use for the Waline comment system. */
      emoji: z.array(z.string()).optional(),
      /** Additional configurations for the Waline comment system. */
      additionalConfigs: z.record(z.string(), z.any()).default({})
    })
  })

export type IntegrationConfig = z.infer<ReturnType<typeof IntegrationConfigSchema>>
export type IntegrationUserConfig = z.input<ReturnType<typeof IntegrationConfigSchema>>

// ============================================
// User Config (Complete Config)
// ============================================

export const UserConfigSchema = ThemeConfigSchema()
  .strict()
  .merge(
    z.object({
      integ: IntegrationConfigSchema()
    })
  )
  .transform((config) => ({
    ...config,
    // Pagefind only defaults to true if prerender is also true.
    integ: {
      ...config.integ,
      pagefind: config.integ.pagefind ?? config.prerender
    }
  }))
  .refine((config) => !(config.integ.pagefind && !config.prerender), {
    message: 'Pagefind search is not supported with prerendering disabled.'
  })

export type UserConfig = z.infer<typeof UserConfigSchema>
export type UserInputConfig = z.input<typeof UserConfigSchema>
export type Config = UserInputConfig
export type ConfigOutput = UserConfig

// ============================================
// Additional Types
// ============================================

export interface SiteMeta {
  title: string
  description?: string
  ogImage?: string | undefined
  articleDate?: string | undefined
}

export type CardListData = {
  title: string
  list: CardList
}

export type CardList = {
  title: string
  link?: string
  children?: CardList
}[]

export type TimelineEvent = {
  date: string
  content: string
}

export type iconsType = keyof typeof Icons

export type HeadUserConfig = z.input<ReturnType<typeof HeadConfigSchema>>
export type HeadConfig = z.output<ReturnType<typeof HeadConfigSchema>>

export type LogoUserConfig = z.input<ReturnType<typeof LogoConfigSchema>>
export type LogoConfig = z.output<ReturnType<typeof LogoConfigSchema>>

export type LocaleConfig = z.output<ReturnType<typeof LocaleConfigSchema>>
