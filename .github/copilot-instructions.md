# Copilot Instructions for Personal Website

## Architecture Overview

This is a **standalone Astro static site** inspired by [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure), combining a blog with Obsidian-compatible vault integration. Deployed on Cloudflare Pages with Wrangler.

### Key Design Patterns

1. **Content Collections** ([src/content.config.ts](src/content.config.ts)):
   - `blog`: Strict schema requiring `title`, `description`, `publishDate`, optional `tags`, `heroImage`, `draft`
   - `vault`: Flexible schema for Obsidian notes with auto-generated titles from filenames
   - Both use Astro's `glob` loaders for markdown/MDX files

2. **Dual Configuration System**:
   - [astro.config.ts](astro.config.ts): Framework config with explicit MDX/sitemap/UnoCSS integrations, markdown plugins, Shiki transformers
   - [src/site.config.ts](src/site.config.ts): Site metadata validated with Zod (author, locale, header/footer, social links, feature flags)

3. **Path Aliases** ([tsconfig.json](tsconfig.json)):
   - `@/*` → `src/*` (primary import pattern)
   - `@/utils`, `@/components/*`, `@/layouts/*`, `@/site-config` for specific imports

## Critical Workflows

### Development Commands

```bash
bun dev          # Start dev server (localhost:4321)
bun build        # Full build: astro check → astro build
bun preview      # Preview production build
bun deploy       # Deploy to Cloudflare with wrangler

bun check        # Astro type checking
bun check-all    # Run lint → sync → check → format
bun format       # Prettier formatting
bun lint         # ESLint with astro plugin
bun clean        # Remove .astro, .vercel, dist
```

### Creating Content

- **Blog posts**: Add to `src/content/blog/` with required frontmatter:
  ```yaml
  ---
  title: "Post Title"        # Required, max 60 chars
  description: "..."         # Required, max 160 chars
  publishDate: 2024-01-01    # Required
  tags: ["tag1"]             # Optional
  draft: false               # Filtered in production
  ---
  ```

- **Vault notes**: Add to `src/content/vault/` with optional frontmatter. Titles auto-generated from filenames. Use wikilinks `[[Note Name]]` for cross-references.

## Markdown Processing Pipeline

### Remark Plugins (AST transforms, [astro.config.ts](astro.config.ts) L105-121)

1. **remarkMath** - Parses LaTeX math expressions
2. **remarkBreaks** - **Critical**: Single newlines → `<br>` (Obsidian compatibility)
3. **remarkNormalizeLinks** ([src/plugins/remark-normalize-links.ts](src/plugins/remark-normalize-links.ts)) - Lowercases/sanitizes vault URLs
4. **remarkWikiLink** (`@flowershow/remark-wiki-link`) - Converts `[[wikilinks]]` to proper URLs using permalink map
5. **remarkAddZoomable** - Adds `.zoomable` class to images for medium-zoom
6. **remarkReadingTime** - Injects reading time into frontmatter

### Rehype Plugins (HTML transforms, [astro.config.ts](astro.config.ts) L122-145)

1. **rehypeKatex** - Renders math with KaTeX
2. **rehypeHeadingIds** - Adds IDs to headings for anchor links
3. **rehypeAutolinkHeadings** - Appends `#` anchor links to headings
4. **rehypeCallouts** - Processes Obsidian-style callouts (`> [!note]`, `> [!warning]`)
5. **rehypeExternalLinks** - Appends ` ↗` to external links
6. **rehypeTable** - Wraps tables in responsive containers

### Shiki Code Block Transformers ([src/plugins/shiki-custom-transformers.ts](src/plugins/shiki-custom-transformers.ts))

Custom transformers (L21-153):
- `updateStyle()` - Wraps code in nested `<div><pre>` structure
- `addTitle()` - Extracts title from meta string (e.g., ```ts title="file.ts"`)
- `addLanguage()` - Shows language label in corner
- `addCopyButton(2000)` - Copy button with 2s success feedback
- `addCollapse(15)` - Auto-collapses blocks over 15 lines

Official transformers: `transformerNotationDiff`, `transformerNotationHighlight`, `transformerRemoveNotationEscape`

**Note**: Use `@ts-ignore` for transformer types due to nested Shiki dependency versions

## Project-Specific Conventions

### Import Patterns

```typescript
// Path aliases for internal code
import { getBlogCollection, sortMDByDate } from '@/utils/blog'
import { getVaultCollection, buildVaultTree } from '@/utils/vault'
import { cn } from '@/utils/class-merge'
import PageLayout from '@/layouts/BaseLayout.astro'
import config from '@/site-config'

// Component barrel exports
import { Button, Card, Icon } from '@/components/user'
import { GithubCard, LinkPreview } from '@/components/advanced'
import { PostPreview, Paginator } from '@/components/pages'
```

