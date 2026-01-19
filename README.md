# Personal Website

Built on [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)

A fast, elegant blog and documentation site with comprehensive Obsidian vault integration and enhanced markdown support.

[![Built with Astro](https://img.shields.io/badge/built%20with-Astro-0C1222?style=flat&logo=astro)](https://astro.build)

## Overview

This is a personal website instance built on top of the [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) template with customizations for:

- **Enhanced Markdown**: Single newlines create line breaks (Obsidian-style behavior) with remark-breaks plugin
- **Developer Friendly**: Modern setup with TypeScript, UnoCSS, and extensive markdown plugins
- **Production Ready**: Deployed on Vercel with SSR support
- **Content-First**: Markdown and MDX with KaTeX math support, callouts, and custom plugins

Upcoming:
~~- **Obsidian Vault Integration**: Full support for Obsidian markdown vaults with folder notes, wikilinks, proper line break handling, callouts, and navigation~~
## Features

- ⚡ **Performance**: Lightning-fast site generation and delivery
- 🎨 **Clean Design**: Minimal, distraction-free interface
- 📱 **Responsive**: Mobile-first responsive design
- 🔍 **Full-Site Search**: Built-in search with [Pagefind](https://pagefind.app/)
- 📚 **Documentation Support**: Dedicated vault system for organizing knowledge
- 🪲 **Obsidian Compatibility**: Render Obsidian vaults with folder notes and wikilinks
- 📝 **Markdown + MDX**: Write with Markdown or interactive MDX components
- 🧮 **Math Support**: KaTeX support for mathematical expressions
- 🔗 **SEO Optimized**: Sitemap, RSS feed, Open Graph generation
- 📖 **Table of Contents**: Auto-generated TOC with scroll-spy
- 🖼️ **Image Optimization**: Fast image loading with zoom lightbox
- 🌙 **Dark Mode**: Built-in theme switching

## Built-in Components

Basic components: `Aside`, `Tabs`, `Timeline`, `Steps`, `Spoiler`, `Callout`

Advanced components: `GithubCard`, `LinkPreview`, `Quote`, `QRCode`, `Vault Navigation`

## Documentation

[Full Docs](https://astro-pure.js.org/docs)

## Key Customizations

Enhancements built on top of Astro Theme Pure base:

- **Folder Notes System**: Two-pass algorithm for proper Obsidian folder note handling in vault navigation
- **Smart Link Visibility**: Content links inside headings are visible by default (with underline), while anchor hash links remain hidden until hover
- **Line Break Handling**: Single newlines create `<br>` tags via `remark-breaks` plugin for Obsidian compatibility
- **Obsidian Callouts**: Full support for Obsidian-style callouts via `rehype-callouts` plugin
- **Improved Vault Tree**: Folders with only index docs render as simple links without expand buttons
- **Safe Navigation**: Error handling and path normalization for consistent folder/document matching

## Project Structure

```
├── src/
│   ├── content/          # Blog posts and vault documents
│   │   ├── blog/         # Blog collection
│   │   └── vault/        # Obsidian vault (organized by folders)
│   ├── components/       # Reusable Astro components
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   ├── plugins/          # Markdown/Rehype plugins
│   └── utils/            # Utilities (vault navigation, etc)
├── packages/pure/        # Reusable component package
└── public/               # Static assets
```

## Configuration

Main configuration files:

- `astro.config.ts` - Astro configuration with markdown and integrations setup
- `src/site.config.ts` - Site metadata and theme options
- `uno.config.ts` - UnoCSS typography and theme colors
- `tsconfig.json` - TypeScript configuration

## Tech Stack

Built on [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) with:

- **Framework**: [Astro](https://astro.build)
- **Styling**: [UnoCSS](https://unocss.dev) with @unocss/preset-typography
- **Markdown Processing**: 
  - remark-math, remark-breaks
  - rehype-katex, rehype-callouts
  - Custom rehype plugins for heading links and code blocks
- **Search**: [Pagefind](https://pagefind.app/)
- **Deployment**: [Cloudflare](https://cloudflare.com)

## Development

```shell
# Start dev server with hot reload
bun dev

# Build for production
bun build

# Preview production build
bun preview

# Create new blog post
bun pure new

# Check for errors
bun check

# Format code
bun format

# Lint and fix code
bun lint
```

## Base Theme

This site is built on [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) - an excellent minimal blog and documentation theme. The base theme itself was inspired by: