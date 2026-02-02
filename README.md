# Personal Website

Built on [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)

<div align="center">
  <img src="https://img.shields.io/badge/built%20with-Astro-0C1222?style=flat&logo=astro" alt="Built with Astro">
</div>

## 🎨 About

A fast, elegant personal website combining **blog** and **knowledge vault** - built to work seamlessly with Obsidian notes while maintaining clean URLs and beautiful typography.

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
# Create new blog post with wizard
bun pure new

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

- **`astro.config.ts`** - Framework config, markdown plugins, integrations
- **`src/site.config.ts`** - Site metadata, theme options, header/footer
- **`uno.config.ts`** - Typography and theme colors
- **`tsconfig.json`** - TypeScript configuration

### Key Settings

Edit `src/site.config.ts` to customize:
- Site title, description, author
- Social links
- Header navigation menu
- Footer links and credits
- Blog page size
- Search settings

---

## 📚 Project Structure

```
├── src/
│   ├── content/          # Content collections
│   │   ├── blog/         # Blog posts
│   │   └── vault/        # Obsidian vault
│   ├── components/       # Reusable Astro components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   ├── plugins/          # Markdown/Rehype plugins
│   └── utils/            # Utilities (vault navigation, etc)
├── packages/pure/        # Reusable component package
└── public/               # Static assets
```

---

## 🛠️ Tech Stack

Built on [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) with:

- **Framework**: [Astro](https://astro.build)
- **Styling**: [UnoCSS](https://unocss.dev) with @unocss/preset-typography
- **Markdown Processing**: 
  - remark-math, remark-breaks, remark-wiki-link
  - rehype-katex, rehype-callouts, rehype-autolink-headings
  - Custom plugins for code blocks and link normalization
- **Search**: [Pagefind](https://pagefind.app/)
- **Deployment**: [Cloudflare](https://cloudflare.com)

---

## 🙏 Acknowledgments

This project is based on the following excellent open-source projects:

- **[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)** - Base theme framework
- **[Flowershow](https://github.com/datopian/flowershow)** - Wikilink processing inspiration
- **[Pagefind](https://pagefind.app/)** - Fast static search
- **[Obsidian](https://obsidian.md/)** - Note-taking concept reference

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 🔧 Built-in Components

**Basic**: `Aside`, `Tabs`, `Timeline`, `Steps`, `Spoiler`, `Callout`

**Advanced**: `GithubCard`, `LinkPreview`, `Quote`, `QRCode`, `Vault Navigation`

For full documentation, visit: [Astro Pure Docs](https://astro-pure.js.org/docs)