### Vault URL Sanitization

**Critical pattern** in both [astro.config.ts](astro.config.ts) L43-52 and [src/utils/vault.ts](src/utils/vault.ts) L21-29:

```typescript
function sanitizeSlugPart(part: string): string {
  return part
    .toLowerCase()
    .replace(/[&()[\]{}]/g, '')                 // Remove brackets/parens
    .replace(/[,;:!?@#$%^*+=|\\/<>"'`~]/g, '')  // Remove punctuation
    .replace(/\s+/g, '-')                       // Spaces → dashes
    .replace(/--+/g, '-')                       // Dedup dashes
    .replace(/^-+|-+$/g, '')                    // Trim edge dashes
}
```

This ensures URL consistency between wikilink resolution and actual page slugs. File paths in `src/content/vault/subfolder/My Note.md` become `/vault/subfolder/my-note`.

### Content Helpers ([src/utils/blog.ts](src/utils/blog.ts), [src/utils/vault.ts](src/utils/vault.ts))

```typescript
// Blog helpers (filters drafts in production)
getBlogCollection()         // Returns CollectionEntry<'blog'>[]
sortMDByDate(posts)         // Sorts by updatedDate ?? publishDate
groupCollectionsByYear()    // Groups for archives page
getUniqueTagsWithCount()    // For tag cloud

// Vault helpers
getVaultCollection()        // Returns CollectionEntry<'vault'>[]
buildVaultTree()            // Recursive tree for navigation
sanitizeSlugPart()          // Match URL sanitization
```

### Styling with UnoCSS

- **Theme**: CSS variables in HSL format: `hsl(var(--foreground))`, `hsl(var(--muted))`
- **Typography**: Extensive customization in [uno.config.ts](uno.config.ts) L13-108 (heading anchors, inline code, blockquotes)
- **Inline code style**: Toggle between default and modern (bordered box) via `integ.typography.inlineCodeBlockStyle`
- **Utilities**: Use `cn()` from `@/utils/class-merge` for conditional classes (clsx wrapper)

## Integration Points

### Pagefind Search

- Enabled via `config.integ.pagefind: true` in [src/site.config.ts](src/site.config.ts)
- **Requires** `prerender: true` in site config
- Search UI at `/search` using `@pagefind/default-ui`
- Assets loaded on-demand (zero-JS until search activated)

### Cloudflare Deployment

- Deploy with `bun deploy` (uses `wrangler pages deploy dist`)
- Static output mode (`output: 'static'` in [astro.config.ts](astro.config.ts))
- Site URL: `https://nahil.pages.dev/`

### Experimental Features ([astro.config.ts](astro.config.ts) L179-202)

- `contentIntellisense: true` - Content collection intellisense
- `svgo: true` - SVG optimization
- `fonts` - Fontshare provider for "Satoshi" font (weights 400, 500)

## Common Pitfalls

1. **Shiki transformer types**: Always `@ts-ignore` custom transformers due to nested `@shikijs/types` versions
2. **Draft filtering**: Use `getBlogCollection()` helper, NOT raw `getCollection('blog')` to filter drafts in production
3. **Vault URL matching**: Sanitization must match exactly between:
   - Permalink map generation ([astro.config.ts](astro.config.ts) L43-52)
   - `sanitizeSlugPart()` in [src/utils/vault.ts](src/utils/vault.ts)
   - `remarkNormalizeLinks` plugin ([src/plugins/remark-normalize-links.ts](src/plugins/remark-normalize-links.ts))
4. **Line breaks**: `remark-breaks` makes single newlines create `<br>` (different from standard markdown)
5. **Image paths**: 
   - `/src/assets/` - Optimized images processed by Astro
   - `/public/` - Static assets served as-is
   - Vault images in `/src/content/vault/` served via dynamic route

## Key Files to Reference

- [astro.config.ts](astro.config.ts) - Framework config with plugins, integrations, Shiki setup
- [src/site.config.ts](src/site.config.ts) - Site metadata and feature flags
- [src/content.config.ts](src/content.config.ts) - Content collection schemas (strict blog, flexible vault)
- [src/utils/blog.ts](src/utils/blog.ts) - Blog helpers with draft filtering
- [src/utils/vault.ts](src/utils/vault.ts) - Vault tree building and sanitization
- [uno.config.ts](uno.config.ts) - Typography presets and theme customization
- [package.json](package.json) - Scripts and dependency versions
- [README.md](README.md) - Project overview, component catalog, tech stack
