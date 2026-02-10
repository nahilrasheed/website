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

#### 🔍 Full-Site Search
- **Pagefind Integration**: Fast, efficient search across all content
- **Zero-JS Until Needed**: Search assets only loaded when activated

#### 📝 Enhanced Markdown
- **Obsidian Compatibility**: Single newlines create line breaks via `remark-breaks`
- **Math Support**: KaTeX rendering for mathematical expressions
- **Callouts**: Full support for Obsidian-style callouts via `rehype-callouts`
- **Code Blocks**: Custom transformers with syntax highlighting, copy button, and collapse

#### 🎨 UI Optimization
- **Clean Design**: Minimal, distraction-free interface with custom typography
- **Dark Mode**: Built-in theme switching
- **Responsive**: Mobile-first design adapted for all devices
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
bun dev

# Build for production
bun build

# Preview production build
bun preview
```

### Maintenance

```shell
# Run type checks
bun check

# Format code with Prettier
bun format

# Lint and fix code
bun lint
```

---

## 📝 Usage Guide

### Creating Content

#### Blog Posts
Add `.md` or `.mdx` files to `src/content/blog/` with required frontmatter:
```yaml
---
title: "Your Post Title"
description: "Brief description"
publishDate: 2024-01-01
tags: ["tag1", "tag2"]
---
```

#### Vault Documents
Add files to `src/content/vault/` - organized by folders:
- **Optional frontmatter** - titles auto-generated from filenames
- **Wikilinks** - Use `[[Note Name]]` to link between notes
- **Folder notes** - Create `index.md` or `README.md` for folder descriptions

### Using Wikilinks

```markdown
<!-- Basic wikilink -->
[[Other Note]]

<!-- Wikilink with custom text -->
[[Other Note|Custom Display Text]]

<!-- Nested paths work automatically -->
[[Folder/Subfolder/Note]]
```

---

## ⚙️ Configuration

### Main Configuration Files

- **`astro.config.ts`** - Astro framework config with explicit MDX, sitemap, UnoCSS integrations and remark/rehype plugins
- **`src/site.config.ts`** - Site metadata, theme options, header/footer (validated with Zod schemas)
- **`src/content.config.ts`** - Content collection schemas for blog and vault
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
// Before (relative paths)
import { cn } from '../../utils'
import Card from '../components/Card.astro'

// After (path aliases)
import { cn } from '@/utils'
import Card from '@/components/user/Card.astro'
```

Configured in `tsconfig.json`:
- `@/*` → `src/*` - Main source directory
- Enables tree-shaking and better IDE support

---

## 📚 Project Structure

```
├── src/
│   ├── content/          # Content collections
│   │   ├── blog/         # Blog posts
│   │   └── vault/        # Obsidian vault
│   ├── components/       # Reusable Astro components
│   │   ├── advanced/     # Advanced components (GithubCard, LinkPreview, etc)
│   │   ├── basic/        # Layout components (Header, Footer, ThemeProvider)
│   │   ├── pages/        # Page-specific components (Hero, PostPreview, TOC)
│   │   ├── user/         # UI components (Button, Card, Tabs, Timeline)
│   │   ├── projects/     # Project-specific components
│   │   └── vault/        # Vault navigation components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   ├── plugins/          # Remark/Rehype plugins
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── libs/             # Shared libraries
│   └── assets/           # Images, styles, fonts
└── public/               # Static assets (favicon, robots.txt)
```

---

## 🛠️ Tech Stack

Inspired by [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure), built as a standalone project:

- **Framework**: [Astro](https://astro.build) 5.17.1
- **Runtime**: [Bun](https://bun.sh) (Node.js compatible)
- **Styling**: [UnoCSS](https://unocss.dev) 0.61.9 with @unocss/preset-typography
- **Markdown Processing**: 
  - **Remark**: remark-math, remark-breaks, @flowershow/remark-wiki-link, reading-time
  - **Rehype**: rehype-katex, rehype-callouts, rehype-autolink-headings
  - **Custom plugins**: Shiki transformers, code collapse, external links, steps/tabs
- **Search**: [Pagefind](https://pagefind.app/)
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
`Hero`, `PostPreview`, `TOC`, `Paginator`, `BackToTop`, `ArticleBottom`

**Import Examples**:
```typescript
import { Button, Card, Timeline } from '@/components/user'
import { GithubCard } from '@/components/advanced'
import { PostPreview } from '@/components/pages'
```