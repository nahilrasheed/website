# Personal Website

Built with [Astro](https://astro.build), inspired by [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)

<div align="center">
  <img src="https://img.shields.io/badge/built%20with-Astro-0C1222?style=flat-square&logo=astro" alt="Built with Astro">
  <img src="https://img.shields.io/badge/styled-UnoCSS-4FC08D?style=flat-square&logo=unocss" alt="Styled with UnoCSS">
  <img src="https://img.shields.io/badge/deployed%20on-Cloudflare-F38020?style=flat-square&logo=cloudflare" alt="Deployed on Cloudflare">
</div>

## 🎨 About

A fast, elegant personal website combining **blog** and **knowledge vault** - built with Astro and designed to work seamlessly with Obsidian notes. Features clean URLs, beautiful typography, and a standalone architecture for maximum flexibility.

### ✨ Core Features

#### 📚 Obsidian Vault Integration

- **Wikilinks Support**: Full support via `@flowershow/remark-wiki-link` with proper permalink resolution
- **Title Preservation**: File system mapping preserves original casing/symbols
- **Folder Notes**: Support for index.md/README.md patterns
- **Auto-Generated Titles**: Automatic title generation from filenames with symbol handling

#### 🌿 Interactive Vault Dashboard

- **Responsive Grid Layout**: Card-based interface with smooth animations
- **Smart Navigation**: Auto-closes other folders when opening one for cleaner UX
- **Unified Tree Component**: Recursive `VaultTree.astro` component for both sidebar and dashboard
- **Active State Tracking**: Highlights current page in navigation
- **Grid / List View Toggle**: Support for toggling between a folder card grid and a tree list view, saved persistently in `localStorage`

#### 🕸️ Interactive Vault Network Graph & Backlinks

- **Force-Directed Graph**: Visual interactive network graph mapping note connections and tags (built with `force-graph` and processed via `src/utils/graph.ts`). Renders a local neighborhood graph on individual notes and supports a full global graph overlay modal.
- **Backlinks Discovery**: Dynamic tracking and display of other notes referencing the current note under a collapsible sidebar section.

#### 🔍 Full-Site Search

- **Pagefind Integration**: Fast, efficient search across all content
- **Zero-JS Until Needed**: Search assets only loaded when activated

#### 📝 Enhanced Markdown

- **Obsidian Compatibility**: Single newlines create line breaks via `remark-breaks`
- **Wikilinks**: Full `[[wikilink]]` support with proper permalink resolution
- **Vault Link Resolution**: Centralized index resolves standard links, images, embeds, heading fragments, and short-name references
- **Math Support**: KaTeX rendering for mathematical expressions
- **Callouts**: Full support for Obsidian-style callouts via `rehype-callouts`
- **Code Blocks**: Custom transformers with syntax highlighting, copy button, and collapse

#### 🎨 UI Optimization

- **Clean Design**: Minimal, distraction-free interface with custom typography (Satoshi font via native fonts system)
- **Dark Mode**: Built-in theme switching
- **Responsive Sidebar Drawer**: Organizes vault navigation, Table of Contents, graph, and backlinks into desktop sidebars that collapse to a drawer (below 1280px width) toggled by a floating list button.
- **Image Optimization**: Fast loading with optional zoom lightbox

---

## 🚀 Quick Start

### Requirements

- [Node.js](https://nodejs.org/): 18.0.0+
- [Bun](https://bun.sh/) (recommended) or npm/pnpm

### Installation

```shell
# Clone repository
git clone https://github.com/nahilrasheed/website
cd website

# Install dependencies
bun install
```

```shell
# Start dev server (localhost:4321)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Maintenance

```shell
# Run type checks
bun run check

# Format code with Prettier
bun run format

# Lint and fix code
bun run lint
```

---

## 📝 Usage Guide

### Creating Content

All content lives strictly in the unified `src/content/vault/` directory.

#### Unified Content Workflow

- **Creation**: Place any `.md` or `.mdx` file anywhere under `src/content/vault/` (subfolders like `posts/` or `writeups/` are recommended for organization).
- **Routing**: All documents are compiled under the unified `/vault/[...slug]` path.
- **Listing**:
  - **Blog posts** (entries containing `type: 'post'` in frontmatter) are displayed on the `/blog` index page and link directly to `/vault/[...slug]`.
  - **Vault notes** (entries containing `type: 'note'` or defaulting to it) show up in the left tree navigation sidebar and dashboard grid folders.
- **Media**: Images and assets in `src/content/vault/` are served at `/vault/assets/...` URLs.

#### Frontmatter Reference

Here is the list of properties validated by Zod (`src/content.config.ts`):

```yaml
---
# Classification
type: 'note'                 # String or array of strings. Defaults to 'note'. Use 'post' for blog entries.
                             # e.g., type: ['post'] or type: ['note', 'post']

# Standard Metadata
title: "Title Override"      # Optional. Defaults to auto-generating from filename.
description: "Description"   # Optional. Synopsis shown under headers and in metadata.
publishDate: 2026-06-16      # Optional. Document creation date.
updatedDate: 2026-06-16      # Optional. Document last updated date.
publish: true                # Optional. Set to false to exclude from production builds.
tags: ["testing", "docs"]    # Optional. Duplicates are auto-removed and normalized to lowercase.
permalink: "custom-slug"     # Optional. Custom slug override.
order: 999                   # Optional. Sorting priority in tree navigation/indexes.
language: "en"               # Optional. Page language attribute.
comment: true                # Optional. Set to false to disable comment layouts.

# Media & Custom Theme
heroImage:                   # Optional. Renders a cover image layout with a blur overlay scroll effect:
  src: "./thumbnail.jpg"     # Required. Cover image path.
  alt: "Alternate description"# Optional. Image alt text.
  color: "#659EB9"           # Optional. Hex/HSL color color code for page glow and TOC highlights.
---
```

### Using Wikilinks

```markdown
<!-- Basic wikilink -->
[[Other Note]]

<!-- Wikilink with custom text -->
[[Other Note|Custom Display Text]]

<!-- Nested paths work automatically -->
[[Folder/Subfolder/Note]]

<!-- Heading fragments -->
[[Note#Section Heading]]

<!-- Image embeds (Obsidian-style) -->
![[image.png]]
![[image.png|200x100]]
![[image.png|200x100|Alt text]]
```

---

## ⚙️ Configuration

### Main Configuration Files

- **`astro.config.ts`** - Astro framework config with explicit MDX, sitemap, UnoCSS integrations and remark/rehype plugins
- **`src/site.config.ts`** - Site metadata, theme options, header/footer (validated with Zod schemas)
- **`src/content.config.ts`** - Unified content collection schema for the vault
- **`uno.config.ts`** - UnoCSS configuration with typography presets and theme colors
- **`tsconfig.json`** - TypeScript paths and compiler options

### Key Settings

Edit `src/site.config.ts` to customize:

- Site title, description, author info
- Social links and profile URLs
- Header navigation menu items
- Footer links and copyright
- Blog pagination (posts per page)
- Feature toggles (search, theme toggle, etc)

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
// Path aliases (configured in tsconfig.json)
import PageLayout from '@/layouts/BaseLayout.astro'
import { GithubCard, LinkPreview } from '@/components/advanced'
import { Paginator, PostPreview } from '@/components/pages'
import { Button, Card, Icon } from '@/components/user'
import { cn } from '@/utils/class-merge'
import { getEnrichedVaultCollection, getVaultTree, sortMDByDate } from '@/utils/vault'
import config from '@/site-config'
```

- `@/*` → `src/*` (primary import pattern)

---

## 📚 Project Structure

```
├── src/
│   ├── content/          # Content collections
│   │   └── vault/        # Unified Obsidian vault (includes posts, notes, writeups)
│   ├── components/       # Reusable Astro components
│   │   ├── advanced/     # Advanced components (GithubCard, LinkPreview, etc)
│   │   ├── basic/        # Layout components (Header, Footer, ThemeProvider)
│   │   ├── pages/        # Page-specific components (PostPreview, TOC, Paginator)
│   │   ├── user/         # UI components (Button, Card, Tabs, Timeline)
│   │   ├── projects/     # Project-specific components
│   │   └── vault/        # Vault navigation components (VaultTree, VaultGraph, Backlinks)
│   ├── layouts/          # Page layouts (BaseLayout, VaultLayout, ContentLayout)
│   ├── pages/            # Route pages
│   ├── plugins/          # Remark/Rehype plugins and Shiki transformers
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (vault, graph, vault-link-index)
│   └── assets/           # Images, styles, fonts
└── public/               # Static assets (favicon, robots.txt)
```

---

## 🛠️ Tech Stack

Inspired by [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure), built as a standalone project:

- **Framework**: [Astro](https://astro.build) 7.0.6 (Astro v7)
- **Runtime**: [Bun](https://bun.sh) (Node.js compatible)
- **Styling**: [UnoCSS](https://unocss.dev) with @unocss/preset-typography
- **Graph Visualization**: [force-graph](https://github.com/vasturiano/force-graph)
- **Markdown Processing**:
  - **Remark**: remark-math, remark-breaks, @flowershow/remark-wiki-link, remarkResolveVaultLinks, reading-time
  - **Rehype**: rehype-katex, rehype-callouts, rehype-autolink-headings
  - **Custom plugins**: Shiki transformers, code collapse, external links, image zoom
  - **Link Resolution**: VaultLinkIndex with github-slugger for heading fragments
- **Search**: [Pagefind](https://pagefind.app/) (automatically indexed post-build)
- **Type System**: TypeScript with Zod for config validation
- **Deployment**: [Cloudflare](https://cloudflare.com)

---

## 🙏 Acknowledgments

This project is inspired by and built upon the following excellent open-source projects:

- **[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)** - Original theme framework and component inspiration
- **[Pagefind](https://pagefind.app/)** - Fast static search engine
- **[Obsidian](https://obsidian.md/)** - Note-taking workflow inspiration

---

## 📄 License

This project is open source under the [Apache 2.0](LICENSE).

---

## 🔧 Built-in Components

All components are organized in `src/components/` with barrel exports:

**User Components** (`@/components/user`):

- Containers: `Card`, `Collapse`, `Aside`, `Tabs`, `TabItem`
- Lists: `CardList`, `Timeline`, `Steps`
- UI Elements: `Button`, `Label`, `Spoiler`, `Icon`, `FormattedDate`
- Layout: `Section`

**Advanced Components** (`@/components/advanced`):
`GithubCard`, `LinkPreview`, `Quote`, `QRCode`, `MediumZoom`

**Page Components** (`@/components/pages`):
`PostPreview`, `TOC`, `Paginator`, `BackToTop`, `ArticleBottom`

**Vault Components** (used for navigation and graph views):
`VaultTree` (sidebar/dashboard tree), `VaultGraph` (force-directed graph visualizer), `Backlinks` (referenced notes list)

**Import Examples**:

```typescript
import { GithubCard } from '@/components/advanced'
import { PostPreview } from '@/components/pages'
import { Button, Card, Timeline } from '@/components/user'
import { Backlinks, VaultGraph } from '@/components/vault'
```
