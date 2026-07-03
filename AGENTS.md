# Agent Instructions for Personal Website

## Architecture Overview

This is a **standalone Astro (v6) static site** inspired by [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure), combining a blog with Obsidian-compatible vault integration. Deployed on Cloudflare Pages with Wrangler.

### Key Design Patterns

1. **Content Collections** ([src/content.config.ts](src/content.config.ts)):
   - **Unified `vault` collection**: Combines flexible schema for Obsidian notes (auto-generated titles) with strict typing for specialized content like blog posts.
   - **Schema Support**: Supports array-based content types (`type` field accepts a string or array of strings, e.g. `type: 'post'` for blog posts, `type: 'note'` for knowledge vault entries, defaulting to `['note']`).
   - Uses Astro's `glob` loaders for markdown/MDX files.
   - Standardized visibility controls using a boolean `publish` flag.

2. **Unified Route Handling**:
   - Both blog posts (entries containing `type: 'post'`) and vault notes (entries containing `type: 'note'`) are resolved and served under the unified `/vault/...` route handled by `src/pages/vault/[...slug].astro`.
   - The `/blog` route (handled by `src/pages/blog/[...page].astro`) provides a paginated listing of blog posts which link directly to their respective `/vault/...` pages.

3. **Dual Configuration System**:
   - [astro.config.ts](astro.config.ts): Framework config with native fonts integration, MDX/sitemap/UnoCSS integrations, markdown plugins, Shiki transformers
   - [src/site.config.ts](src/site.config.ts): Site metadata validated with Zod (author, locale, header/footer, social links, feature flags)

4. **Path Aliases** ([tsconfig.json](tsconfig.json)):
   - `@/*` → `src/*` (primary import pattern)
   - `@/utils`, `@/components/*`, `@/layouts/*`, `@/site-config` for specific imports

## Critical Workflows

### Development Commands

```bash
bun run dev          # Start dev server (localhost:4321)
bun run build        # Full build: astro check → astro build
bun run preview      # Preview production build
bun run deploy       # Deploy to Cloudflare with wrangler

bun run check        # Astro type checking
bun run check-all    # Run lint → sync → check → format
bun run format       # Prettier formatting
bun run lint         # ESLint with astro plugin
bun run clean        # Remove .astro, .vercel, dist
```

### Creating Content

All content lives strictly in the unified `src/content/vault/` directory.

#### Unified Content Workflow

- **Creation**: Create a `.md` or `.mdx` file anywhere under `src/content/vault/` (subfolders like `posts/` or `writeups/` are recommended for organization).
- **Routing**: All documents are compiled under the unified `/vault/[...slug]` path.
- **Listing**:
  - **Blog posts** (entries with `type: 'post'`) are displayed on the `/blog` index page and link directly to `/vault/[...slug]`.
  - **Vault notes** (entries with `type: 'note'`) are visible in the left navigation sidebar tree and dashboard grid folders.

#### Frontmatter Schema Reference

Here is the complete set of frontmatter properties validated by Zod ([src/content.config.ts](src/content.config.ts)):

```yaml
---
# Classification (Unified Router)
type:
  'note' # String or array of strings. Defaults to 'note'. Use 'post' for blog entries.
  # e.g., type: ['post'] or type: ['note', 'post']

# Standard Metadata
title: 'Title Override' # Optional string. If omitted, the title is auto-generated from the filename.
description: 'Description' # Optional string. Brief synopsis shown under header and in meta tags.
publishDate: 2026-06-16 # Optional date. Document creation date.
updatedDate: 2026-06-16 # Optional date. Document modification date.
publish: true # Optional boolean. Default: true. Set to false to exclude from production builds.
tags: ['cyber', 'astro'] # Optional string array. Category tags. Duplicates are auto-removed and normalized to lowercase.
permalink: 'custom-slug' # Optional string. Custom URL override.
order: 999 # Optional number. Default: 999. Ascending sort order inside tree navigation/indexes.
language: 'en' # Optional string. Language code for base page markup.
comment: true # Optional boolean. Default: true. Toggles comment system visibility.

# Media & Aesthetics
heroImage: # Optional object. Renders a cover image layout with a blur overlay scroll effect:
  src: './thumbnail.jpg' # Required image path. Optimized cover image asset.
  alt: 'Image description' # Optional string. Image alternate text.
  color: '#659EB9' # Optional string. Hex/HSL accent color code. Overrides top page wash and TOC highlights.
---
```

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
import PageLayout from '@/layouts/BaseLayout.astro'
import { GithubCard, LinkPreview } from '@/components/advanced'
import { Paginator, PostPreview } from '@/components/pages'
// Component barrel exports
import { Button, Card, Icon } from '@/components/user'
import { cn } from '@/utils/class-merge'
import { getEnrichedVaultCollection, getVaultTree, sortMDByDate } from '@/utils/vault'
import config from '@/site-config'
```

### Vault URL Sanitization

**Critical pattern** in both [astro.config.ts](astro.config.ts) L43-52 and [src/utils/vault.ts](src/utils/vault.ts) L21-29:

```typescript
function sanitizeSlugPart(part: string): string {
  return part
    .toLowerCase()
    .replace(/[&()[\]{}]/g, '') // Remove brackets/parens
    .replace(/[,;:!?@#$%^*+=|\\/<>"'`~]/g, '') // Remove punctuation
    .replace(/\s+/g, '-') // Spaces → dashes
    .replace(/--+/g, '-') // Dedup dashes
    .replace(/^-+|-+$/g, '') // Trim edge dashes
}
```

This ensures URL consistency between wikilink resolution and actual page slugs. File paths in `src/content/vault/subfolder/My Note.md` become `/vault/subfolder/my-note`.

### Content Helpers ([src/utils/vault.ts](src/utils/vault.ts))

```typescript
// Unified Vault helpers
getEnrichedVaultCollection() // Returns EnrichedVaultEntry[], automatically filtering publish: false
sortMDByDate(posts) // Sorts by updatedDate ?? publishDate
groupCollectionsByYear() // Groups posts for archives page
getUniqueVaultTagsWithCount() // Unified tag cloud matching
getVaultTree() // Recursive tree for navigation (used by sidebar and dashboard)
getVaultFlatList() // Flattened list of notes for pagination
sanitizeSlugPart() // Match URL sanitization
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
- Search index is generated post-build via `pagefind --site dist` as part of the `bun run build` script.

### Interactive Vault Features

- **Vault Network Graph**: Interactive node-link network visualization of vault notes and tags built with `force-graph` and processed via `src/utils/graph.ts`. Renders a local neighborhood view on note pages (`src/components/vault/VaultGraph.astro`) and lazy-loads the global graph JSON (`/vault/graph.json`) when launching the global graph modal.
- **Backlinks Module**: Calculates incoming connections for notes and renders them under a collapsible section (`src/components/vault/Backlinks.astro`) in the right sidebar.
- **Responsive Collapsible Sidebars**: Vault layout (`src/layouts/VaultLayout.astro`) organizes content with a left sidebar for desktop tree navigation and a right sidebar for table of contents, local graph, and backlinks. On viewport widths below 1280px (XL breakpoint), the right sidebar collapses into a drawer toggled by a floating list button.
- **Grid / List Toggle**: Vault dashboard supports toggling between card grid (collapsible folders) and tree list view, with preference saved in `localStorage`.

### Cloudflare Deployment

- Deploy with `bun deploy` (uses `wrangler pages deploy dist`)
- Static output mode (`output: 'static'` in [astro.config.ts](astro.config.ts))
- Site URL: `https://nahil.xyz/`

### Fonts Configuration ([astro.config.ts](astro.config.ts) L99-108)

- Configured directly under Astro's native `fonts` array config (using `fontProviders.fontshare()` for the "Satoshi" font).

## Common Pitfalls

1. **Shiki transformer types**: Always `@ts-ignore` custom transformers due to nested `@shikijs/types` versions
2. **Visibility filtering**: Use `getEnrichedVaultCollection()` helper, NOT raw `getCollection('vault')` to ensure entries with `publish: false` are filtered out in production.
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
- [src/content.config.ts](src/content.config.ts) - Unified content collection schema with type extensibility
- [src/utils/vault.ts](src/utils/vault.ts) - Vault tree building, sanitization, and queries
- [src/utils/graph.ts](src/utils/graph.ts) - Precomputes node-link graph relationships and backlinks
- [src/components/vault/VaultGraph.astro](src/components/vault/VaultGraph.astro) - Force-directed interactive network graph
- [src/components/vault/Backlinks.astro](src/components/vault/Backlinks.astro) - Backlinks list UI component
- [src/pages/vault/graph.json.ts](src/pages/vault/graph.json.ts) - Lazy global graph data JSON endpoint
- [uno.config.ts](uno.config.ts) - Typography presets and theme customization
- [package.json](package.json) - Scripts and dependency versions
- [README.md](README.md) - Project overview, component catalog, tech stack
